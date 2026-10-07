import { Sofa, Armchair, Car, ShoppingBag, Footprints, Building2, Stethoscope, PanelTop } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { ProductApplication } from "@/types";

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Sofa: ({ className }) => <Sofa className={className} />,
  Armchair: ({ className }) => <Armchair className={className} />,
  Car: ({ className }) => <Car className={className} />,
  ShoppingBag: ({ className }) => <ShoppingBag className={className} />,
  Footprints: ({ className }) => <Footprints className={className} />,
  Building2: ({ className }) => <Building2 className={className} />,
  Stethoscope: ({ className }) => <Stethoscope className={className} />,
  PanelTop: ({ className }) => <PanelTop className={className} />,
};

interface ApplicationCardProps {
  application: ProductApplication;
}

export default function ApplicationCard({ application }: ApplicationCardProps) {
  const { lang, isRTL } = useLanguage();
  const Icon = iconMap[application.icon] || Sofa;

  return (
    <div className="group relative overflow-hidden rounded-2xl cursor-pointer bg-white border border-cream-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={application.image}
          alt={lang === "ar" ? application.name.ar : application.name.en}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Icon Badge */}
        <div className={`absolute bottom-3 ${isRTL ? "right-3" : "left-3"}`}>
          <div className="w-9 h-9 bg-burgundy-900 rounded-full flex items-center justify-center shadow-lg">
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`p-4 ${isRTL ? "text-right" : "text-left"}`}>
        <h4 className="text-sm font-bold text-charcoal-900 mb-1">
          {lang === "ar" ? application.name.ar : application.name.en}
        </h4>
        <p className="text-xs text-charcoal-500 leading-relaxed">
          {lang === "ar" ? application.benefit.ar : application.benefit.en}
        </p>
      </div>
    </div>
  );
}
