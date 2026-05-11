/**
 * Plain constants — no runtime deps. Client components must import limits
 * from here, not from server modules like lib/image.ts (sharp) or lib/csv.ts
 * (papaparse), which would otherwise pull Node-only code into the browser.
 */
export const MAX_CSV_BYTES = 5 * 1024 * 1024; // PRD NFR-10 / FR-A02

// PRD §2.3.4 는 5MB 였지만 Vercel serverless 의 request body 한도가 4.5MB 라
// multipart 오버헤드 (boundary/headers/filename) 를 고려하면 실제 파일은 4MB
// 이하여야 안전. sharp 가 어차피 1600px + JPEG 80 으로 재압축하므로 4MB
// 원본도 충분.
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
