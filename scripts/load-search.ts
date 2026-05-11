/**
 * S14 부하 시뮬레이션 — 100 명의 가상 관객이 거의 동시에 /api/search 를 호출.
 * 각 가상 사용자는 distinct X-Forwarded-For 로 rate limit (1m / 30/IP) 을 우회한다.
 *
 * 실행:
 *   pnpm dev          # 한 터미널
 *   pnpm load:search  # 다른 터미널
 */
import { performance } from "node:perf_hooks";

const BASE_URL = process.env.LOAD_BASE_URL ?? "http://localhost:3000";
const N = Number(process.env.LOAD_USERS ?? 100);
const ENDPOINT = `${BASE_URL}/api/search`;

interface Result {
  ok: boolean;
  status: number;
  ms: number;
  err?: string;
}

async function oneCall(idx: number): Promise<Result> {
  // 시드 22명 중 0001..0022 안에서 라운드로빈 (한 명에 몰리면 캐시 효과로 부정확)
  const seedIdx = (idx % 22) + 1;
  const phone = String(seedIdx).padStart(4, "0");
  // 실제 시드 이름까지 매칭하지 않아도 부하 경로는 동일 (DB findFirst + ratelimit)
  // — 일치 여부보다 throughput/p95 가 측정 대상
  const t0 = performance.now();
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        // 가상 사용자별 distinct IP — search route 의 getClientIp 가 이걸 사용
        "x-forwarded-for": `10.0.${Math.floor(idx / 256)}.${idx % 256}`,
      },
      body: JSON.stringify({ name: "신귀복", phone_last4: phone }),
    });
    return { ok: res.ok || res.status === 404, status: res.status, ms: performance.now() - t0 };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      ms: performance.now() - t0,
      err: e instanceof Error ? e.message : String(e),
    };
  }
}

async function main() {
  console.log(`▸ Sending ${N} concurrent POST ${ENDPOINT}`);
  const t0 = performance.now();
  const results = await Promise.all(
    Array.from({ length: N }, (_, i) => oneCall(i)),
  );
  const totalMs = performance.now() - t0;

  const sorted = results.map((r) => r.ms).sort((a, b) => a - b);
  const p = (q: number) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))]!;
  const counts = results.reduce<Record<number, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
  const okCount = results.filter((r) => r.ok).length;

  console.log(`\n▸ wall: ${totalMs.toFixed(0)}ms · throughput: ${(N / (totalMs / 1000)).toFixed(1)} req/s`);
  console.log(`  status mix: ${JSON.stringify(counts)}`);
  console.log(`  ok ratio:   ${okCount}/${N} (${((okCount / N) * 100).toFixed(0)}%)`);
  console.log(`  latency:    p50=${p(0.5).toFixed(0)}ms  p95=${p(0.95).toFixed(0)}ms  p99=${p(0.99).toFixed(0)}ms  max=${p(1).toFixed(0)}ms`);

  // PRD 가 명시 임계값을 지정하지 않으므로 합리적 기준: ok ≥ 95%, p95 < 2s
  const okPct = (okCount / N) * 100;
  const p95 = p(0.95);
  const passOk = okPct >= 95;
  const passP95 = p95 < 2000;
  console.log(`\n  gate: ok≥95%  → ${passOk ? "✓" : "✗"} (${okPct.toFixed(0)}%)`);
  console.log(`  gate: p95<2s  → ${passP95 ? "✓" : "✗"} (${p95.toFixed(0)}ms)`);

  if (!passOk || !passP95) process.exit(1);
}

void main();
