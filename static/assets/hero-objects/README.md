# Hero floating objects

These 3D models appear in the blurred orbital layer behind the hero header.

## How to add your models

1. Export each product as **GLB** (textures embedded) or **OBJ** (+ `.mtl` + images).
2. Name them `01.glb`, `02.glb`, `03.glb` … and drop them in this folder.

The loader scans that sequence and uses every file it finds. A missing number is skipped; the next ones still load.

## Ring

Edit `src/lib/hero-objects.js`:

- `HERO_ORBIT.density` — how many papers sit in the ring (currently **17**)
- `HERO_ORBIT.radius` — orbit distance (currently **32**)
- `HERO_OBJECT_SIZE_CM.width` — paper width in the scene
- `HERO_OBJECT_ROTATION` — extra tilt after auto-align (`0, 0, 0` faces the camera)
- `HERO_OBJECT_FIXES` — per-file orientation overrides if auto-align guesses wrong

The overlay uses the site’s 3px blur.

## Tips

- Keep each model under ~2–5 MB.
- Artwork is auto-aligned from the printed cover. If one pack is backwards, add a fix in `HERO_OBJECT_FIXES`.
