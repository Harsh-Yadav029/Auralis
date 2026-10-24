"""
tests/test_phase3_benchmarks.py
Verification suite for Phase 3:
1. Validates Dockerfiles exist and have valid structure.
2. Validates docker-compose.yml configuration (no cloud API keys, correct port/volume mappings).
3. Validates latency benchmark metrics collector.
"""

import os
import pytest
import yaml

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def test_dockerfiles_exist_and_non_empty():
    """Verify that Dockerfiles exist and define base images and ENTRYPOINT/CMD."""
    paths = [
        os.path.join(BASE_DIR, "backend", "Dockerfile"),
        os.path.join(BASE_DIR, "ml-service", "Dockerfile"),
        os.path.join(BASE_DIR, "frontend", "Dockerfile"),
    ]

    for p in paths:
        assert os.path.isfile(p), f"Missing Dockerfile: {p}"
        with open(p, "r", encoding="utf-8") as f:
            content = f.read()
        assert "FROM " in content, f"{p} must contain a FROM directive"
        assert ("CMD" in content or "ENTRYPOINT" in content), f"{p} must define CMD or ENTRYPOINT"


def test_docker_compose_configuration():
    """Verify docker-compose.yml has no cloud API keys and correctly maps services."""
    compose_path = os.path.join(BASE_DIR, "infra", "docker", "docker-compose.yml")
    assert os.path.isfile(compose_path), "Missing docker-compose.yml"

    with open(compose_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    assert "services" in data
    services = data["services"]
    assert "auralis-web" in services
    assert "auralis-gateway" in services
    assert "auralis-ml-service" in services
    assert "coturn" in services

    # Ensure no Groq or Cartesia cloud keys are embedded
    content_raw = yaml.dump(data)
    assert "GROQ_API_KEY" not in content_raw
    assert "CARTESIA_API_KEY" not in content_raw

    # Gateway must point to local Ollama host bridge
    gateway_env = services["auralis-gateway"]["environment"]
    env_dict = {}
    for item in gateway_env:
        if "=" in item:
            k, v = item.split("=", 1)
            env_dict[k] = v
    assert "OLLAMA_BASE_URL" in env_dict
    assert "host.docker.internal" in env_dict["OLLAMA_BASE_URL"]


@pytest.mark.asyncio
async def test_benchmark_single_turn_contract():
    """Verify benchmark_single_turn returns complete timing dictionary."""
    import sys
    if BASE_DIR not in sys.path:
        sys.path.insert(0, BASE_DIR)
    backend_path = os.path.join(BASE_DIR, "backend")
    if backend_path not in sys.path:
        sys.path.insert(0, backend_path)

    from scripts.benchmark_latency import benchmark_single_turn
    from src.services.llm_service import OllamaLLMEngine
    from src.services.tts_service import KokoroTTSService

    llm = OllamaLLMEngine()
    tts = KokoroTTSService()

    metrics = await benchmark_single_turn(
        llm, tts, "Can you put down the weapon?",
        {"arousal": 0.5, "valence": 0.0, "primary_label": "neutral"}
    )

    assert "ttft_ms" in metrics
    assert "tts_chunk_ms" in metrics
    assert "ttfa_ms" in metrics
    assert "total_turn_ms" in metrics
    assert "clause_count" in metrics
    assert metrics["clause_count"] > 0
    assert metrics["ttfa_ms"] > 0
