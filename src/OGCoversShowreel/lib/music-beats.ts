import beatsData from "./yep-by-fgb-beats.json";

export type BeatMarkers = typeof beatsData.markers;

const FPS = beatsData.fps;

/** Detected beat onsets in seconds (librosa beat_track). */
export const MUSIC_BEATS = beatsData.beats;

/** Detected onsets in seconds (librosa onset_detect). */
export const MUSIC_ONSETS = beatsData.onsets;

export const MUSIC_TEMPO = beatsData.tempo;

export const MUSIC_MARKERS = beatsData.markers;

export function secondsToFrame(seconds: number): number {
  return Math.round(seconds * FPS);
}

export function beatIndexToFrame(index: number): number {
  return secondsToFrame(MUSIC_BEATS[index] ?? 0);
}

/** Absolute composition frame for beat index `i`. */
export function musicBeatFrame(index: number): number {
  return beatIndexToFrame(index);
}

/** Drop / main energy hit (~16.6s target → detected beat 35 @ frame 503). */
export const MUSIC_DROP_FRAME = MUSIC_MARKERS.drop.frame;

/** First rapid-fire cut — beat index from librosa, frame 690 @ ~23.0s. */
export const RAPID_FIRE_BEAT_INDEX = MUSIC_MARKERS.rapidFire.beatIndex;

/** Absolute frame of rapid-fire cover cut `coverIndex` (0 = first cover). */
export function rapidFireAbsoluteCutFrame(coverIndex: number): number {
  return musicBeatFrame(RAPID_FIRE_BEAT_INDEX + coverIndex);
}

/** Cut time local to the rapid-fire Sequence (frame 0 = first cover). */
export function rapidFireCutFrame(coverIndex: number): number {
  return rapidFireAbsoluteCutFrame(coverIndex) - RAPID_FIRE_START;
}

export const RAPID_FIRE_START = rapidFireAbsoluteCutFrame(0);

/** Duration through the last cover's starting beat (end beat frame − start). */
export function rapidFireDuration(coverCount: number): number {
  return rapidFireAbsoluteCutFrame(coverCount) - RAPID_FIRE_START;
}
