import Stage from "@/components/layout/Stage";

export default function Home() {
  return (
    <Stage className="flex min-h-screen flex-col items-center justify-center text-center">
      <p
        className="font-serif-en text-gold text-xs tracking-wider2 uppercase"
        data-testid="placeholder-eyebrow"
      >
        — Harmony Concert · placeholder —
      </p>
      <h1 className="font-serif-ko text-paper mt-4 text-4xl font-medium tracking-wider2">
        어울림 콘서트
      </h1>
      <p className="font-serif-ko text-paper/60 mt-3 text-sm">
        S01 디자인 토큰 적용. 이후 단계에서 헤더·영상·메뉴가 채워집니다.
      </p>
    </Stage>
  );
}
