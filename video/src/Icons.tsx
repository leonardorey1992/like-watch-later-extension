import type { CSSProperties, ReactNode } from "react";
import { COLORS, STAR_PATH } from "./theme";

type IconProps = {
  size?: number;
  color?: string;
  style?: CSSProperties;
};

const Svg = ({
  size = 24,
  color = "currentColor",
  style,
  children,
  viewBox = "0 0 24 24",
}: IconProps & { children: ReactNode; viewBox?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "block", flex: "none", ...style }}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const StarIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d={STAR_PATH} />
  </Svg>
);

export const MoreIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="5" r="1.75" />
    <circle cx="12" cy="12" r="1.75" />
    <circle cx="12" cy="19" r="1.75" />
  </Svg>
);

export const SearchIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z" />
  </Svg>
);

export const MenuIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" />
  </Svg>
);

export const HomeIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4Z" />
  </Svg>
);

export const ShortsIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M17.77 10.32c-.21-.73-.8-1.32-1.53-1.53l-2.2-.64a5.55 5.55 0 0 0-4.08 0l-2.2.64c-.73.21-1.32.8-1.53 1.53a5.5 5.5 0 0 0 0 3.36c.21.73.8 1.32 1.53 1.53l2.2.64a5.55 5.55 0 0 0 4.08 0l2.2-.64c.73-.21 1.32-.8 1.53-1.53a5.5 5.5 0 0 0 0-3.36ZM10 14.65v-5.3L14.5 12 10 14.65Z" />
  </Svg>
);

export const SubscriptionIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v10h16V7H4Zm5 2 5 3-5 3V9Z" />
  </Svg>
);

export const LibraryIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 4h2v16H4V4Zm4 0h2v16H8V4Zm5 1.5 7.5 14-1.8.96L11.2 6.46l1.8-.96Z" />
  </Svg>
);

export const ClockIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7Z" />
  </Svg>
);

export const QueueIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 6h10v2H4V6Zm0 5h10v2H4v-2Zm0 5h7v2H4v-2Zm12-7.5v7l5-3.5-5-3.5Z" />
  </Svg>
);

export const DownloadIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M19 9h-4V3H9v6H5l7 7 7-7ZM5 18v2h14v-2H5Z" />
  </Svg>
);

export const ShareIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M18 16.08a3 3 0 0 0-2.08.84l-6.09-3.55a3.28 3.28 0 0 0 0-1.54l6.09-3.55A3 3 0 1 0 15 5c0 .24.04.47.09.7L9 9.81a3 3 0 1 0 0 5.58l6.09 3.55c-.05.21-.09.43-.09.66a3 3 0 1 0 3-3.52Z" />
  </Svg>
);

export const BlockIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM4 12a7.95 7.95 0 0 1 1.69-4.9L16.9 18.31A7.95 7.95 0 0 1 12 20a8 8 0 0 1-8-8Zm3.1 4.9L17.31 5.69A7.95 7.95 0 0 1 20 12a8 8 0 0 1-8 8 7.95 7.95 0 0 1-4.9-1.69Z" />
  </Svg>
);

export const FlagIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M14.4 6 14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6Z" />
  </Svg>
);

export const BellIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2Z" />
  </Svg>
);

export const MicIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z" />
  </Svg>
);

export const CheckIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" />
  </Svg>
);

export const FolderIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M10 4H2v16h20V6H12l-2-2Z" />
  </Svg>
);

export const PuzzleIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M20.5 11H19V7a2 2 0 0 0-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4a2 2 0 0 0-2 2v4h1.5a2.5 2.5 0 0 0 0 5H2v4a2 2 0 0 0 2 2h4v-1.5a2.5 2.5 0 0 1 5 0V22h4a2 2 0 0 0 2-2v-4h1.5a2.5 2.5 0 0 0 0-5Z" />
  </Svg>
);

export const PlayTriangle = ({ size = 24, color = "currentColor", style }: IconProps) => (
  <Svg size={size} color={color} style={style}>
    <path d="M8 5v14l11-7L8 5Z" />
  </Svg>
);

export const SparkIcon = ({ size = 24, color = "currentColor", style }: IconProps) => (
  <Svg size={size} color={color} style={style}>
    <path d="m12 2 1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2Zm6.5 11 .9 2.6L22 17l-2.6.9L18.5 21l-.9-3.1L15 17l2.6-1.4.9-2.6Z" />
  </Svg>
);

export const YouTubeMark = ({ size = 38 }: { size?: number }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
    <div
      style={{
        width: size * 1.45,
        height: size,
        borderRadius: size * 0.28,
        background: COLORS.red,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(255,0,51,0.22)",
      }}
    >
      <PlayTriangle size={size * 0.56} color="#fff" />
    </div>
    <span
      style={{
        fontSize: size * 0.66,
        fontWeight: 800,
        letterSpacing: "-0.05em",
        color: COLORS.ink,
      }}
    >
      YouTube
    </span>
  </div>
);

export const ExtensionMark = ({ size = 44 }: { size?: number }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.26,
      background: `linear-gradient(145deg, ${COLORS.blueDeep}, ${COLORS.blue})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 8px 22px rgba(6,95,212,0.28)",
    }}
  >
    <StarIcon size={size * 0.56} color="#fff" />
  </div>
);
