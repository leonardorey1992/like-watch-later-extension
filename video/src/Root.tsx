import { Composition } from "remotion";
import { Tutorial } from "./Tutorial";
import { DURATION, FPS, HEIGHT, WIDTH } from "./theme";

export const RemotionRoot = () => (
  <Composition
    id="AddToPlaylistTutorial"
    component={Tutorial}
    durationInFrames={DURATION}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
