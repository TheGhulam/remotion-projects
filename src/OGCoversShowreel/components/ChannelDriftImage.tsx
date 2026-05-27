import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";

interface Props {
    src: string;
    triggerFrame: number;
    durationInFrames?: number;
}

const CHANNEL_OFFSETS: [number, number][] = [
    [-30, -15], // Red/Left drift
    [25, 12],   // Green/Right drift
    [8, -25],   // Blue/Top drift
];

export const ChannelDriftImage: React.FC<Props> = ({ src, triggerFrame, durationInFrames = 20 }) => {
    const frame = useCurrentFrame();
    const localFrame = Math.max(0, frame - triggerFrame);

    // Math to calculate how close we are to the end of the drift (0 to 1)
    const t = Math.min(1, localFrame / durationInFrames);

    // Custom easing for a snappy, magnetic pull
    const eased = 1 - Math.pow(1 - t, 3);

    // If the animation is done, just show the final sharp image
    if (t >= 1) {
        return (
            <AbsoluteFill>
                {/* Replace Img with an actual Remotion Img tag or standard img */}
                <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </AbsoluteFill>
        );
    }

    // If it's animating, show the 3 drifting channels
    return (
        <AbsoluteFill>
            {CHANNEL_OFFSETS.map(([offsetX, offsetY], i) => (
                <AbsoluteFill
                    key={i}
                    style={{
                        // The magic math: moving from the offset down to 0 based on the ease
                        transform: `translate(${(offsetX * (1 - eased)).toFixed(1)}px, ${(offsetY * (1 - eased)).toFixed(1)}px)`,
                        opacity: 0.5, // Semi-transparent so they blend
                    }}
                >
                    <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </AbsoluteFill>
            ))}
        </AbsoluteFill>
    );
};