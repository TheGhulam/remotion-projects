import React from "react";
import { spring, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

interface Props {
    triggerFrame: number;
    title: string;
    subtitle: string;
}

export const SpringNotification: React.FC<Props> = ({ triggerFrame, title, subtitle }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // The Physics Spring (Damping 14 / Stiffness 120 is the sweet spot)
    const entranceSpring = spring({
        frame: frame - triggerFrame,
        fps,
        config: { damping: 14, stiffness: 120 },
    });

    const scale = interpolate(entranceSpring, [0, 1], [0.8, 1]);
    const translateY = interpolate(entranceSpring, [0, 1], [20, 0]);
    const opacity = interpolate(entranceSpring, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });

    return (
        <div
            style={{
                position: "absolute",
                bottom: 60,
                right: 60,
                width: 380,
                padding: "20px 24px",
                backgroundColor: "#15151a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                color: "#fff",
                fontFamily: "sans-serif",
                opacity,
                transform: `translateY(${translateY}px) scale(${scale})`,
                boxShadow: "0 24px 80px -20px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.05)",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#c8884a" }} />
                <div>
                    <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>{title}</div>
                    <div style={{ color: "#807a72", fontSize: 14 }}>{subtitle}</div>
                </div>
            </div>
        </div>
    );
};