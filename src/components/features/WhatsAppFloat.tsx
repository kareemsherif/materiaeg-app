import { MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/context/ContentContext";

export default function WhatsAppFloat() {
  const { isRTL } = useLanguage();
  const { settings } = useContent();

  const whatsapp = settings.whatsapp || "201290053380";

  return (
    <a
      href={`https://wa.me/${whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 ${isRTL ? "left-6" : "right-6"} z-50 w-14 h-14 bg-green-500 hover:bg-green-400 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 whatsapp-pulse`}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 fill-white" />
    </a>
  );
}
