import { Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  BlockIcon,
  CheckIcon,
  ClockIcon,
  ExtensionMark,
  HomeIcon,
  PlayTriangle,
  SearchIcon,
  ShortsIcon,
  SparkIcon,
  StarIcon,
} from "./Icons";
import {
  BrowserFrame,
  CARD,
  Caption,
  ContextMenu,
  Cursor,
  DOTS,
  EXT_ICON,
  ExtensionPopup,
  ExtensionsPage,
  MENU_ITEM,
  MiniMenuCard,
  POPUP_INPUT,
  POPUP_SAVE,
  Pill,
  SceneBackdrop,
  Toast,
  YouTubeHome,
} from "./Ui";
import { clamp, COLORS, FONT, SCENES } from "./theme";

const FRAME_LEFT = 320;
const FRAME_TOP = 110;

type Key = { f: number; x: number; y: number };

const at = (frame: number, keys: Key[]) => {
  for (let i = 1; i < keys.length; i++) {
    if (frame <= keys[i].f) {
      const t = interpolate(frame, [keys[i - 1].f, keys[i].f], [0, 1], {
        easing: Easing.inOut(Easing.cubic),
        ...clamp,
      });
      return {
        x: keys[i - 1].x + (keys[i].x - keys[i - 1].x) * t,
        y: keys[i - 1].y + (keys[i].y - keys[i - 1].y) * t,
      };
    }
  }
  return keys[keys.length - 1];
};

const rippleAt = (frame: number, click: number) => {
  if (frame < click || frame > click + 14) return 0;
  return interpolate(frame, [click, click + 14], [0.001, 1], clamp);
};

const pop = (frame: number, start: number, fps: number, damping = 16, stiffness = 110) =>
  spring({
    frame: Math.max(0, frame - start),
    fps,
    config: { damping, stiffness },
  });

const Click = ({ frame, volume = 0.32 }: { frame: number; volume?: number }) => (
  <Sequence from={frame} durationInFrames={20}>
    <Audio src={staticFile("sfx/click.wav")} volume={volume} />
  </Sequence>
);

const Pop = ({ frame, volume = 0.22 }: { frame: number; volume?: number }) => (
  <Sequence from={frame} durationInFrames={24}>
    <Audio src={staticFile("sfx/pop.wav")} volume={volume} />
  </Sequence>
);

const Chime = ({ frame, volume = 0.28 }: { frame: number; volume?: number }) => (
  <Sequence from={frame} durationInFrames={40}>
    <Audio src={staticFile("sfx/success.wav")} volume={volume} />
  </Sequence>
);

const CursorLayer = ({
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
      left: FRAME_LEFT,
      top: FRAME_TOP,
      width: 1280,
      height: 760,
      pointerEvents: "none",
      zIndex: 100,
    }}
  >
    <Cursor x={x} y={y} visible={visible} ripple={ripple} />
  </div>
);

export const Intro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const eyebrow = pop(frame, 4, fps, 18, 100);
  const title = pop(frame, 12, fps, 18, 90);
  const sub = pop(frame, 26, fps, 18, 90);
  const pills = pop(frame, 38, fps, 18, 90);
  const visual = pop(frame, 28, fps, 16, 85);
  const bob = Math.sin(frame / 22) * 5;

  return (
    <SceneBackdrop>
      <div style={{ position: "absolute", left: 150, top: 250, width: 930 }}>
        <div style={{ opacity: eyebrow, transform: `translateY(${(1 - eyebrow) * 14}px)` }}>
          <Pill color={COLORS.blue}>
            <StarIcon size={14} color={COLORS.blue} />
            A ONE-CLICK YOUTUBE EXTENSION
          </Pill>
        </div>
        <div
          style={{
            marginTop: 24,
            opacity: title,
            transform: `translateY(${(1 - title) * 22}px)`,
            fontSize: 76,
            lineHeight: 1.02,
            fontWeight: 800,
            letterSpacing: "-0.05em",
            color: COLORS.ink,
          }}
        >
          Add any YouTube video
          <br />
          to your playlist.
          <br />
          <span style={{ color: COLORS.blue }}>One click.</span>
        </div>
        <div
          style={{
            marginTop: 24,
            maxWidth: 640,
            opacity: sub,
            transform: `translateY(${(1 - sub) * 18}px)`,
            fontSize: 21,
            lineHeight: 1.45,
            color: COLORS.muted,
            fontWeight: 500,
          }}
        >
          A 38-second tutorial for the Add to Playlist extension.
        </div>
        <div
          style={{
            marginTop: 28,
            display: "flex",
            gap: 10,
            opacity: pills,
            transform: `translateY(${(1 - pills) * 16}px)`,
          }}
        >
          <Pill color={COLORS.green}>
            <CheckIcon size={13} color={COLORS.green} />
            No dialogs
          </Pill>
          <Pill color={COLORS.blue}>
            <PlayTriangle size={12} color={COLORS.blue} />
            Works on every video
          </Pill>
          <Pill color={COLORS.red}>
            <StarIcon size={13} color={COLORS.red} />
            Your playlist
          </Pill>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 1130,
          top: 245,
          width: 570,
          opacity: visual,
          transform: `translateY(${bob}px) rotate(2.5deg) scale(${0.94 + visual * 0.06})`,
        }}
      >
        <div
          style={{
            borderRadius: 20,
            background: "#fff",
            padding: 14,
            boxShadow: "0 38px 100px rgba(15,23,42,0.20)",
          }}
        >
          <div
            style={{
              height: 240,
              borderRadius: 14,
              background:
                "linear-gradient(135deg, #ff8a65 0%, #ff3d71 48%, #7c4dff 100%)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 25% 20%, rgba(255,255,255,0.4), transparent 36%), linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.25))",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 26,
                top: 24,
                width: 80,
                height: 80,
                borderRadius: 22,
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.4)",
                transform: "rotate(-8deg)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 64,
                height: 64,
                marginLeft: -32,
                marginTop: -32,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.22)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PlayTriangle size={28} color="#fff" />
            </div>
            <div
              style={{
                position: "absolute",
                right: 10,
                bottom: 10,
                padding: "4px 7px",
                borderRadius: 6,
                background: "rgba(0,0,0,0.75)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              12:48
            </div>
          </div>
          <div style={{ padding: "16px 8px 6px" }}>
            <div style={{ fontSize: 18, fontWeight: 750, letterSpacing: "-0.01em" }}>
              Your next favorite video
            </div>
            <div style={{ marginTop: 5, fontSize: 12.5, color: COLORS.muted, fontWeight: 500 }}>
              Creative Lab · 124K views · 2 days ago
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: -38,
            bottom: -34,
            width: 438,
            borderRadius: 15,
            background: "#fff",
            padding: 13,
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 26px 70px rgba(15,23,42,0.24)",
          }}
        >
          <StarIcon size={24} color={COLORS.ink} />
          <span style={{ flex: 1, fontSize: 15, fontWeight: 750, color: COLORS.ink }}>
            Add to My Watch Later
          </span>
          <div
            style={{
              width: 27,
              height: 27,
              borderRadius: "50%",
              background: COLORS.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckIcon size={17} color="#fff" />
          </div>
        </div>
      </div>

      <Pop frame={10} />
      <Pop frame={28} />
      <Pop frame={42} />
    </SceneBackdrop>
  );
};

export const Install = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });

  const developerMode = frame >= 58;
  const modalOpen = frame >= 112 && frame < 178;
  const showCard = frame >= 176;

  const p1 = at(frame, [
    { f: 0, x: 1260, y: 720 },
    { f: 28, x: 1160, y: 500 },
    { f: 50, x: 1220, y: 88 },
    { f: 75, x: 1220, y: 88 },
    { f: 95, x: 300, y: 210 },
    { f: 112, x: 100, y: 144 },
    { f: 135, x: 500, y: 350 },
    { f: 155, x: 842, y: 515 },
    { f: 180, x: 1020, y: 640 },
    { f: 210, x: 1100, y: 720 },
  ]);

  return (
    <SceneBackdrop>
      <BrowserFrame
        url="brave://extensions"
        style={{
          left: FRAME_LEFT,
          top: FRAME_TOP,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 16}px) scale(${0.985 + enter * 0.015})`,
        }}
      >
        <ExtensionsPage developerMode={developerMode} showCard={showCard} modalOpen={modalOpen} />
      </BrowserFrame>

      <CursorLayer
        x={p1.x}
        y={p1.y}
        ripple={Math.max(
          rippleAt(frame, 58),
          rippleAt(frame, 116),
          rippleAt(frame, 158),
        )}
      />

      <Sequence from={0} durationInFrames={70}>
        <Caption step="1 · INSTALL" text="Open your browser's extensions page." />
      </Sequence>
      <Sequence from={70} durationInFrames={42}>
        <Caption step="1 · INSTALL" text="Turn on Developer mode, then Load unpacked." />
      </Sequence>
      <Sequence from={112} durationInFrames={98}>
        <Caption step="1 · INSTALL" text="Select the extension folder." />
      </Sequence>

      <Click frame={58} />
      <Click frame={116} />
      <Click frame={158} />
      <Pop frame={176} />
    </SceneBackdrop>
  );
};

export const Configure = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const popupIn = pop(frame, 42, fps, 14, 120);
  const typed = "My Watch Later".slice(
    0,
    Math.floor(interpolate(frame, [62, 116], [0, "My Watch Later".length], clamp)),
  );
  const saved = frame >= 154;
  const iconPulse = frame >= 28 && frame <= 55 ? 1 - (frame - 28) / 27 : 0;

  const p = at(frame, [
    { f: 0, x: 1260, y: 720 },
    { f: 22, x: 1240, y: 300 },
    { f: 36, x: EXT_ICON.x, y: EXT_ICON.y },
    { f: 55, x: EXT_ICON.x, y: EXT_ICON.y },
    { f: 68, x: POPUP_INPUT.x, y: POPUP_INPUT.y + 44 },
    { f: 120, x: POPUP_INPUT.x, y: POPUP_INPUT.y + 44 },
    { f: 138, x: POPUP_SAVE.x, y: POPUP_SAVE.y + 44 },
    { f: 170, x: 900, y: 400 },
    { f: 210, x: 1100, y: 720 },
  ]);

  return (
    <SceneBackdrop>
      <BrowserFrame
        url="https://www.youtube.com"
        toolbarPulse={iconPulse}
        style={{ left: FRAME_LEFT, top: FRAME_TOP }}
      >
        <YouTubeHome dimmed />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(247,249,252,0.22)",
            pointerEvents: "none",
          }}
        />
        <ExtensionPopup
          typed={typed}
          saved={saved}
          style={{
            opacity: popupIn,
            transform: `scale(${0.94 + popupIn * 0.06})`,
            transformOrigin: "top right",
          }}
        />
      </BrowserFrame>

      <CursorLayer
        x={p.x}
        y={p.y}
        ripple={Math.max(rippleAt(frame, 40), rippleAt(frame, 145))}
      />

      <Sequence from={0} durationInFrames={100}>
        <Caption step="2 · CONFIGURE" text="Choose your playlist once." />
      </Sequence>
      <Sequence from={100} durationInFrames={110}>
        <Caption step="2 · CONFIGURE" text="Paste its URL or type its name, then Save." />
      </Sequence>

      <Click frame={40} />
      <Click frame={145} />
      <Chime frame={154} />
    </SceneBackdrop>
  );
};

export const Use = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const menuIn = pop(frame, 64, fps, 15, 110);
  const menuOut = interpolate(frame, [150, 164], [1, 0], clamp);
  const menuProgress = menuIn * menuOut;
  const highlight =
    frame >= 92 && frame < 154 ? 0.7 + 0.3 * Math.sin((frame - 92) / 6) : 0;
  const toastIn = pop(frame, 168, fps, 14, 120);
  const checkIn = pop(frame, 168, fps, 14, 120);
  const cursorVisible = interpolate(frame, [168, 176], [1, 0], clamp);

  const p = at(frame, [
    { f: 0, x: 1260, y: 720 },
    { f: 24, x: 1000, y: 600 },
    { f: 52, x: 210 + DOTS.x, y: 64 + DOTS.y + 44 },
    { f: 85, x: 210 + DOTS.x, y: 64 + DOTS.y + 44 },
    { f: 120, x: MENU_ITEM.x, y: MENU_ITEM.y + 44 },
    { f: 145, x: MENU_ITEM.x, y: MENU_ITEM.y + 44 },
    { f: 175, x: 900, y: 600 },
    { f: 220, x: 980, y: 700 },
    { f: 360, x: 1000, y: 720 },
  ]);

  return (
    <SceneBackdrop>
      <BrowserFrame url="https://www.youtube.com" style={{ left: FRAME_LEFT, top: FRAME_TOP }}>
        <YouTubeHome spotlight={frame >= 38} />
        <div
          style={{
            position: "absolute",
            left: 210 + CARD.x + CARD.w - 56,
            top: 64 + CARD.y + 14,
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: COLORS.green,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow:
              "0 8px 22px rgba(24,128,56,0.35), 0 0 0 6px rgba(24,128,56,0.16)",
            opacity: checkIn,
            transform: `scale(${0.55 + checkIn * 0.45})`,
            zIndex: 35,
          }}
        >
          <CheckIcon size={24} color="#fff" />
        </div>
        <ContextMenu progress={menuProgress} highlight={highlight} />
        <Toast progress={toastIn} />
      </BrowserFrame>

      <CursorLayer
        x={p.x}
        y={p.y}
        visible={cursorVisible}
        ripple={Math.max(rippleAt(frame, 60), rippleAt(frame, 150))}
      />

      <Sequence from={0} durationInFrames={64}>
        <Caption step="3 · USE" text="Open any video's 3-dot menu." />
      </Sequence>
      <Sequence from={64} durationInFrames={96}>
        <Caption step="3 · USE" text="Click 'Add to My Watch Later'." />
      </Sequence>
      <Sequence from={160} durationInFrames={200}>
        <Caption step="3 · USE" text="Done — the video is in your playlist." />
      </Sequence>

      <Click frame={60} />
      <Click frame={150} />
      <Chime frame={168} />
      <Pop frame={168} />
    </SceneBackdrop>
  );
};

const everywhereCards = [
  { label: "Home", icon: HomeIcon, accent: COLORS.red },
  { label: "Search", icon: SearchIcon, accent: COLORS.blue },
  { label: "Watch", icon: ClockIcon, accent: "#7c4dff" },
  { label: "Shorts", icon: ShortsIcon, accent: "#ff6d00" },
];

export const Everywhere = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const header = pop(frame, 2, fps, 18, 90);

  return (
    <SceneBackdrop>
      <div style={{ position: "absolute", top: 92, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ opacity: header, transform: `translateY(${(1 - header) * 14}px)` }}>
          <Pill color={COLORS.blue}>
            <CheckIcon size={13} color={COLORS.blue} />
            WORKS EVERYWHERE
          </Pill>
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: "-0.045em",
            color: COLORS.ink,
            opacity: header,
            transform: `translateY(${(1 - header) * 18}px)`,
          }}
        >
          One star. Every menu.
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 19,
            color: COLORS.muted,
            fontWeight: 500,
            opacity: header,
          }}
        >
          The same one-click item on Home, Search, Watch and Shorts.
        </div>
      </div>

      {everywhereCards.map(({ label, icon, accent }, i) => {
        const cardIn = pop(frame, 10 + i * 8, fps, 16, 100);
        const left = 516 + (i % 2) * 458;
        const top = 312 + Math.floor(i / 2) * 202;
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left,
              top,
              opacity: cardIn,
              transform: `translateY(${(1 - cardIn) * 22}px) scale(${0.96 + cardIn * 0.04})`,
            }}
          >
            <MiniMenuCard label={label} icon={icon} accent={accent} />
          </div>
        );
      })}

      <Caption text="One extension. Every video menu." />

      <Pop frame={10} />
      <Pop frame={18} />
      <Pop frame={26} />
      <Pop frame={34} />
    </SceneBackdrop>
  );
};

const stars = [
  { x: 300, y: 220, s: 4, d: 0 },
  { x: 420, y: 760, s: 3, d: 12 },
  { x: 1520, y: 250, s: 5, d: 22 },
  { x: 1640, y: 680, s: 3, d: 6 },
  { x: 700, y: 160, s: 3, d: 30 },
  { x: 1260, y: 830, s: 4, d: 18 },
  { x: 980, y: 880, s: 2, d: 40 },
  { x: 1780, y: 480, s: 2, d: 8 },
];

export const Outro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = pop(frame, 0, fps, 14, 100);
  const title = pop(frame, 12, fps, 18, 90);
  const tagline = pop(frame, 24, fps, 18, 90);
  const repo = pop(frame, 36, fps, 18, 90);
  const features = pop(frame, 48, fps, 18, 90);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 34%, #17233b 0%, #0b0d12 52%, #07080c 100%)",
        fontFamily: FONT,
        color: "#fff",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          left: "50%",
          top: "50%",
          marginLeft: -400,
          marginTop: -500,
          borderRadius: "50%",
          background: "rgba(6,95,212,0.18)",
          filter: "blur(120px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 620,
          height: 620,
          right: -180,
          bottom: -260,
          borderRadius: "50%",
          background: "rgba(255,0,51,0.10)",
          filter: "blur(110px)",
        }}
      />
      {stars.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: s.x,
            top: s.y,
            width: s.s,
            height: s.s,
            borderRadius: "50%",
            background: i % 3 === 0 ? "#9fc3ff" : "#fff",
            opacity: 0.18 + 0.72 * Math.abs(Math.sin((frame + s.d) / 28)),
            boxShadow: "0 0 12px rgba(255,255,255,0.45)",
          }}
        />
      ))}

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 215,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            opacity: logo,
            transform: `scale(${0.8 + logo * 0.2}) rotate(${Math.sin(frame / 26) * 3}deg)`,
          }}
        >
          <ExtensionMark size={104} />
        </div>
        <div
          style={{
            marginTop: 26,
            opacity: title,
            transform: `translateY(${(1 - title) * 18}px)`,
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: "-0.05em",
          }}
        >
          Add to Playlist
        </div>
        <div
          style={{
            marginTop: 10,
            opacity: tagline,
            transform: `translateY(${(1 - tagline) * 16}px)`,
            fontSize: 29,
            fontWeight: 500,
            color: "rgba(255,255,255,0.70)",
            letterSpacing: "-0.02em",
          }}
        >
          One click. Any video. Your playlist.
        </div>

        <div
          style={{
            marginTop: 34,
            opacity: repo,
            transform: `translateY(${(1 - repo) * 16}px)`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 18px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.14)",
            color: "rgba(255,255,255,0.86)",
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: "-0.01em",
          }}
        >
          <SparkIcon size={17} color="#9fc3ff" />
          github.com/leonardorey1992/like-watch-later-extension
        </div>

        <div
          style={{
            marginTop: 24,
            display: "flex",
            gap: 10,
            opacity: features,
            transform: `translateY(${(1 - features) * 14}px)`,
          }}
        >
          {["No dialogs", "Works everywhere", "Your playlist"].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "7px 12px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.70)",
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              <CheckIcon size={13} color="#7fd18b" />
              {label}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 30,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.34)",
          }}
        >
          v1.3 · CHROME / BRAVE
        </div>
      </div>

      <Chime frame={12} volume={0.22} />
    </div>
  );
};
