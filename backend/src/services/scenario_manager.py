from typing import Dict, Any

class ScenarioManager:
    """
    Manages crisis simulation personas, background incident dossiers,
    tactical negotiation objectives, and dynamic LLM system contexts.
    """

    SCENARIOS: Dict[str, Dict[str, Any]] = {
        "bank_hostage": {
            "id": "bank_hostage",
            "title": "Armed Bank Robbery",
            "subject_name": "Mark Vance (34)",
            "location": "First Federal Savings, Downtown",
            "threat_level": "CRITICAL",
            "hostages": "4 civilian bank tellers",
            "overview": "Suspect is cornered in the vault room with a 9mm firearm. Demanding an armored SUV and clear route to interstate.",
            "prompt_personality": """You are Mark Vance, a desperate 34-year-old cornered in a bank vault holding 4 hostages.
Your adrenaline is surging, you feel trapped by police snipers outside, and you are terrified of spending life in prison.
If the trainee speaks with threats or demands, get furious and yell.
If the trainee demonstrates genuine empathy, active listening, and calm grounding, gradually lower your weapon and consider negotiating.""",
            "cartesia_voice_id": "a0e17861-1792-4174-a5d6-f62071636709"
        },
        "bridge_jumper": {
            "id": "bridge_jumper",
            "title": "Suicide Intervention",
            "subject_name": "David Cole (28)",
            "location": "Suspension Bridge Walkway, Pier 4",
            "threat_level": "HIGH",
            "hostages": "Self-harm threat",
            "overview": "Subject is standing on the outer ledge over icy waters. Depressed, emotionally exhausted, feeling completely isolated.",
            "prompt_personality": """You are David Cole, a 28-year-old standing on the outer railing of a bridge ledge.
You feel empty, completely hopeless, and believe everyone would be better off without you.
Do NOT respond to logical arguments or police orders.
Only respond if the trainee listens patiently, validates your pain, and makes you feel truly heard without judgment.""",
            "cartesia_voice_id": "69267136-1bdc-4103-a11a-7a06aa764fb5"
        },
        "cyber_extortion": {
            "id": "cyber_extortion",
            "title": "Healthcare Ransomware Extortion",
            "subject_name": "Cipher-X Syndicate",
            "location": "Dark Web Voice Relay",
            "threat_level": "MODERATE",
            "hostages": "Hospital ICU life-support telemetry",
            "overview": "Cyber threat actor encrypted hospital network. Demands 50 BTC within 45 minutes or keys will be permanently deleted.",
            "prompt_personality": """You are the lead negotiator for Cipher-X, a disciplined cyber-extortion group.
You are professional, cold, and calculated. You despise small talk and emotional manipulation.
You respond only to proof of funds, professional crisis management, and calm procedural counter-proposals.
If the trainee displays panic or hesitation, leverage the deadline aggressively.""",
            "cartesia_voice_id": "2ee87190-8f84-4925-97da-e52547f9469c"
        }
    }

    def __init__(self):
        self.active_scenario_id = "bank_hostage"

    def set_scenario(self, scenario_id: str) -> Dict[str, Any]:
        if scenario_id in self.SCENARIOS:
            self.active_scenario_id = scenario_id
        return self.get_active_scenario()

    def get_active_scenario(self) -> Dict[str, Any]:
        return self.SCENARIOS.get(self.active_scenario_id, self.SCENARIOS["bank_hostage"])

    def list_scenarios(self) -> list:
        return [
            {
                "id": s["id"],
                "title": s["title"],
                "subject_name": s["subject_name"],
                "threat_level": s["threat_level"],
                "location": s["location"]
            }
            for s in self.SCENARIOS.values()
        ]
