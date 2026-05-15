import Stage from "@/components/layout/Stage";
import HomeHeader from "@/components/public/HomeHeader";
import EventMeta from "@/components/public/EventMeta";
import DDayCard from "@/components/public/DDayCard";
import CalendarCard from "@/components/public/CalendarCard";
import InvitationVideo from "@/components/public/InvitationVideo";
import MenuCardList from "@/components/public/MenuCardList";
import NoticeLine from "@/components/public/NoticeLine";
import VenueCard from "@/components/public/VenueCard";
import HomeFooter from "@/components/public/HomeFooter";
import { EVENT } from "@/lib/event";

// 공연장 정보가 admin 수정 시 즉시 반영되도록 SSR.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <Stage edgeToEdge>
      <HomeHeader />
      <div className="px-[26px]">
        <EventMeta />
      </div>
      <div className="px-[26px] pt-5">
        <div className="flex gap-3" data-testid="save-the-date">
          <DDayCard />
          <CalendarCard />
        </div>
      </div>
      <div className="px-[26px]">
        <InvitationVideo
          videoId={EVENT.videoYoutubeId}
          caption={EVENT.videoCaption}
          footText={EVENT.videoFootText}
        />
      </div>
      <div className="px-[26px] pt-3">
        <MenuCardList />
      </div>
      <div className="px-[26px]">
        <NoticeLine testId="entry-notice">
          공연시작 10분 전까지 공연장에 입장하시기 바랍니다.
        </NoticeLine>
      </div>
      <div className="px-[26px]">
        <VenueCard />
      </div>
      <HomeFooter />
    </Stage>
  );
}
