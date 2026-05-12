import Stage from "@/components/layout/Stage";
import HomeHeader from "@/components/public/HomeHeader";
import EventMeta from "@/components/public/EventMeta";
import InvitationVideo from "@/components/public/InvitationVideo";
import MenuCardList from "@/components/public/MenuCardList";
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
        <VenueCard />
      </div>
      <HomeFooter />
    </Stage>
  );
}
