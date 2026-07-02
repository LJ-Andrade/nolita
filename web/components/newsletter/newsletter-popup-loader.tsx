import { getNewsletterPopupConfig } from "lib/vadmin";
import NewsletterPopup from "./newsletter-popup";

export default async function NewsletterPopupLoader() {
  const config = await getNewsletterPopupConfig();

  if (!config || !config.is_enabled) return null;

  return <NewsletterPopup config={config} />;
}
