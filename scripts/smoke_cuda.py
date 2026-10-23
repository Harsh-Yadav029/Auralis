"""
scripts/smoke_cuda.py
Standalone smoke test — run from ml-service directory:
    python -m scripts.smoke_cuda
Prints CUDA info, loads Whisper tiny, transcribes 1s silence.
"""
import sys
import numpy as np


def check_torch():
    print("\n=== PyTorch / CUDA ===")
    try:
        import torch

        print(f"  torch version : {torch.__version__}")
        print(f"  CUDA available: {torch.cuda.is_available()}")
        if torch.cuda.is_available():
            print(f"  Device name   : {torch.cuda.get_device_name(0)}")
            mem_total = torch.cuda.get_device_properties(0).total_memory / 1024**3
            mem_res = torch.cuda.memory_reserved(0) / 1024**3
            print(f"  VRAM total    : {mem_total:.2f} GB")
            print(f"  VRAM reserved : {mem_res:.2f} GB")
        return True
    except ImportError:
        print("  [FAIL] torch not installed")
        return False


def check_whisper():
    print("\n=== Faster-Whisper (tiny smoke) ===")
    try:
        from faster_whisper import WhisperModel

        print("  Loading 'tiny' model on CPU int8 for speed check...")
        model = WhisperModel("tiny", device="cpu", compute_type="int8")
        silence = np.zeros(16000, dtype=np.float32)  # 1 second of silence
        segments, info = model.transcribe(silence, beam_size=1, language="en")
        transcript = " ".join(seg.text for seg in segments).strip()
        print(f"  Transcription (silence): '{transcript}'")
        print(f"  Detected language: {info.language}")
        print("  [OK] Faster-Whisper loaded and inferred")
        return True
    except Exception as exc:
        print(f"  [FAIL] {exc}")
        return False


def check_silero():
    print("\n=== Silero VAD v5 ===")
    try:
        import torch

        model, _ = torch.hub.load(
            repo_or_dir="snakers4/silero-vad",
            model="silero_vad",
            force_reload=False,
            trust_repo=True,
        )
        model.eval()
        # 512 samples of silence
        audio = torch.zeros(1, 512)
        with torch.no_grad():
            prob = float(model(audio, 16000).item())
        print(f"  VAD probability on silence: {prob:.4f}")
        print("  [OK] Silero VAD loaded and inferred")
        return True
    except Exception as exc:
        print(f"  [FAIL] {exc}")
        return False


def check_ollama():
    print("\n=== Ollama connectivity ===")
    try:
        import httpx

        resp = httpx.get("http://localhost:11434/api/tags", timeout=5.0)
        resp.raise_for_status()
        models = [m["name"] for m in resp.json().get("models", [])]
        print(f"  Available models: {models}")
        target = "qwen2.5:7b-instruct-q4_K_M"
        if any(target in m for m in models):
            print(f"  [OK] Target model '{target}' found")
        else:
            print(f"  [WARN] Target model '{target}' NOT found — run: ollama pull {target}")
        return True
    except Exception as exc:
        print(f"  [FAIL] Ollama not reachable: {exc}")
        return False


def main():
    results = {
        "torch_cuda": check_torch(),
        "faster_whisper": check_whisper(),
        "silero_vad": check_silero(),
        "ollama": check_ollama(),
    }

    print("\n=== Summary ===")
    all_pass = True
    for name, ok in results.items():
        status = "[PASS]" if ok else "[FAIL]"
        print(f"  {status} {name}")
        if not ok:
            all_pass = False

    sys.exit(0 if all_pass else 1)


if __name__ == "__main__":
    main()
