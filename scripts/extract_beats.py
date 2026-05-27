"""
Extract beat/onset timestamps from an MP3 for Remotion beat-matched cuts.

Usage:
  python scripts/extract_beats.py
  python scripts/extract_beats.py path/to/song.mp3 path/to/output.json
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import librosa
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_AUDIO = ROOT / "public" / "music" / "yep-by-fgb.mp3"
DEFAULT_OUTPUT = ROOT / "src" / "OGCoversShowreel" / "lib" / "yep-by-fgb-beats.json"
FPS = 30

# Composition sync targets (seconds) — matched to nearest detected beat.
MARKER_TARGETS = {
    "drop": 25.0,
    "rapidFire": 35.0,
}


def nearest_beat_index(beat_times: list[float], target_s: float) -> int:
    return min(range(len(beat_times)), key=lambda i: abs(beat_times[i] - target_s))


def extract_beats(audio_path: Path) -> dict:
    y, sr = librosa.load(str(audio_path), sr=None, mono=True)

    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr, units="frames")
    beat_times = librosa.frames_to_time(beat_frames, sr=sr).tolist()

    onset_frames = librosa.onset.onset_detect(y=y, sr=sr, units="frames")
    onset_times = librosa.frames_to_time(onset_frames, sr=sr).tolist()

    # librosa may return tempo as ndarray
    bpm = float(np.atleast_1d(tempo)[0])

    markers = {
        name: {
            "targetSeconds": target_s,
            "beatIndex": nearest_beat_index(beat_times, target_s),
            "seconds": round(beat_times[nearest_beat_index(beat_times, target_s)], 4),
            "frame": round(beat_times[nearest_beat_index(beat_times, target_s)] * FPS),
        }
        for name, target_s in MARKER_TARGETS.items()
    }

    return {
        "source": audio_path.name,
        "sampleRate": int(sr),
        "durationSeconds": float(len(y) / sr),
        "fps": FPS,
        "tempo": round(bpm, 2),
        "beats": [round(t, 4) for t in beat_times],
        "onsets": [round(t, 4) for t in onset_times],
        "markers": markers,
    }


def main() -> None:
    audio_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_AUDIO
    output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUTPUT

    if not audio_path.exists():
        raise SystemExit(f"Audio file not found: {audio_path}")

    data = extract_beats(audio_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")

    print(f"Detected {len(data['beats'])} beats at ~{data['tempo']:.1f} BPM")
    print(f"Duration: {data['durationSeconds']:.2f}s")
    print(f"Saved to {output_path}")


if __name__ == "__main__":
    main()
