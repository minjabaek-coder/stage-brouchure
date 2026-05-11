import Stage from "@/components/layout/Stage";
import HomeHeader from "@/components/public/HomeHeader";
import InvitationVideo from "@/components/public/InvitationVideo";
import HomeFooter from "@/components/public/HomeFooter";
import { EVENT } from "@/lib/event";

export default function Home() {
  return (
    <Stage>
      <HomeHeader />
      <InvitationVideo videoId={EVENT.videoYoutubeId} />
      {/* S04: MenuCardList */}
      <HomeFooter />
    </Stage>
  );
}
