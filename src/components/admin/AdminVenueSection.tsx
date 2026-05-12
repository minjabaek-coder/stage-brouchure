"use client";

import { type FC, useState, type FormEvent } from "react";
import { toast } from "sonner";
import type { VenueInfo } from "@/lib/venue";

interface AdminVenueSectionProps {
  initial: VenueInfo;
}

/**
 * 공연장 편집 — VenueIllustration 이 그릴 약도 SVG 의 모든 파라미터를 텍스트로
 * 받는다. 이미지 업로드 없이 admin 이 텍스트만 수정하면 홈의 약도가 즉시 갱신.
 *
 * POST /api/admin/save-venue 가 8개 키를 assets 테이블에 upsert.
 */
const AdminVenueSection: FC<AdminVenueSectionProps> = ({ initial }) => {
  const [state, setState] = useState(initial);
  const [saving, setSaving] = useState(false);

  function bind<K extends keyof VenueInfo>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setState((s) => ({ ...s, [key]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/save-venue", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: state.name,
          line: state.line,
          prevStation: state.prevStation,
          destStation: state.destStation,
          exit: state.exit,
          walkDistance: state.walkDistance,
          address: state.address,
          mapUrl: state.mapUrl,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        throw new Error(body?.error?.message ?? `Save failed (${res.status})`);
      }
      toast.success("공연장 정보가 저장되었습니다.");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.",
      );
    } finally {
      setSaving(false);
    }
  }

  const labelClass = "text-muted mb-1 block text-[12px] font-medium";
  const inputClass =
    "border-line text-ink focus:border-gold focus:ring-gold/20 w-full rounded-lg border bg-white px-3 py-2.5 text-[14px] leading-tight tracking-[-0.01em] outline-none transition-colors focus:ring-2";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      data-testid="admin-venue-form"
    >
      <div>
        <label htmlFor="venue-name" className={labelClass}>
          공연장 이름
        </label>
        <input
          id="venue-name"
          type="text"
          value={state.name}
          onChange={bind("name")}
          required
          maxLength={200}
          className={inputClass}
          style={{ borderWidth: "0.5px" }}
          data-testid="venue-input-name"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="venue-line" className={labelClass}>
            지하철 호선
          </label>
          <input
            id="venue-line"
            type="text"
            value={state.line}
            onChange={bind("line")}
            maxLength={40}
            placeholder="9호선"
            className={inputClass}
            style={{ borderWidth: "0.5px" }}
            data-testid="venue-input-line"
          />
        </div>
        <div>
          <label htmlFor="venue-exit" className={labelClass}>
            출구
          </label>
          <input
            id="venue-exit"
            type="text"
            value={state.exit}
            onChange={bind("exit")}
            required
            maxLength={40}
            placeholder="4번 출구"
            className={inputClass}
            style={{ borderWidth: "0.5px" }}
            data-testid="venue-input-exit"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="venue-prev" className={labelClass}>
            이전 정거장 (선택)
          </label>
          <input
            id="venue-prev"
            type="text"
            value={state.prevStation}
            onChange={bind("prevStation")}
            maxLength={40}
            placeholder="삼전역"
            className={inputClass}
            style={{ borderWidth: "0.5px" }}
            data-testid="venue-input-prev"
          />
        </div>
        <div>
          <label htmlFor="venue-dest" className={labelClass}>
            도착 정거장
          </label>
          <input
            id="venue-dest"
            type="text"
            value={state.destStation}
            onChange={bind("destStation")}
            required
            maxLength={40}
            placeholder="석촌고분역"
            className={inputClass}
            style={{ borderWidth: "0.5px" }}
            data-testid="venue-input-dest"
          />
        </div>
      </div>

      <div>
        <label htmlFor="venue-walk" className={labelClass}>
          도보 거리
        </label>
        <input
          id="venue-walk"
          type="text"
          value={state.walkDistance}
          onChange={bind("walkDistance")}
          required
          maxLength={40}
          placeholder="도보 300m"
          className={inputClass}
          style={{ borderWidth: "0.5px" }}
          data-testid="venue-input-walk"
        />
      </div>

      <div>
        <label htmlFor="venue-address" className={labelClass}>
          주소 / 설명 (줄바꿈 허용, 카드 우측 텍스트)
        </label>
        <textarea
          id="venue-address"
          value={state.address}
          onChange={bind("address")}
          required
          maxLength={500}
          rows={2}
          className={`${inputClass} resize-y`}
          style={{ borderWidth: "0.5px" }}
          data-testid="venue-input-address"
        />
      </div>

      <div>
        <label htmlFor="venue-map-url" className={labelClass}>
          지도 URL (네이버/카카오 지도 deeplink, 비우면 기본값)
        </label>
        <input
          id="venue-map-url"
          type="url"
          value={state.mapUrl}
          onChange={bind("mapUrl")}
          maxLength={1000}
          placeholder="https://map.naver.com/..."
          className={inputClass}
          style={{ borderWidth: "0.5px" }}
          data-testid="venue-input-mapurl"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-ink text-paper rounded-lg px-4 py-2 text-[13px] font-medium tracking-[-0.01em] transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-50"
        data-testid="venue-save"
      >
        {saving ? "저장 중…" : "저장"}
      </button>
    </form>
  );
};

export default AdminVenueSection;
