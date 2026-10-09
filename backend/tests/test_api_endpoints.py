import pytest
from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "database" in data
    assert data["database"]["status"] == "connected"


def test_get_communities(client: TestClient):
    response = client.get("/api/communities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["id"] == "green-valley-01"


def test_get_dashboard(client: TestClient):
    response = client.get("/api/dashboard?community_id=green-valley-01")
    assert response.status_code == 200
    data = response.json()
    assert "community" in data
    assert "water_source" in data
    assert "water_budget" in data
    assert "simulation" in data
    assert "facilities" in data
    assert "recent_readings" in data
    assert "forecast_trajectory" in data
    assert "active_alerts" in data
    assert data["simulation"]["allMinimumsMet"] is True


def test_water_budgets_crud(client: TestClient):
    # GET
    get_res = client.get("/api/water-budgets?community_id=green-valley-01")
    assert get_res.status_code == 200
    current = get_res.json()
    assert current["residential_liters"] == 52000.0

    # POST (Update allocations)
    payload = {
        "community_id": "green-valley-01",
        "name": "Updated Conservation Budget",
        "total_available": 100000.0,
        "residential_liters": 50000.0,
        "commercial_liters": 18000.0,
        "facilities_liters": 12000.0,
        "landscaping_liters": 5000.0,
        "reserve_locked_liters": 15000.0,
        "active_preset": "conservation",
    }
    post_res = client.post("/api/water-budgets", json=payload)
    assert post_res.status_code == 200
    updated = post_res.json()
    assert updated["residential_liters"] == 50000.0
    assert updated["active_preset"] == "conservation"


def test_consumption_records_crud(client: TestClient):
    # GET
    get_res = client.get("/api/consumption?community_id=green-valley-01")
    assert get_res.status_code == 200
    readings = get_res.json()
    assert len(readings) >= 1

    # POST
    payload = {
        "community_id": "green-valley-01",
        "zone": "Sector 4 Parkland Inflow (MTR-408)",
        "meter_id": "MTR-408",
        "volume": 7650.0,
        "reading_date": "2025-07-25T10:00:00Z",
        "source": "sensor",
        "reading_type": "instantaneous",
        "technician_notes": "Acoustic transducer calibrated.",
    }
    post_res = client.post("/api/consumption", json=payload)
    assert post_res.status_code == 201
    created = post_res.json()
    assert created["meter_id"] == "MTR-408"
    assert created["volume"] == 7650.0


def test_forecasts_endpoints(client: TestClient):
    # GET
    get_res = client.get("/api/forecasts?community_id=green-valley-01&horizon=7")
    assert get_res.status_code == 200
    points = get_res.json()
    assert len(points) >= 1

    # POST generate/simulate
    gen_payload = {
        "community_id": "green-valley-01",
        "horizon_days": 7,
        "mitigate_irrigation": True,
        "mitigate_hvac": True,
        "mitigate_rainwater": True,
    }
    gen_res = client.post("/api/forecasts/generate", json=gen_payload)
    assert gen_res.status_code == 200
    summary = gen_res.json()
    assert summary["horizon"] == "7d"
    assert summary["total_relief_liters"] == 11700.0
    assert summary["simulated_peak_liters"] == 100300.0
    assert summary["is_deficit_eliminated"] is False


def test_alerts_endpoints(client: TestClient):
    # GET
    get_res = client.get("/api/alerts?community_id=green-valley-01")
    assert get_res.status_code == 200
    alerts = get_res.json()
    assert len(alerts) >= 1
    alert_id = alerts[0]["id"]

    # PATCH status
    patch_res = client.patch(f"/api/alerts/{alert_id}/status", json={"status": "acknowledged"})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "acknowledged"


def test_facilities_and_simulation(client: TestClient):
    # GET facilities
    fac_res = client.get("/api/facilities?community_id=green-valley-01")
    assert fac_res.status_code == 200
    facilities = fac_res.json()
    assert len(facilities) >= 5

    # Run simulation endpoint
    sim_payload = {
        "community_id": "green-valley-01",
        "water_availability": {
            "dailySupplyLiters": 90000.0,
            "reservoirCapacityLiters": 500000.0,
            "currentStoredLiters": 320000.0,
            "incomingSupplyLiters": 85000.0,
            "planningPeriodDays": 7,
            "expectedShortageDurationDays": 5,
        },
    }
    sim_res = client.post("/api/simulation/run", json=sim_payload)
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert sim_data["availableSupply"] == 90000.0
    assert sim_data["allMinimumsMet"] is True
