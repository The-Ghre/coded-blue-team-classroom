# Classroom projection

Present uses authored plans in `src/content/presentations`, not reading blocks. Study and Workshop retain the complete lesson and interactive exercises.

Each plan contains a central question and outlined chapters. The deck builder adds a cover, session route and section openers. Teaching beats use one of seven layouts: bullets, process flow, comparison, annotated evidence, discussion question, activity or recap. Source IDs preserve links to complete explanations and local progress.

The composition is 1920 × 1080, uniformly scaled into the available display. Headings are 84 reference pixels, bullets48, flow notes38, evidence code38 and annotations36. No content-dependent text shrinking, line clamping or internal scrolling is allowed. This targets an85-inch16:9 screen with a five-metre viewing distance; actual room lighting, screen settings and eyesight still require an in-room check.

Right arrow/Space/PageDown reveal the next point, then advance. Left/PageUp reverse a reveal before leaving. A reveals all points; O opens the slide overview; F toggles fullscreen. Outlines, activities and recap slides show their complete brief immediately. Reduced motion retains the same reveal states without the wipe animation. Lesson palettes, IBM Plex typography and existing directional slide transitions remain in use.

Keep titles under10 words, bullets under14 words and takeaways under16. Use no more than4 bullets,5 flow steps,3 comparison columns or5 excerpt lines. Evidence is labelled illustrative; full workshop packs remain on the exercise page. Split a dense slide instead of reducing its font.

Run `node scripts/check-presentations.mjs` and `npm run build`. Browser verification must cover all slides fully revealed, slide bounds, next/previous/reveal-all, overview, fullscreen, resume and reduced motion. Test at1920×1080 and1440×900; phone layouts offer a scaled deck with usable controls, while reading pages remain the way to study on a phone.

## Motion

`useProjectionMotion` uses finite Web Animations API effects on new build items. Previous points stay still. A process connector draws before the new step explanation; evidence reveals code before its annotation; comparisons expose a new side. Section outline stagger is bounded, and the cover's Observe → Reason → Decide sequence runs once per entry. Navigation, reverse, unmount and motion-off cancel outstanding effects. M toggles motion; device reduced motion takes precedence. No layout properties animate, no loops run, and no dependencies were added.
