"use client";

import { type FC, useState, type FormEvent } from "react";
import SeatResultCard from "@/components/public/SeatResultCard";
import NoResultCard from "@/components/public/NoResultCard";

type ResultState =
  | { kind: "idle" }
  | { kind: "loading" }
  | {
      kind: "found";
      data: { name: string; seat: string; note: string | null; phoneLast4: string };
    }
  | { kind: "not_found" }
  | { kind: "error"; message: string };

interface ApiSuccess {
  data: { name: string; seat: string; note: string | null; phoneLast4: string };
}
interface ApiError {
  error: { code: string };
}

const EMPTY_MESSAGE = "이름과 전화번호 뒷자리 4자리를 모두 입력해 주세요.";
const PHONE_FORMAT_MESSAGE = "전화번호 뒷자리 4자리(숫자)를 입력해 주세요.";
const RATE_LIMITED_MESSAGE =
  "잠시 후 다시 시도해 주세요. (1분에 30회까지 검색 가능합니다.)";

const SearchForm: FC = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [validation, setValidation] = useState<string | null>(null);
  const [result, setResult] = useState<ResultState>({ kind: "idle" });

  // 입력을 비우면 결과/오류를 자연스럽게 닫는다 (E2E #5)
  function handleNameChange(value: string) {
    setName(value);
    if (value.trim() === "" && phone === "") {
      setResult({ kind: "idle" });
      setValidation(null);
    }
  }
  function handlePhoneChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    setPhone(digits);
    if (name.trim() === "" && digits === "") {
      setResult({ kind: "idle" });
      setValidation(null);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || phone.length === 0) {
      setValidation(EMPTY_MESSAGE);
      setResult({ kind: "idle" });
      return;
    }
    if (!/^\d{4}$/.test(phone)) {
      setValidation(PHONE_FORMAT_MESSAGE);
      setResult({ kind: "idle" });
      return;
    }

    setValidation(null);
    setResult({ kind: "loading" });

    let res: Response;
    try {
      res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, phone_last4: phone }),
      });
    } catch {
      setResult({
        kind: "error",
        message: "네트워크 오류가 발생했습니다. 다시 시도해 주세요.",
      });
      return;
    }

    if (res.status === 200) {
      const body = (await res.json()) as ApiSuccess;
      setResult({ kind: "found", data: body.data });
      // S08 — 좌석맵 영역으로 부드러운 스크롤
      setTimeout(() => {
        document
          .getElementById("seatmap-anchor")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
      return;
    }

    if (res.status === 404) {
      setResult({ kind: "not_found" });
      return;
    }

    if (res.status === 429) {
      setResult({ kind: "error", message: RATE_LIMITED_MESSAGE });
      return;
    }

    // 400 INVALID_INPUT 등 — 클라이언트 검증을 통과한 입력이 서버에서 막힌 경우
    const body = (await res.json().catch(() => null)) as ApiError | null;
    setResult({
      kind: "error",
      message:
        body?.error?.code === "INVALID_INPUT"
          ? "입력 형식을 확인해 주세요."
          : "검색 중 오류가 발생했습니다.",
    });
  }

  return (
    <section
      className="animate-fade-up flex flex-col gap-6"
      data-testid="search-form-section"
    >
      <p className="font-serif-ko text-paper/65 text-center text-sm leading-[1.7] tracking-[0.05em]">
        이름과 전화번호 뒷자리 4자리를 입력하시면
        <br />
        지정된 좌석을 안내해 드립니다.
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-3"
        data-testid="search-form"
      >
        <label className="sr-only" htmlFor="search-name">
          이름
        </label>
        <input
          id="search-name"
          name="name"
          type="text"
          autoComplete="off"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="이름 (Name)"
          className="font-serif-ko text-paper border-gold/30 focus:border-gold focus:ring-gold/20 placeholder:font-serif-en w-full rounded-[2px] border border-b-[var(--color-gold)] bg-[rgba(26,26,31,0.6)] px-5 py-4 text-base tracking-[0.05em] outline-none transition-all placeholder:text-[rgba(244,237,224,0.3)] placeholder:italic focus:bg-[rgba(26,26,31,0.9)] focus:ring-[3px]"
        />

        <label className="sr-only" htmlFor="search-phone">
          전화번호 뒷자리 4자리
        </label>
        <input
          id="search-phone"
          name="phone_last4"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          // maxLength is enforced in handlePhoneChange below — applying it on
          // the element clips chars before the onChange runs, which would let
          // a paste like "abc1234" become "abc1" and then JS-strip down to "1".
          pattern="\d{4}"
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="전화번호 뒷자리 4자리 (1234)"
          className="font-serif-ko text-paper border-gold/30 focus:border-gold focus:ring-gold/20 placeholder:font-serif-en w-full rounded-[2px] border border-b-[var(--color-gold)] bg-[rgba(26,26,31,0.6)] px-5 py-4 text-base tracking-[0.15em] outline-none transition-all placeholder:text-[rgba(244,237,224,0.3)] placeholder:italic focus:bg-[rgba(26,26,31,0.9)] focus:ring-[3px]"
        />

        <button
          type="submit"
          disabled={result.kind === "loading"}
          className="font-serif-ko bg-gold text-ink hover:bg-gold-hi focus-visible:ring-gold/40 mt-2 w-full rounded-[2px] py-3.5 text-[15px] font-medium tracking-[0.2em] transition-colors disabled:cursor-wait disabled:opacity-60 focus-visible:ring-2 focus-visible:outline-none"
          data-testid="search-submit"
        >
          {result.kind === "loading" ? "조회 중…" : "자리 확인"}
        </button>

        {validation && (
          <p
            className="font-serif-ko text-[#e8b4b4] mt-1 text-center text-[13px] tracking-[0.05em]"
            role="alert"
            data-testid="search-validation"
          >
            {validation}
          </p>
        )}
      </form>

      {result.kind === "found" && (
        <SeatResultCard
          name={result.data.name}
          phoneLast4={result.data.phoneLast4}
          seat={result.data.seat}
          note={result.data.note}
        />
      )}
      {result.kind === "not_found" && <NoResultCard />}
      {result.kind === "error" && (
        <div
          className="font-serif-ko text-paper/70 rounded-[2px] border border-[rgba(232,180,180,0.4)] px-5 py-5 text-center text-sm leading-[1.7]"
          role="alert"
          data-testid="search-error"
        >
          {result.message}
        </div>
      )}

      {/* S08 좌석맵이 마운트될 위치 — 검색 성공 시 스크롤 타깃 */}
      <div id="seatmap-anchor" aria-hidden />
    </section>
  );
};

export default SearchForm;
