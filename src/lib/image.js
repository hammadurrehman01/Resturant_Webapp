// Cloudinary delivery optimization.
//
// Images are stored as raw Cloudinary `secure_url`s (full-resolution
// originals — often several MB from a phone camera). Delivering those
// straight into small cards makes the browser download megabytes and
// downscale them, which renders slowly. Cloudinary can resize, compress
// and re-encode on the fly by inserting a transformation segment right
// after `/upload/` in the URL, so we optimize at render time without
// re-uploading anything.
//
//   f_auto    → serve WebP/AVIF to browsers that support them
//   q_auto    → automatic quality compression
//   c_fill,w_ → crop/scale to the actual display width
//   dpr_auto  → serve @2x/@3x pixels on retina screens

const CLOUDINARY_UPLOAD_RE = /\/image\/upload\//;

/**
 * Return an optimized Cloudinary URL sized for how it is displayed.
 * Non-Cloudinary URLs (and already-transformed ones) are returned unchanged.
 *
 * @param {string} url    stored image URL
 * @param {number} width  target display width in CSS pixels
 */
export function cldImg(url, width = 400) {
  if (!url || typeof url !== 'string') return url;
  if (!CLOUDINARY_UPLOAD_RE.test(url)) return url; // not a Cloudinary upload URL

  const transform = `f_auto,q_auto,c_fill,w_${Math.round(width)},dpr_auto`;

  // Idempotent: don't double-inject if we've already transformed this URL.
  if (url.includes(`/upload/${transform}/`)) return url;

  return url.replace(CLOUDINARY_UPLOAD_RE, `/image/upload/${transform}/`);
}
