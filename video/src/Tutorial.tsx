import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { interpolate, useCurrentFrame } from "remotion";
import {
  Configure,
  Everywhere,
  Install,
  Intro,
  Outro,
  Use,
} from "./Scenes";
import { Brand, ProgressBar, VersionPill } from "./Ui";
import { clamp, COLORS, DURATION, FONT, SCENES } from "./theme";

const transition = (
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: SCENES.transition })}
  />
);

export const Tutorial = () => {
  const frame = useCurrentFrame();
  const outroStart = DURATION - SCENES.outro;
  const chromeOpacity = interpolate(
    frame,
    [outroStart - 26, outroStart],
    [1, 0],
    clamp,
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: COLORS.bg,
        fontFamily: FONT,
      }}
    >
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENES.intro}>
          <Intro />
        </TransitionSeries.Sequence>
        {transition}
        <TransitionSeries.Sequence durationInFrames={SCENES.install}>
          <Install />
        </TransitionSeries.Sequence>
        {transition}
        <TransitionSeries.Sequence durationInFrames={SCENES.configure}>
          <Configure />
        </TransitionSeries.Sequence>
        {transition}
        <TransitionSeries.Sequence durationInFrames={SCENES.use}>
          <Use />
        </TransitionSeries.Sequence>
        {transition}
        <TransitionSeries.Sequence durationInFrames={SCENES.everywhere}>
          <Everywhere />
        </TransitionSeries.Sequence>
        {transition}
        <TransitionSeries.Sequence durationInFrames={SCENES.outro}>
          <Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: chromeOpacity,
        }}
      >
        <Brand />
        <VersionPill />
      </div>

      <ProgressBar progress={frame / DURATION} dark={frame >= outroStart} />
    </div>
  );
};
