// The 8 shard paths that make up the "GE" iceberg logo mark, shared by the
// nav icon, the launch loader (shatters outward) and the footer (assembles
// inward on scroll).
export const LOGO_PATHS: string[] = [
  "M96.3335 64.9553L95.9819 11.4843L80.8094 24.9538L80.9852 51.6892L96.3335 64.9553Z",
  "M77.6584 49.9992L77.5007 26L69.0406 32.0564L69.1195 44.056L77.6584 49.9992Z",
  "M50.1437 69.9319L96.042 66.7156L78.9822 51.8726L60.5043 53.1674L50.1437 69.9319Z",
  "M95.3477 9.71416L50.3687 1.18916e-06L62.6296 19.0116L80.7374 22.9224L95.3477 9.71416Z",
  "M0.00192142 64.9553L0.353438 11.4843L15.526 24.9538L15.3502 51.6892L0.00192142 64.9553Z",
  "M46.1916 69.9319L0.293277 66.7156L17.3531 51.8726L35.831 53.1674L46.1916 69.9319Z",
  "M60.2326 39.2472L47.7292 68.7034L37.3439 52.2225L42.3776 40.364L60.2326 39.2472Z",
  "M0.987621 9.71416L45.9666 1.18916e-06L33.7057 19.0116L15.5979 22.9224L0.987621 9.71416Z",
];

// Scatter offsets [dx, dy, rotateDeg] the footer logo's 8 pieces start from
// before they assemble into place as the footer scrolls into view.
export const FOOTER_SCATTER: [number, number, number][] = [
  [70, -42, 44],
  [86, 16, 28],
  [48, 66, -32],
  [48, -72, -36],
  [-70, -42, -44],
  [-48, 66, 32],
  [4, 82, 16],
  [-48, -72, 36],
];
