/**
 * Light-theme: the canvas color is set on <body> in globals.css. This layer
 * exists as a no-op for backward compatibility with pages that render it —
 * a future revision could add subtle paper-grain texture here, but the new
 * design is intentionally flat.
 */
export default function BackgroundLayer() {
  return null;
}
