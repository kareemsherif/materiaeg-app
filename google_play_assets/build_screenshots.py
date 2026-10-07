import os
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import arabic_reshaper
from bidi.algorithm import get_display

out_dir = r'c:\Users\kareem\Desktop\Materia-main\google_play_assets'
os.makedirs(out_dir, exist_ok=True)
base_path = r'c:\Users\kareem\Desktop\Materia-main\materia_app'

# Load Fonts
font_head_ar = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 44)
font_head_en = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 24)

font_ui_title = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 26)
font_ui_subtitle = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 20)
font_ui_body = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 18)
font_ui_body_bd = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 18)
font_ui_small = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 15)
font_ui_small_bd = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 15)

def ar(text):
    return get_display(arabic_reshaper.reshape(text))

def get_asset(rel_path):
    p = os.path.join(base_path, rel_path)
    if os.path.exists(p):
        return Image.open(p)
    return Image.new('RGB', (100, 100), (80, 80, 80))

def create_base_canvas(title_ar, title_en):
    canvas = Image.new('RGB', (1080, 1920), (22, 22, 22))
    draw = ImageDraw.Draw(canvas)
    # Background gradient: deep burgundy to dark charcoal
    for y in range(1920):
        ratio = y / 1920.0
        r = int(58 * (1 - ratio) + 16 * ratio)
        g = int(10 * (1 - ratio) + 16 * ratio)
        b = int(22 * (1 - ratio) + 18 * ratio)
        draw.line([(0, y), (1080, y)], fill=(r, g, b))
    
    # Header Arabic title
    ar_str = ar(title_ar)
    bbox_ar = draw.textbbox((0, 0), ar_str, font=font_head_ar)
    w_ar = bbox_ar[2] - bbox_ar[0]
    draw.text(((1080 - w_ar) // 2, 85), ar_str, font=font_head_ar, fill=(255, 255, 255))
    
    # Header English title
    bbox_en = draw.textbbox((0, 0), title_en, font=font_head_en)
    w_en = bbox_en[2] - bbox_en[0]
    draw.text(((1080 - w_en) // 2, 155), title_en, font=font_head_en, fill=(236, 196, 203))
    
    return canvas

def place_phone_frame(canvas, phone_ui):
    pw, ph = 880, 1620
    px, py = (1080 - pw) // 2, 240
    
    draw = ImageDraw.Draw(canvas)
    # Outer device bezel
    draw.rounded_rectangle([px-6, py-6, px+pw+6, py+ph+6], radius=48, fill=(118, 37, 46))
    draw.rounded_rectangle([px-3, py-3, px+pw+3, py+ph+3], radius=45, fill=(35, 35, 35))
    
    # Mask for curved corners
    mask = Image.new('L', (pw, ph), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, pw, ph], radius=42, fill=255)
    
    resized_ui = phone_ui.resize((pw, ph), Image.Resampling.LANCZOS)
    canvas.paste(resized_ui, (px, py), mask)

def draw_status_bar(ui_draw, pw=880):
    # Time and battery
    ui_draw.text((45, 16), "9:41", font=font_ui_small_bd, fill=(20, 20, 20))
    ui_draw.text((pw - 90, 16), "100%", font=font_ui_small_bd, fill=(20, 20, 20))
    # Speaker notch
    ui_draw.rounded_rectangle([(pw//2 - 60, 12), (pw//2 + 60, 26)], radius=7, fill=(20, 20, 20))

def draw_bottom_bar(ui_draw, pw=880, ph=1620, active_index=0):
    ui_draw.rectangle([0, ph - 100, pw, ph], fill=(255, 255, 255))
    ui_draw.line([(0, ph - 100), (pw, ph - 100)], fill=(230, 230, 230), width=1)
    
    tabs = ["الرئيسية", "المنتجات", "الماسح", "الصناعات", "تواصل"]
    step = pw // len(tabs)
    for i, t in enumerate(tabs):
        cx = i * step + step // 2
        color = (118, 37, 46) if i == active_index else (150, 150, 150)
        # Dot / icon indicator
        ui_draw.ellipse([cx - 8, ph - 80, cx + 8, ph - 64], fill=color)
        t_str = ar(t)
        bbox = ui_draw.textbbox((0, 0), t_str, font=font_ui_small)
        tw = bbox[2] - bbox[0]
        ui_draw.text((cx - tw // 2, ph - 55), t_str, font=font_ui_small, fill=color)
        
    # Home bar
    ui_draw.rounded_rectangle([pw//2 - 70, ph - 16, pw//2 + 70, ph - 10], radius=3, fill=(180, 180, 180))

# ----------------- SCREEN 1: Home & Catalog -----------------
def generate_screen_1():
    canvas = create_base_canvas("ماتيريا – كتالوج الجلود الفاخرة", "MATERIA – Premium Leather Catalog")
    pw, ph = 880, 1620
    ui = Image.new('RGB', (pw, ph), (250, 250, 250))
    draw = ImageDraw.Draw(ui)
    draw_status_bar(draw, pw)
    
    # App Header
    logo = get_asset('assets/images/logo.png').convert('RGBA')
    lw = 240
    lh = int(lw * (logo.height / logo.width))
    logo_res = logo.resize((lw, lh), Image.Resampling.LANCZOS)
    ui.paste(logo_res, (40, 50), logo_res)
    
    # Search Bar
    draw.rounded_rectangle([40, 125, pw - 40, 185], radius=15, fill=(240, 240, 240))
    draw.text((pw - 220, 142), ar("ابحث عن نوع الخامة..."), font=font_ui_body, fill=(140, 140, 140))
    
    # Hero Banner Card
    hero = get_asset('assets/images/hero.jpg').convert('RGB')
    hw, hh = pw - 80, 360
    hero_res = hero.resize((hw, hh), Image.Resampling.LANCZOS)
    # Mask rounded
    hmask = Image.new('L', (hw, hh), 0)
    ImageDraw.Draw(hmask).rounded_rectangle([0, 0, hw, hh], radius=24, fill=255)
    ui.paste(hero_res, (40, 210), hmask)
    
    # Hero Text Overlay
    draw.rounded_rectangle([40, 440, pw - 40, 570], radius=24, fill=(30, 10, 15))
    draw.text((pw - 380, 460), ar("خامات الجيل الجديد"), font=font_ui_title, fill=(255, 255, 255))
    draw.text((pw - 490, 505), ar("أعلى معايير الجودة والتصنيع في مصر"), font=font_ui_body, fill=(220, 200, 205))
    
    # Category Pills
    pills = ["الكل", "أثاث منزلي", "مقاعد سيارات", "أزياء وحقائب"]
    px_cur = 40
    for p in pills:
        p_str = ar(p)
        bbox = draw.textbbox((0, 0), p_str, font=font_ui_body_bd)
        pw_box = bbox[2] - bbox[0] + 36
        bg_col = (118, 37, 46) if p == "الكل" else (240, 240, 240)
        fg_col = (255, 255, 255) if p == "الكل" else (60, 60, 60)
        draw.rounded_rectangle([px_cur, 595, px_cur + pw_box, 645], radius=25, fill=bg_col)
        draw.text((px_cur + 18, 607), p_str, font=font_ui_body_bd, fill=fg_col)
        px_cur += pw_box + 14
        
    # Section Title
    draw.text((pw - 260, 675), ar("المنتجات الأكثر طلباً"), font=font_ui_title, fill=(30, 30, 30))
    draw.text((50, 680), ar("عرض الكل"), font=font_ui_body_bd, fill=(118, 37, 46))
    
    # 2 Product Cards Grid
    # Card 1: Soft Touch
    c1_w, c1_h = (pw - 100) // 2, 440
    p1_img = get_asset('assets/images/products/soft-touch.jpg').resize((c1_w, 240), Image.Resampling.LANCZOS)
    draw.rounded_rectangle([40, 725, 40 + c1_w, 725 + c1_h], radius=20, fill=(255, 255, 255), outline=(230, 230, 230), width=1)
    p1_mask = Image.new('L', (c1_w, 240), 0)
    ImageDraw.Draw(p1_mask).rounded_rectangle([0, 0, c1_w, 240], radius=20, fill=255)
    ui.paste(p1_img, (40, 725), p1_mask)
    draw.text((40 + c1_w - 180, 985), ar("سوفت تاتش 1.2مم"), font=font_ui_title, fill=(30, 30, 30))
    draw.text((40 + c1_w - 150, 1025), ar("أثاث فاخر وسهل التنظيف"), font=font_ui_small, fill=(120, 120, 120))
    # Color chips
    for idx, col in enumerate([(34, 34, 34), (184, 115, 51), (234, 230, 223)]):
        draw.ellipse([40 + c1_w - 40 - idx * 28, 1075, 40 + c1_w - 18 - idx * 28, 1097], fill=col, outline=(200, 200, 200))
    draw.rounded_rectangle([55, 1110, 40 + c1_w - 15, 1150], radius=10, fill=(118, 37, 46))
    draw.text((55 + (c1_w - 110) // 2, 1120), ar("طلب عينة"), font=font_ui_small_bd, fill=(255, 255, 255))
    
    # Card 2: Auto Grade
    c2_x = 40 + c1_w + 20
    p2_img = get_asset('assets/images/products/auto-grade.jpg').resize((c1_w, 240), Image.Resampling.LANCZOS)
    draw.rounded_rectangle([c2_x, 725, c2_x + c1_w, 725 + c1_h], radius=20, fill=(255, 255, 255), outline=(230, 230, 230), width=1)
    ui.paste(p2_img, (c2_x, 725), p1_mask)
    draw.text((c2_x + c1_w - 180, 985), ar("أوتو جريد 1.4مم"), font=font_ui_title, fill=(30, 30, 30))
    draw.text((c2_x + c1_w - 165, 1025), ar("مقاوم للحرارة والـ UV"), font=font_ui_small, fill=(120, 120, 120))
    for idx, col in enumerate([(20, 20, 20), (139, 69, 19), (160, 40, 40)]):
        draw.ellipse([c2_x + c1_w - 40 - idx * 28, 1075, c2_x + c1_w - 18 - idx * 28, 1097], fill=col, outline=(200, 200, 200))
    draw.rounded_rectangle([c2_x + 15, 1110, c2_x + c1_w - 15, 1150], radius=10, fill=(118, 37, 46))
    draw.text((c2_x + 15 + (c1_w - 110) // 2, 1120), ar("طلب عينة"), font=font_ui_small_bd, fill=(255, 255, 255))
    
    # Bottom Bar
    draw_bottom_bar(draw, pw, ph, active_index=0)
    place_phone_frame(canvas, ui)
    canvas.save(os.path.join(out_dir, 'screenshot_1_catalog.png'), 'PNG')
    print("Screenshot 1 generated.")

# ----------------- SCREEN 2: Industries -----------------
def generate_screen_2():
    canvas = create_base_canvas("خامات متخصصة لكافة الصناعات", "Engineered for Diverse Industries")
    pw, ph = 880, 1620
    ui = Image.new('RGB', (pw, ph), (250, 250, 250))
    draw = ImageDraw.Draw(ui)
    draw_status_bar(draw, pw)
    
    # Title
    draw.text((pw - 260, 60), ar("القطاعات والصناعات"), font=font_ui_title, fill=(30, 30, 30))
    draw.text((pw - 390, 100), ar("حلول مبتكرة مصممة لأدق معايير الاستخدام"), font=font_ui_body, fill=(120, 120, 120))
    
    items = [
        ("الأثاث المنزلي والمكتبي", "مقاوم للبقع وسهل التنظيف للأرائك والكراسي", 'assets/images/applications/sofa.jpg', "الأكثر طلباً"),
        ("تجهيزات ومقاعد السيارات", "مقاوم لأشعة الشمس والحرارة وثابت الألوان", 'assets/images/applications/car.jpg', "Auto Grade"),
        ("الموضة والحقائب والأحذية", "نعومة فائقة وألوان عصرية لمصممي الأزياء", 'assets/images/applications/bag.jpg', "Fashion"),
        ("الرعاية الصحية والمستشفيات", "معالج ضد البكتيريا وسهل التعقيم للأسرة الطبية", 'assets/images/applications/medical.jpg', "Medica Pro"),
    ]
    
    card_y = 150
    for title, desc, img_path, badge in items:
        cw, ch = pw - 80, 220
        # Container
        draw.rounded_rectangle([40, card_y, 40 + cw, card_y + ch], radius=20, fill=(255, 255, 255), outline=(225, 225, 225), width=1)
        # Image on left
        img = get_asset(img_path).resize((220, ch), Image.Resampling.LANCZOS)
        imask = Image.new('L', (220, ch), 0)
        ImageDraw.Draw(imask).rounded_rectangle([0, 0, 220, ch], radius=20, fill=255)
        ui.paste(img, (40, card_y), imask)
        
        # Text on right
        draw.text((40 + cw - 300, card_y + 35), ar(title), font=font_ui_title, fill=(30, 30, 30))
        draw.text((40 + cw - 390, card_y + 80), ar(desc), font=font_ui_small, fill=(120, 120, 120))
        
        # Badge
        b_str = ar(badge)
        bbox = draw.textbbox((0, 0), b_str, font=font_ui_small_bd)
        bw = bbox[2] - bbox[0] + 20
        draw.rounded_rectangle([40 + cw - bw - 25, card_y + 140, 40 + cw - 25, card_y + 175], radius=10, fill=(245, 235, 237))
        draw.text((40 + cw - bw - 15, card_y + 148), b_str, font=font_ui_small_bd, fill=(118, 37, 46))
        
        card_y += ch + 25
        
    draw_bottom_bar(draw, pw, ph, active_index=3)
    place_phone_frame(canvas, ui)
    canvas.save(os.path.join(out_dir, 'screenshot_2_industries.png'), 'PNG')
    print("Screenshot 2 generated.")

# ----------------- SCREEN 3: Product Detail -----------------
def generate_screen_3():
    canvas = create_base_canvas("مواصفات فنية وتنوع واسع في الألوان", "Technical Specs & Color Options")
    pw, ph = 880, 1620
    ui = Image.new('RGB', (pw, ph), (255, 255, 255))
    draw = ImageDraw.Draw(ui)
    draw_status_bar(draw, pw)
    
    # Back button & Title
    draw.text((pw - 180, 60), ar("تفاصيل المنتج"), font=font_ui_title, fill=(30, 30, 30))
    draw.text((50, 60), "share / fav", font=font_ui_small, fill=(120, 120, 120))
    
    # Big Product Image
    prod_img = get_asset('assets/images/products/soft-touch.jpg').resize((pw - 80, 440), Image.Resampling.LANCZOS)
    pmask = Image.new('L', (pw - 80, 440), 0)
    ImageDraw.Draw(pmask).rounded_rectangle([0, 0, pw - 80, 440], radius=24, fill=255)
    ui.paste(prod_img, (40, 115), pmask)
    
    # Badge floating on image
    draw.rounded_rectangle([60, 135, 240, 175], radius=12, fill=(118, 37, 46))
    draw.text((80, 145), ar("ضمان الجودة العالية"), font=font_ui_small_bd, fill=(255, 255, 255))
    
    # Product Title & Subtitle
    draw.text((pw - 340, 580), ar("ماتيريا سوفت تاتش 1.2مم"), font=font_ui_title, fill=(20, 20, 20))
    draw.text((pw - 390, 625), ar("الرمز: MAT-ST-120 | كود الأثاث الفاخر"), font=font_ui_body, fill=(120, 120, 120))
    
    # Color palette
    draw.text((pw - 200, 680), ar("الألوان المتوفرة:"), font=font_ui_body_bd, fill=(40, 40, 40))
    colors = [
        ((34, 34, 34), "فحمي"),
        ((184, 115, 51), "عنبري"),
        ((234, 230, 223), "لؤلؤي"),
        ((118, 37, 46), "عنابي"),
        ((90, 105, 120), "أزرق رمادي")
    ]
    cx = pw - 80
    for col, name in colors:
        draw.ellipse([cx - 45, 720, cx, 765], fill=col, outline=(180, 180, 180), width=2)
        cx -= 65
        
    # Technical Specs Box
    draw.rounded_rectangle([40, 810, pw - 40, 1180], radius=20, fill=(248, 248, 248), outline=(235, 235, 235))
    draw.text((pw - 220, 835), ar("المواصفات الفنية:"), font=font_ui_title, fill=(118, 37, 46))
    
    specs = [
        ("السماكة الإجمالية", "1.20 مم ± 0.05 مم"),
        ("عرض الرول", "140 سم (قياسي صناعي)"),
        ("مقاومة التآكل والفرك", "50,000+ دورة Martindale"),
        ("مقاومة التمزق", "فائقة التحمل (High Tensile)"),
        ("سهولة التنظيف", "مقاوم للبقع والماء 100%"),
    ]
    sy = 890
    for k, v in specs:
        draw.text((pw - 260, sy), ar(k), font=font_ui_body_bd, fill=(50, 50, 50))
        draw.text((60, sy), ar(v), font=font_ui_body, fill=(90, 90, 90))
        draw.line([(60, sy + 38), (pw - 60, sy + 38)], fill=(230, 230, 230))
        sy += 55
        
    # CTA Buttons at bottom
    draw.rounded_rectangle([40, 1220, pw - 40, 1290], radius=16, fill=(118, 37, 46))
    draw.text((pw // 2 - 80, 1240), ar("طلب عينة مجانية للمشروع"), font=font_ui_title, fill=(255, 255, 255))
    
    draw.rounded_rectangle([40, 1310, pw - 40, 1380], radius=16, fill=(255, 255, 255), outline=(118, 37, 46), width=2)
    draw.text((pw // 2 - 85, 1330), ar("تحميل ورقة المواصفات PDF"), font=font_ui_body_bd, fill=(118, 37, 46))
    
    place_phone_frame(canvas, ui)
    canvas.save(os.path.join(out_dir, 'screenshot_3_product_detail.png'), 'PNG')
    print("Screenshot 3 generated.")

# ----------------- SCREEN 4: AI Scanner -----------------
def generate_screen_4():
    canvas = create_base_canvas("الماسح الذكي لمطابقة خامات الجلد", "AI-Powered Leather Texture Scanner")
    pw, ph = 880, 1620
    ui = Image.new('RGB', (pw, ph), (18, 18, 20))
    draw = ImageDraw.Draw(ui)
    draw_status_bar(draw, pw)
    
    # Title
    draw.text((pw - 310, 60), ar("الماسح الذكي للجلد"), font=font_ui_title, fill=(255, 255, 255))
    draw.text((pw - 420, 100), ar("وجّه الكاميرا نحو عينة الجلد للتعرف الفوري"), font=font_ui_body, fill=(180, 180, 180))
    
    # Viewfinder Image Area
    scan_img = get_asset('assets/images/products/fashion-black.jpg').resize((pw - 80, 650), Image.Resampling.LANCZOS)
    smask = Image.new('L', (pw - 80, 650), 0)
    ImageDraw.Draw(smask).rounded_rectangle([0, 0, pw - 80, 650], radius=24, fill=255)
    ui.paste(scan_img, (40, 150), smask)
    
    # Viewfinder target corners
    vx1, vy1, vx2, vy2 = 100, 210, pw - 100, 740
    line_w = 6
    corner_len = 50
    col = (255, 80, 100)
    # TL
    draw.line([(vx1, vy1), (vx1 + corner_len, vy1)], fill=col, width=line_w)
    draw.line([(vx1, vy1), (vx1, vy1 + corner_len)], fill=col, width=line_w)
    # TR
    draw.line([(vx2, vy1), (vx2 - corner_len, vy1)], fill=col, width=line_w)
    draw.line([(vx2, vy1), (vx2, vy1 + corner_len)], fill=col, width=line_w)
    # BL
    draw.line([(vx1, vy2), (vx1 + corner_len, vy2)], fill=col, width=line_w)
    draw.line([(vx1, vy2), (vx1, vy2 - corner_len)], fill=col, width=line_w)
    # BR
    draw.line([(vx2, vy2), (vx2 - corner_len, vy2)], fill=col, width=line_w)
    draw.line([(vx2, vy2), (vx2, vy2 - corner_len)], fill=col, width=line_w)
    
    # Scanning laser line
    draw.line([(vx1 + 20, 480), (vx2 - 20, 480)], fill=(255, 100, 120), width=4)
    
    # Floating Result Card
    rw, rh = pw - 80, 520
    ry = 830
    draw.rounded_rectangle([40, ry, 40 + rw, ry + rh], radius=24, fill=(28, 28, 32), outline=(50, 50, 55))
    
    # Match percentage badge
    draw.rounded_rectangle([pw - 260, ry + 30, pw - 70, ry + 75], radius=14, fill=(35, 120, 75))
    draw.text((pw - 240, ry + 40), ar("تطابق 98% ممتاز"), font=font_ui_small_bd, fill=(255, 255, 255))
    
    draw.text((pw - 320, ry + 100), ar("الخامة المطابقة:"), font=font_ui_body, fill=(160, 160, 160))
    draw.text((pw - 370, ry + 135), ar("ماتيريا فاشن سموث 0.8مم"), font=font_ui_title, fill=(255, 255, 255))
    
    # Features detected
    dets = [
        ("نقشة الجلد", "حبيبي ناعم (Fine Grain)"),
        ("السماكة المقدرة", "0.80 مم مرن"),
        ("الاستخدام المثالي", "حقائب يد، أحذية فاخرة"),
    ]
    dy = ry + 200
    for k, v in dets:
        draw.text((pw - 240, dy), ar(k), font=font_ui_body, fill=(160, 160, 160))
        draw.text((70, dy), ar(v), font=font_ui_body_bd, fill=(255, 255, 255))
        draw.line([(70, dy + 35), (pw - 70, dy + 35)], fill=(45, 45, 50))
        dy += 50
        
    # Actions
    draw.rounded_rectangle([60, ry + 410, pw - 60, ry + 480], radius=16, fill=(118, 37, 46))
    draw.text((pw // 2 - 75, ry + 430), ar("عرض تفاصيل المنتج"), font=font_ui_body_bd, fill=(255, 255, 255))
    
    draw_bottom_bar(draw, pw, ph, active_index=2)
    place_phone_frame(canvas, ui)
    canvas.save(os.path.join(out_dir, 'screenshot_4_scanner.png'), 'PNG')
    print("Screenshot 4 generated.")

# ----------------- SCREEN 5: Contact & Samples -----------------
def generate_screen_5():
    canvas = create_base_canvas("تواصل فوري وطلب عينات لمشروعك", "Direct Support & Sample Orders")
    pw, ph = 880, 1620
    ui = Image.new('RGB', (pw, ph), (250, 250, 250))
    draw = ImageDraw.Draw(ui)
    draw_status_bar(draw, pw)
    
    # Title
    draw.text((pw - 240, 60), ar("تواصل معنا"), font=font_ui_title, fill=(30, 30, 30))
    draw.text((pw - 400, 100), ar("فريق مبيعات ودعم فني متاح لخدمتك دائماً"), font=font_ui_body, fill=(120, 120, 120))
    
    # Factory Image Banner
    fact_img = get_asset('assets/images/about-factory.jpg').resize((pw - 80, 300), Image.Resampling.LANCZOS)
    fmask = Image.new('L', (pw - 80, 300), 0)
    ImageDraw.Draw(fmask).rounded_rectangle([0, 0, pw - 80, 300], radius=20, fill=255)
    ui.paste(fact_img, (40, 150), fmask)
    
    # Contact Channels Cards
    contacts = [
        ("الخط الساخن المباشر", "16870", "اتصال سريع ومجاني"),
        ("محادثة واتساب الفورية", "خدمة العملاء والمبيعات", "تواصل فوري ومباشر"),
        ("البريد الإلكتروني الرسمي", "info@materiaeg.com", "لطلبات الشركات والمصانع"),
        ("موقع المصنع والمقر الرئيسي", "مدينة السادات الصناعية & الإسكندرية", "زيارة المعرض والإنتاج"),
    ]
    cy = 480
    for title, val, sub in contacts:
        draw.rounded_rectangle([40, cy, pw - 40, cy + 130], radius=18, fill=(255, 255, 255), outline=(225, 225, 225))
        # Icon box
        draw.rounded_rectangle([60, cy + 25, 140, cy + 105], radius=14, fill=(248, 238, 240))
        draw.ellipse([88, cy + 50, 112, cy + 74], fill=(118, 37, 46))
        
        # Details
        draw.text((pw - 340, cy + 28), ar(title), font=font_ui_title, fill=(30, 30, 30))
        draw.text((pw - 380, cy + 70), ar(val), font=font_ui_body_bd, fill=(118, 37, 46))
        draw.text((160, cy + 50), ar(sub), font=font_ui_small, fill=(140, 140, 140))
        
        cy += 150
        
    # Bottom Inquiry Box
    draw.rounded_rectangle([40, 1140, pw - 40, 1370], radius=20, fill=(35, 12, 18))
    draw.text((pw - 300, 1170), ar("هل تحتاج استشارة فنية؟"), font=font_ui_title, fill=(255, 255, 255))
    draw.text((pw - 480, 1215), ar("خبراؤنا جاهزون لاقتراح أفضل خامة لمشروعك"), font=font_ui_body, fill=(230, 200, 205))
    draw.rounded_rectangle([60, 1280, pw - 60, 1345], radius=14, fill=(255, 255, 255))
    draw.text((pw // 2 - 95, 1298), ar("بدء محادثة واتساب الآن"), font=font_ui_title, fill=(118, 37, 46))
    
    draw_bottom_bar(draw, pw, ph, active_index=4)
    place_phone_frame(canvas, ui)
    canvas.save(os.path.join(out_dir, 'screenshot_5_contact.png'), 'PNG')
    print("Screenshot 5 generated.")

if __name__ == '__main__':
    generate_screen_1()
    generate_screen_2()
    generate_screen_3()
    generate_screen_4()
    generate_screen_5()
    print("All screenshots generated successfully!")
