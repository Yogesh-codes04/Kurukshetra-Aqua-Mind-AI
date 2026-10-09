import {
  Facility,
  FacilityAllocation,
  FacilityPriority,
  SimulationResult,
  WaterAvailability,
} from '../types/water';

const PRIORITY_RANKS: Record<FacilityPriority, number> = {
  Critical: 1,
  High: 2,
  Medium: 3,
  Low: 4,
};

/**
 * Deterministic Water Allocation Algorithm
 *
 * Rules:
 * 1. Available Supply Constraint: Total allocated water never exceeds available supply (S).
 * 2. Non-Negativity Constraint: No facility receives < 0 Litres, and no facility receives > demand.
 * 3. Priority Hierarchy: Critical > High > Medium > Low.
 * 4. Sub-Minimum Scarcity Handler:
 *    If S < Sum(Minimums), the algorithm explicitly reports that all minimum requirements
 *    cannot be met. Supply is rationed to minimums in strict priority order, with proportional
 *    sharing applied within the marginal priority tier.
 * 5. Proportional Fairness Rule for Surplus:
 *    When S >= Sum(Minimums), all minimums are guaranteed first.
 *    Any remaining surplus is allocated tier-by-tier. If a tier cannot be fully satisfied,
 *    the available surplus is distributed proportionally according to each facility's
 *    remaining demand (unmet requirement) within that tier:
 *      allocation_share = (remaining_demand_i / sum_tier_remaining_demand) * tier_surplus.
 * 6. Explicit Traceability: Generates deterministic step-by-step audit logs and trade-off rationales.
 */
export function runWaterAllocationSimulation(
  facilities: Facility[],
  availability: WaterAvailability
): SimulationResult {
  const S = Math.max(0, availability.dailySupplyLiters);
  const stepExplanations: string[] = [];
  const tradeOffNotes: string[] = [];

  // Edge case: Empty facilities list
  if (!facilities || facilities.length === 0) {
    return {
      availableSupply: S,
      totalDemand: 0,
      totalAllocated: 0,
      remainingReserve: S,
      totalUnmetDemand: 0,
      criticalDeficitCount: 0,
      criticalUnmetLiters: 0,
      allMinimumsMet: true,
      facilityAllocations: [],
      explanation: 'No facilities configured for simulation.',
      stepExplanations: ['No facilities in registry to allocate water to.'],
      tradeOffNotes: [],
      timestamp: new Date().toISOString(),
      isSimulatedEstimate: true,
    };
  }

  // Pre-calculations
  const totalDemand = facilities.reduce((sum, f) => sum + Math.max(0, f.demandLiters), 0);
  const totalMinimum = facilities.reduce((sum, f) => sum + Math.max(0, f.minLiters), 0);

  stepExplanations.push(
    `Input Verification: Available supply is ${S.toLocaleString()} L/day. Total community demand is ${totalDemand.toLocaleString()} L/day across ${facilities.length} facilities. Total protected minimum required is ${totalMinimum.toLocaleString()} L/day.`
  );

  // Tracking allocations per facility ID
  const allocations: Record<string, number> = {};
  const reasons: Record<string, string> = {};
  facilities.forEach((f) => {
    allocations[f.id] = 0;
  });

  let remainingSupply = S;
  let allMinimumsMet = true;

  // Group facilities by priority
  const priorityGroups: Record<FacilityPriority, Facility[]> = {
    Critical: facilities.filter((f) => f.priority === 'Critical'),
    High: facilities.filter((f) => f.priority === 'High'),
    Medium: facilities.filter((f) => f.priority === 'Medium'),
    Low: facilities.filter((f) => f.priority === 'Low'),
  };

  const priorityOrder: FacilityPriority[] = ['Critical', 'High', 'Medium', 'Low'];

  // =========================================================================
  // CASE A: Available supply is BELOW total minimum requirements (S < totalMinimum)
  // =========================================================================
  if (S < totalMinimum) {
    allMinimumsMet = false;
    const deficitBelowMin = totalMinimum - S;

    stepExplanations.push(
      `CRITICAL SHORTAGE WARNING: Total available supply (${S.toLocaleString()} L/day) is below the sum of all minimum requirements (${totalMinimum.toLocaleString()} L/day) by ${deficitBelowMin.toLocaleString()} L/day. All minimum requirements CANNOT be met.`
    );

    tradeOffNotes.push(
      `Severe scarcity emergency: Total daily water is insufficient to satisfy even minimum survival and operational baselines. Rationing initiated strictly by priority ranking.`
    );

    // Distribute available supply to minimums in strict priority order
    for (const priority of priorityOrder) {
      const tierFacilities = priorityGroups[priority];
      if (tierFacilities.length === 0) continue;

      const tierMinNeeded = tierFacilities.reduce((sum, f) => sum + Math.max(0, f.minLiters), 0);

      if (remainingSupply >= tierMinNeeded) {
        // Full minimum satisfied for this tier
        tierFacilities.forEach((f) => {
          const min = Math.max(0, f.minLiters);
          allocations[f.id] = min;
          reasons[f.id] = `${priority} priority: 100% of minimum requirement (${min.toLocaleString()} L) fulfilled under sub-minimum supply.`;
        });
        remainingSupply -= tierMinNeeded;
        stepExplanations.push(
          `Phase 1 — Priority ${priority}: Fulfilled full minimum requirements (${tierMinNeeded.toLocaleString()} L/day) across ${tierFacilities.length} facility(ies). Remaining supply: ${remainingSupply.toLocaleString()} L/day.`
        );
      } else if (remainingSupply > 0) {
        // Partial minimum distribution within this tier using Proportional Fairness
        const availableForTier = remainingSupply;
        stepExplanations.push(
          `Phase 1 — Priority ${priority} (Marginal Tier): Insufficient supply (${availableForTier.toLocaleString()} L/day) to satisfy total tier minimum (${tierMinNeeded.toLocaleString()} L/day). Rationing proportionally based on facility minimum demand.`
        );

        tierFacilities.forEach((f) => {
          const min = Math.max(0, f.minLiters);
          const share = tierMinNeeded > 0 ? (min / tierMinNeeded) * availableForTier : 0;
          const allocated = Math.min(min, Math.round(share));
          allocations[f.id] = allocated;
          reasons[f.id] = `Curtailed ${priority} priority: Received ${allocated.toLocaleString()} L/day (${((allocated / (min || 1)) * 100).toFixed(0)}% of minimum). Deficit of ${(min - allocated).toLocaleString()} L due to emergency rationing.`;
        });

        tradeOffNotes.push(
          `${priority} facilities received only partial minimum requirements (${((availableForTier / tierMinNeeded) * 100).toFixed(1)}% of minimum).`
        );
        remainingSupply = 0;
      } else {
        // Zero supply remaining for this lower tier
        tierFacilities.forEach((f) => {
          allocations[f.id] = 0;
          reasons[f.id] = `Shut off: Available supply exhausted on higher priority tiers. Zero water allocated.`;
        });
        tradeOffNotes.push(
          `${priority} tier facilities completely shut off (0 L/day) to prevent complete failure of higher-priority facilities.`
        );
        stepExplanations.push(
          `Phase 1 — Priority ${priority}: Zero supply available. All ${tierFacilities.length} facility(ies) curtailed to 0 L/day.`
        );
      }
    }
  } else {
    // =========================================================================
    // CASE B: Available supply can satisfy all minimum requirements (S >= totalMinimum)
    // =========================================================================
    stepExplanations.push(
      `Phase 1 — Baseline Minimum Protection: S (${S.toLocaleString()} L/day) >= Total Minimum (${totalMinimum.toLocaleString()} L/day). All ${facilities.length} facilities guaranteed 100% of their statutory minimum requirements.`
    );

    // Step 1: Guarantee 100% of minimum requirements
    facilities.forEach((f) => {
      const min = Math.max(0, f.minLiters);
      allocations[f.id] = min;
      reasons[f.id] = `Baseline minimum (${min.toLocaleString()} L/day) fully protected.`;
    });
    remainingSupply -= totalMinimum;

    stepExplanations.push(
      `Surplus Pool: ${remainingSupply.toLocaleString()} L/day available to distribute beyond minimums towards standard daily demands.`
    );

    // Step 2: Allocate remaining surplus tier-by-tier according to priority
    for (const priority of priorityOrder) {
      if (remainingSupply <= 0) break;

      const tierFacilities = priorityGroups[priority];
      if (tierFacilities.length === 0) continue;

      // Calculate remaining demand beyond minimum for this tier
      const tierUnmetRemaining = tierFacilities.reduce((sum, f) => {
        const remainingDemand = Math.max(0, f.demandLiters - allocations[f.id]);
        return sum + remainingDemand;
      }, 0);

      if (tierUnmetRemaining <= 0) continue;

      if (remainingSupply >= tierUnmetRemaining) {
        // Full unmet demand can be satisfied for this tier
        tierFacilities.forEach((f) => {
          const add = Math.max(0, f.demandLiters - allocations[f.id]);
          allocations[f.id] += add;
          reasons[f.id] = `${priority} priority: 100% of full daily demand satisfied (${allocations[f.id].toLocaleString()} L/day).`;
        });
        remainingSupply -= tierUnmetRemaining;
        stepExplanations.push(
          `Phase 2 — Priority ${priority}: Fulfilled 100% of remaining demand (+${tierUnmetRemaining.toLocaleString()} L/day). Remaining surplus: ${remainingSupply.toLocaleString()} L/day.`
        );
      } else {
        // Proportional fairness rule: distribute available tier surplus proportionally to unmet demand
        const availableTierSurplus = remainingSupply;
        stepExplanations.push(
          `Phase 2 — Priority ${priority} (Proportional Fairness): Surplus (${availableTierSurplus.toLocaleString()} L/day) is insufficient to satisfy total remaining demand (${tierUnmetRemaining.toLocaleString()} L/day). Distributing proportionally to facility deficits.`
        );

        let allocatedTierTotal = 0;
        tierFacilities.forEach((f, idx) => {
          const fRemainingDemand = Math.max(0, f.demandLiters - allocations[f.id]);
          if (fRemainingDemand <= 0) return;

          // Proportional share
          let share = Math.round((fRemainingDemand / tierUnmetRemaining) * availableTierSurplus);
          // Safety cap to not exceed remaining supply or demand
          share = Math.min(share, fRemainingDemand, availableTierSurplus - allocatedTierTotal);
          if (idx === tierFacilities.length - 1 && allocatedTierTotal + share < availableTierSurplus) {
            // Allocate any remaining single-liter rounding to the last facility
            share = Math.min(fRemainingDemand, availableTierSurplus - allocatedTierTotal);
          }

          allocations[f.id] += share;
          allocatedTierTotal += share;
          const pctFulfilled = ((allocations[f.id] / (f.demandLiters || 1)) * 100).toFixed(1);
          reasons[f.id] = `${priority} priority: Minimum protected + proportional surplus (+${share.toLocaleString()} L). Total: ${allocations[f.id].toLocaleString()} L/day (${pctFulfilled}% fulfilled).`;
        });

        tradeOffNotes.push(
          `${priority} tier facilities received ${((availableTierSurplus / tierUnmetRemaining) * 100).toFixed(1)}% of their discretionary demand above minimums.`
        );
        remainingSupply = Math.max(0, remainingSupply - allocatedTierTotal);
      }
    }

    // Step 3: Any tiers that received no surplus beyond minimum
    for (const priority of priorityOrder) {
      const tierFacilities = priorityGroups[priority];
      tierFacilities.forEach((f) => {
        if (allocations[f.id] === f.minLiters && f.demandLiters > f.minLiters) {
          reasons[f.id] = `${priority} priority: Maintained at statutory minimum (${f.minLiters.toLocaleString()} L/day). Discretionary demand curtailed to safeguard higher-priority facilities.`;
          if (!tradeOffNotes.some((t) => t.includes(`${f.name} restricted to minimum`))) {
            tradeOffNotes.push(`${f.name} restricted strictly to baseline minimum (${f.minLiters.toLocaleString()} L/day).`);
          }
        }
      });
    }
  }

  // Final rounding, bounds checking and building facility allocations
  let totalAllocated = 0;
  let criticalDeficitCount = 0;
  let criticalUnmetLiters = 0;

  const facilityAllocations: FacilityAllocation[] = facilities.map((f) => {
    const rawAllocated = Math.max(0, allocations[f.id] || 0);
    // Never allocate more than demand, never negative
    const allocatedLiters = Math.min(f.demandLiters, rawAllocated);
    totalAllocated += allocatedLiters;

    const unmetLiters = Math.max(0, f.demandLiters - allocatedLiters);
    const shortagePercentage =
      f.demandLiters > 0 ? Number(((unmetLiters / f.demandLiters) * 100).toFixed(1)) : 0;
    const fulfilledPercentage =
      f.demandLiters > 0 ? Number(((allocatedLiters / f.demandLiters) * 100).toFixed(1)) : 100;
    const minMet = allocatedLiters >= f.minLiters;
    const minDeficitLiters = Math.max(0, f.minLiters - allocatedLiters);

    if (f.priority === 'Critical' && !minMet) {
      criticalDeficitCount++;
      criticalUnmetLiters += minDeficitLiters;
    }

    // Status classification
    let status: FacilityAllocation['status'];
    if (allocatedLiters === 0) {
      status = 'zero_allocation';
    } else if (!minMet) {
      status = 'critical_deficit';
    } else if (allocatedLiters >= f.demandLiters) {
      status = 'fully_met';
    } else if (allocatedLiters === f.minLiters) {
      status = 'minimum_only';
    } else {
      status = 'partially_met';
    }

    // People protected calculation (proportional to fulfilled percentage)
    const peopleProtected = Math.round(f.peopleServed * (fulfilledPercentage / 100));

    return {
      facilityId: f.id,
      facilityName: f.name,
      type: f.type,
      priority: f.priority,
      demandLiters: f.demandLiters,
      minLiters: f.minLiters,
      allocatedLiters,
      unmetLiters,
      shortagePercentage,
      fulfilledPercentage,
      minMet,
      minDeficitLiters,
      peopleProtected,
      status,
      reason: reasons[f.id] || 'Allocation calculated by deterministic priority engine.',
    };
  });

  const remainingReserve = Math.max(0, S - totalAllocated);
  const totalUnmetDemand = Math.max(0, totalDemand - totalAllocated);

  stepExplanations.push(
    `Final Reconciliation: Total allocated is ${totalAllocated.toLocaleString()} L/day out of ${S.toLocaleString()} L/day available. Total community unmet demand is ${totalUnmetDemand.toLocaleString()} L/day. Remaining unallocated reserve: ${remainingReserve.toLocaleString()} L/day.`
  );

  // Overall human explanation
  let explanation = '';
  if (S < totalMinimum) {
    explanation = `Emergency Deficit Allocation: Available supply (${S.toLocaleString()} L/day) fails to cover the combined minimum threshold (${totalMinimum.toLocaleString()} L/day) by ${(totalMinimum - S).toLocaleString()} L/day. The engine prioritized critical health and safety facilities (Hospital & Schools) while rationing lower-priority facilities to prevent localized grid failure.`;
  } else if (totalUnmetDemand === 0) {
    explanation = `Full Supply Optimal Allocation: Available water (${S.toLocaleString()} L/day) fully covers all facility requirements (${totalDemand.toLocaleString()} L/day). All facilities receive 100% of their operational demand, leaving a reserve surplus of ${remainingReserve.toLocaleString()} L/day in storage.`;
  } else {
    explanation = `Constrained Priority Allocation: All statutory minimums (${totalMinimum.toLocaleString()} L/day) were guaranteed first across all ${facilities.length} facilities. The remaining surplus pool was distributed in descending priority (Critical → High → Medium → Low), applying proportional fairness to prevent any single facility within a tier from bearing an unequal burden.`;
  }

  return {
    availableSupply: S,
    totalDemand,
    totalAllocated,
    remainingReserve,
    totalUnmetDemand,
    criticalDeficitCount,
    criticalUnmetLiters,
    allMinimumsMet,
    facilityAllocations,
    explanation,
    stepExplanations,
    tradeOffNotes,
    timestamp: new Date().toISOString(),
    isSimulatedEstimate: true,
  };
}
