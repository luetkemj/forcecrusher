type DurationStyle = {
  warning: number;
  danger: number;
};

const defaultThresholds: DurationStyle = { warning: 1.5, danger: 3 };

const systemThresholds: Record<string, DurationStyle> = {
  FRAME: { warning: 24, danger: 32 },
  renderSystem: { warning: 6, danger: 10 },
  fovSystem: { warning: 4, danger: 6 },
  aiSystem: { warning: 4, danger: 6 },
  // You can add other specific systems here
};

export function styleDuration(
  duration: number,
  systemName: string,
): { color: string; emoji: string } {
  const { warning, danger } = systemThresholds[systemName] ?? defaultThresholds;

  if (duration >= danger) {
    return {
      color: "color: #ef4444; font-weight: bold", // red
      emoji: "❌",
    };
  } else if (duration >= warning) {
    return {
      color: "color: #facc15; font-weight: bold", // yellow
      emoji: "⚠️",
    };
  } else {
    return {
      color: "color: #22c55e", // green
      emoji: "✅",
    };
  }
}
