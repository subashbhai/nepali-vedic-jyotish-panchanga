#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Balananda Vedic Jyotish & Panchanga - Real Frontend User Manual Video Generator
Captures real software interface screens, overlays realistic animated mouse cursor,
user manual instruction banners, and synthesizes authentic Nepali Female Voiceover (ne-NP-HemkalaNeural).
"""

import os
import sys
import asyncio
import subprocess

# Ensure UTF-8 stdout on Windows console
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

import edge_tts
import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
CHROME_EXE = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

WORK_DIR = os.path.abspath("manual_video_work")
FINAL_VIDEO_FILENAME = "balananda-jyotish-frontend-user-manual.mp4"
FINAL_VIDEO_PATH = os.path.abspath(FINAL_VIDEO_FILENAME)
PUBLIC_DOWNLOAD_PATH = os.path.abspath(os.path.join("public", "downloads", FINAL_VIDEO_FILENAME))
DIST_DOWNLOAD_PATH = os.path.abspath(os.path.join("dist", "downloads", FINAL_VIDEO_FILENAME))
USER_VIDEOS_PATH = os.path.expanduser(os.path.join("~", "Videos", FINAL_VIDEO_FILENAME))
BACKUP_PATH = os.path.abspath(os.path.join("C:\\ProjectBackups", FINAL_VIDEO_FILENAME))
DOCS_BACKUP_PATH = os.path.abspath(os.path.join("C:\\Users\\DELL-PC\\Documents\\Balananda_Project_Backups", FINAL_VIDEO_FILENAME))

# Authentic Nepali Female Voice in Edge TTS
FEMALE_VOICE = "ne-NP-HemkalaNeural"

# Fonts
FONT_BOLD_PATH = "C:/Windows/Fonts/kokilab.ttf"
FONT_REG_PATH = "C:/Windows/Fonts/kokila.ttf"
FONT_MANGAL_BOLD = "C:/Windows/Fonts/mangalb.ttf"
FONT_MANGAL_REG = "C:/Windows/Fonts/mangal.ttf"

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

FONT_HUD_BADGE = get_font(FONT_MANGAL_BOLD, 22)
FONT_HUD_TEXT = get_font(FONT_MANGAL_REG, 24)
FONT_TOOLTIP = get_font(FONT_MANGAL_BOLD, 20)
FONT_TITLE = get_font(FONT_BOLD_PATH, 36)

# 12 Real Frontend Walkthrough Chapters
CHAPTERS = [
    {
        "id": "step01",
        "step_num": "०१",
        "url_hash": "dashboard",
        "target_xy": (360, 48),  # Navigation bar: Dashboard / Home
        "target_label": "मुख्य ड्यासबोर्ड (Home)",
        "hud_badge": "कदम ०१/१२ : मुख्य ड्यासबोर्ड",
        "hud_instruction": "निर्देशिका: सफ्टवेयर सुरु गर्दा मुख्य ड्यासबोर्ड देखिन्छ। यहाँ आजको पञ्चाङ्ग, शुभ साइत र दैनिक ग्रह गोचर उपलब्ध छन्।",
        "narration": "नमस्ते, बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग प्रणालीको आधिकारिक प्रयोगकर्ता निर्देशिकामा यहाँलाई हार्दिक स्वागत छ। यो हाम्रो मुख्य ड्यासबोर्ड हो। यहाँ स्क्रिनको माथिल्लो भागमा मुख्य मेनुहरू र तल दैनिक पञ्चाङ्ग, शुभ साइत तथा वर्तमान ग्रह गोचरको सारांश देख्न सकिन्छ।"
    },
    {
        "id": "step02",
        "step_num": "०२",
        "url_hash": "user_dashboard",
        "target_xy": (1720, 48),  # Top-right user profile / registration icon
        "target_label": "नयाँ खाता दर्ता (Signup)",
        "hud_badge": "कदम ०२/१२ : नयाँ खाता दर्ता",
        "hud_instruction": "निर्देशिका: माथिल्लो दायाँ भागमा रहेको प्रयोगकर्ता आइकनमा क्लिक गर्नुहोस् र नाम, मोबाइल, जन्म मिति प्रविष्टि गर्नुहोस्।",
        "narration": "सफ्टवेयर प्रयोग गर्न नयाँ खाता दर्ता गर्नुपर्दछ। माथिल्लो दायाँ भागमा रहेको प्रयोगकर्ता आइकनमा क्लिक गर्नुहोस्। यहाँ आफ्नो पूरा नाम, मोबाइल नम्बर, ठेगाना र जन्म विवरण राखेर सजिलै नयाँ खाता दर्ता गर्न सकिन्छ। यसले वि.सं. र ई.सं. दुवै क्यालेन्डरमा स्वतः काम गर्दछ।"
    },
    {
        "id": "step03",
        "step_num": "०३",
        "url_hash": "user_dashboard",
        "target_xy": (1180, 240),  # Login gate / Active trial badge
        "target_label": "सुरक्षित लगइन (Login)",
        "hud_badge": "कदम ०३/१२ : सुरक्षित लगइन तथा २४ घण्टे ट्रायल",
        "hud_instruction": "निर्देशिका: मोबाइल नम्बर र पासवर्ड राखेर लगइन गर्नुहोस्। नयाँ ग्राहकका लागि २४ घण्टे निःशुल्क ट्रायल स्वतः सक्रिय हुन्छ।",
        "narration": "खाता दर्ता सम्पन्न भएपछि आफ्नो मोबाइल नम्बर वा युजरनेम र पासवर्ड राखेर सजिलै लगइन गर्नुहोस्। नयाँ प्रयोगकर्ताका लागि २४ घण्टासम्म सफ्टवेयरका सम्पूर्ण सुविधाहरू विनाशुल्क परीक्षण गर्न सकिने व्यवस्था गरिएको छ।"
    },
    {
        "id": "step04",
        "step_num": "०४",
        "url_hash": "kundali",
        "target_xy": (540, 48),  # 'कुण्डली' menu tab
        "target_label": "जन्मकुण्डली मेन्यु",
        "hud_badge": "कदम ०४/१२ : जन्मकुण्डली तथा भाव चक्र",
        "hud_instruction": "निर्देशिका: माथिको 'कुण्डली' मेन्युमा क्लिक गर्नुहोस्। लग्न कुण्डली, नवमांश चक्र (D9), भावचलित र ९ ग्रहको स्थिति अवलोकन गर्नुहोस्।",
        "narration": "अब माथिको कुण्डली मेन्युमा क्लिक गर्नुहोस्। यहाँ जातकको लग्न कुण्डली, नवमांश चक्र, भावचलित र चन्द्र कुण्डली तत्काल तयार हुन्छ। स्क्रिनमा ९ ग्रहहरूको स्पष्ट राशि, अंश, नक्षत्र र उच्च-नीच अवस्था ०.१ प्रतिशत पनि त्रुटी बिना गणितीय रूपमा देख्न सकिन्छ।"
    },
    {
        "id": "step05",
        "step_num": "०५",
        "url_hash": "dasha",
        "target_xy": (630, 48),  # 'दशा' menu tab
        "target_label": "विंशोत्तरी दशा मेन्यु",
        "hud_badge": "कदम ०५/१२ : विंशोत्तरी दशा तथा ग्रह गोचर",
        "hud_instruction": "निर्देशिका: 'दशा' मेन्युमा थिच्नुहोस्। १२० वर्षे विंशोत्तरी महादशा, अन्तर्दशा, प्रत्यन्तर, गोचर र साढेसाती चक्र तालिका खुल्छ।",
        "narration": "अर्को महत्त्वपूर्ण भाग हो दशा मेन्यु। दशा मेन्युमा क्लिक गर्दा १२० वर्षको पूर्ण विंशोत्तरी महादशा, अन्तर्दशा, प्रत्यन्तर र सूक्ष्मदशाको समयतालिका खुल्छ। साथै वर्तमान ग्रह गोचर, अष्टकवर्ग बिन्दु र शनिको साढेसाती चक्रको सटिक विश्लेषण यहाँ उपलब्ध छ।"
    },
    {
        "id": "step06",
        "step_num": "०६",
        "url_hash": "panchanga",
        "target_xy": (450, 48),  # 'पञ्चाङ्ग' menu tab
        "target_label": "पञ्चाङ्ग मेन्यु",
        "hud_badge": "कदम ०६/१२ : नेपाली पञ्चाङ्ग तथा क्यालेन्डर",
        "hud_instruction": "निर्देशिका: 'पञ्चाङ्ग' मेन्युमा थिच्नुहोस्। दैनिक तिथि, नक्षत्र, योग, करण, सूर्योदय र वि.सं. क्यालेन्डर हेर्नुहोस्।",
        "narration": "दैनिक पञ्चाङ्ग जान्न माथिल्लो बारको पञ्चाङ्ग मेन्युमा थिच्नुहोस्। यहाँ नेपाल पञ्चाङ्ग निर्णायक विकास समितिको मानक अनुसार दैनिक तिथि, नक्षत्र, योग, करण, सूर्योदय र सूर्यास्त समय उपलब्ध छ। साथै विक्रम संवत् २०० वर्षको क्यालेन्डर, शुभ होरा र साइतहरू समेटिएका छन्।"
    },
    {
        "id": "step07",
        "step_num": "०७",
        "url_hash": "prashna",
        "target_xy": (720, 48),  # 'प्रश्न' menu tab
        "target_label": "११६ प्रश्न ज्योतिष मेन्यु",
        "hud_badge": "कदम ०७/१२ : ११६ शास्त्रीय प्रश्न ज्योतिष",
        "hud_instruction": "निर्देशिका: 'प्रश्न' मेन्युमा जानुहोस्। ११६ शास्त्रीय प्रश्नहरू, कुण्डली अनुसार कार्यसिद्धि सम्भावना (%) र मूल श्लोक हेर्नुहोस्।",
        "narration": "अब प्रश्न ज्योतिष मेन्युमा जाऔँ। यहाँ जातकले दैनिक जीवनमा सोध्ने नोकरी, व्यापार, धन, विवाह, स्वास्थ्य र विदेश यात्रा सम्बन्धी ११६ वटा शास्त्रीय प्रश्नहरू छन्। प्रश्नमा क्लिक गर्दा तात्कालिक कुण्डलीका आधारमा कार्यसिद्धि प्रतिशत, बृहत् पराशरका मूल संस्कृत श्लोक, नेपाली व्याख्या र वैदिक उपाय प्राप्त हुन्छन्।"
    },
    {
        "id": "step08",
        "step_num": "०८",
        "url_hash": "ankajyotish",
        "target_xy": (800, 48),  # 'अंक ज्योतिष' menu tab
        "target_label": "अंक तथा केपी ज्योतिष",
        "hud_badge": "कदम ०८/१२ : अंक, केपी तथा नेमा ज्योतिष",
        "hud_instruction": "निर्देशिका: 'अंक ज्योतिष' मेन्युबाट नामांक, मूलांक र भाग्यांक तथा सब-मेन्युबाट केपी र नेमा ज्योतिष हेर्नुहोस्।",
        "narration": "अंक ज्योतिष मेन्युबाट आफ्नो नामांक, मूलांक र भाग्यांक गणना गर्न सकिन्छ। यसैगरी सब-मेन्युबाट कृष्णमूर्ति पद्धतिको २४९ सब-लर्ड र कस्पल कुण्डली तथा हिमाली परम्पराको प्राचीन नेमा ज्योतिष समेत एकै ठाउँमा अध्ययन गर्न सकिन्छ।"
    },
    {
        "id": "step09",
        "step_num": "०९",
        "url_hash": "vivah",
        "target_xy": (870, 48),  # 'विवाह' menu tab
        "target_label": "विवाह मेलापक मेन्यु",
        "hud_badge": "कदम ०९/१२ : विवाह मेलापक कुण्डली मिलान",
        "hud_instruction": "निर्देशिका: 'विवाह' मेन्युमा वर र वधुको जन्म विवरण राखी ३६ गुण अष्टकूट, नाडी, भकूट र मङ्गल दोष परीक्षण गर्नुहोस्।",
        "narration": "विवाह मेलापक मेन्युमा वर र वधुको जन्म विवरण राखेर ३६ गुण अष्टकूट मिलान गर्न सकिन्छ। यसले नाडी, भकूट, ग्रहमैत्री र मङ्गल दोष छ कि छैन र दोष भए परिहार के छ भन्ने शास्त्रीय प्रमाणसहितको स्पष्ट प्रतिवेदन तयार गरिदिन्छ।"
    },
    {
        "id": "step10",
        "step_num": "१०",
        "url_hash": "vastu",
        "target_xy": (940, 48),  # 'वास्तु' menu tab
        "target_label": "वैदिक वास्तु मेन्यु",
        "hud_badge": "कदम १०/१२ : वैदिक वास्तु शास्त्र तथा कम्पास",
        "hud_instruction": "निर्देशिका: 'वास्तु' मेन्युमा क्लिक गर्नुहोस्। १६ दिशा डिजिटल कम्पास, ४५ देवता वास्तु मण्डल र उपचार विधि हेर्नुहोस्।",
        "narration": "घर, पसल वा कार्यालयको वास्तु परीक्षण गर्न वास्तु मेन्युमा क्लिक गर्नुहोस्। यहाँ १६ दिशाको डिजिटल कम्पास, ४५ देवताको वास्तु पुरुष मण्डल, पञ्चतत्व अडिट र बिना तोडफोड गरिने सरल र प्रभावकारी वैदिक वास्तु उपायहरू उपलब्ध छन्।"
    },
    {
        "id": "step11",
        "step_num": "११",
        "url_hash": "patrika",
        "target_xy": (1030, 48),  # 'पत्रिका' menu tab
        "target_label": "पत्रिका तथा प्रिन्ट मेन्यु",
        "hud_badge": "कदम ११/१२ : बृहत् चिना तथा A4 लेटरहेड प्रिन्ट",
        "hud_instruction": "निर्देशिका: 'पत्रिका' मेन्युबाट १० पृष्ठको बृहत् चिना, टिप्पन संस्थाको लेटरहेड र छापसहित A4 साइजमा प्रिन्ट गर्नुहोस्।",
        "narration": "ग्राहकलाई चिना तथा पत्रिका दिन पत्रिका मेन्यु प्रयोग गर्नुहोस्। यहाँबाट १० पृष्ठको बृहत् चिना, ३ पृष्ठको सामान्य चिना, १ पृष्ठको टिप्पन वा नामकरण पत्रिका संस्थाको लोगो, आधिकारिक छाप र वाटरमार्कसहित A4 साइजमा सिधै प्रिन्ट वा PDF डाउनलोड गर्न सकिन्छ।"
    },
    {
        "id": "step12",
        "step_num": "१२",
        "url_hash": "app_download",
        "target_xy": (1130, 48),  # 'डाउनलोड' menu tab
        "target_label": "डाउनलोड तथा होस्टिङ मेन्यु",
        "hud_badge": "कदम १२/१२ : ई-पुस्तकालय, एप्स तथा होस्टिङ",
        "hud_instruction": "निर्देशिका: ५००+ ई-पुस्तकालय, विन्डोज/एन्ड्रोइड एप र cPanel का लागि कम्प्लिट वेब होस्टिङ ZIP डाउनलोड गर्नुहोस्।",
        "narration": "अन्त्यमा, ५०० भन्दा बढी दुर्लभ धार्मिक ग्रन्थहरूको ई-पुस्तकालय, चौबीसै घण्टा उत्तर दिने स्मार्ट एआई ज्योतिषी तथा विन्डोज र एन्ड्रोइड एप डाउनलोड मेन्युमा उपलब्ध छन्। आफ्नै डोमेनमा होस्ट गर्न चाहनुहुन्छ भने कम्प्लिट जिप फाइल डाउनलोड गरी आजै सुरु गर्नुहोस्। धन्यवाद, जय श्री बालानन्द!"
    }
]

def capture_real_screenshot(url_hash, output_png):
    url = f"http://localhost:3000/#{url_hash}"
    cmd = [
        CHROME_EXE,
        "--headless=new",
        "--disable-gpu",
        "--virtual-time-budget=3000",
        "--window-size=1920,1080",
        f"--screenshot={output_png}",
        url
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"Captured real screen for #{url_hash}: {output_png}")

def draw_mouse_cursor(draw, cx, cy):
    # 1. Concentric Golden Pulse Circles (Click Ripple)
    gold_rgb = (255, 215, 0)
    draw.ellipse([cx - 28, cy - 28, cx + 28, cy + 28], outline=gold_rgb, width=3)
    draw.ellipse([cx - 18, cy - 18, cx + 18, cy + 18], outline=(255, 235, 120), width=2)
    draw.ellipse([cx - 7, cy - 7, cx + 7, cy + 7], fill=gold_rgb)

    # 2. Sleek OS Mouse Arrow Pointer with Drop Shadow
    # Shadow
    shadow_offset = 3
    shadow_pts = [
        (cx + shadow_offset, cy + shadow_offset),
        (cx + shadow_offset, cy + 34 + shadow_offset),
        (cx + 8 + shadow_offset, cy + 26 + shadow_offset),
        (cx + 17 + shadow_offset, cy + 42 + shadow_offset),
        (cx + 24 + shadow_offset, cy + 38 + shadow_offset),
        (cx + 15 + shadow_offset, cy + 22 + shadow_offset),
        (cx + 26 + shadow_offset, cy + 22 + shadow_offset)
    ]
    draw.polygon(shadow_pts, fill=(0, 0, 0, 160))

    # Real Arrow Pointer
    cursor_pts = [
        (cx, cy),
        (cx, cy + 34),
        (cx + 8, cy + 26),
        (cx + 17, cy + 42),
        (cx + 24, cy + 38),
        (cx + 15, cy + 22),
        (cx + 26, cy + 22)
    ]
    draw.polygon(cursor_pts, fill=(255, 255, 255), outline=(0, 0, 0))

def overlay_manual_hud(raw_png, ch, final_png):
    img = Image.open(raw_png).convert("RGBA")
    draw = ImageDraw.Draw(img)
    width, height = img.size

    cx, cy = ch["target_xy"]

    # 1. Target Highlight Box around Menu Item
    box_w, box_h = 130, 46
    box_x1 = max(10, cx - 65)
    box_y1 = max(10, cy - 20)
    box_x2 = box_x1 + box_w
    box_y2 = box_y1 + box_h

    # Glowing Frame around clicked menu
    draw.rectangle([box_x1 - 3, box_y1 - 3, box_x2 + 3, box_y2 + 3], outline=(255, 215, 0), width=3)

    # 2. Draw Realistic Mouse Cursor
    draw_mouse_cursor(draw, cx, cy)

    # 3. Floating Tooltip Tag next to Cursor
    tip_text = f"👆 यहाँ क्लिक गर्नुहोस् ({ch['target_label']})"
    tip_x = min(width - 380, cx + 32)
    tip_y = min(height - 180, cy + 35)
    draw.rectangle([tip_x, tip_y, tip_x + 350, tip_y + 44], fill=(122, 28, 28), outline=(255, 215, 0), width=2)
    draw.text((tip_x + 12, tip_y + 8), tip_text, font=FONT_TOOLTIP, fill=(255, 255, 255))

    # 4. Bottom User Manual Instruction HUD Banner
    hud_h = 115
    hud_y = height - hud_h
    # Banner Background (Royal Maroon with Gold Trim)
    draw.rectangle([0, hud_y, width, height], fill=(65, 12, 12))
    draw.line([0, hud_y, width, hud_y], fill=(212, 175, 55), width=3)
    draw.line([0, hud_y + 4, width, hud_y + 4], fill=(255, 215, 0), width=1)

    # Left: Step Badge Pill
    badge_w = 340
    draw.rectangle([25, hud_y + 20, 25 + badge_w, hud_y + 92], fill=(122, 28, 28), outline=(255, 215, 0), width=2)
    draw.text((45, hud_y + 38), ch["hud_badge"], font=FONT_HUD_BADGE, fill=(255, 215, 0))

    # Middle: User Manual Instruction Text
    draw.text((400, hud_y + 40), ch["hud_instruction"], font=FONT_HUD_TEXT, fill=(255, 255, 255))

    # Right: Voiceover Tag
    draw.rectangle([width - 340, hud_y + 28, width - 25, hud_y + 84], fill=(92, 21, 21), outline=(212, 175, 55), width=1)
    draw.text((width - 325, hud_y + 42), "🎙️ आवाज: नेपाली नारी (Voice Guide)", font=FONT_HUD_BADGE, fill=(254, 240, 138))

    img = img.convert("RGB")
    img.save(final_png, quality=95)
    print(f"Generated user manual slide: {final_png}")

async def generate_female_audio(text, output_mp3):
    comm = edge_tts.Communicate(text, FEMALE_VOICE)
    await comm.save(output_mp3)
    print(f"Generated female audio: {output_mp3}")

def make_chapter_clip(slide_png, audio_mp3, output_mp4):
    cmd = [
        FFMPEG_EXE,
        "-loop", "1",
        "-i", slide_png,
        "-i", audio_mp3,
        "-c:v", "libx264",
        "-tune", "stillimage",
        "-c:a", "aac",
        "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-shortest",
        "-y",
        output_mp4
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"Created chapter video clip: {output_mp4}")

def concatenate_clips(clip_list, final_output):
    concat_txt = os.path.join(WORK_DIR, "concat_manual_list.txt")
    with open(concat_txt, "w", encoding="utf-8") as f:
        for c in clip_list:
            clean_c = c.replace("\\", "/")
            f.write(f"file '{clean_c}'\n")

    cmd = [
        FFMPEG_EXE,
        "-f", "concat",
        "-safe", "0",
        "-i", concat_txt,
        "-c", "copy",
        "-y",
        final_output
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"Successfully assembled final video: {final_output}")

async def main():
    os.makedirs(WORK_DIR, exist_ok=True)
    os.makedirs("public/downloads", exist_ok=True)
    os.makedirs("dist/downloads", exist_ok=True)
    os.makedirs("C:/ProjectBackups", exist_ok=True)

    print("=======================================================================")
    print("Balananda Vedic Jyotish Real Frontend User Manual Video Generator")
    print("Voice: ne-NP-HemkalaNeural (Authentic Nepali Female Voice)")
    print("Mode: Real 1080p Frontend Interfaces + Mouse Cursor + Manual HUD Banners")
    print("=======================================================================")

    clip_files = []

    for idx, ch in enumerate(CHAPTERS):
        print(f"\n--- Processing Step {idx+1}/{len(CHAPTERS)}: {ch['hud_badge']} ---")
        raw_png = os.path.join(WORK_DIR, f"{ch['id']}_raw.png")
        hud_png = os.path.join(WORK_DIR, f"{ch['id']}_hud.png")
        audio_mp3 = os.path.join(WORK_DIR, f"{ch['id']}_voice.mp3")
        clip_mp4 = os.path.join(WORK_DIR, f"{ch['id']}_clip.mp4")

        # 1. Capture real screenshot of this route
        capture_real_screenshot(ch["url_hash"], raw_png)

        # 2. Overlay Mouse Cursor & User Manual HUD
        overlay_manual_hud(raw_png, ch, hud_png)

        # 3. Generate Nepali Female Audio
        await generate_female_audio(ch["narration"], audio_mp3)

        # 4. Render MP4 Clip
        make_chapter_clip(hud_png, audio_mp3, clip_mp4)
        clip_files.append(clip_mp4)

    # 5. Concatenate All Clips
    print("\nAssembling full frontend user manual demonstration video...")
    concatenate_clips(clip_files, FINAL_VIDEO_PATH)

    # 6. Copy to public/downloads, dist/downloads, User Videos, and Backups
    import shutil
    for dest, label in [
        (PUBLIC_DOWNLOAD_PATH, "public/downloads"),
        (DIST_DOWNLOAD_PATH, "dist/downloads"),
        (USER_VIDEOS_PATH, "User Videos folder"),
        (BACKUP_PATH, "C:/ProjectBackups"),
        (DOCS_BACKUP_PATH, "Documents Backups")
    ]:
        try:
            shutil.copy(FINAL_VIDEO_PATH, dest)
            print(f"Copied to {label}: {dest}")
        except Exception as e:
            print(f"Copy to {label} failed:", e)

    size_mb = os.path.getsize(FINAL_VIDEO_PATH) / (1024 * 1024)
    print(f"\n=======================================================================")
    print(f"SUCCESS! Real Frontend User Manual Video is Ready:")
    print(f"Video File: {FINAL_VIDEO_PATH} ({size_mb:.2f} MB)")
    print("Voice: Authentic Nepali Female Voice (ne-NP-HemkalaNeural)")
    print("Features: Real Frontend UI + Mouse Cursor Pointer + Step-by-Step HUD")
    print("=======================================================================")

if __name__ == "__main__":
    asyncio.run(main())
