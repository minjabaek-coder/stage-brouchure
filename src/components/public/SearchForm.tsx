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

    const body = (await res.json().catch(() => null)) as ApiError | null;
    setResult({
      kind: "error",
      message:
        body?.error?.code === "INVALID_INPUT"
          ? "입력 형식을 확인해 주세요."
          : "검색 중 오류가 발생했습니다.",
    });
  }

  const inputClass =
    "font-sans-ko text-ink border-line focus:border-gold focus:ring-gold/20 placeholder:text-muted-light w-full rounded-lg border bg-white px-4 py-3.5 text-base leading-tight tracking-[-0.01em] outline-none transition-colors focus:ring-2";

  return (
    <section
      className="flex flex-col gap-5"
      data-testid="search-form-section"
    >
      <p className="text-muted text-center text-[14px] leading-[1.7]">
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
          placeholder="이름"
          className={inputClass}
          style={{ borderWidth: "0.5px" }}
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
          pattern="\d{4}"
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="전화번호 뒷자리 4자리"
          className={`${inputClass} tracking-[0.1em]`}
          style={{ borderWidth: "0.5px" }}
        />

        <button
          type="submit"
          disabled={result.kind === "loading"}
          className="font-sans-ko bg-ink text-paper mt-2 w-full rounded-lg py-3.5 text-[15px] font-medium tracking-[0.05em] transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-50"
          data-testid="search-submit"
        >
          {result.kind === "loading" ? "조회 중…" : "자리 확인"}
        </button>

        {validation && (
          <p
            className="font-sans-ko mt-1 text-center text-[13px] text-[#b95e5e]"
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
          className="text-muted rounded-lg border border-[#e8c5c5] bg-[#fcefef] px-5 py-4 text-center text-sm leading-[1.7]"
          role="alert"
          data-testid="search-error"
        >
          {result.message}
        </div>
      )}

      <div id="seatmap-anchor" aria-hidden />
    </section>
  );
};

export default SearchForm;
