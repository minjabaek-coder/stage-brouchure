/**
 * Plain constants — no runtime deps. Client components must import limits
 * from here, not from server modules like lib/image.ts (sharp) or lib/csv.ts
 * (papaparse), which would otherwise pull Node-only code into the browser.
 */
export const MAX_CSV_BYTES = 5 * 1024 * 1024; // PRD NFR-10 / FR-A02
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // PRD §2.3.4 / NFR-10
