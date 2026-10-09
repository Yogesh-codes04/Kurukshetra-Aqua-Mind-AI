import pytest
from app.services.allocation_service import run_water_allocation_simulation

SAMPLE_FACILITIES = [
    {
        "id": "fac-hospital",
        "name": "General County Hospital",
        "type": "Healthcare",
        "demand_liters": 35000.0,
        "min_liters": 25000.0,
        "priority": "Critical",
        "people_served": 450,
    },
    {
        "id": "fac-school",
        "name": "District Unified School",
        "type": "Education",
        "demand_liters": 20000.0,
        "min_liters": 10000.0,
        "priority": "High",
        "people_served": 1200,
    },
    {
        "id": "fac-residential",
        "name": "Valley Residential Sector",
        "type": "Residential",
        "demand_liters": 30000.0,
        "min_liters": 18000.0,
        "priority": "High",
        "people_served": 1840,
    },
    {
        "id": "fac-commercial",
        "name": "Metro Commercial Plaza",
        "type": "Commercial",
        "demand_liters": 25000.0,
        "min_liters": 5000.0,
        "priority": "Medium",
        "people_served": 650,
    },
    {
        "id": "fac-park",
        "name": "Municipal Central Park",
        "type": "Recreation",
        "demand_liters": 10000.0,
        "min_liters": 0.0,
        "priority": "Low",
        "people_served": 500,
    },
]

# Total demand: 35000 + 20000 + 30000 + 25000 + 10000 = 120,000 L
# Total minimum: 25000 + 10000 + 18000 + 5000 + 0 = 58,000 L


def test_normal_supply_meets_all_demands():
    """When supply exceeds total demand (e.g. 125,000 L >= 120,000 L), all demands are 100% met."""
    result = run_water_allocation_simulation(SAMPLE_FACILITIES, daily_supply_liters=125000.0)

    assert result.availableSupply == 125000.0
    assert result.totalDemand == 120000.0
    assert result.totalAllocated == 120000.0
    assert result.remainingReserve == 5000.0
    assert result.totalUnmetDemand == 0.0
    assert result.allMinimumsMet is True
    assert result.criticalDeficitCount == 0

    for alloc in result.facilityAllocations:
        assert alloc.status == "fully_met"
        assert alloc.fulfilledPercentage == 100.0
        assert alloc.allocatedLiters == alloc.demandLiters


def test_moderate_scarcity_guarantees_minimums():
    """When supply is between total minimum and total demand (e.g. 90,000 L),
    all minimums are met, and surplus is allocated by priority.
    """
    result = run_water_allocation_simulation(SAMPLE_FACILITIES, daily_supply_liters=90000.0)

    assert result.totalAllocated == 90000.0
    assert result.allMinimumsMet is True
    assert result.criticalDeficitCount == 0

    # Critical hospital should receive 100% of demand (25000 min + 10000 surplus)
    hosp = next(f for f in result.facilityAllocations if f.facilityId == "fac-hospital")
    assert hosp.allocatedLiters == 35000.0
    assert hosp.status == "fully_met"

    # Low priority park should receive less than full demand
    park = next(f for f in result.facilityAllocations if f.facilityId == "fac-park")
    assert park.allocatedLiters < park.demandLiters


def test_critical_scarcity_sub_minimum_rationing():
    """When supply is strictly below total minimums (e.g. 45,000 L < 58,000 L),
    allMinimumsMet must be False, and lower priority tiers must be rationed.
    """
    result = run_water_allocation_simulation(SAMPLE_FACILITIES, daily_supply_liters=45000.0)

    assert result.allMinimumsMet is False
    assert result.criticalDeficitCount > 0
    assert result.criticalUnmetLiters > 0.0
    assert result.totalAllocated <= 45000.0

    # Critical tier (hospital min = 25,000) must be protected first
    hosp = next(f for f in result.facilityAllocations if f.facilityId == "fac-hospital")
    assert hosp.allocatedLiters == 25000.0
    assert hosp.minMet is True

    # Low priority park must get 0
    park = next(f for f in result.facilityAllocations if f.facilityId == "fac-park")
    assert park.allocatedLiters == 0.0


def test_empty_facilities_handling():
    """Edge case: empty facility list returns clean zeroed response."""
    result = run_water_allocation_simulation([], daily_supply_liters=50000.0)
    assert result.totalDemand == 0.0
    assert result.totalAllocated == 0.0
    assert result.allMinimumsMet is True
    assert len(result.facilityAllocations) == 0
