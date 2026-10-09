import os
import json
import logging
from typing import Dict, Any, List
from app.config import settings

logger = logging.getLogger(__name__)


class RecommendationService:
    @staticmethod
    def generate_budget_explanation(
        scenario_name: str,
        supply_liters: float,
        total_demand: float,
        facilities_summary: List[Dict[str, Any]],
        critical_unmet: float,
    ) -> Dict[str, Any]:
        """Provides hydrological explanations and actionable recommendations.
        Uses Gemini server-side if GEMINI_API_KEY is configured, otherwise applies
        deterministic domain logic.
        """
        if settings.GEMINI_API_KEY:
            try:
                import urllib.request

                prompt = (
                    f"You are a municipal hydrological engineer for Aqua Mind AI. "
                    f"Explain a water scarcity situation:\n"
                    f"Scenario: {scenario_name}\n"
                    f"Available Supply: {supply_liters:,.0f} L/day\n"
                    f"Total Community Demand: {total_demand:,.0f} L/day\n"
                    f"Critical Unmet Deficit: {critical_unmet:,.0f} L/day\n"
                    f"Facilities: {json.dumps(facilities_summary[:5])}\n"
                    f"Provide a brief executive summary (2 sentences) and 3 prioritized mitigation bullet points. "
                    f"Return JSON with keys 'summary' (str) and 'recommendations' (list of strings)."
                )

                # Using Google Gemini REST API securely on backend
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"responseMimeType": "application/json"},
                }
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                    method="POST",
                )
                with urllib.request.urlopen(req, timeout=8.0) as resp:
                    resp_data = json.loads(resp.read().decode("utf-8"))
                    text = resp_data["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = json.loads(text)
                    return {
                        "source": "gemini_ai",
                        "summary": parsed.get("summary", ""),
                        "recommendations": parsed.get("recommendations", []),
                    }
            except Exception as e:
                logger.warning(f"Gemini API request failed, falling back to deterministic recommendations: {e}")

        # Deterministic domain rule-based recommendation
        deficit = max(0.0, total_demand - supply_liters)
        deficit_pct = round((deficit / total_demand) * 100, 1) if total_demand > 0 else 0.0

        if deficit == 0:
            summary = (
                f"Full baseline municipal inflow satisfied. Available supply ({supply_liters:,.0f} L/day) "
                f"covers 100% of community demand across all sectors with stable storage reserves."
            )
            recommendations = [
                "Maintain baseline reservoir storage recharge schedule (85,000 L/day replenishment).",
                "Perform routine weekly calibration across LoRaWAN ultrasonic flow transmitters.",
                "Review commercial cooling tower drift and seasonal evapotranspiration baselines.",
            ]
        elif critical_unmet > 0:
            summary = (
                f"Emergency drought alert: Community is experiencing a sub-minimum shortage with {critical_unmet:,.0f} L/day "
                f"deficit below basic survival thresholds. Mandatory tier-1 rationing is active."
            )
            recommendations = [
                "Immediately activate Emergency Fire Reserve protection and restrict non-potable landscape irrigation.",
                "Ration supply strictly to Critical healthcare suites and High-priority residential tap access.",
                "Deploy auxiliary graywater storage tank substitution for sanitation and HVAC chillers.",
                "Issue urgent public water advisory to all 542 residential units via 24/7 SMS dispatch.",
            ]
        else:
            summary = (
                f"Moderate scarcity advisory: Supply curtailed by {deficit_pct}% ({deficit:,.0f} L/day deficit). "
                f"All core human baselines are preserved, but discretionary consumption must be shifted."
            )
            recommendations = [
                "Implement 4,500 L/day landscape irrigation moratorium during peak daylight (06:00 to 21:00).",
                "Reschedule commercial HVAC pre-cooling cycles to off-peak hours (01:00 to 05:00).",
                "Encourage voluntary residential conservation to protect reservoir emergency floor.",
            ]

        return {
            "source": "hydrological_rules_engine",
            "summary": summary,
            "recommendations": recommendations,
        }
