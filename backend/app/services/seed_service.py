import logging
from sqlalchemy.orm import Session
from app.models.community import Community
from app.models.water_source import WaterSource
from app.models.water_budget import WaterBudget
from app.models.allocation import Facility
from app.models.consumption import ConsumptionRecord, MeterLedger
from app.models.forecast import ForecastPoint, HistoricalReportPoint
from app.models.alert import AlertItem

logger = logging.getLogger(__name__)


def seed_database_if_empty(db: Session) -> bool:
    """Seeds the database with baseline hydrological data matching mockData.ts if empty."""
    community = db.query(Community).filter(Community.id == "green-valley-01").first()
    if community:
        return False  # Already seeded

    logger.info("Database is empty. Seeding initial AquaMind AI data...")

    # 1. Community
    community = Community(
        id="green-valley-01",
        name="Green Valley Community",
        phase="Phase 1-4",
        units=542,
        population=1840,
        commercial_nodes=28,
        parkland_hectares=14.2,
        authority="Maricopa County Hydrological District 09",
        officer_name="Yogesh Mulaje",
        emergency_phone="+1 (480) 555-0193 [24/7 SMS]",
        daily_yield_cap=100000.0,
        emergency_reserve_floor=10000.0,
        per_capita_baseline=108.0,
        heat_advisory_multiplier=1.15,
    )
    db.add(community)
    db.flush()

    # 2. Water Source
    water_source = WaterSource(
        id="src-valley-reservoir",
        community_id="green-valley-01",
        name="Valley Municipal Reservoir",
        source_type="reservoir",
        daily_supply_liters=90000.0,
        reservoir_capacity_liters=500000.0,
        current_stored_liters=320000.0,
        incoming_supply_liters=85000.0,
        planning_period_days=7,
        expected_shortage_duration_days=5,
        status="active",
    )
    db.add(water_source)

    # 3. Water Budget
    budget = WaterBudget(
        id="wb-green-valley-01",
        community_id="green-valley-01",
        name="Active Water Budget",
        total_available=100000.0,
        residential_liters=52000.0,
        commercial_liters=20000.0,
        facilities_liters=12000.0,
        landscaping_liters=7500.0,
        reserve_locked_liters=10000.0,
        active_preset="standard",
        is_active=True,
    )
    db.add(budget)

    # 4. Facilities
    facilities = [
        Facility(
            id="fac-hospital",
            community_id="green-valley-01",
            name="General County Hospital",
            type="Healthcare",
            demand_liters=35000.0,
            min_liters=25000.0,
            priority="Critical",
            people_served=450,
            notes="Intensive care, surgical suites, sterile processing, and emergency triage.",
        ),
        Facility(
            id="fac-school",
            community_id="green-valley-01",
            name="District Unified School",
            type="Education",
            demand_liters=20000.0,
            min_liters=10000.0,
            priority="High",
            people_served=1200,
            notes="K-12 campus, cafeteria preparation, student sanitation facilities.",
        ),
        Facility(
            id="fac-residential",
            community_id="green-valley-01",
            name="Valley Residential Sector",
            type="Residential",
            demand_liters=30000.0,
            min_liters=18000.0,
            priority="High",
            people_served=1840,
            notes="Domestic potable tap, cooking, basic hygiene across 542 residential units.",
        ),
        Facility(
            id="fac-commercial",
            community_id="green-valley-01",
            name="Metro Commercial Plaza",
            type="Commercial",
            demand_liters=25000.0,
            min_liters=5000.0,
            priority="Medium",
            people_served=650,
            notes="Offices, retail stores, food court and sanitary facilities.",
        ),
        Facility(
            id="fac-park",
            community_id="green-valley-01",
            name="Municipal Central Park",
            type="Recreation",
            demand_liters=10000.0,
            min_liters=0.0,
            priority="Low",
            people_served=500,
            notes="Public lawns, botanical garden irrigation, ornamental water features.",
        ),
    ]
    db.add_all(facilities)

    # 5. Consumption Records (Meter Readings)
    readings = [
        ConsumptionRecord(
            id="rec-001",
            community_id="green-valley-01",
            meter_id="MTR-104",
            zone="Block A Residential (MTR-104)",
            volume=11200.0,
            reading_date="2025-07-24T08:00:00Z",
            source="manual",
            reading_type="24h_cycle",
            technician_notes="Manual optical reading verified at main residential junction vault.",
        ),
        ConsumptionRecord(
            id="rec-002",
            community_id="green-valley-01",
            meter_id="MTR-502",
            zone="Emergency Hospital Feeder Line (MTR-502)",
            volume=25400.0,
            reading_date="2025-07-24T07:30:00Z",
            source="sensor",
            reading_type="instantaneous",
            technician_notes="Automated ultrasonic differential sensor confirmed continuous positive head.",
        ),
        ConsumptionRecord(
            id="rec-003",
            community_id="green-valley-01",
            meter_id="MTR-301",
            zone="Commercial Retail Plaza (MTR-301)",
            volume=8900.0,
            reading_date="2025-07-23T18:00:00Z",
            source="manual",
            reading_type="24h_cycle",
            technician_notes="Routine end-of-business cycle verification.",
        ),
    ]
    db.add_all(readings)

    # 6. Meter Ledgers (Sub-zone meter rows)
    meters = [
        MeterLedger(
            id="MTR-104",
            community_id="green-valley-01",
            substation="Sub-Station 1",
            zone_name="Block A Residential (Units 1-120)",
            meter_architecture="Ultrasonic Smart Meter",
            allocated_quota=360000.0,
            recorded_usage=345600.0,
            adherence_delta=-14400.0,
            percentage_delta=-4.0,
            compliance_status="compliant",
        ),
        MeterLedger(
            id="MTR-105",
            community_id="green-valley-01",
            substation="Sub-Station 1",
            zone_name="Block B Residential (Units 121-240)",
            meter_architecture="Ultrasonic Smart Meter",
            allocated_quota=360000.0,
            recorded_usage=372600.0,
            adherence_delta=12600.0,
            percentage_delta=3.5,
            compliance_status="over_quota",
        ),
        MeterLedger(
            id="MTR-202",
            community_id="green-valley-01",
            substation="Loop Circ B",
            zone_name="Clubhouse & Aquatic Facility",
            meter_architecture="Acoustic Flow Transducer",
            allocated_quota=240000.0,
            recorded_usage=228000.0,
            adherence_delta=-12000.0,
            percentage_delta=-5.0,
            compliance_status="compliant",
        ),
        MeterLedger(
            id="MTR-301",
            community_id="green-valley-01",
            substation="Commercial Feeder",
            zone_name="Retail Plaza & Dining Hub",
            meter_architecture="Ultrasonic Smart Meter",
            allocated_quota=560000.0,
            recorded_usage=588000.0,
            adherence_delta=28000.0,
            percentage_delta=5.0,
            compliance_status="over_quota",
        ),
        MeterLedger(
            id="MTR-502",
            community_id="green-valley-01",
            substation="Gravity Main N",
            zone_name="Emergency Hospital Feeder Line",
            meter_architecture="Pressurized Dual Ultrasonic",
            allocated_quota=150000.0,
            recorded_usage=150000.0,
            adherence_delta=0.0,
            percentage_delta=0.0,
            compliance_status="protected",
        ),
    ]
    db.add_all(meters)

    # 7. Forecast Points
    forecast_points = [
        ForecastPoint(
            id="fc-01",
            community_id="green-valley-01",
            forecast_date="2025-07-18",
            day_label="Mon Jul 18",
            actual_liters=68500.0,
            baseline_liters=100000.0,
            weather_temp=29.0,
        ),
        ForecastPoint(
            id="fc-02",
            community_id="green-valley-01",
            forecast_date="2025-07-19",
            day_label="Tue Jul 19",
            actual_liters=70800.0,
            baseline_liters=100000.0,
            weather_temp=30.0,
        ),
        ForecastPoint(
            id="fc-03",
            community_id="green-valley-01",
            forecast_date="2025-07-20",
            day_label="Wed Jul 20",
            actual_liters=73900.0,
            baseline_liters=100000.0,
            weather_temp=31.0,
        ),
        ForecastPoint(
            id="fc-04",
            community_id="green-valley-01",
            forecast_date="2025-07-21",
            day_label="Mon Jul 21",
            actual_liters=69400.0,
            baseline_liters=100000.0,
            weather_temp=30.0,
        ),
        ForecastPoint(
            id="fc-05",
            community_id="green-valley-01",
            forecast_date="2025-07-22",
            day_label="Tue Jul 22",
            actual_liters=71200.0,
            baseline_liters=100000.0,
            weather_temp=31.0,
        ),
        ForecastPoint(
            id="fc-06",
            community_id="green-valley-01",
            forecast_date="2025-07-23",
            day_label="Wed Jul 23",
            actual_liters=74100.0,
            baseline_liters=100000.0,
            weather_temp=32.0,
        ),
        ForecastPoint(
            id="fc-07",
            community_id="green-valley-01",
            forecast_date="2025-07-24",
            day_label="Thu (Today)",
            actual_liters=72000.0,
            forecast_liters=72000.0,
            baseline_liters=100000.0,
            weather_temp=32.0,
        ),
        ForecastPoint(
            id="fc-08",
            community_id="green-valley-01",
            forecast_date="2025-07-25",
            day_label="Fri Jul 25 ★",
            forecast_liters=105000.0,
            ci_lower=101200.0,
            ci_upper=108800.0,
            baseline_liters=100000.0,
            weather_temp=34.0,
            is_peak=True,
            is_breach=True,
        ),
        ForecastPoint(
            id="fc-09",
            community_id="green-valley-01",
            forecast_date="2025-07-26",
            day_label="Sat Jul 26",
            forecast_liters=108000.0,
            ci_lower=104200.0,
            ci_upper=111800.0,
            baseline_liters=100000.0,
            weather_temp=34.0,
            is_peak=True,
            is_breach=True,
        ),
    ]
    db.add_all(forecast_points)

    # 8. Historical Report Points (July records)
    report_points = [
        HistoricalReportPoint(
            id="hr-01", community_id="green-valley-01", day_number=1, date_str="Jul 01", actual_liters=69200.0
        ),
        HistoricalReportPoint(
            id="hr-02", community_id="green-valley-01", day_number=2, date_str="Jul 02", actual_liters=67800.0
        ),
        HistoricalReportPoint(
            id="hr-12",
            community_id="green-valley-01",
            day_number=12,
            date_str="Jul 12",
            actual_liters=108400.0,
            is_spike=True,
            spike_reason="Phase 2 Solenoid Stoppage & Pressure Lift",
        ),
        HistoricalReportPoint(
            id="hr-20",
            community_id="green-valley-01",
            day_number=20,
            date_str="Jul 20",
            actual_liters=114200.0,
            is_spike=True,
            spike_reason="Weekend Heatwave Peak + Pool Refill",
        ),
    ]
    db.add_all(report_points)

    # 9. Alerts
    alerts = [
        AlertItem(
            id="ALT-8402",
            code="#ALT-8402",
            community_id="green-valley-01",
            severity="critical",
            category_label="CRITICAL DEFICIT SHORTAGE",
            title="Projected Peak Exceedance: 12,000 L/day Supply Breach",
            description="Model detected compound thermal surge and weekend occupancy overlap driving demand to 112,000 L/day against 100,000 L/day hydrological safe ceiling.",
            timestamp_str="Today, 08:30 UTC",
            time_ago="25m ago",
            impact_volume=12000.0,
            impact_unit="L/day",
            breach_window="Jul 25, 08:00 - Jul 26 (36h Window)",
            confidence=94.8,
            status="active",
            regulatory_notice="Local Ordinance § 42-B Alert Trigger Level 2",
            shap_drivers=[
                {"name": "Atmospheric Temperature (+34°C Heatwave)", "impactLiters": 6200, "percentage": 51.6, "icon": "thermometer", "description": "Ambient heat accelerating landscape evapotranspiration and commercial cooling towers."},
                {"name": "Weekend Community Residency (+18% Occupancy)", "impactLiters": 3400, "percentage": 28.3, "icon": "users", "description": "Domestic occupancy spike, clubhouse pool replenishment, laundry and meal preparation."},
                {"name": "Municipal Off-Peak Booster Compensation", "impactLiters": 1800, "percentage": 15.0, "icon": "gauge", "description": "Utility line maintenance lowering inlet pressure, triggering booster pump top-up."},
            ],
            prescribed_mitigations=[
                {"id": "mit-1", "title": "Enforce Immediate Level-2 Irrigation Moratorium", "impactLiters": 4500, "impactPercentage": 37.5, "description": "Throttles park sprayers and green belts between 06:00 and 21:00.", "isDefaultSelected": True},
                {"id": "mit-2", "title": "Shift Commercial HVAC Chillers to Off-Peak (01:00-05:00)", "impactLiters": 2200, "impactPercentage": 18.3, "description": "Pre-cool commercial core overnight during minimal evaporation window.", "isDefaultSelected": True},
                {"id": "mit-3", "title": "Release Rainwater Storage Tank A Non-Potable Reserves", "impactLiters": 5000, "impactPercentage": 41.7, "description": "Auxiliary graywater substitution for non-potable sanitation and cooling.", "isDefaultSelected": True},
            ],
        ),
        AlertItem(
            id="ALT-8399",
            code="#ALT-8399",
            community_id="green-valley-01",
            severity="critical",
            category_label="POLICY CONSTRAINT VIOLATION",
            title="Mandatory Emergency Fire Reserve Threshold at Risk",
            description="If unregulated commercial cooling draw continues, inviolable safety reserve may be compromised by Saturday 02:00.",
            timestamp_str="Today, 07:15 UTC",
            time_ago="1h 40m ago",
            impact_volume=10000.0,
            impact_unit="L Reserve Floor",
            breach_window="T-minus 42 Hours",
            confidence=96.2,
            status="active",
            regulatory_notice="Regional Water Board Rule 14-B Protected Threshold",
            shap_drivers=[
                {"name": "Unregulated Commercial Feeder Draw", "impactLiters": 3800, "percentage": 65.0, "icon": "store", "description": "Retail plaza chillers operating above authorized volumetric quota."},
                {"name": "Supply Feed Inlet Restriction", "impactLiters": 2100, "percentage": 35.0, "icon": "droplets", "description": "Upstream municipal main line valve throttled by regional water board."},
            ],
            prescribed_mitigations=[
                {"id": "mit-fire-1", "title": "Isolate Commercial Valve B-08 & Enforce Statutory Floor", "impactLiters": 4000, "impactPercentage": 70.0, "description": "Rebalance draw rate to protect emergency 10,000 L safety margin.", "isDefaultSelected": True},
            ],
        ),
        AlertItem(
            id="ALT-8391",
            code="#ALT-8391",
            community_id="green-valley-01",
            severity="warning",
            category_label="ANOMALOUS CONSUMPTION",
            title="Nighttime Baseflow Leak Signature in Sector 2 (Phase 3 Parklands)",
            description="Acoustic and pressure telemetry indicates probable sub-surface distribution pipe fissure or stuck irrigation solenoid valve.",
            timestamp_str="Jul 23, 22:40 UTC",
            time_ago="Yesterday",
            impact_volume=1450.0,
            impact_unit="L/hr continuous",
            breach_window="~11,600 L / 24h cycle",
            confidence=92.4,
            status="active",
            regulatory_notice="Smart Ultrasonic Meter S2-M12 Continuous Telemetry",
            shap_drivers=[
                {"name": "Acoustic Transducer High Vibration", "impactLiters": 1100, "percentage": 75.0, "icon": "activity", "description": "Unusual acoustic frequency detected near joint Manifold 3."},
            ],
            prescribed_mitigations=[
                {"id": "mit-leak-1", "title": "Remotely Throttle Sector 2 Drip Valve B-14", "impactLiters": 1450, "impactPercentage": 100.0, "description": "Isolate manifold pending physical technician inspection.", "isDefaultSelected": True},
            ],
        ),
    ]
    db.add_all(alerts)

    db.commit()
    logger.info("Database successfully seeded.")
    return True
