"use client";

import { type FC, useState, type FormEvent } from "react";
import { toast } from "sonner";

interface AdminVenueSectionProps {
  initial: {
    name: string;
    address: string;
    mapUrl: string;
  };
}

/**
 * 공연장 편집 — 이름 / 주소 (여러 줄) / 지도 URL.
 * POST /api/admin/save-venue 가 assets.venue_* 키 3개를 upsert.
 */
const AdminVenueSection: FC<AdminVenueSectionProps> = ({ initial }) => {
  const [name, setName] = useState(initial.name);
  const [address, setAddress] = useState(initial.address);
  const [mapUrl, setMapUrl] = useState(initial.mapUrl);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/save-venue", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, address, mapUrl }),
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
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={200}
          className={inputClass}
          style={{ borderWidth: "0.5px" }}
          data-testid="venue-input-name"
        />
      </div>

      <div>
        <label htmlFor="venue-address" className={labelClass}>
          주소 / 약도 (줄바꿈 허용)
        </label>
        <textarea
          id="venue-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
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
          value={mapUrl}
          onChange={(e) => setMapUrl(e.target.value)}
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
