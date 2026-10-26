import type { CSSProperties, ReactNode } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  BellIcon,
  BlockIcon,
  CheckIcon,
  ClockIcon,
  DownloadIcon,
  ExtensionMark,
  FlagIcon,
  FolderIcon,
  HomeIcon,
  LibraryIcon,
  MenuIcon,
  MicIcon,
  MoreIcon,
  PuzzleIcon,
  QueueIcon,
  SearchIcon,
  ShareIcon,
  ShortsIcon,
  SparkIcon,
  StarIcon,
  SubscriptionIcon,
  YouTubeMark,
} from "./Icons";
import { clamp, COLORS, FONT } from "./theme";

// Coordinates are relative to the 1280x760 browser frame.
export const FRAME = { width: 1280, height: 760, topBar: 44 };
export const CARD = { x: 242, y: 165, w: 300, thumbH: 169, gap: 26 };
export const DOTS = { x: CARD.x + CARD.w - 20, y: CARD.y + CARD.thumbH + 76 };
export const MENU = { x: 760, y: 372, w: 318, h: 344 };
export const MENU_ITEM = { x: MENU.x + 158, y: MENU.y + 42 };
export const TOAST = { x: 640, y: 620 };
export const EXT_ICON = { x: 1238, y: 22 };
export const POPUP = { x: 922, y: 56, w: 338, h: 258 };
export const POPUP_INPUT = { x: POPUP.x + 169, y: POPUP.y + 114 };
export const POPUP_SAVE = { x: POPUP.x + 74, y: POPUP.y + 216 };

const shadow = "0 24px 70px rgba(15, 23, 42, 0.22)";

export const SceneBackdrop = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      background:
        "linear-gradient(135deg, #f7f9fc 0%, #eef2f7 45%, #e8edf4 100%)",
      fontFamily: FONT,
      color: COLORS.ink,
    }}
  >
    <div
      style={{
        position: "absolute",
        width: 720,
        height: 720,
        left: -220,
        top: -280,
        borderRadius: "50%",
        background: "rgba(6, 95, 212, 0.14)",
        filter: "blur(90px)",
      }}
    />
    <div
      style={{
        position: "absolute",
        width: 680,
        height: 680,
        right: -240,
        bottom: -320,
        borderRadius: "50%",
        background: "rgba(255, 0, 51, 0.10)",
        filter: "blur(100px)",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.28,
        backgroundImage:
          "radial-gradient(rgba(15, 23, 42, 0.18) 1px, transparent 1px)",
        backgroundSize: "26px 26px",
        maskImage:
          "radial-gradient(ellipse at center, black 0%, transparent 72%)",
      }}
    />
    {children}
  </div>
);

export const Brand = () => (
  <div
    style={{
      position: "absolute",
      left: 80,
      top: 42,
      display: "flex",
      alignItems: "center",
      gap: 13,
      zIndex: 120,
      fontFamily: FONT,
    }}
  >
    <ExtensionMark size={42} />
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div
        style={{
          fontSize: 19,
          fontWeight: 750,
          letterSpacing: "-0.02em",
          color: COLORS.ink,
        }}
      >
        Add to Playlist
      </div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.18em",
          color: COLORS.faint,
        }}
      >
        YOUTUBE TUTORIAL
      </div>
    </div>
  </div>
);

export const VersionPill = () => (
  <div
    style={{
      position: "absolute",
      right: 80,
      top: 52,
      padding: "7px 13px",
      borderRadius: 999,
      border: `1px solid ${COLORS.line}`,
      background: "rgba(255,255,255,0.66)",
      color: COLORS.muted,
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "0.08em",
      zIndex: 120,
      fontFamily: FONT,
    }}
  >
    v1.3
  </div>
);

export const ProgressBar = ({
  progress,
  dark = false,
}: {
  progress: number;
  dark?: boolean;
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 5,
      background: dark ? "rgba(255,255,255,0.10)" : "rgba(15, 23, 42, 0.07)",
      zIndex: 200,
    }}
  >
    <div
      style={{
        width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
        height: "100%",
        background: `linear-gradient(90deg, ${COLORS.red}, ${COLORS.blue})`,
      }}
    />
  </div>
);

export const BrowserFrame = ({
  url,
  children,
  style,
  toolbarPulse = 0,
}: {
  url: string;
  children: ReactNode;
  style?: CSSProperties;
  toolbarPulse?: number;
}) => (
  <div
    style={{
      position: "absolute",
      width: FRAME.width,
      height: FRAME.height,
      borderRadius: 22,
      background: "#fff",
      boxShadow: shadow,
      overflow: "hidden",
      fontFamily: FONT,
      ...style,
    }}
  >
    <div
      style={{
        height: FRAME.topBar,
        background: "#f8f9fb",
        borderBottom: `1px solid ${COLORS.line}`,
        display: "flex",
        alignItems: "center",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", gap: 7, marginLeft: 18 }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
          <div
            key={color}
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              background: color,
            }}
          />
        ))}
      </div>
      <div
        style={{
          marginLeft: 24,
          width: 540,
          height: 28,
          borderRadius: 8,
          background: "#eef1f4",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 12px",
          color: COLORS.muted,
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        <div
          style={{
            width: 8,
            height: 10,
            border: `1.5px solid ${COLORS.muted}`,
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 1,
              top: -5,
              width: 4,
              height: 6,
              border: `1.5px solid ${COLORS.muted}`,
              borderBottom: "none",
              borderRadius: "4px 4px 0 0",
            }}
          />
        </div>
        {url}
      </div>
      <div
        style={{
          marginLeft: "auto",
          marginRight: 18,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <PuzzleIcon size={17} color={COLORS.muted} />
        <div
          style={{
            position: "relative",
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `linear-gradient(145deg, ${COLORS.blueDeep}, ${COLORS.blue})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: toolbarPulse
              ? `0 0 0 ${6 + toolbarPulse * 10}px rgba(6,95,212,${0.22 * (1 - toolbarPulse)})`
              : "none",
          }}
        >
          <StarIcon size={15} color="#fff" />
        </div>
      </div>
    </div>
    <div style={{ position: "relative", height: FRAME.height - FRAME.topBar }}>
      {children}
    </div>
  </div>
);

const sidebarItems = [
  { label: "Home", icon: HomeIcon, active: true },
  { label: "Shorts", icon: ShortsIcon },
  { label: "Subscriptions", icon: SubscriptionIcon },
  { label: "You", icon: LibraryIcon },
];

const chips = ["All", "Music", "Gaming", "Podcasts", "Live"];

const cardData = [
  {
    title: "Build a tiny app in 20 minutes",
    channel: "Creative Lab",
    views: "124K views · 2 days ago",
    duration: "12:48",
    gradient: "linear-gradient(135deg, #ff8a65 0%, #ff3d71 55%, #7c4dff 100%)",
  },
  {
    title: "Why good design feels obvious",
    channel: "Studio Notes",
    views: "89K views · 5 days ago",
    duration: "08:21",
    gradient: "linear-gradient(135deg, #26c6da 0%, #1e88e5 55%, #3949ab 100%)",
  },
  {
    title: "A calm morning in the mountains",
    channel: "Slow Travel",
    views: "2.1M views · 3 weeks ago",
    duration: "21:07",
    gradient: "linear-gradient(135deg, #aed581 0%, #43a047 45%, #00695c 100%)",
  },
  {
    title: "The hidden math behind music",
    channel: "Signal Path",
    views: "340K views · 1 week ago",
    duration: "16:32",
    gradient: "linear-gradient(135deg, #ffd54f 0%, #ff8f00 50%, #d84315 100%)",
  },
  {
    title: "Designing for focus, not attention",
    channel: "Deep Work",
    views: "56K views · 4 days ago",
    duration: "09:54",
    gradient: "linear-gradient(135deg, #b39ddb 0%, #7e57c2 45%, #4527a0 100%)",
  },
  {
    title: "A beginner's guide to slow cooking",
    channel: "Kitchen Hours",
    views: "410K views · 6 days ago",
    duration: "18:11",
    gradient: "linear-gradient(135deg, #ffab91 0%, #f4511e 50%, #6d4c41 100%)",
  },
] as const;

const ThreeDots = ({
  color = COLORS.ink,
  opacity = 1,
  pulse = 0,
}: {
  color?: string;
  opacity?: number;
  pulse?: number;
}) => (
  <div
    style={{
      width: 28,
      height: 28,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity,
      boxShadow: pulse
        ? `0 0 0 ${4 + pulse * 8}px rgba(6,95,212,${0.22 * (1 - pulse)})`
        : "none",
      background: pulse ? "rgba(6,95,212,0.08)" : "transparent",
    }}
  >
    <MoreIcon size={21} color={color} />
  </div>
);

const VideoCard = ({
  index,
  data,
  spotlight,
  dimmed,
  showDots,
}: {
  index: number;
  data: (typeof cardData)[number];
  spotlight?: boolean;
  dimmed?: boolean;
  showDots?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - 8 - index * 4,
    fps,
    config: { damping: 18, stiffness: 90 },
  });

  const x = CARD.x + (index % 3) * (CARD.w + CARD.gap);
  const y = CARD.y + Math.floor(index / 3) * 310;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: CARD.w,
        opacity: enter * (dimmed ? 0.32 : 1),
        transform: `translateY(${(1 - enter) * 18}px)`,
        filter: spotlight ? "none" : "saturate(0.96)",
        transition: "opacity 0.2s",
      }}
    >
      <div
        style={{
          width: CARD.w,
          height: CARD.thumbH,
          borderRadius: 14,
          overflow: "hidden",
          background: data.gradient,
          position: "relative",
          boxShadow: spotlight
            ? "0 0 0 3px rgba(6,95,212,0.65), 0 18px 38px rgba(15,23,42,0.16)"
            : "0 8px 18px rgba(15,23,42,0.10)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 25% 20%, rgba(255,255,255,0.38), transparent 35%), linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.22))",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 20,
            top: 18,
            width: 66,
            height: 66,
            borderRadius: 18,
            background: "rgba(255,255,255,0.22)",
            border: "1px solid rgba(255,255,255,0.4)",
            transform: "rotate(-8deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 24,
            bottom: 22,
            width: 96,
            height: 12,
            borderRadius: 99,
            background: "rgba(255,255,255,0.3)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 8,
            bottom: 8,
            padding: "3px 6px",
            borderRadius: 5,
            background: "rgba(0,0,0,0.78)",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.02em",
          }}
        >
          {data.duration}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: data.gradient,
            flex: "none",
            border: "1px solid rgba(255,255,255,0.8)",
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              lineHeight: 1.28,
              fontWeight: 650,
              color: COLORS.ink,
              height: 36,
              overflow: "hidden",
            }}
          >
            {data.title}
          </div>
          <div
            style={{
              marginTop: 5,
              fontSize: 11.5,
              color: COLORS.muted,
              fontWeight: 500,
            }}
          >
            {data.channel}
          </div>
          <div style={{ fontSize: 11.5, color: COLORS.muted }}>
            {data.views}
          </div>
        </div>
        {showDots && (
          <div style={{ marginTop: -2 }}>
            <ThreeDots
              opacity={spotlight ? 1 : 0.45}
              pulse={spotlight ? 0.06 : 0}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const YouTubeHome = ({
  spotlight = false,
  dimmed = false,
}: {
  spotlight?: boolean;
  dimmed?: boolean;
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "#fff",
      fontFamily: FONT,
      opacity: dimmed ? 0.55 : 1,
    }}
  >
    <div
      style={{
        height: 64,
        borderBottom: `1px solid ${COLORS.line}`,
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 26,
        position: "relative",
        zIndex: 2,
        background: "#fff",
      }}
    >
      <MenuIcon size={22} color={COLORS.ink} />
      <YouTubeMark size={30} />
      <div
        style={{
          marginLeft: 36,
          width: 520,
          height: 38,
          borderRadius: 99,
          border: `1px solid ${COLORS.line}`,
          display: "flex",
          alignItems: "center",
          padding: "0 6px 0 18px",
          color: COLORS.faint,
          fontSize: 13,
        }}
      >
        Search
        <div
          style={{
            marginLeft: "auto",
            width: 40,
            height: 30,
            borderRadius: 99,
            background: "#f1f3f4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SearchIcon size={16} color={COLORS.ink} />
        </div>
      </div>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "#f1f3f4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MicIcon size={17} color={COLORS.ink} />
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 20 }}>
        <BellIcon size={21} color={COLORS.ink} />
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #ff8a65, #7c4dff)",
            border: "2px solid #fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
        />
      </div>
    </div>

    <div style={{ position: "absolute", left: 0, top: 64, bottom: 0, width: 210, background: "#fff", borderRight: `1px solid ${COLORS.line}`, paddingTop: 16 }}>
      {sidebarItems.map(({ label, icon: Icon, active }) => (
        <div
          key={label}
          style={{
            height: 42,
            margin: "0 10px 4px",
            borderRadius: 10,
            background: active ? "#f1f3f4" : "transparent",
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "0 16px",
            color: COLORS.ink,
            fontSize: 13.5,
            fontWeight: active ? 650 : 500,
          }}
        >
          <Icon size={19} color={COLORS.ink} />
          {label}
        </div>
      ))}
      <div style={{ height: 1, background: COLORS.line, margin: "16px 20px" }} />
      {["History", "Playlists", "Watch later"].map((label) => (
        <div
          key={label}
          style={{
            height: 38,
            margin: "0 10px",
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "0 16px",
            color: COLORS.muted,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <ClockIcon size={18} color={COLORS.muted} />
          {label}
        </div>
      ))}
    </div>

    <div style={{ position: "absolute", left: 210, top: 64, right: 0, bottom: 0, overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 10, padding: "18px 32px 0" }}>
        {chips.map((chip, i) => (
          <div
            key={chip}
            style={{
              padding: "7px 13px",
              borderRadius: 9,
              background: i === 0 ? COLORS.ink : "#f1f3f4",
              color: i === 0 ? "#fff" : COLORS.ink,
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            {chip}
          </div>
        ))}
      </div>
      {cardData.map((data, index) => (
        <VideoCard
          key={data.title}
          index={index}
          data={data}
          spotlight={spotlight && index === 0}
          dimmed={spotlight && index !== 0}
          showDots={index === 0}
        />
      ))}
    </div>
  </div>
);

export const ExtensionsPage = ({
  developerMode,
  showCard,
  modalOpen,
}: {
  developerMode: boolean;
  showCard: boolean;
  modalOpen: boolean;
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "#f6f7f9",
      fontFamily: FONT,
      color: COLORS.ink,
      padding: "34px 42px",
    }}
  >
    <div style={{ fontSize: 25, fontWeight: 750, letterSpacing: "-0.03em" }}>Extensions</div>

    <div
      style={{
        position: "absolute",
        top: 34,
        right: 42,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 36,
          height: 21,
          borderRadius: 99,
          background: developerMode ? COLORS.blue : "#cfd4da",
          position: "relative",
          transition: "background 0.2s",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: developerMode ? 17 : 2,
            width: 17,
            height: 17,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
            transition: "left 0.2s",
          }}
        />
      </div>
      <span style={{ fontSize: 13, fontWeight: 650 }}>Developer mode</span>
    </div>

    <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
      {["Load unpacked", "Pack extension", "Update"].map((label, i) => (
        <div
          key={label}
          style={{
            padding: "9px 14px",
            borderRadius: 8,
            background: i === 0 ? COLORS.blue : "#fff",
            color: i === 0 ? "#fff" : COLORS.ink,
            border: i === 0 ? "none" : `1px solid ${COLORS.line}`,
            fontSize: 12.5,
            fontWeight: 650,
            boxShadow: i === 0 ? "0 3px 10px rgba(6,95,212,0.25)" : "none",
          }}
        >
          {label}
        </div>
      ))}
    </div>

    <div style={{ height: 1, background: COLORS.line, marginTop: 20 }} />

    {showCard && (
      <div
        style={{
          marginTop: 24,
          width: 760,
          borderRadius: 16,
          background: "#fff",
          border: `1px solid ${COLORS.line}`,
          padding: 22,
          display: "flex",
          gap: 18,
          boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
        }}
      >
        <ExtensionMark size={54} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 18, fontWeight: 750 }}>Add to Playlist</span>
            <span style={{ fontSize: 12, color: COLORS.muted }}>v1.3</span>
          </div>
          <div style={{ marginTop: 6, fontSize: 12.5, color: COLORS.muted, lineHeight: 1.5 }}>
            Adds a one-click "Add to &lt;your playlist&gt;" item to every YouTube video's 3-dot menu.
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 18, fontSize: 11.5, color: COLORS.blue, fontWeight: 650 }}>
            <span>Reload</span>
            <span>Remove</span>
          </div>
        </div>
        <div
          style={{
            width: 36,
            height: 21,
            borderRadius: 99,
            background: COLORS.blue,
            position: "relative",
            marginTop: 2,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 2,
              left: 17,
              width: 17,
              height: 17,
              borderRadius: "50%",
              background: "#fff",
            }}
          />
        </div>
      </div>
    )}

    {modalOpen && (
      <div
        style={{
          position: "absolute",
          left: 320,
          top: 280,
          width: 640,
          borderRadius: 18,
          background: "#fff",
          boxShadow: "0 30px 90px rgba(15,23,42,0.28)",
          padding: 28,
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <FolderIcon size={30} color={COLORS.blue} />
          <div style={{ fontSize: 18, fontWeight: 750 }}>Select the extension folder</div>
        </div>
        <div style={{ marginTop: 18, fontSize: 12.5, color: COLORS.muted }}>
          Choose the folder that contains <b>manifest.json</b>.
        </div>
        <div
          style={{
            marginTop: 14,
            padding: "13px 16px",
            borderRadius: 10,
            background: "#f1f3f4",
            fontSize: 13,
            color: COLORS.ink,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          like-watch-later-extension
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
          <div style={{ padding: "10px 16px", borderRadius: 9, background: "#f1f3f4", fontSize: 12.5, fontWeight: 650 }}>Cancel</div>
          <div
            style={{
              padding: "10px 18px",
              borderRadius: 9,
              background: COLORS.blue,
              color: "#fff",
              fontSize: 12.5,
              fontWeight: 700,
              boxShadow: "0 6px 18px rgba(6,95,212,0.28)",
            }}
          >
            Select folder
          </div>
        </div>
      </div>
    )}

    {modalOpen && (
      <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.28)", zIndex: 10 }} />
    )}
  </div>
);

export const ExtensionPopup = ({
  typed,
  saved,
  style,
}: {
  typed: string;
  saved: boolean;
  style?: CSSProperties;
}) => (
  <div
    style={{
      position: "absolute",
      left: POPUP.x,
      top: POPUP.y,
      width: POPUP.w,
      height: POPUP.h,
      borderRadius: 16,
      background: "#fff",
      boxShadow: "0 26px 70px rgba(15,23,42,0.28)",
      border: `1px solid ${COLORS.line}`,
      padding: 20,
      fontFamily: FONT,
      zIndex: 30,
      ...style,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <ExtensionMark size={34} />
      <div style={{ fontSize: 15, fontWeight: 750 }}>Add to Playlist</div>
    </div>
    <div style={{ marginTop: 18, fontSize: 11.5, fontWeight: 700, color: COLORS.muted, letterSpacing: "0.04em", textTransform: "uppercase" }}>
      Target playlist
    </div>
    <div
      style={{
        marginTop: 7,
        height: 42,
        borderRadius: 9,
        border: `1.5px solid ${saved ? COLORS.green : "#cfd4da"}`,
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        fontSize: 13,
        fontWeight: 550,
        color: COLORS.ink,
        background: "#fff",
      }}
    >
      {typed}
      <span style={{ marginLeft: 2, width: 1.5, height: 17, background: COLORS.blue, opacity: saved ? 0 : 1 }} />
    </div>
    <div style={{ marginTop: 7, fontSize: 10.5, color: COLORS.faint }}>
      Playlist name or URL
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 17 }}>
      <div
        style={{
          padding: "9px 18px",
          borderRadius: 8,
          background: COLORS.blue,
          color: "#fff",
          fontSize: 12.5,
          fontWeight: 700,
          boxShadow: "0 4px 12px rgba(6,95,212,0.24)",
        }}
      >
        Save
      </div>
      {saved && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: COLORS.green, fontSize: 11.5, fontWeight: 650 }}>
          <CheckIcon size={15} color={COLORS.green} />
          Options saved.
        </div>
      )}
    </div>
  </div>
);

const menuRows = [
  { label: "Add to queue", icon: QueueIcon },
  { label: "Save to Watch later", icon: ClockIcon },
  { label: "Download", icon: DownloadIcon },
  { label: "Share", icon: ShareIcon },
  { label: "Not interested", icon: BlockIcon },
  { label: "Report", icon: FlagIcon },
];

export const ContextMenu = ({
  progress,
  highlight,
}: {
  progress: number;
  highlight: number;
}) => (
  <div
    style={{
      position: "absolute",
      left: MENU.x,
      top: MENU.y,
      width: MENU.w,
      borderRadius: 14,
      background: "rgba(255,255,255,0.98)",
      boxShadow: "0 30px 80px rgba(15,23,42,0.30), 0 2px 8px rgba(15,23,42,0.12)",
      border: `1px solid ${COLORS.line}`,
      padding: 8,
      opacity: progress,
      transform: `translateY(${(1 - progress) * 10}px) scale(${0.96 + progress * 0.04})`,
      transformOrigin: "top right",
      zIndex: 40,
      backdropFilter: "blur(14px)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 12px",
        borderRadius: 9,
        background: highlight ? "rgba(232,240,254,0.95)" : "transparent",
        boxShadow: highlight
          ? `inset 3px 0 0 ${COLORS.blue}, 0 0 0 1px rgba(6,95,212,${0.18 * highlight})`
          : "none",
        color: COLORS.ink,
        fontSize: 14,
        fontWeight: 700,
      }}
    >
      <StarIcon size={21} color={COLORS.ink} />
      <span style={{ flex: 1 }}>Add to My Watch Later</span>
      <SparkIcon size={15} color={COLORS.blue} style={{ opacity: 0.7 }} />
    </div>
    <div style={{ height: 1, background: COLORS.line, margin: "4px 8px 6px" }} />
    {menuRows.map(({ label, icon: Icon }) => (
      <div
        key={label}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 12px",
          borderRadius: 8,
          color: COLORS.ink,
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        <Icon size={20} color={COLORS.muted} />
        {label}
      </div>
    ))}
  </div>
);

export const Toast = ({
  progress,
  text = "Added to playlist",
}: {
  progress: number;
  text?: string;
}) => (
  <div
    style={{
      position: "absolute",
      left: TOAST.x - 235,
      top: TOAST.y,
      width: 470,
      height: 76,
      borderRadius: 999,
      background: "rgba(15,15,15,0.94)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      gap: 15,
      padding: "0 26px",
      boxShadow:
        "0 20px 55px rgba(0,0,0,0.32), 0 0 0 1px rgba(255,255,255,0.06)",
      opacity: progress,
      transform: `translateY(${(1 - progress) * 16}px) scale(${0.94 + progress * 0.06})`,
      fontFamily: FONT,
      fontSize: 21,
      fontWeight: 700,
      letterSpacing: "-0.015em",
      zIndex: 60,
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: COLORS.green,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 0 6px rgba(24,128,56,0.18)",
        flex: "none",
      }}
    >
      <CheckIcon size={25} color="#fff" />
    </div>
    {text}
  </div>
);

export const Caption = ({
  step,
  text,
}: {
  step?: string;
  text: string;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 100 },
    durationInFrames: 22,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: 54,
        transform: `translateX(-50%) translateY(${(1 - enter) * 18}px)`,
        opacity: enter,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "13px 24px 13px 16px",
        borderRadius: 999,
        background: "rgba(15,15,15,0.90)",
        color: "#fff",
        boxShadow: "0 16px 40px rgba(15,23,42,0.22)",
        fontFamily: FONT,
        fontSize: 25,
        fontWeight: 600,
        letterSpacing: "-0.015em",
        whiteSpace: "nowrap",
        zIndex: 110,
      }}
    >
      {step && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.10em",
            color: "#9fc3ff",
            background: "rgba(6,95,212,0.24)",
            padding: "6px 9px",
            borderRadius: 999,
          }}
        >
          {step}
        </span>
      )}
      {text}
    </div>
  );
};

export const Cursor = ({
  x,
  y,
  visible = 1,
  ripple = 0,
}: {
  x: number;
  y: number;
  visible?: number;
  ripple?: number;
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      zIndex: 90,
      opacity: visible,
      pointerEvents: "none",
      transform: "translate(-3px, -3px)",
    }}
  >
    {ripple > 0 && ripple < 1 && (
      <div
        style={{
          position: "absolute",
          left: -20,
          top: -20,
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: `2px solid rgba(6,95,212,${0.55 * (1 - ripple)})`,
          transform: `scale(${0.35 + ripple * 1.3})`,
        }}
      />
    )}
    <svg
      width="34"
      height="42"
      viewBox="0 0 24 30"
      style={{ filter: "drop-shadow(0 5px 9px rgba(0,0,0,0.35))" }}
    >
      <path
        d="M3 2.5 20 14l-7.6 1.9L9 23.5 3 2.5Z"
        fill="#fff"
        stroke="#111"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

export const Pill = ({
  children,
  color = COLORS.blue,
}: {
  children: ReactNode;
  color?: string;
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 13px",
      borderRadius: 999,
      background: `${color}14`,
      color,
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "0.02em",
    }}
  >
    {children}
  </div>
);

export const MiniMenuCard = ({
  label,
  icon: Icon,
  accent,
}: {
  label: string;
  icon: typeof HomeIcon;
  accent: string;
}) => (
  <div
    style={{
      position: "relative",
      width: 430,
      height: 174,
      borderRadius: 18,
      background: "#fff",
      boxShadow: "0 18px 46px rgba(15,23,42,0.13)",
      border: `1px solid ${COLORS.line}`,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      overflow: "hidden",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: `${accent}16`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={19} color={accent} />
      </div>
      <span style={{ fontSize: 15, fontWeight: 750 }}>{label}</span>
      <span style={{ marginLeft: "auto", color: COLORS.faint, fontSize: 11 }}>3-dot menu</span>
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "11px 12px",
        borderRadius: 10,
        background: COLORS.blueSoft,
        boxShadow: `inset 3px 0 0 ${COLORS.blue}`,
        fontSize: 13,
        fontWeight: 700,
      }}
    >
      <StarIcon size={18} color={COLORS.ink} />
      Add to My Watch Later
      <CheckIcon size={16} color={COLORS.green} style={{ marginLeft: "auto" }} />
    </div>
  </div>
);

export const darkCaption = {
  color: "#fff",
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.16)",
} satisfies CSSProperties;
