# SFX — required files

Drop these three files here before rendering. The composition references them via `staticFile("sfx/...")`.
Audio will be silently absent in Studio and render if the files are missing.

| File | Used at | Suggested search |
|---|---|---|
| `whoosh.mp3` | Hero-beat entries (frames 135, 270, 480) | "whoosh transition short" — freesound.org / zapsplat |
| `tick.mp3` | Every rapid-fire cover swap (11×, every 13 frames from frame 600) | "film leader tick" or "mechanical click short" |
| `chime.mp3` | End card entry (frame 750) | "soft chime ding" or "bell ding" |

**Recommended levels**: volume is set to 0.12–0.14 (~−18 dB), which sits well under the music.
Trim any leading silence with Audacity or ffmpeg so the SFX hits on the exact frame.

```bash
# Example: trim 0.3s of leading silence from whoosh
ffmpeg -i whoosh-raw.mp3 -ss 0.3 -acodec copy sfx/whoosh.mp3
```
