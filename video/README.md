# Tutorial video

Remotion source for the 38-second **Add to Playlist** tutorial.

## Watch

- [Full tutorial — 1920×1080 MP4](out/add-to-playlist-tutorial.mp4)
- [6-second GIF preview](out/preview.gif)
- [Poster frame](out/poster.png)

## Storyboard

| Time | Scene |
| --- | --- |
| 0:00–0:04 | Hook: “Add any YouTube video to your playlist. One click.” |
| 0:04–0:11 | Install: Developer mode → Load unpacked → select the folder. |
| 0:11–0:18 | Configure: open the popup, choose “My Watch Later”, Save. |
| 0:18–0:29 | Use: open a video’s 3-dot menu, click the starred item, see the toast. |
| 0:29–0:34 | Coverage: Home, Search, Watch and Shorts. |
| 0:34–0:37.5 | Outro: name, tagline and repository URL. |

The visuals are a mock UI, not a screen recording. No account data is shown.

## Rebuild

Requirements: Node.js 20+ and npm. The system `ffmpeg` is only needed to regenerate the GIF preview; Remotion handles the MP4 itself.

```bash
npm install
npm run render
```

Output: `out/add-to-playlist-tutorial.mp4` (H.264, 1920×1080, 30 fps, ~3.8 MB).

Useful commands:

```bash
# Live preview / timeline editor
npm run studio

# Poster frame
npm run poster

# Regenerate the README GIF preview
ffmpeg -y -ss 18.5 -t 6 -i out/add-to-playlist-tutorial.mp4 \
  -vf "fps=12,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" \
  out/preview.gif
```

## Source layout

| Path | Purpose |
| --- | --- |
| `src/index.ts` | Font loading and Remotion entry point |
| `src/Root.tsx` | Composition metadata |
| `src/Tutorial.tsx` | Scene order and transitions |
| `src/Scenes.tsx` | Intro, Install, Configure, Use, Everywhere and Outro |
| `src/Ui.tsx` | Browser frame, YouTube mock, menus, popup, captions and cursor |
| `src/Icons.tsx` | Inline SVG icon set |
| `src/theme.ts` | Colors, timing constants and the star path |
| `public/sfx/` | Generated click, pop and success sounds |

## Notes

- Dependencies are pinned to Remotion `4.0.538`.
- The composition is `AddToPlaylistTutorial`.
- Scene durations and transition length live in `src/theme.ts`; change them there and update the table above if the storyboard changes.
- Audio is intentionally limited to subtle UI sounds: no voiceover or music.
