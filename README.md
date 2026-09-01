# Romantic Anniversary Website — Responsive Build

Put the supplied artwork into:

assets/images/beach-scene.webp
assets/images/cat.webp
assets/images/butterfly.webp

Put the music into:

assets/music/anniversary.mp3

Then deploy the folder to Vercel.

## Responsive controls

The main positions are CSS variables at the top of `style.css`:

--envelope-x / --envelope-y / --envelope-size
--cat-x / --cat-y / --cat-size

There are separate tablet/phone values further down so the overlays can be
aligned to the basket and shoreline after testing on the actual artwork.

The letter itself is the only scrollable area. The beach scene stays fixed.
