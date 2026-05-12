/**
 * 작은 OG 스크래퍼 — 외부 의존성 없이 fetch + 정규식으로 페이지의 og:image /
 * twitter:image 메타 태그를 찾아 해당 이미지 바이트를 가져온다.
 *
 * 사용처: 관리자 페이지에서 공연장 지도 URL 저장 시 자동으로 미리보기 이미지를
 * 생성. 외부 페이지의 OG 이미지가 실제 지도 썸네일이 아닐 수 있으므로 (네이버
 * 검색 URL 은 일반 로고만 반환하는 사례) 호출 측에서 결과를 검증 후 사용한다.
 */

const HTML_FETCH_TIMEOUT_MS = 6000;
const IMAGE_FETCH_TIMEOUT_MS = 8000;
const MAX_HTML_BYTES = 2 * 1024 * 1024; // 2MB; OG 메타는 head 안에 있으니 충분
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB; sharp 가 재압축할 거라 여유

// 카카오톡 인앱 브라우저로 보이게 하면 일부 사이트(naver share 등)가 모바일
// 페이지를 보내주는 경우가 있어 더 풍부한 OG 메타를 얻을 확률이 높다.
const USER_AGENT =
  "Mozilla/5.0 (Linux; Android 10; KaKaoTalk; AppleWebKit/537.36) Chrome/120 Mobile";

export interface ScrapedOgImage {
  /** 원본 이미지 URL (절대 경로로 정규화) */
  imageUrl: string;
  /** 페이지 fetch 시 따라간 최종 URL — share / 단축 URL 디버깅용 */
  finalPageUrl: string;
  /** 이미지 바이트 (Content-Type image/* 확인 완료) */
  imageBuffer: Buffer;
  /** 이미지 MIME (image/jpeg, image/png …) */
  imageContentType: string;
}

/**
 * 페이지에서 OG/Twitter 이미지 메타를 찾아 이미지를 다운로드한다.
 * 실패 시 throw 하지 않고 null 반환 (호출부가 silent fallback 가능하도록).
 */
export async function scrapeOgImage(pageUrl: string): Promise<ScrapedOgImage | null> {
  let url: URL;
  try {
    url = new URL(pageUrl);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(url.protocol)) return null;

  const html = await fetchText(url.toString(), HTML_FETCH_TIMEOUT_MS, MAX_HTML_BYTES);
  if (!html) return null;

  const finalPageUrl = html.finalUrl;
  const imageRef = parseOgImage(html.text);
  if (!imageRef) return null;

  let absoluteImageUrl: string;
  try {
    absoluteImageUrl = new URL(imageRef, finalPageUrl).toString();
  } catch {
    return null;
  }

  const img = await fetchBytes(absoluteImageUrl, IMAGE_FETCH_TIMEOUT_MS, MAX_IMAGE_BYTES);
  if (!img) return null;
  if (!/^image\//.test(img.contentType)) return null;

  return {
    imageUrl: absoluteImageUrl,
    finalPageUrl,
    imageBuffer: img.buffer,
    imageContentType: img.contentType,
  };
}

/**
 * `<meta property="og:image" content="...">` 또는 twitter:image 를 정규식으로
 * 추출. property/name 어느 쪽에 있어도, 따옴표 종류가 달라도 동작하도록 작성.
 */
function parseOgImage(html: string): string | null {
  // head 만 살펴봐도 충분 (성능 + 잘못된 매칭 방지)
  const headMatch = html.match(/<head[\s\S]*?<\/head>/i);
  const scope = headMatch ? headMatch[0] : html.slice(0, 64 * 1024);

  const patterns: RegExp[] = [
    // <meta property="og:image" content="...">
    /<meta[^>]+(?:property|name)\s*=\s*["']og:image(?::secure_url|:url)?["'][^>]*content\s*=\s*["']([^"']+)["']/i,
    // <meta content="..." property="og:image">
    /<meta[^>]+content\s*=\s*["']([^"']+)["'][^>]*(?:property|name)\s*=\s*["']og:image(?::secure_url|:url)?["']/i,
    // twitter:image
    /<meta[^>]+(?:property|name)\s*=\s*["']twitter:image(?::src)?["'][^>]*content\s*=\s*["']([^"']+)["']/i,
    /<meta[^>]+content\s*=\s*["']([^"']+)["'][^>]*(?:property|name)\s*=\s*["']twitter:image(?::src)?["']/i,
  ];
  for (const re of patterns) {
    const m = scope.match(re);
    if (m && m[1]) return decodeHtmlEntities(m[1].trim());
  }
  return null;
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

interface TextResp {
  text: string;
  finalUrl: string;
}

async function fetchText(
  url: string,
  timeoutMs: number,
  maxBytes: number,
): Promise<TextResp | null> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ac.signal,
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/xhtml+xml,*/*;q=0.8",
        "accept-language": "ko-KR,ko;q=0.9,en;q=0.5",
      },
    });
    if (!res.ok) return null;
    const buf = await readWithCap(res, maxBytes);
    if (!buf) return null;
    // Content-Type 의 charset 정직하게 따르기보다는 UTF-8 가정 (대부분의 한국
    // 포털이 utf-8). 잘못 디코딩되어도 OG meta 의 ASCII 부분은 그대로 읽힘.
    const text = buf.toString("utf8");
    return { text, finalUrl: res.url };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

interface BytesResp {
  buffer: Buffer;
  contentType: string;
}

async function fetchBytes(
  url: string,
  timeoutMs: number,
  maxBytes: number,
): Promise<BytesResp | null> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ac.signal,
      headers: { "user-agent": USER_AGENT },
    });
    if (!res.ok) return null;
    const buf = await readWithCap(res, maxBytes);
    if (!buf) return null;
    return {
      buffer: buf,
      contentType: res.headers.get("content-type")?.split(";")[0]?.trim() ?? "",
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** 스트림을 읽되 maxBytes 를 넘기면 null. 큰 페이지/이미지를 들고 있지 않도록. */
async function readWithCap(res: Response, maxBytes: number): Promise<Buffer | null> {
  const reader = res.body?.getReader();
  if (!reader) {
    const ab = await res.arrayBuffer();
    if (ab.byteLength > maxBytes) return null;
    return Buffer.from(ab);
  }
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (total > maxBytes) {
        reader.cancel().catch(() => undefined);
        return null;
      }
      chunks.push(value);
    }
  }
  return Buffer.concat(chunks.map((c) => Buffer.from(c)));
}
