import type { Product, Industry, ProductApplication } from "@/types";
import appSofa from "@/assets/app-sofa.jpg";
import appChair from "@/assets/app-chair.jpg";
import appCar from "@/assets/app-car.jpg";
import appBag from "@/assets/app-bag.jpg";
import appShoes from "@/assets/app-shoes.jpg";
import appHotel from "@/assets/app-hotel.jpg";
import appMedical from "@/assets/app-medical.jpg";
import appWall from "@/assets/app-wall.jpg";
import softTouch from "@/assets/product-soft-touch.jpg";
import ultraGrip from "@/assets/product-ultra-grip.jpg";
import autoGrade from "@/assets/product-auto-grade.jpg";
import fashionBlack from "@/assets/product-fashion-black.jpg";
import medicaWhite from "@/assets/product-medica.jpg";

export const APPLICATIONS: ProductApplication[] = [
  {
    id: "sofa",
    name: { en: "Home Furniture", ar: "الأثاث المنزلي" },
    benefit: { en: "Elegant finish + easy cleaning", ar: "تشطيب أنيق وسهل التنظيف" },
    image: appSofa,
    icon: "Sofa",
  },
  {
    id: "chair",
    name: { en: "Office Chairs", ar: "كراسي المكتب" },
    benefit: { en: "Durable + professional look", ar: "متين ومظهر احترافي" },
    image: appChair,
    icon: "Armchair",
  },
  {
    id: "car",
    name: { en: "Car Seats", ar: "مقاعد السيارات" },
    benefit: { en: "Durable + heat resistant", ar: "متين ومقاوم للحرارة" },
    image: appCar,
    icon: "Car",
  },
  {
    id: "bag",
    name: { en: "Handbags & Wallets", ar: "الحقائب والمحافظ" },
    benefit: { en: "Premium look + stylish texture", ar: "مظهر فاخر وملمس أنيق" },
    image: appBag,
    icon: "ShoppingBag",
  },
  {
    id: "shoes",
    name: { en: "Footwear", ar: "الأحذية" },
    benefit: { en: "Comfortable + water resistant", ar: "مريح ومقاوم للماء" },
    image: appShoes,
    icon: "Footprints",
  },
  {
    id: "hotel",
    name: { en: "Hotel Seating", ar: "أثاث الفنادق" },
    benefit: { en: "Luxury aesthetic + durability", ar: "جماليات فاخرة ومتانة" },
    image: appHotel,
    icon: "Building2",
  },
  {
    id: "medical",
    name: { en: "Medical Beds", ar: "أسرة طبية" },
    benefit: { en: "Hygienic + easy sterilization", ar: "صحي وسهل التعقيم" },
    image: appMedical,
    icon: "Stethoscope",
  },
  {
    id: "wall",
    name: { en: "Wall Panels", ar: "ألواح الجدران" },
    benefit: { en: "Acoustic insulation + elegance", ar: "عزل صوتي وأناقة" },
    image: appWall,
    icon: "PanelTop",
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "soft-touch-1-2mm",
    name: { en: "Soft Touch 1.2mm", ar: "سوفت تاتش 1.2 مم" },
    code: "MT-ST-12",
    description: {
      en: "Premium quality PVC leather with a soft and smooth feel, combining luxurious appearance with durability across multiple applications. Water resistant and easy to clean with exceptional color stability.",
      ar: "جلد صناعي عالي الجودة بملمس ناعم ومرن، يجمع مظهراً فاخراً وأداءً ممتازاً في مختلف الاستخدامات. مقاوم للماء وسهل التنظيف مع ثبات لون عالي.",
    },
    thickness: "1.2 mm",
    width: "137 cm",
    materialType: { en: "PVC", ar: "PVC" },
    texture: { en: "Knitted", ar: "محبوك" },
    backing: { en: "Polyester", ar: "بوليستر" },
    finish: { en: "Matte", ar: "غير لامع" },
    waterResistance: { en: "Excellent", ar: "ممتاز" },
    fireResistance: { en: "Good", ar: "جيد" },
    softnessLevel: { en: "Soft", ar: "ناعم" },
    isNew: true,
    isBestSeller: false,
    image: softTouch,
    galleryImages: [softTouch, ultraGrip],
    colors: [
      { name: { en: "Cream White", ar: "أبيض كريمي" }, hex: "#F5F0E8" },
      { name: { en: "Warm Beige", ar: "بيج دافئ" }, hex: "#C4A882" },
      { name: { en: "Caramel Brown", ar: "بني كراميل" }, hex: "#8B6852" },
      { name: { en: "Charcoal Gray", ar: "رمادي فحمي" }, hex: "#4A4A4A" },
      { name: { en: "Jet Black", ar: "أسود غامق" }, hex: "#1A1A1A" },
      { name: { en: "Burgundy", ar: "خمري" }, hex: "#7B1C2C" },
    ],
    applications: ["sofa", "chair", "hotel", "wall", "medical"],
    categories: ["furniture", "hospitality", "medical"],
  },
  {
    id: "2",
    slug: "ultra-grip-1-4mm",
    name: { en: "Ultra Grip 1.4mm", ar: "ألترا جريب 1.4 مم" },
    code: "MT-UG-14",
    description: {
      en: "Heavy-duty PVC leather designed for high-traffic applications. Exceptional scratch resistance and durability make it ideal for commercial furniture and industrial use.",
      ar: "جلد صناعي PVC سميك مصمم للتطبيقات عالية الاستخدام. مقاومة استثنائية للخدش والمتانة تجعله مثالياً للأثاث التجاري والاستخدام الصناعي.",
    },
    thickness: "1.4 mm",
    width: "140 cm",
    materialType: { en: "PVC", ar: "PVC" },
    texture: { en: "Woven", ar: "منسوج" },
    backing: { en: "Non-woven", ar: "غير منسوج" },
    finish: { en: "Semi-matte", ar: "شبه لامع" },
    waterResistance: { en: "Excellent", ar: "ممتاز" },
    fireResistance: { en: "Excellent", ar: "ممتاز" },
    softnessLevel: { en: "Medium", ar: "متوسط" },
    isNew: false,
    isBestSeller: true,
    image: ultraGrip,
    galleryImages: [ultraGrip, softTouch],
    colors: [
      { name: { en: "Chocolate", ar: "شوكولاتة" }, hex: "#5C3317" },
      { name: { en: "Walnut", ar: "جوزي" }, hex: "#773E22" },
      { name: { en: "Tan Brown", ar: "بني تان" }, hex: "#9B7654" },
      { name: { en: "Deep Black", ar: "أسود عميق" }, hex: "#111111" },
      { name: { en: "Slate Gray", ar: "رمادي" }, hex: "#6B7280" },
    ],
    applications: ["sofa", "chair", "hotel", "wall"],
    categories: ["furniture", "hospitality"],
  },
  {
    id: "3",
    slug: "auto-grade-perforated",
    name: { en: "Auto Grade Perforated", ar: "أوتو جريد مثقب" },
    code: "MT-AG-P",
    description: {
      en: "Specially engineered perforated PVC leather for automotive applications. Designed to withstand extreme temperatures, UV exposure, and intensive daily use inside vehicles.",
      ar: "جلد صناعي مثقب مصمم خصيصاً لتطبيقات السيارات. مصمم لتحمل درجات الحرارة القصوى والتعرض للأشعة فوق البنفسجية والاستخدام اليومي المكثف داخل المركبات.",
    },
    thickness: "1.6 mm",
    width: "140 cm",
    materialType: { en: "PVC", ar: "PVC" },
    texture: { en: "Perforated", ar: "مثقب" },
    backing: { en: "Foam + Polyester", ar: "إسفنج + بوليستر" },
    finish: { en: "Matte Anti-slip", ar: "غير لامع مضاد للانزلاق" },
    waterResistance: { en: "Excellent", ar: "ممتاز" },
    fireResistance: { en: "Excellent", ar: "ممتاز" },
    softnessLevel: { en: "Medium-Soft", ar: "متوسط ناعم" },
    isNew: false,
    isBestSeller: true,
    image: autoGrade,
    galleryImages: [autoGrade, softTouch, ultraGrip],
    colors: [
      { name: { en: "Cream", ar: "كريم" }, hex: "#F5F0E8" },
      { name: { en: "Tan", ar: "تان" }, hex: "#C4A882" },
      { name: { en: "Graphite", ar: "جرافيت" }, hex: "#3D3D3D" },
      { name: { en: "Black", ar: "أسود" }, hex: "#111111" },
    ],
    applications: ["car"],
    categories: ["automotive"],
  },
  {
    id: "4",
    slug: "fashion-smooth-0-8mm",
    name: { en: "Fashion Smooth 0.8mm", ar: "فاشن سموث 0.8 مم" },
    code: "MT-FS-08",
    description: {
      en: "Ultra-smooth thin PVC leather crafted for fashion applications. Exceptional color vibrancy, smooth grain-free surface, and excellent flexibility make it ideal for premium bags, wallets, and footwear.",
      ar: "جلد صناعي PVC رفيع فائق النعومة مصنوع لتطبيقات الموضة. إشراق استثنائي للألوان وسطح ناعم بدون حبيبات ومرونة ممتازة تجعله مثالياً للحقائب الفاخرة والأحذية.",
    },
    thickness: "0.8 mm",
    width: "137 cm",
    materialType: { en: "PVC", ar: "PVC" },
    texture: { en: "Smooth Grain-free", ar: "ناعم بدون حبيبات" },
    backing: { en: "Polyester Knit", ar: "بوليستر محبوك" },
    finish: { en: "High Gloss", ar: "لامع عالي" },
    waterResistance: { en: "Good", ar: "جيد" },
    fireResistance: { en: "Standard", ar: "قياسي" },
    softnessLevel: { en: "Very Soft", ar: "ناعم جداً" },
    isNew: false,
    isBestSeller: false,
    image: fashionBlack,
    galleryImages: [fashionBlack, softTouch, medicaWhite],
    colors: [
      { name: { en: "Jet Black", ar: "أسود لامع" }, hex: "#111111" },
      { name: { en: "Burgundy Red", ar: "خمري" }, hex: "#7B1C2C" },
      { name: { en: "Navy Blue", ar: "كحلي" }, hex: "#1B2A4A" },
      { name: { en: "Forest Green", ar: "أخضر غابة" }, hex: "#2D5016" },
      { name: { en: "Ivory", ar: "عاجي" }, hex: "#FFFFF0" },
    ],
    applications: ["bag", "shoes"],
    categories: ["fashion", "footwear"],
  },
  {
    id: "5",
    slug: "medica-pro-antimicrobial",
    name: { en: "Medica Pro Antimicrobial", ar: "ميديكا برو مضاد للبكتيريا" },
    code: "MT-MP-AM",
    description: {
      en: "Medical-grade PVC leather with built-in antimicrobial protection. Easy to sterilize with standard disinfectants, seamless surface prevents bacterial growth. Ideal for healthcare furniture.",
      ar: "جلد صناعي بمستوى طبي مع حماية مدمجة مضادة للميكروبات. سهل التعقيم بالمطهرات القياسية، سطح بلا مسام يمنع نمو البكتيريا. مثالي لأثاث الرعاية الصحية.",
    },
    thickness: "1.0 mm",
    width: "137 cm",
    materialType: { en: "PVC Antimicrobial", ar: "PVC مضاد للميكروبات" },
    texture: { en: "Smooth", ar: "ناعم" },
    backing: { en: "Polyester", ar: "بوليستر" },
    finish: { en: "Matte Soft", ar: "ناعم غير لامع" },
    waterResistance: { en: "Excellent", ar: "ممتاز" },
    fireResistance: { en: "Good", ar: "جيد" },
    softnessLevel: { en: "Soft", ar: "ناعم" },
    isNew: true,
    isBestSeller: false,
    image: medicaWhite,
    galleryImages: [medicaWhite, softTouch, autoGrade],
    colors: [
      { name: { en: "Clinical White", ar: "أبيض سريري" }, hex: "#F8F8F8" },
      { name: { en: "Light Gray", ar: "رمادي فاتح" }, hex: "#D4D4D4" },
      { name: { en: "Sky Blue", ar: "أزرق سماوي" }, hex: "#87CEEB" },
      { name: { en: "Mint Green", ar: "أخضر نعناعي" }, hex: "#98D8C8" },
    ],
    applications: ["medical", "chair"],
    categories: ["medical"],
  },
];

export const INDUSTRIES: Industry[] = [
  {
    id: "furniture",
    name: { en: "Home & Office Furniture", ar: "الأثاث المنزلي والمكتبي" },
    description: {
      en: "Supplying premium leather to Egypt's top furniture manufacturers. Our materials cover sofas, chairs, headboards, and more.",
      ar: "نوفر الجلد الفاخر لكبار مصنعي الأثاث في مصر. خاماتنا تغطي الأرائك والكراسي ولوحات الرأس والمزيد.",
    },
    icon: "Sofa",
    image: appSofa,
    products: ["1", "2"],
    applications: ["Sofas", "Armchairs", "Headboards", "Ottoman", "Office Chairs"],
  },
  {
    id: "automotive",
    name: { en: "Automotive", ar: "السيارات" },
    description: {
      en: "Heat-resistant, UV-stable leather for car seats, door panels, steering wheels, and dashboards.",
      ar: "جلد مقاوم للحرارة وثابت أمام الأشعة فوق البنفسجية لمقاعد السيارات والأبواب وعجلات القيادة.",
    },
    icon: "Car",
    image: appCar,
    products: ["3"],
    applications: ["Car Seats", "Door Panels", "Steering Wheel", "Dashboard", "Armrests"],
  },
  {
    id: "fashion",
    name: { en: "Fashion & Bags", ar: "الموضة والحقائب" },
    description: {
      en: "Ultra-smooth, vibrant fashion leather for handbags, wallets, belts, and accessories.",
      ar: "جلد موضة فائق النعومة وزاهي الألوان للحقائب والمحافظ والأحزمة والاكسسوارات.",
    },
    icon: "ShoppingBag",
    image: appBag,
    products: ["4"],
    applications: ["Handbags", "Wallets", "Belts", "Accessories", "Clutches"],
  },
  {
    id: "footwear",
    name: { en: "Footwear", ar: "الأحذية" },
    description: {
      en: "Flexible, water-resistant leather perfectly suited for shoes, sandals, and boot production.",
      ar: "جلد مرن ومقاوم للماء مناسب تماماً لإنتاج الأحذية والصنادل والجزم.",
    },
    icon: "Footprints",
    image: appShoes,
    products: ["4"],
    applications: ["Dress Shoes", "Sneakers", "Sandals", "Boots", "Children's Shoes"],
  },
  {
    id: "hospitality",
    name: { en: "Hospitality & Hotels", ar: "الضيافة والفنادق" },
    description: {
      en: "Contract-grade leather for hotels, restaurants, clubs, and entertainment venues.",
      ar: "جلد للاستخدام التجاري للفنادق والمطاعم والنوادي وأماكن الترفيه.",
    },
    icon: "Building2",
    image: appHotel,
    products: ["1", "2"],
    applications: ["Lobby Seating", "Restaurant Chairs", "Banquet Furniture", "Bar Stools"],
  },
  {
    id: "medical",
    name: { en: "Medical & Healthcare", ar: "الطبي والرعاية الصحية" },
    description: {
      en: "Antimicrobial, easy-sterilize leather for hospitals, clinics, and medical equipment.",
      ar: "جلد مضاد للميكروبات وسهل التعقيم للمستشفيات والعيادات والمعدات الطبية.",
    },
    icon: "Stethoscope",
    image: appMedical,
    products: ["5"],
    applications: ["Exam Tables", "Hospital Beds", "Dental Chairs", "Clinic Furniture"],
  },
  {
    id: "interior",
    name: { en: "Interior Design", ar: "الديكور الداخلي" },
    description: {
      en: "Premium wall panels, ceiling accents, and decorative leather for luxury interior spaces.",
      ar: "ألواح جدران فاخرة وزخارف أسقف وجلد ديكوري لتصميمات الديكور الداخلي الفاخرة.",
    },
    icon: "PanelTop",
    image: appWall,
    products: ["1", "2"],
    applications: ["Wall Panels", "Ceiling Panels", "Column Wrapping", "Door Upholstery"],
  },
];

export const SELECTOR_RECOMMENDATIONS: Record<string, { productId: string; reason: { en: string; ar: string } }> = {
  sofa: {
    productId: "1",
    reason: {
      en: "Soft Touch 1.2mm is perfect for sofas — excellent softness, easy cleaning, and long durability.",
      ar: "سوفت تاتش 1.2مم مثالي للأرائك — نعومة ممتازة وسهولة تنظيف ومتانة طويلة.",
    },
  },
  chair: {
    productId: "2",
    reason: {
      en: "Ultra Grip 1.4mm withstands heavy daily use in office chairs with superior scratch resistance.",
      ar: "ألترا جريب 1.4مم يتحمل الاستخدام اليومي المكثف في كراسي المكتب بمقاومة استثنائية للخدش.",
    },
  },
  car: {
    productId: "3",
    reason: {
      en: "Auto Grade Perforated is engineered specifically for automotive — heat resistant and UV stable.",
      ar: "أوتو جريد مثقب مصمم خصيصاً للسيارات — مقاوم للحرارة وثابت أمام الأشعة فوق البنفسجية.",
    },
  },
  bag: {
    productId: "4",
    reason: {
      en: "Fashion Smooth 0.8mm gives handbags a premium look with vibrant colors and ultra-smooth surface.",
      ar: "فاشن سموث 0.8مم يمنح الحقائب مظهراً فاخراً بألوان زاهية وسطح فائق النعومة.",
    },
  },
  shoes: {
    productId: "4",
    reason: {
      en: "Fashion Smooth 0.8mm is highly flexible and water-resistant — perfect for premium footwear.",
      ar: "فاشن سموث 0.8مم عالي المرونة ومقاوم للماء — مثالي للأحذية الفاخرة.",
    },
  },
  hotel: {
    productId: "2",
    reason: {
      en: "Ultra Grip 1.4mm handles heavy commercial use in hotels with a luxury finish.",
      ar: "ألترا جريب 1.4مم يتحمل الاستخدام التجاري المكثف في الفنادق مع تشطيب فاخر.",
    },
  },
  clinic: {
    productId: "5",
    reason: {
      en: "Medica Pro Antimicrobial is specifically designed for healthcare — easy sterilization, hygienic.",
      ar: "ميديكا برو مضاد للبكتيريا مصمم خصيصاً للرعاية الصحية — سهل التعقيم وصحي.",
    },
  },
};
