export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const FONT = '"Inter", "Roboto", Arial, sans-serif';

export const COLORS = {
  bg: "#eef1f5",
  ink: "#0f0f0f",
  muted: "#606060",
  faint: "#8b8b8b",
  line: "#e6e8eb",
  surface: "#ffffff",
  red: "#ff0033",
  redDark: "#d4002a",
  blue: "#065fd4",
  blueSoft: "#e8f0fe",
  blueDeep: "#0b57d0",
  green: "#188038",
  greenSoft: "#e6f4ea",
  dark: "#0b0d12",
  darkSoft: "#151923",
  shadow: "rgba(15, 23, 42, 0.18)",
};

export const SCENES = {
  intro: 120,
  install: 210,
  configure: 210,
  use: 360,
  everywhere: 150,
  outro: 150,
  transition: 15,
} as const;

export const DURATION =
  SCENES.intro +
  SCENES.install +
  SCENES.configure +
  SCENES.use +
  SCENES.everywhere +
  SCENES.outro -
  SCENES.transition * 5;

export const STAR_PATH =
  "M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

export const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};
