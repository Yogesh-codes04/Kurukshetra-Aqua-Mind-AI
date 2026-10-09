import math
from datetime import datetime, timezone
from typing import List, Dict, Any
from app.schemas.allocation import (
    FacilityBase,
    SimulationResultResponse,
    FacilityAllocationItemSchema,
)

PRIORITY_RANKS: Dict[str, int] = {
    "Critical": 1,
    "High": 2,
    "Medium": 3,
    "Low": 4,
}

PRIORITY_ORDER: List[str] = ["Critical", "High", "Medium", "Low"]


def run_water_allocation_simulation(
    facilities: List[Any],
    daily_supply_liters: float,
) -> SimulationResultResponse:
    """Deterministic Water Allocation Algorithm.
    Faithful Python port of the allocation engine in allocationEngine.ts.

    Guarantees:
    1. Total allocated <= available supply S.
    2. Non-negativity: 0 <= allocated <= demand.
    3. Strict priority tier hierarchy: Critical > High > Medium > Low.
    4. Proportional rationing within marginal priority tier.
    5. Detailed audit trail and trade-off rationales.
    """
    S = max(0.0, float(daily_supply_liters))
    step_explanations: List[str] = []
    trade_off_notes: List[str] = []

    if not facilities:
        return SimulationResultResponse(
            availableSupply=S,
            totalDemand=0.0,
            totalAllocated=0.0,
            remainingReserve=S,
            totalUnmetDemand=0.0,
            criticalDeficitCount=0,
            criticalUnmetLiters=0.0,
            allMinimumsMet=True,
            facilityAllocations=[],
            explanation="No facilities configured for simulation.",
            stepExplanations=["No facilities in registry to allocate water to."],
            tradeOffNotes=[],
            timestamp=datetime.now(timezone.utc).isoformat(),
            isSimulatedEstimate=True,
        )

    # Standardize facility objects to dicts
    f_list = []
    for f in facilities:
        f_id = getattr(f, "id", None) or f.get("id") if isinstance(f, dict) else getattr(f, "name", "fac-unknown")
        f_name = getattr(f, "name", None) or f.get("name") if isinstance(f, dict) else "Unknown"
        f_type = getattr(f, "type", None) or f.get("type", "General") if isinstance(f, dict) else "General"
        f_demand = float(getattr(f, "demand_liters", None) or getattr(f, "demandLiters", 0.0) if not isinstance(f, dict) else f.get("demand_liters", f.get("demandLiters", 0.0)))
        f_min = float(getattr(f, "min_liters", None) or getattr(f, "minLiters", 0.0) if not isinstance(f, dict) else f.get("min_liters", f.get("minLiters", 0.0)))
        f_prio = getattr(f, "priority", "Medium") if not isinstance(f, dict) else f.get("priority", "Medium")
        f_people = int(getattr(f, "people_served", None) or getattr(f, "peopleServed", 0) if not isinstance(f, dict) else f.get("people_served", f.get("peopleServed", 0)))
        
        f_list.append({
            "id": str(f_id),
            "name": str(f_name),
            "type": str(f_type),
            "demand": max(0.0, f_demand),
            "min": max(0.0, f_min),
            "priority": str(f_prio),
            "people": max(0, f_people),
        })

    total_demand = sum(f["demand"] for f in f_list)
    total_minimum = sum(f["min"] for f in f_list)

    step_explanations.append(
        f"Input Verification: Available supply is {S:,.0f} L/day. "
        f"Total community demand is {total_demand:,.0f} L/day across {len(f_list)} facilities. "
        f"Total protected minimum required is {total_minimum:,.0f} L/day."
    )

    allocations: Dict[str, float] = {f["id"]: 0.0 for f in f_list}
    reasons: Dict[str, str] = {}
    remaining_supply = S
    all_minimums_met = True

    priority_groups: Dict[str, List[Dict[str, Any]]] = {
        p: [f for f in f_list if f["priority"] == p] for p in PRIORITY_ORDER
    }

    # CASE A: Sub-Minimum Scarcity (S < total_minimum)
    if S < total_minimum:
        all_minimums_met = False
        deficit_below_min = total_minimum - S
        step_explanations.append(
            f"CRITICAL SHORTAGE WARNING: Total available supply ({S:,.0f} L/day) is below "
            f"the sum of all minimum requirements ({total_minimum:,.0f} L/day) by {deficit_below_min:,.0f} L/day. "
            "All minimum requirements CANNOT be met."
        )
        trade_off_notes.append(
            "Severe scarcity emergency: Total daily water is insufficient to satisfy even minimum survival baselines. "
            "Rationing initiated strictly by priority ranking."
        )

        for priority in PRIORITY_ORDER:
            tier_facilities = priority_groups[priority]
            if not tier_facilities:
                continue

            tier_min_needed = sum(f["min"] for f in tier_facilities)

            if remaining_supply >= tier_min_needed:
                for f in tier_facilities:
                    allocations[f["id"]] = f["min"]
                    reasons[f["id"]] = (
                        f"{priority} priority: 100% of minimum requirement ({f['min']:,.0f} L) fulfilled under sub-minimum supply."
                    )
                remaining_supply -= tier_min_needed
                step_explanations.append(
                    f"Tier [{priority}]: 100% of minimum requirements ({tier_min_needed:,.0f} L) fully satisfied. "
                    f"Remaining supply: {remaining_supply:,.0f} L."
                )
            elif remaining_supply > 0:
                step_explanations.append(
                    f"Tier [{priority}]: Insufficient supply ({remaining_supply:,.0f} L available vs {tier_min_needed:,.0f} L needed). "
                    "Applying proportional rationing across tier minimums."
                )
                allocated_so_far = 0.0
                for f in tier_facilities:
                    if tier_min_needed > 0:
                        share = math.floor((f["min"] / tier_min_needed) * remaining_supply)
                    else:
                        share = 0.0
                    allocations[f["id"]] = share
                    allocated_so_far += share
                    reasons[f["id"]] = (
                        f"{priority} priority: Rationed proportionally to {share:,.0f} L "
                        f"({(share / f['min'] * 100):.1f}% of {f['min']:,.0f} L min) due to sub-minimum supply."
                        if f["min"] > 0
                        else f"{priority} priority: Zero allocation."
                    )

                leftover = remaining_supply - allocated_so_far
                if leftover > 0:
                    for f in sorted(tier_facilities, key=lambda x: x["min"], reverse=True):
                        if leftover <= 0:
                            break
                        allocations[f["id"]] += 1.0
                        leftover -= 1.0

                trade_off_notes.append(
                    f"Tier [{priority}] rationed to {((remaining_supply / tier_min_needed) * 100):.1f}% of minimum capacity."
                )
                remaining_supply = 0.0
            else:
                for f in tier_facilities:
                    allocations[f["id"]] = 0.0
                    reasons[f["id"]] = f"{priority} priority: 0 L allocated. All available supply exhausted by higher priority tiers."
                trade_off_notes.append(
                    f"Tier [{priority}] received zero water (supply exhausted by higher-priority tiers)."
                )

    # CASE B: Surplus available (S >= total_minimum)
    else:
        step_explanations.append(
            f"Baseline Guarantee: Available supply ({S:,.0f} L/day) satisfies 100% of community minimum requirements ({total_minimum:,.0f} L/day). "
            f"Guaranteeing all facility minimums first."
        )

        for f in f_list:
            allocations[f["id"]] = f["min"]
            reasons[f["id"]] = f"Protected minimum baseline ({f['min']:,.0f} L) guaranteed."

        surplus_supply = S - total_minimum
        step_explanations.append(
            f"Protected Minimums Guaranteed: {total_minimum:,.0f} L distributed. Surplus supply available for demand fulfillment: {surplus_supply:,.0f} L."
        )

        for priority in PRIORITY_ORDER:
            tier_facilities = priority_groups[priority]
            if not tier_facilities:
                continue

            tier_unmet_demand = sum(f["demand"] - f["min"] for f in tier_facilities)
            if tier_unmet_demand <= 0:
                step_explanations.append(f"Tier [{priority}]: All facilities already at 100% demand capacity.")
                continue

            if surplus_supply >= tier_unmet_demand:
                for f in tier_facilities:
                    added = f["demand"] - f["min"]
                    allocations[f["id"]] += added
                    reasons[f["id"]] = f"{priority} priority: 100% of requested demand ({f['demand']:,.0f} L) fully satisfied."
                surplus_supply -= tier_unmet_demand
                step_explanations.append(
                    f"Tier [{priority}]: 100% of remaining demand ({tier_unmet_demand:,.0f} L) fulfilled. Remaining surplus: {surplus_supply:,.0f} L."
                )
            elif surplus_supply > 0:
                step_explanations.append(
                    f"Tier [{priority}]: Partial surplus ({surplus_supply:,.0f} L available vs {tier_unmet_demand:,.0f} L requested). "
                    "Distributing surplus proportionally according to unmet demand."
                )
                allocated_so_far = 0.0
                for f in tier_facilities:
                    unmet = f["demand"] - f["min"]
                    if unmet > 0 and tier_unmet_demand > 0:
                        bonus = math.floor((unmet / tier_unmet_demand) * surplus_supply)
                    else:
                        bonus = 0.0
                    allocations[f["id"]] += bonus
                    allocated_so_far += bonus
                    reasons[f["id"]] = (
                        f"{priority} priority: Minimum ({f['min']:,.0f} L) guaranteed + {bonus:,.0f} L proportional surplus share "
                        f"({((f['min'] + bonus) / f['demand'] * 100):.1f}% of {f['demand']:,.0f} L demand)."
                    )

                leftover = surplus_supply - allocated_so_far
                if leftover > 0:
                    for f in sorted(tier_facilities, key=lambda x: x["demand"] - x["min"], reverse=True):
                        if leftover <= 0:
                            break
                        allocations[f["id"]] += 1.0
                        leftover -= 1.0

                trade_off_notes.append(
                    f"Tier [{priority}] received minimums plus {((surplus_supply / tier_unmet_demand) * 100):.1f}% of remaining discretionary demand."
                )
                surplus_supply = 0.0
            else:
                for f in tier_facilities:
                    reasons[f["id"]] = (
                        f"{priority} priority: Minimum ({f['min']:,.0f} L) guaranteed. Discretionary demand ({f['demand'] - f['min']:,.0f} L) curtailed due to exhausted surplus."
                        if f["demand"] > f["min"]
                        else f"{priority} priority: 100% satisfied at minimum threshold."
                    )
                trade_off_notes.append(
                    f"Tier [{priority}] discretionary demand curtailed (surplus exhausted by higher-priority tiers)."
                )

        remaining_supply = surplus_supply

    # Generate facility allocation schemas
    facility_allocations: List[FacilityAllocationItemSchema] = []
    total_allocated = sum(allocations.values())
    remaining_reserve = max(0.0, S - total_allocated)
    total_unmet = max(0.0, total_demand - total_allocated)
    critical_deficits = 0
    critical_unmet_liters = 0.0

    for f in f_list:
        f_id = f["id"]
        alloc = allocations[f_id]
        unmet = max(0.0, f["demand"] - alloc)
        fulfilled_pct = round((alloc / f["demand"]) * 1000) / 10 if f["demand"] > 0 else 100.0
        shortage_pct = round((unmet / f["demand"]) * 1000) / 10 if f["demand"] > 0 else 0.0
        min_met = alloc >= f["min"]
        min_deficit = max(0.0, f["min"] - alloc)

        if not min_met:
            critical_deficits += 1
            critical_unmet_liters += min_deficit

        people_protected = f["people"] if min_met else (
            round(f["people"] * (alloc / f["min"])) if f["min"] > 0 else 0
        )

        status = "fully_met"
        if alloc >= f["demand"]:
            status = "fully_met"
        elif alloc == f["min"] and f["demand"] > f["min"]:
            status = "minimum_only"
        elif alloc > f["min"] and alloc < f["demand"]:
            status = "partially_met"
        elif alloc < f["min"] and alloc > 0:
            status = "critical_deficit"
        elif alloc == 0:
            status = "zero_allocation"

        facility_allocations.append(
            FacilityAllocationItemSchema(
                facilityId=f_id,
                facilityName=f["name"],
                type=f["type"],
                priority=f["priority"],
                demandLiters=f["demand"],
                minLiters=f["min"],
                allocatedLiters=alloc,
                unmetLiters=unmet,
                shortagePercentage=shortage_pct,
                fulfilledPercentage=fulfilled_pct,
                minMet=min_met,
                minDeficitLiters=min_deficit,
                peopleProtected=people_protected,
                status=status,
                reason=reasons.get(f_id, "Allocated per priority rules."),
            )
        )

    if not all_minimums_met:
        explanation = (
            f"CRITICAL SHORTAGE: Available supply ({S:,.0f} L/day) is below total community minimum "
            f"requirements ({total_minimum:,.0f} L/day). {critical_deficits} facilities experienced sub-minimum deficits "
            f"totaling {critical_unmet_liters:,.0f} L/day. Strict priority rationing applied."
        )
    elif total_allocated >= total_demand:
        explanation = (
            f"NORMAL SUPPLY: 100% of community demand ({total_demand:,.0f} L/day) fully met. "
            f"Remaining unallocated supply: {remaining_reserve:,.0f} L/day."
        )
    else:
        explanation = (
            f"MODERATE SCARCITY: All facility minimums guaranteed ({total_minimum:,.0f} L/day). "
            f"{total_allocated:,.0f} L/day allocated across {len(f_list)} facilities ({((total_allocated / total_demand) * 100):.1f}% of total demand). "
            f"Unmet discretionary demand: {total_unmet:,.0f} L/day."
        )

    return SimulationResultResponse(
        availableSupply=S,
        totalDemand=total_demand,
        totalAllocated=total_allocated,
        remainingReserve=remaining_reserve,
        totalUnmetDemand=total_unmet,
        criticalDeficitCount=critical_deficits,
        criticalUnmetLiters=critical_unmet_liters,
        allMinimumsMet=all_minimums_met,
        facilityAllocations=facility_allocations,
        explanation=explanation,
        stepExplanations=step_explanations,
        tradeOffNotes=trade_off_notes,
        timestamp=datetime.now(timezone.utc).isoformat(),
        isSimulatedEstimate=True,
    )
