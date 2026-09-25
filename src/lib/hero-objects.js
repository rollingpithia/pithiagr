/**
 * Fewest objects in the ring. If fewer models are found than this, the ones
 * that loaded get cloned to fill it out. If MORE are found, all of them are
 * used — the ring grows.
 */
export const HERO_RING_MIN = 8;

/** @deprecated kept so existing imports keep working. */
export const HERO_OBJECT_COUNT = HERO_RING_MIN;

/**
 * Models are numbered 01, 02, 03 … The loader walks that sequence and takes
 * everything it finds, so adding 09.glb is just dropping the file in.
 *
 *   max            never look past this number
 *   missTolerance  stop after this many consecutive gaps (so a missing 04
 *                  doesn't hide 05 onwards)
 *   batchSize      how many numbers to check at once
 */
export const HERO_OBJECT_SCAN = {
  max: 64,
  missTolerance: 2,
  batchSize: 8,
};

/** Static folder — drop models here. */
export const HERO_OBJECTS_DIR = '/assets/hero-objects';

export const HERO_OBJECT_EXTENSIONS = ['.glb', '.obj'];

/**
 * Artistic tilt only (degrees), applied AFTER the artwork has been squared up.
 * 0/0/0 faces the camera dead-on.
 */
export const HERO_OBJECT_ROTATION = {
  x: 0,
  y: 0,
  z: 0,
};

/** width is the artwork's width after alignment, so every paper matches. */
export const HERO_OBJECT_SIZE_CM = {
  width: 8,
  height: 2,
};

/**
 * The ring. Papers sit evenly spaced with a gentle in/out and up/down drift.
 *
 *   density   objects in the ring (rounded up to a whole number of passes
 *             through the model list)
 *   radius    orbit distance
 *   variance  small in/out drift
 *   heightY   up/down drift
 */
export const HERO_ORBIT = {
  radius: 32,
  density: 17,
  variance: 5,
  heightY: 4,
  /** Widen the ring rather than let papers overlap at high counts. */
  autoWiden: true,
};

/**
 * Per-file orientation overrides, keyed by filename.
 *
 *   flipOutward   the wrong face of the booklet is pointing at the camera
 *   reflectPanel  the print is on the inner skin of the cover panel
 *   mirrorTexture the artwork reads backwards
 *   roll          0 | 90 | 180 | 270, spins the artwork in its own plane
 */
export const HERO_OBJECT_FIXES = {};

export const FLAGS = {
  autoAlignArtwork: true,
  dedupeCopies: true,
  lineUp: false,
};

export function heroObjectNumber(index) {
  return String(index + 1).padStart(2, '0');
}

/**
 * @param {string} base
 * @param {number} index
 * @param {string} [cacheToken]
 */
export function heroObjectCandidates(base, index, cacheToken = '') {
  const dir = `${base}${HERO_OBJECTS_DIR}`;
  const suffix = cacheToken ? `?v=${encodeURIComponent(cacheToken)}` : '';
  return HERO_OBJECT_EXTENSIONS.map((ext) => `${dir}/${heroObjectNumber(index)}${ext}${suffix}`);
}

/** @deprecated use heroObjectCandidates */
export function heroObjectUrl(base, index) {
  return heroObjectCandidates(base, index)[0];
}
