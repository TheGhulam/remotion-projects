import os
import sys
import json
import urllib.request
import urllib.error
from pathlib import Path

# ElevenLabs API settings
API_BASE_URL = "https://api.elevenlabs.io/v1"

# Load environment variables from .env file if it exists
env_path = Path(__file__).resolve().parents[1] / ".env"
if env_path.exists():
    for line in env_path.read_text(encoding="utf-8").splitlines():
        if "=" in line and not line.strip().startswith("#"):
            k, v = line.split("=", 1)
            os.environ[k.strip()] = v.strip()

API_KEY = os.environ.get("ELEVENLABS_API_KEY")

if not API_KEY:
    print("Error: ELEVENLABS_API_KEY environment variable is not set.", file=sys.stderr)
    print("Please set it in your .env file in the project root.", file=sys.stderr)
    sys.exit(1)

ROOT_DIR = Path(__file__).resolve().parents[1]
VOICEOVER_DIR = ROOT_DIR / "public" / "voiceovers"
SFX_DIR = ROOT_DIR / "public" / "sfx"
MUSIC_DIR = ROOT_DIR / "public" / "music"

# Ensure directories exist
VOICEOVER_DIR.mkdir(parents=True, exist_ok=True)
SFX_DIR.mkdir(parents=True, exist_ok=True)
MUSIC_DIR.mkdir(parents=True, exist_ok=True)


def make_post_request(url, payload, headers):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=120) as response:
            return response.read()
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"HTTP Error {e.code} for URL {url}: {err_msg}", file=sys.stderr)
        raise e
    except Exception as e:
        print(f"Network error: {e}", file=sys.stderr)
        raise e


def generate_tts(text, output_path, voice_id):
    # Prefix text with a silent punctuation to give the synthesis engine
    # a tiny pre-roll buffer, completely avoiding clipping the first letter!
    padded_text = "... " + text
    print(f"Generating Natural TTS Voiceover -> '{text}'...")
    url = f"{API_BASE_URL}/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
    }
    payload = {
        "text": padded_text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.42,
            "similarity_boost": 0.8,
            "style": 0.10,
            "use_speaker_boost": True
        }
    }

    try:
        audio_content = make_post_request(url, payload, headers)
        with open(output_path, "wb") as f:
            f.write(audio_content)
        print(f"Successfully generated and saved: {output_path.relative_to(ROOT_DIR)}")
    except Exception as e:
        print(f"Failed to generate TTS for '{text}': {e}", file=sys.stderr)


def generate_sfx(prompt, output_path, duration_seconds=None):
    print(f"Synthesizing SFX for prompt -> '{prompt}'...")
    url = f"{API_BASE_URL}/sound-generation"
    headers = {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
    }
    payload = {
        "text": prompt,
        "prompt_influence": 0.3
    }
    if duration_seconds:
        payload["duration_seconds"] = duration_seconds

    try:
        audio_content = make_post_request(url, payload, headers)
        with open(output_path, "wb") as f:
            f.write(audio_content)
        print(f"Successfully generated and saved: {output_path.relative_to(ROOT_DIR)}")
    except Exception as e:
        print(f"Failed to generate SFX for prompt '{prompt}': {e}", file=sys.stderr)


def generate_music_track(prompt, output_path, length_ms=65000):
    print(f"Synthesizing background music track via ElevenLabs Music API...")
    url = f"{API_BASE_URL}/music/stream"
    headers = {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
    }
    payload = {
        "prompt": prompt,
        "music_length_ms": length_ms,
        "model_id": "music_v1",
        "force_instrumental": True,
        "instrumental": True
    }

    try:
        audio_content = make_post_request(url, payload, headers)
        with open(output_path, "wb") as f:
            f.write(audio_content)
        print(f"Successfully generated and saved music: {output_path.relative_to(ROOT_DIR)}")
    except Exception as e:
        print(f"Failed to generate music track: {e}", file=sys.stderr)


def main():
    # Bypassing voices lookup: Directly use "Rachel" (ID: 21m00Tcm4TlvDq8ikWAM)
    # Rachel is the absolute gold standard natural premium female voice for product storytelling.
    voice_id = "21m00Tcm4TlvDq8ikWAM"
    print(f"Using standard natural female narrator voice (Rachel, ID: {voice_id})")

    # Define the 4 high-impact voiceover segments
    voiceovers = [
        (
            "You spent three days writing a blog masterpiece, only to share it with a generic blue gradient or a blurry screenshot. The internet is too crowded for boring previews. So better-covers compiles something different: not AI, but pure deterministic math.",
            VOICEOVER_DIR / "01_intro.mp3"
        ),
        (
            "Just drop in a seed string to compile actual generative art: hoarfrost, strange attractors, and flow fields. Every cover is unique, but renders exactly the same, every single time.",
            VOICEOVER_DIR / "02_grid.mp3"
        ),
        (
            "It's a beautiful, complex visual fingerprint of your ideas, running right in your terminal. No design skills needed, just repeatable art.",
            VOICEOVER_DIR / "03_heroes.mp3"
        ),
        (
            "Your blog deserves better than a template. Stop settling and start compiling. Just run npm install better-covers.",
            VOICEOVER_DIR / "04_endcard.mp3"
        )
    ]

    # Generate Voiceovers
    print("\n--- GENERATING VOICEOVERS ---")
    for text, path in voiceovers:
        generate_tts(text, path, voice_id)

    # Generate Sound Effects
    print("\n--- GENERATING SOUND EFFECTS ---")
    sfxs = [
        (
            "Deep cinematic sub-bass impact with a digital glitch decay whoosh",
            SFX_DIR / "whoosh.mp3",
            1.8
        ),
        (
            "Short mechanical click or film leader tick, high-speed UI snap",
            SFX_DIR / "tick.mp3",
            0.5
        ),
        (
            "Soft high-frequency digital chime or elegant bell ding",
            SFX_DIR / "chime.mp3",
            2.0
        )
    ]

    for prompt, path, duration in sfxs:
        generate_sfx(prompt, path, duration)

    # Generate Minimal Techno/Electronic background music
    print("\n--- GENERATING DYNAMIC BACKGROUND MUSIC ---")
    music_prompt = "Upbeat modern electronic instrumental, driving synth arpeggios, crisp punchy drums, and bright optimistic pads. Clean, forward-momentum tech vibe, fast tempo at 120-125 BPM, rising energy, dynamic transitions, instrumental only."
    generate_music_track(music_prompt, MUSIC_DIR / "yep-by-fgb.mp3", 65000)

    print("\nAll ElevenLabs audio assets successfully generated and synced!")


if __name__ == "__main__":
    main()
