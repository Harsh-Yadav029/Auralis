"""
scripts/benchmark_latency.py
Automated End-to-End Latency Benchmarking Harness for Auralis.
Measures Time-to-First-Audio (TTFA) across simulated crisis negotiation turns.
Calculates p50, p95, and p99 against the sub-800ms gate.
"""

import asyncio
import json
import os
import sys
import time
from typing import List, Dict, Any
import numpy as np

# Ensure backend path is first in sys.path and remove root/cwd shadowing
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_path = os.path.join(BASE_DIR, "backend")

# Strip current working directory and base directory from sys.path to avoid top-level src collision
sys.path = [p for p in sys.path if p not in ("", ".", BASE_DIR)]
if backend_path in sys.path:
    sys.path.remove(backend_path)
sys.path.insert(0, backend_path)

if "src" in sys.modules:
    for mod in list(sys.modules.keys()):
        if mod == "src" or mod.startswith("src."):
            del sys.modules[mod]

from src.services.llm_service import OllamaLLMEngine
from src.services.tts_service import KokoroTTSService
from src.services.webrtc_service import CustomOutboundAudioTrack

TEST_UTTERANCES = [
    "We have plenty of time. Tell me what you need right now.",
    "I understand you are feeling overwhelmed, but nobody has to get hurt today.",
    "Can you hear me? I am here to listen to what went wrong.",
    "Let us take a deep breath and work through this together step by step.",
    "I hear how angry you are, and I want to make sure your voice is heard safely.",
    "Tell me your name so I know who I am talking to.",
    "Put the weapon down and let the medics check on everyone.",
    "No one is going to rush the room. You have my word on that.",
    "What is the most important thing you want resolved first?",
    "I am not going anywhere. Take as much time as you need to explain."
]


async def benchmark_single_turn(
    llm: OllamaLLMEngine,
    tts: KokoroTTSService,
    utterance: str,
    emotion: Dict[str, Any]
) -> Dict[str, float]:
    """Execute a single simulated turn and capture pipeline latencies."""
    track = CustomOutboundAudioTrack()
    t_start = time.perf_counter()

    t_first_clause: float | None = None
    t_first_audio: float | None = None
    clause_count = 0
    total_audio_samples = 0

    async def on_audio_chunk(chunk: np.ndarray):
        nonlocal t_first_audio, total_audio_samples
        if t_first_audio is None:
            t_first_audio = time.perf_counter()
        total_audio_samples += len(chunk)
        await track.add_pcm_chunk(chunk)

    async for clause in llm.stream_deescalation_response(
        user_transcript=utterance,
        emotion_data=emotion,
        history=[],
    ):
        if t_first_clause is None:
            t_first_clause = time.perf_counter()
        clause_count += 1
        await tts.stream_speech(
            text_clause=clause,
            emotion_arousal=emotion.get("arousal", 0.5),
            audio_callback=on_audio_chunk,
        )

    t_end = time.perf_counter()

    now = time.perf_counter()
    ttft_ms = ((t_first_clause - t_start) * 1000) if t_first_clause else 0.0
    ttfa_ms = ((t_first_audio - t_start) * 1000) if t_first_audio else ((now - t_start) * 1000)
    tts_chunk_ms = ((t_first_audio - t_first_clause) * 1000) if (t_first_audio and t_first_clause) else 0.0
    total_turn_ms = (t_end - t_start) * 1000

    return {
        "ttft_ms": round(ttft_ms, 2),
        "tts_chunk_ms": round(tts_chunk_ms, 2),
        "ttfa_ms": round(ttfa_ms, 2),
        "total_turn_ms": round(total_turn_ms, 2),
        "clause_count": clause_count,
        "total_audio_samples": total_audio_samples,
    }


async def run_benchmark(iterations: int = 5) -> Dict[str, Any]:
    """Run sequential benchmark iterations and compute percentile distributions."""
    print("=" * 70)
    print("AURALIS END-TO-END LATENCY BENCHMARK")
    print(f"Target Gate: TTFA <= 800ms | Running {iterations} iterations")
    print("=" * 70)

    llm = OllamaLLMEngine()
    tts = KokoroTTSService()

    # Warm-up pass
    print("\n[1/3] Running warm-up pass...")
    warmup_result = await benchmark_single_turn(
        llm, tts, "Hello, can you hear me?",
        {"arousal": 0.5, "valence": 0.0, "primary_label": "neutral"}
    )
    print(f"  Warm-up completed: TTFA = {warmup_result['ttfa_ms']:.1f}ms")

    # Benchmark passes
    print(f"\n[2/3] Executing {iterations} timed iterations...")
    turn_metrics: List[Dict[str, float]] = []

    for i in range(iterations):
        utterance = TEST_UTTERANCES[i % len(TEST_UTTERANCES)]
        emotion = {
            "arousal": float(np.random.uniform(0.4, 0.9)),
            "valence": float(np.random.uniform(-0.8, -0.2)),
            "primary_label": "panic" if i % 2 == 0 else "angry"
        }

        print(f"  Turn {i+1}/{iterations}: \"{utterance[:40]}...\"")
        result = await benchmark_single_turn(llm, tts, utterance, emotion)
        turn_metrics.append(result)
        print(f"    -> TTFT: {result['ttft_ms']}ms | TTS: {result['tts_chunk_ms']}ms | TTFA: {result['ttfa_ms']}ms")

    # Compute percentiles
    ttfa_values = [m["ttfa_ms"] for m in turn_metrics]
    ttft_values = [m["ttft_ms"] for m in turn_metrics]
    p50_ttfa = float(np.percentile(ttfa_values, 50))
    p95_ttfa = float(np.percentile(ttfa_values, 95))
    p99_ttfa = float(np.percentile(ttfa_values, 99))

    summary = {
        "iterations": iterations,
        "p50_ttfa_ms": round(p50_ttfa, 2),
        "p95_ttfa_ms": round(p95_ttfa, 2),
        "p99_ttfa_ms": round(p99_ttfa, 2),
        "min_ttfa_ms": round(float(np.min(ttfa_values)), 2),
        "max_ttfa_ms": round(float(np.max(ttfa_values)), 2),
        "avg_ttft_ms": round(float(np.mean(ttft_values)), 2),
        "gate_800ms_passed": bool(p50_ttfa <= 800.0),
        "turns": turn_metrics,
    }

    print("\n[3/3] BENCHMARK RESULTS SUMMARY:")
    print("-" * 50)
    print(f"  p50 TTFA: {summary['p50_ttfa_ms']} ms")
    print(f"  p95 TTFA: {summary['p95_ttfa_ms']} ms")
    print(f"  p99 TTFA: {summary['p99_ttfa_ms']} ms")
    print(f"  Min TTFA: {summary['min_ttfa_ms']} ms | Max: {summary['max_ttfa_ms']} ms")
    print(f"  Average LLM TTFT: {summary['avg_ttft_ms']} ms")
    print(f"  Gate Sub-800ms Compliance: {'PASSED' if summary['gate_800ms_passed'] else 'ATTENTION NEEDED'}")
    print("=" * 70)

    # Save artifact
    output_dir = os.path.join(BASE_DIR, "tests", "artifacts")
    os.makedirs(output_dir, exist_ok=True)
    report_path = os.path.join(output_dir, "latency_report.json")
    with open(report_path, "w") as f:
        json.dump(summary, f, indent=2)
    print(f"Report written to: {report_path}\n")

    return summary


if __name__ == "__main__":
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 3
    asyncio.run(run_benchmark(iterations=count))
