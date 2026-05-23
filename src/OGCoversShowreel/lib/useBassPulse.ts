import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const MUSIC_SRC = staticFile("music/yep-by-fgb.mp3");

// We ask for 16 frequency buckets and use the lowest few as "bass".
// This is the canonical recipe from Remotion's audio-visualization docs.
const NUM_SAMPLES = 16;
const BASS_BUCKETS = 3; // bottom 3 of 16 = sub + low-bass

// How many frames behind the current one to average over for smoothing.
// 3 frames @ 30fps = 100ms window. Punchy on attack, no jitter.
const SMOOTHING_FRAMES = 3;

function sampleBassAt(
  frame: number,
  fps: number,
  audioData: ReturnType<typeof useAudioData>,
): number {
  if (!audioData || frame < 0) return 0;
  const spectrum = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples: NUM_SAMPLES,
  });
  let bass = 0;
  for (let i = 0; i < BASS_BUCKETS; i++) bass += spectrum[i] ?? 0;
  bass /= BASS_BUCKETS;
  // Logarithmic curve — perceived loudness, not raw amplitude.
  // Maps the typical 0–0.4 range up into a more usable 0–1.
  return Math.min(1, Math.pow(bass * 2.4, 0.7));
}

/**
 * Returns a normalized bass amplitude in [0, 1] for the current frame.
 *
 * IMPORTANT: pass `offsetFrames` equal to the absolute frame where this beat's
 * <Sequence> starts. Inside a Sequence, `useCurrentFrame()` returns a frame
 * relative to the sequence start, not the composition. Since the music plays
 * from the composition's frame 0, we need to add the offset back so we sample
 * the audio at the right moment.
 *
 * Smoothing is done by sampling a small window of recent frames and averaging,
 * which is stateless and renders deterministically (Remotion may render frames
 * in parallel across workers, so module-level state isn't safe).
 *
 * Returns 0 while audio data is still loading (first paint).
 */
export function useBassPulse(offsetFrames: number = 0): number {
  const localFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioData = useAudioData(MUSIC_SRC);

  if (!audioData) return 0;

  const absoluteFrame = localFrame + offsetFrames;

  // Sample the current frame full-weight, plus a few recent frames at decaying
  // weight. This gives an asymmetric envelope: fast attack, slow decay.
  let total = 0;
  let weightSum = 0;
  for (let i = 0; i <= SMOOTHING_FRAMES; i++) {
    const f = absoluteFrame - i;
    if (f < 0) continue;
    const weight = i === 0 ? 1.0 : 0.5 / i; // 1.0, 0.5, 0.25, 0.166...
    total += sampleBassAt(f, fps, audioData) * weight;
    weightSum += weight;
  }
  return weightSum > 0 ? total / weightSum : 0;
}

/**
 * Convenience: same bass pulse but biased toward attack — good for
 * "punch on the beat" use cases. Returns 0–1.
 */
export function useBassPunch(offsetFrames: number = 0): number {
  const bass = useBassPulse(offsetFrames);
  // Square it to suppress noise floor and accentuate hits.
  return bass * bass;
}
