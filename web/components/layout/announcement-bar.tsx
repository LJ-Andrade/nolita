import { getSiteContent } from "lib/vadmin";
import { AnnouncementBarClient } from "./announcement-bar-client";

// Announcement bar — shown at the very top of the page
export async function AnnouncementBar() {
  const content = await getSiteContent('home');

  return (
    <AnnouncementBarClient
      retailText={content.home_top_text_retail}
      wholesaleText={content.home_top_text_wholesale}
      fallbackText={content.home_top_text}
    />
  );
}
