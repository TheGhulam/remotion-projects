import { loadFont as loadSourceSerif4 } from "@remotion/google-fonts/SourceSerif4";
import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

// Display + body serif. 600 = subtitle/medium emphasis. 700 = display headlines
// (intro, end card). Kept tight to two weights so the visual language stays
// consistent across the whole reel.
export const { fontFamily: sourceSerif4 } = loadSourceSerif4("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
});

// Used only for the small "Von Kármán 1911" / "Goold 1844" attribution subtitles
// inside hero captions. Kept at a single weight (400) — anything heavier fights
// the serif title above it.
export const { fontFamily: geist } = loadGeist("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

// Terminal / seed strings / URL. 400 = inline use, 500 = the end-card URL pill.
export const { fontFamily: jetBrainsMono } = loadJetBrainsMono("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

// NOTE: Shantell Sans intentionally removed. It was being used as a display
// face on the intro claims, the diagonal grid scrawl, and the end-card headline
// — all of which conflicted with the "deterministic generative math" brand.
// If a future beat wants a hand-drawn texture, reach for the art itself
// (e.g. one of the harmonograph / venation covers) instead of handwritten type.
