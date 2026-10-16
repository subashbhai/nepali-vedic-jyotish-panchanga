#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Balananda Vedic Jyotish & Panchanga Demonstration Video Generator
Creates a Full HD 1080p Video Walkthrough with authentic Nepali Male Voiceover (ne-NP-SagarNeural).
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
OUTPUT_DIR = os.path.abspath("demo_video_work")
FINAL_VIDEO_FILENAME = "balananda-jyotish-demonstration-video.mp4"
FINAL_VIDEO_PATH = os.path.abspath(FINAL_VIDEO_FILENAME)
PUBLIC_DOWNLOAD_PATH = os.path.abspath(os.path.join("public", "downloads", FINAL_VIDEO_FILENAME))
USER_VIDEOS_PATH = os.path.expanduser(os.path.join("~", "Videos", FINAL_VIDEO_FILENAME))
BACKUP_PATH = os.path.abspath(os.path.join("C:\\ProjectBackups", FINAL_VIDEO_FILENAME))

# Nepali male voice in Edge TTS
VOICE_NAME = "ne-NP-SagarNeural"

# Color Palette
BG_COLOR = (92, 21, 21)         # Deep Royal Maroon #5C1515
CARD_BG = (122, 28, 28)         # Crimson #7A1C1C
CARD_BORDER = (212, 175, 55)    # Gold #D4AF37
GOLD_ACCENT = (255, 215, 0)     # Bright Gold #FFD700
TEXT_WHITE = (255, 255, 255)
TEXT_AMBER = (254, 240, 138)
TEXT_MUTED = (229, 231, 235)
BOX_BG = (45, 10, 10, 220)

# Fonts
FONT_BOLD_PATH = "C:/Windows/Fonts/kokilab.ttf"
FONT_REG_PATH = "C:/Windows/Fonts/kokila.ttf"
FONT_MANGAL_PATH = "C:/Windows/Fonts/mangal.ttf"

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

FONT_HEADER = get_font(FONT_BOLD_PATH, 42)
FONT_SUBHEADER = get_font(FONT_REG_PATH, 28)
FONT_TITLE = get_font(FONT_BOLD_PATH, 58)
FONT_SUBTITLE = get_font(FONT_REG_PATH, 32)
FONT_CARD_TITLE = get_font(FONT_BOLD_PATH, 34)
FONT_CARD_BODY = get_font(FONT_REG_PATH, 26)
FONT_BADGE = get_font(FONT_BOLD_PATH, 24)
FONT_SMALL = get_font(FONT_REG_PATH, 22)

# 12 Demonstration Chapters covering A to Z
CHAPTERS = [
    {
        "id": "ch01",
        "chapter_num": "०१",
        "badge": "खण्ड ०१ : सफ्टवेयर परिचय तथा स्वागत",
        "title": "बालानन्द वैदिक ज्योतिष, वास्तु तथा पञ्चाङ्ग प्रणाली",
        "subtitle": "नेपालकै पहिलो आधुनिक, प्रामाणिक एवं सम्पूर्ण एकीकृत वैदिक सफ्टवेयर",
        "narration": "नमस्कार तथा हार्दिक स्वागत छ। यो हो बालानन्द वैदिक ज्योतिष, वास्तु तथा पञ्चाङ्ग प्रणाली। नेपालकै पहिलो अत्याधुनिक, प्रामाणिक एवं शास्त्रीय सिद्धान्तहरूमा आधारित कम्प्युटिङ सफ्टवेयर। यस भिडियोमा हामी यस सफ्टवेयरका सम्पूर्ण मेनु, सब-मेनु, दर्ता, लगइन तथा कुण्डली गणना प्रणालीको विस्तृत ए देखि जेड जानकारी प्रस्तुत गर्दैछौँ।",
        "bullets": [
            ("ॐ प्रामाणिक वैदिक शास्त्र", "पाराशर, जैमिनी, भृगु संहिता तथा फलदीपिकाका मूल सूत्रहरूमा आधारित।"),
            ("💻 बहु-प्लेटफर्म समर्थन", "कम्प्युटर, ल्यापटप, ट्याब्लेट तथा मोबाइलमा इन्टरनेट बिना १००% अफलाइन चल्ने।"),
            ("🌐 विश्वव्यापी सूक्ष्म गणित", "नेपालका ७७ वटै जिल्ला तथा विश्वका १५० भन्दा बढी स्थानहरूको अटो-कोअर्डिनेट्स।")
        ],
        "ui_box": {
            "title": "मुख्य ड्यासबोर्ड (Main Dashboard)",
            "items": [
                "📅 आजको पञ्चाङ्ग र शुभ साइत",
                "☸️ दैनिक लग्न तथा ग्रह गोचर",
                "👤 जातक प्रोफाइल व्यवस्थापन",
                "🖨️ १-क्लिक A4 पत्रिका प्रिन्ट"
            ]
        }
    },
    {
        "id": "ch02",
        "chapter_num": "०२",
        "badge": "खण्ड ०२ : नयाँ प्रयोगकर्ता दर्ता (User Registration)",
        "title": "नयाँ खाता दर्ता तथा व्यक्तिगत प्रोफाइल प्रविष्टि",
        "subtitle": "यजमान, विद्यार्थी तथा पेशागत ज्योतिषीका लागि १ मिनेटमै दर्ता",
        "narration": "सफ्टवेयर प्रयोग गर्न नयाँ खाता दर्ता गर्नुपर्दछ। दर्ता फारममा आफ्नो पूरा नाम, मोबाइल नम्बर, इमेल, ठेगाना र जन्म विवरण प्रविष्टि गर्नुहोस्। यहाँ विक्रम संवत् वा इस्वी संवत् दुवैमा जन्म मिति राख्न सकिन्छ, जसले कुनै त्रुटी बिना स्वतः स्थानीय समय, अयनांश र अक्षांश-देशान्तर गणना गर्दछ।",
        "bullets": [
            ("📝 सहज अनलाइन दर्ता", "नाम, मोबाइल नम्बर, गोत्र, वंश तथा पारिवारिक पृष्ठभूमि प्रविष्टि।"),
            ("📅 वि.सं. तथा ई.सं. तत्काल टगल", "मिति सम्पादन गर्दा स्वतः रूपान्तरण हुने दुई-तर्फी क्यालेन्डर प्रणाली।"),
            ("📍 भौगोलिक स्थान छनोट", "गाउँपालिका, नगरपालिका, जिल्ला तथा देश स्वतः पत्ता लाग्ने जिपिएस इन्जिन।")
        ],
        "ui_box": {
            "title": "जन्म विवरण प्रविष्टि फारम",
            "items": [
                "नाम: रामप्रसाद शर्मा",
                "जन्म मिति: वि.सं. २०४८-०५-१२ (B.S.)",
                "जन्म समय: बिहान ०६:४५:००",
                "स्थान: काठमाडौं (27.71° N, 85.32° E)"
            ]
        }
    },
    {
        "id": "ch03",
        "chapter_num": "०३",
        "badge": "खण्ड ०३ : सुरक्षित लगइन तथा अधिकार (Login & RBAC)",
        "title": "सुरक्षित लगइन, अधिकार तथा २४ घण्टे निःशुल्क ट्रायल",
        "subtitle": "भूमिका अनुसारको सुरक्षित पहुँच (Role-Based Access Control)",
        "narration": "दर्ता सम्पन्न भएपछि आफ्नो मोबाइल नम्बर वा युजरनेम र पासवर्ड राखेर सजिलै लगइन गर्न सकिन्छ। नयाँ ग्राहकका लागि २४ घण्टाको पूर्ण निःशुल्क परीक्षण सुविधा उपलब्ध छ। यजमान, परामर्शदाता ज्योतिषी तथा सुपर एडमिनका लागि छुट्टाछुट्टै सुरक्षित अधिकार र ड्यासबोर्डको व्यवस्था गरिएको छ।",
        "bullets": [
            ("🔐 १-क्लिक सुरक्षित लगइन", "मोबाइल नम्बर, युजरनेम वा बायोमेट्रिक फिंगरप्रिन्ट समर्थन।"),
            ("⏳ २४ घण्टे निःशुल्क ट्रायल", "नयाँ प्रयोगकर्ताका लागि सबै सुविधाहरू २४ घण्टासम्म विनाशुल्क खुला।"),
            ("🛡️ बहु-स्तरीय अधिकार नियन्त्रण", "ग्राहक, ज्योतिषी तथा सुपर एडमिनका लागि छुट्टाछुट्टै नियन्त्रण कक्ष।")
        ],
        "ui_box": {
            "title": "सुरक्षा तथा अधिकार स्विचबोर्ड",
            "items": [
                "रोल: यजमान / ज्योतिषी / एडमिन",
                "लाइसेन्स स्थिति: सक्रिय (Active)",
                "ट्रायल अवधि: २४ घण्टा बाँकी",
                "डाटा सुरक्षा: SHA-256 इन्क्रिप्टेड"
            ]
        }
    },
    {
        "id": "ch04",
        "chapter_num": "०४",
        "badge": "खण्ड ०४ : जन्मकुण्डली तथा भाव चक्र (Kundali Calculation)",
        "title": "जन्मकुण्डली, नवमांश (D9) तथा वर्ग कुण्डलीहरू",
        "subtitle": "०.१% पनि त्रुटिरहित उच्च परिशुद्ध वैदिक खगोल गणित",
        "narration": "जन्मकुण्डली मेनु भित्र प्रवेश गर्दा जातकको लग्न कुण्डली, नवमांश चक्र, भावचलित, चन्द्र कुण्डली तथा डी-वान देखि डी-सिक्सटी सम्मका १६ वर्ग कुण्डलीहरू तत्काल प्रदर्शित हुन्छन्। यसमा ९ ग्रहहरूको स्पष्ट राशि, अंश, कला, विकला, नक्षत्र, पाद, उच्च, नीच र वक्री अवस्था स्पष्ट देख्न सकिन्छ।",
        "bullets": [
            ("☸️ परम्परागत चक्र शैली", "उत्तर भारतीय, दक्षिण भारतीय र पूर्वीय चक्र ढाँचामा १-क्लिक स्विच।"),
            ("🪐 ९ ग्रह र १२ भावको विश्लेषण", "अंश, नक्षत्र, पाद, कारकांश तथा षड्बल बलको स्वचालित गणना।"),
            ("📐 उच्च-परिशुद्ध लाहिरी अयनांश", "नासा र भारतीय खगोल विज्ञानसँग प्रमाणित उच्च शुद्धता।")
        ],
        "ui_box": {
            "title": "ग्रह स्थिति (Planetary Degrees)",
            "items": [
                "लग्न: सिंह (१४° २३' १०\")",
                "सूर्य: मेष उच्च (१०° १५' ००\")",
                "चन्द्र: वृष उच्च (०३° ४५' २०\")",
                "गुरु: कर्कट उच्च (०५° १२' ३०\")"
            ]
        }
    },
    {
        "id": "ch05",
        "chapter_num": "०५",
        "badge": "खण्ड ०५ : दशा चक्र तथा ग्रह गोचर (Dasha & Transits)",
        "title": "१२० वर्षे विंशोत्तरी एवं योगिनी दशा तथा गोचर",
        "subtitle": "महादशा, अन्तर्दशा, प्रत्यन्तर्दशा र साढेसाती समय चक्र",
        "narration": "दशा मेनुमा १२० वर्षको पूर्ण विंशोत्तरी महादशा, अन्तर्दशा, प्रत्यन्तर र सूक्ष्मदशाको गणना उपलब्ध छ। साथै अष्टकवर्ग बिन्दु, वर्तमान ग्रह गोचर, अढैया, साढेसाती तथा ग्रहशान्तिका उपायहरू स्पष्ट रूपमा देखाइन्छ, जसले जातकको समय चक्रको सटिक मार्गनिर्देशन गर्दछ।",
        "bullets": [
            ("⏳ ५ तहसम्मको विंशोत्तरी दशा", "महादशा, अन्तर्दशा, प्रत्यन्तर, सूक्ष्म र प्राणदशाको मिति तालिका।"),
            ("🔄 वास्तविक समय ग्रह गोचर", "अहिले आकाशमा घुमिरहेका ग्रहहरू जातकको कुण्डलीमा कस्तो प्रभाव पार्दैछन्।"),
            ("🪐 शनिको साढेसाती तथा अष्टकवर्ग", "कहिले सुरु, कहिले समाप्त र शुभ-अशुभ अष्टकवर्ग बिन्दु विश्लेषण।")
        ],
        "ui_box": {
            "title": "दशा तथा गोचर समयतालिका",
            "items": [
                "वर्तमान महादशा: बृहस्पति (१६ वर्ष)",
                "अन्तर्दशा: शनि (२ वर्ष ६ महिना)",
                "साढेसाती: प्रथम चरण (मध्यम)",
                "सर्वाष्टकवर्ग: ३३७ कुल शुभ बिन्दु"
            ]
        }
    },
    {
        "id": "ch06",
        "chapter_num": "०६",
        "badge": "खण्ड ०६ : नेपाली पञ्चाङ्ग तथा क्यालेन्डर (Panchanga & Calendar)",
        "title": "आधिकारिक नेपाली पञ्चाङ्ग, पात्रो तथा दैनिक साइत",
        "subtitle": "तिथि, वार, नक्षत्र, योग, करण र सूर्योदय/सूर्यास्त समय",
        "narration": "पञ्चाङ्ग खण्डमा नेपाल पञ्चाङ्ग निर्णायक विकास समितिको मानक अनुसार दैनिक तिथि, नक्षत्र, योग, करण, सूर्योदय, सूर्यास्त तथा दिनमान उपलब्ध छ। यसका साथै विक्रम संवत् २०० वर्षको डिजिटल क्यालेन्डर, दैनिक शुभ होरा, राहुकाल र विवाह, व्रतबन्ध तथा गृहप्रवेशका साइतहरू समेटिएका छन्।",
        "bullets": [
            ("🌞 पञ्चाङ्गका ५ अङ्ग", "सूर्य सिद्धान्त र दृक गणित अनुसार दैनिक तिथि, नक्षत्र, योग, करण।"),
            ("📅 वि.सं. २०० वर्षको डिजिटल पात्रो", "विक्रम संवत् २००० देखि २१०० सम्मका सम्पूर्ण चाडपर्व र एकादशी।"),
            ("⏰ दैनिक साइत तथा मुहूर्त", "चौघडिया, शुभ होरा, राहुकाल, अभिजित् र विवाह-व्रतबन्धका शुद्ध साइत।")
        ],
        "ui_box": {
            "title": "आजको पञ्चाङ्ग (दैनिक विवरण)",
            "items": [
                "तिथि: शुक्ल पक्ष पञ्चमी",
                "नक्षत्र: रोहिणी (अमृत योग)",
                "सूर्योदय: ०६:०५ | सूर्यास्त: १८:१५",
                "अभिजित् मुहूर्त: ११:४५ देखि १२:३५"
            ]
        }
    },
    {
        "id": "ch07",
        "chapter_num": "०७",
        "badge": "खण्ड ०७ : ११६ शास्त्रीय प्रश्न ज्योतिष (Horary Astrology)",
        "title": "शास्त्रीय प्रश्न संग्रह तथा कुण्डली फलादेश",
        "subtitle": "११६ प्रश्नहरू, मूल संस्कृत श्लोक, व्याख्या र कार्यसिद्धि दर",
        "narration": "प्रश्न ज्योतिष खण्डमा जातकले दैनिक जीवनमा सोध्ने नोकरी, व्यापार, धन, विवाह, स्वास्थ्य, विदेश यात्रा र मुद्दा-मामिला सम्बन्धी ११६ वटा शास्त्रीय प्रश्नहरू समावेश छन्। तात्कालिक प्रश्न लग्न र कार्येशको स्थिति अनुसार कार्यसिद्धि प्रतिशत, बृहत् पराशरका मूल संस्कृत श्लोक, नेपाली व्याख्या र वैदिक उपाय प्राप्त हुन्छन्।",
        "bullets": [
            ("❓ १२ जीवन क्षेत्रका ११६ प्रश्नहरू", "जागिर, विवाह, व्यापार, सन्तान, परीक्षा, मुद्दा र हराएको वस्तु।"),
            ("📜 मूल संस्कृत श्लोक र प्रमाण", "बृहत् पराशर, प्रश्न मार्ग, षट्पञ्चाशिका र ताजिक नीलकण्ठीका उद्धरण।"),
            ("📊 कार्यसिद्धि सम्भावना प्रतिशत (%)", "लग्नेश र कार्येशको इत्थशाल, दृष्टि सम्बन्ध र चन्द्रबल अनुसारको निर्णय।")
        ],
        "ui_box": {
            "title": "प्रश्न कुण्डली निर्णय",
            "items": [
                "प्रश्न: के मलाई नयाँ नोकरी मिल्ला?",
                "कार्यसिद्धि सम्भावना: ८५% (शीघ्र योग)",
                "लग्नेश-कार्येश: समसप्तक शुभ दृष्टि",
                "शास्त्र: ताजिक नीलकण्ठी श्लोक १२"
            ]
        }
    },
    {
        "id": "ch08",
        "chapter_num": "०८",
        "badge": "खण्ड ०८ : अंक, केपी तथा नेमा ज्योतिष (Special Systems)",
        "title": "अंक ज्योतिष, केपी पद्धति र हिमाली नेमा ज्योतिष",
        "subtitle": "बहुआयामिक ज्योतिषीय विधाको एकीकृत वैज्ञानिक प्रणाली",
        "narration": "यस सफ्टवेयरमा वैदिक ज्योतिषका अलावा नामांक, मूलांक र भाग्यांक गणना गर्ने अंक ज्योतिष, कृष्णमूर्ति पद्धतिको सब-लर्ड र कस्पल कुण्डली तथा हिमाली परम्पराको प्राचीन नेमा ज्योतिष पनि उपलब्ध छ। यसले अनुसन्धानकर्ता तथा ज्योतिषीहरूलाई चौतर्फी तुलनात्मक विश्लेषण गर्ने सुविधा दिन्छ।",
        "bullets": [
            ("🔢 अंक ज्योतिष (Numerology)", "पाइथागोरस तथा काल्डियन पद्धतिबाट नाम र जन्म मितिको भाग्य अंक।"),
            ("🧭 केपी प्रणाली (KP System)", "२४९ सब-लर्ड तालिका, कस्पल भाव चक्र र सूक्ष्म फलकथन।"),
            ("🏔️ नेमा ज्योतिष (Tibetan)", "प्राचीन हिमाली पात्रो, ९ मेवा, ८ पार्कखा र तत्त्व सन्तुलन।")
        ],
        "ui_box": {
            "title": "अंक तथा केपी सारांश",
            "items": [
                "मूलांक: ७ (केतु) | भाग्यांक: ३ (बृहस्पति)",
                "शुभ बार: बिहीबार | शुभ रंग: पहेँलो",
                "केपी लग्न सब-लर्ड: गुरु-शुक्र",
                "नेमा मेवा: १ सेतो (White Element)"
            ]
        }
    },
    {
        "id": "ch09",
        "chapter_num": "०९",
        "badge": "खण्ड ०९ : विवाह मेलापक तथा कुण्डली मिलान (Match Making)",
        "title": "विवाह मेलापक तथा ३६ गुण कुण्डली मिलान",
        "subtitle": "अष्टकूट गुण, नाडी दोष, भकूट तथा मङ्गल दोष परिहार",
        "narration": "विवाह मेनुमा वर र वधुको जन्म विवरण राखेर ३६ गुण अष्टकूट मिलान गर्न सकिन्छ। यसमा वर्ण, वश्य, तारा, योनि, ग्रहमैत्री, गण, भकूट र नाडीको सूक्ष्म अंक गणनाका साथै मङ्गल दोष छ कि छैन र दोष भए परिहार के छ भन्ने शास्त्रीय प्रमाणसहितको प्रतिवेदन तयार हुन्छ।",
        "bullets": [
            ("💍 ३६ गुण अष्टकूट मिलान", "नाडी (८), भकूट (७), गण (६), ग्रहमैत्री (५) आदि गुणहरूको सूक्ष्म अंक।"),
            ("⚠️ नाडी, भकूट र मङ्गल दोष", "दोषको स्थिति, तीव्रता तथा शास्त्रोक्त परिहार नियमको विस्तृत परीक्षण।"),
            ("📋 वैवाहिक अनुकूलता प्रतिवेदन", "दाम्पत्य सुख, सन्तान सुख, दीर्घायु तथा आर्थिक उन्नतिको समग्र मूल्याङ्कन।")
        ],
        "ui_box": {
            "title": "मेलापक गुण विश्लेषण",
            "items": [
                "कुल गुण: २८ / ३६ (उत्कृष्ट मिलान)",
                "नाडी दोष: छैन (शुभ)",
                "मङ्गल दोष: परिहार भएको (सुरक्षित)",
                "वैवाहिक सम्भावना: शुभ विवाह योग्य"
            ]
        }
    },
    {
        "id": "ch10",
        "chapter_num": "१०",
        "badge": "खण्ड १० : वैदिक वास्तु शास्त्र तथा कम्पास (Vastu Shastra)",
        "title": "वैदिक वास्तु शास्त्र, १६-दिशा कम्पास तथा वास्तु मण्डल",
        "subtitle": "आवासीय, व्यापारिक तथा औद्योगिक वास्तु दोष निवारण",
        "narration": "वास्तु मेनुमा १६ दिशाको डिजिटल कम्पास, ४५ देवताको वास्तु पुरुष मण्डल, पञ्चतत्व सन्तुलन तथा घरको नक्सा परीक्षण गर्न सकिन्छ। मुख्य ढोका, भान्सा, पूजा कोठा र शयन कक्षको सहि दिशा पत्ता लगाई बिना तोडफोड गरिने सरल र प्रभावकारी वास्तु उपायहरू यसमा उपलब्ध छन्।",
        "bullets": [
            ("🧭 १६ दिशा डिजिटल कम्पास", "ईशान, आग्नेय, नैऋत्य र वायव्य कोणहरूको सूक्ष्म डिग्रि मापन।"),
            ("📐 ४५ देवता वास्तु पुरुष मण्डल", "घर वा व्यापारिक भवनको ऊर्जा सन्तुलन र पञ्चतत्व अडिट।"),
            ("🌿 बिना तोडफोड वास्तु उपचार", "रंग, धातु, पिरामिड, यन्त्र तथा वैदिक विधिबाट तत्काल दोष निवारण।")
        ],
        "ui_box": {
            "title": "वास्तु दिशा अडिट",
            "items": [
                "मुख्य ढोका: ईशान (अत्यन्त शुभ)",
                "भान्सा कोठा: आग्नेय (अग्नि तत्व शुद्ध)",
                "पूजा कोठा: पूर्व-उत्तर (देवता स्थान)",
                "वास्तु स्कोर: ९२% सकारात्मक ऊर्जा"
            ]
        }
    },
    {
        "id": "ch11",
        "chapter_num": "११",
        "badge": "खण्ड ११ : बृहत् चिना तथा A4 लेटरहेड प्रिन्ट (Print & Reports)",
        "title": "बृहत् चिना, टिप्पन तथा आधिकारिक A4 लेटरहेड प्रिन्ट",
        "subtitle": "संस्थागत छाप, वाटरमार्क तथा डिजिटल हस्ताक्षरसहितको पत्रिका",
        "narration": "प्रिन्ट मेनुबाट १० पृष्ठको बृहत् चिना, ३ पृष्ठको सामान्य चिना, १ पृष्ठको टिप्पन, नामकरण, विवाह तथा वास्तु रिपोर्ट उच्च गुणस्तरको A4 लेटरहेड ढाँचामा तुरुन्तै प्रिन्ट वा PDF डाउनलोड गर्न सकिन्छ। यसमा संस्थाको लोगो, आधिकारिक छाप र डिजिटल हस्ताक्षर समेत समावेश हुन्छ।",
        "bullets": [
            ("🖨️ १ देखि १० पृष्ठसम्मको पूर्ण चिना", "बृहत् चिना, टिप्पन, विवाह पत्रिका, नामकरण तथा वास्तु रिपोर्ट।"),
            ("📄 व्यावसायिक A4 लेटरहेड", "ज्योतिष कार्यालयको लोगो, नाम, ठेगाना, फोन र वाटरमार्क सहित।"),
            ("📥 उच्च रिजोलुसन PDF तथा प्रिन्ट", "रंगीन वा श्यामश्वेत (B&W) ढाँचामा तत्काल प्रिन्टिङ सुविधा।")
        ],
        "ui_box": {
            "title": "प्रिन्टेबल डकुमेन्ट सूची",
            "items": [
                "१. बृहत् चिना (१० पृष्ठ पूर्ण)",
                "२. जन्मपत्रिका / टिप्पन (१ पृष्ठ)",
                "३. विवाह मेलापक पत्रिका (३ पृष्ठ)",
                "४. वास्तु अडिट रिपोर्ट (५ पृष्ठ)"
            ]
        }
    },
    {
        "id": "ch12",
        "chapter_num": "१२",
        "badge": "खण्ड १२ : ई-पुस्तकालय, AI तथा बहु-प्लेटफर्म (E-Library & Apps)",
        "title": "५००+ वैदिक ई-पुस्तकालय, AI ज्योतिषी र बहु-प्लेटफर्म",
        "subtitle": "विन्डोज, एन्ड्रोइड, म्याक तथा आफ्नै डोमेनमा होस्टिङको सुविधा",
        "narration": "अन्त्यमा, ५०० भन्दा बढी प्राचीन धार्मिक ग्रन्थहरूको ई-पुस्तकालय, चौबीसै घण्टा उत्तर दिने स्मार्ट एआई ज्योतिषी तथा विन्डोज र एन्ड्रोइड एप समेत उपलब्ध छन्। आफ्नो डोमेनमा होस्ट गर्न चाहनुहुन्छ भने कम्प्लिट जिप फाइल डाउनलोड गरी आजै सुरु गर्नुहोस्। धन्यवाद, जय श्री बालानन्द!",
        "bullets": [
            ("📚 ५००+ वैदिक ई-पुस्तकालय", "वेद, उपनिषद्, पुराण, ज्योतिष तथा वास्तुका दुर्लभ PDF ग्रन्थहरू।"),
            ("🤖 चौबीसै घण्टा स्मार्ट एआई ज्योतिषी", "कुण्डलीका आधारमा तत्काल प्रश्न-उत्तर र परामर्श सेवा।"),
            ("🌐 आफ्नै डोमेनमा होस्टिङ सुविधा", "cPanel को public_html मा सिधै अपलोड गरी अनजिप गर्दा चल्ने जिप प्याकेज।")
        ],
        "ui_box": {
            "title": "डाउनलोड तथा प्लेटफर्म",
            "items": [
                "💻 Windows Setup (.exe)",
                "📱 Android APK (.apk)",
                "🌐 Web Hosting Complete (.zip)",
                "🍎 macOS तथा iOS PWA"
            ]
        }
    }
]

def create_slide_image(ch, output_png):
    width, height = 1920, 1080
    img = Image.new("RGB", (width, height), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # 1. Subtle Background Gradients & Frames
    # Draw ornate border
    border_margin = 35
    draw.rectangle([border_margin, border_margin, width - border_margin, height - border_margin], outline=CARD_BORDER, width=3)
    draw.rectangle([border_margin + 6, border_margin + 6, width - border_margin - 6, height - border_margin - 6], outline=(150, 100, 30), width=1)

    # Corner Decorative Squares
    corner_size = 20
    for cx, cy in [
        (border_margin, border_margin),
        (width - border_margin - corner_size, border_margin),
        (border_margin, height - border_margin - corner_size),
        (width - border_margin - corner_size, height - border_margin - corner_size)
    ]:
        draw.rectangle([cx, cy, cx + corner_size, cy + corner_size], fill=GOLD_ACCENT, outline=CARD_BORDER)

    # 2. Header Bar
    # Header Banner Background
    draw.rectangle([border_margin + 7, border_margin + 7, width - border_margin - 7, 130], fill=(70, 15, 15))
    draw.line([border_margin + 7, 130, width - border_margin - 7, 130], fill=CARD_BORDER, width=2)

    # App Logo / Icon
    logo_path = os.path.abspath("public/logo.png")
    if os.path.exists(logo_path):
        try:
            logo_img = Image.open(logo_path).convert("RGBA")
            logo_img = logo_img.resize((75, 75), Image.Resampling.LANCZOS)
            img.paste(logo_img, (border_margin + 25, 45), logo_img)
        except Exception as e:
            print("Logo load error:", e)

    # Sacred Text & App Title
    draw.text((border_margin + 120, 45), "॥ ॐ श्री गणेशाय नमः ॥  बालानन्द वैदिक ज्योतिष, वास्तु तथा पञ्चाङ्ग सेवा", font=FONT_HEADER, fill=GOLD_ACCENT)
    draw.text((border_margin + 120, 90), "Balananda Vedic Astrology & Panchanga High-Precision Computing System", font=FONT_SUBHEADER, fill=TEXT_AMBER)

    # Chapter Badge on Top Right
    badge_text = ch["badge"]
    draw.rectangle([width - border_margin - 460, 52, width - border_margin - 25, 105], fill=(122, 28, 28), outline=GOLD_ACCENT, width=2)
    draw.text((width - border_margin - 445, 62), badge_text, font=FONT_BADGE, fill=TEXT_WHITE)

    # 3. Main Title & Subtitle
    draw.text((border_margin + 35, 155), ch["title"], font=FONT_TITLE, fill=TEXT_WHITE)
    draw.text((border_margin + 35, 225), ch["subtitle"], font=FONT_SUBTITLE, fill=GOLD_ACCENT)

    # 4. Two-Column Layout (Left: Bullets, Right: UI Box)
    col_width = 1050
    start_y = 295

    for i, (b_title, b_desc) in enumerate(ch["bullets"]):
        card_y = start_y + (i * 210)
        # Bullet Card Box
        draw.rectangle([border_margin + 35, card_y, border_margin + 35 + col_width, card_y + 185], fill=CARD_BG, outline=CARD_BORDER, width=2)
        # Accent gold bar on left of card
        draw.rectangle([border_margin + 35, card_y, border_margin + 45, card_y + 185], fill=GOLD_ACCENT)
        # Bullet Title
        draw.text((border_margin + 60, card_y + 18), b_title, font=FONT_CARD_TITLE, fill=GOLD_ACCENT)
        # Bullet Description (Wrap text)
        words = b_desc.split(" ")
        line1, line2 = "", ""
        for w in words:
            if len(line1) + len(w) < 55:
                line1 += w + " "
            else:
                line2 += w + " "
        draw.text((border_margin + 60, card_y + 70), line1.strip(), font=FONT_CARD_BODY, fill=TEXT_WHITE)
        if line2:
            draw.text((border_margin + 60, card_y + 115), line2.strip(), font=FONT_CARD_BODY, fill=TEXT_MUTED)

    # Right Column: Interactive UI Showcase Box
    right_x = border_margin + 35 + col_width + 40
    right_w = width - border_margin - 35 - right_x
    right_h = 595
    right_y = start_y

    draw.rectangle([right_x, right_y, right_x + right_w, right_y + right_h], fill=(40, 10, 10), outline=GOLD_ACCENT, width=3)
    # Header bar for right box
    draw.rectangle([right_x, right_y, right_x + right_w, right_y + 65], fill=(122, 28, 28))
    draw.line([right_x, right_y + 65, right_x + right_w, right_y + 65], fill=CARD_BORDER, width=2)
    draw.text((right_x + 25, right_y + 15), ch["ui_box"]["title"], font=FONT_CARD_TITLE, fill=GOLD_ACCENT)

    # Items in Right Box
    box_items = ch["ui_box"]["items"]
    for idx, itm in enumerate(box_items):
        item_y = right_y + 90 + (idx * 115)
        draw.rectangle([right_x + 20, item_y, right_x + right_w - 20, item_y + 95], fill=(70, 15, 15), outline=(180, 130, 40), width=1)
        draw.text((right_x + 40, item_y + 25), itm, font=FONT_CARD_BODY, fill=TEXT_WHITE)

    # 5. Bottom Navigation & Status Bar
    bar_y = height - border_margin - 80
    draw.rectangle([border_margin + 7, bar_y, width - border_margin - 7, height - border_margin - 7], fill=(50, 10, 10))
    draw.line([border_margin + 7, bar_y, width - border_margin - 7, bar_y], fill=CARD_BORDER, width=2)

    # Progress timeline
    ch_idx = int(ch["chapter_num"])
    draw.text((border_margin + 25, bar_y + 22), f"अध्याय {ch['chapter_num']}/१२ : {ch['title'][:35]}...", font=FONT_BADGE, fill=GOLD_ACCENT)

    # System Status Badges
    badges = "[१००% अफलाइन]  [०.१% परिशुद्ध गणित]  [वि.सं. तथा ई.सं.]  [Windows, Android, Web]"
    draw.text((width - border_margin - 680, bar_y + 24), badges, font=FONT_SMALL, fill=TEXT_AMBER)

    img.save(output_png, quality=95)
    print(f"Generated slide: {output_png}")

async def generate_chapter_audio(ch, output_mp3):
    text = ch["narration"]
    comm = edge_tts.Communicate(text, VOICE_NAME)
    await comm.save(output_mp3)
    print(f"Generated audio: {output_mp3}")

def get_audio_duration(mp3_path):
    cmd = [
        FFMPEG_EXE, "-i", mp3_path
    ]
    p = subprocess.Popen(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE)
    _, stderr = p.communicate()
    output = stderr.decode('utf-8', errors='ignore')
    import re
    match = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.\d+)", output)
    if match:
        hours = float(match.group(1))
        minutes = float(match.group(2))
        seconds = float(match.group(3))
        return hours * 3600 + minutes * 60 + seconds
    return 10.0  # default fallback

def make_chapter_video(slide_png, audio_mp3, output_mp4):
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
    print(f"Created chapter video: {output_mp4}")

def concatenate_videos(video_list, final_output):
    concat_txt = os.path.join(OUTPUT_DIR, "concat_list.txt")
    with open(concat_txt, "w", encoding="utf-8") as f:
        for v in video_list:
            # Escape path for ffmpeg concat
            clean_v = v.replace("\\", "/")
            f.write(f"file '{clean_v}'\n")

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
    print(f"Concatenated final demonstration video: {final_output}")

async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs("public/downloads", exist_ok=True)
    os.makedirs("C:/ProjectBackups", exist_ok=True)

    print("=================================================================")
    print("Balananda Vedic Jyotish & Panchanga Video Demonstration Generator")
    print("Voice: ne-NP-SagarNeural (Nepali Male)")
    print("=================================================================")

    video_files = []

    for idx, ch in enumerate(CHAPTERS):
        print(f"\n--- Processing Chapter {idx+1}/{len(CHAPTERS)}: {ch['badge']} ---")
        slide_png = os.path.join(OUTPUT_DIR, f"{ch['id']}_slide.png")
        audio_mp3 = os.path.join(OUTPUT_DIR, f"{ch['id']}_voice.mp3")
        chapter_mp4 = os.path.join(OUTPUT_DIR, f"{ch['id']}_clip.mp4")

        # 1. Create 1080p slide
        create_slide_image(ch, slide_png)

        # 2. Generate Nepali Male Audio
        await generate_chapter_audio(ch, audio_mp3)

        # 3. Render MP4 Clip
        make_chapter_video(slide_png, audio_mp3, chapter_mp4)
        video_files.append(chapter_mp4)

    # 4. Concatenate All Clips
    print("\nAssembling full demonstration video...")
    concatenate_videos(video_files, FINAL_VIDEO_PATH)

    # 5. Copy to Public Downloads, User Videos, and Backup
    import shutil
    try:
        shutil.copy(FINAL_VIDEO_PATH, PUBLIC_DOWNLOAD_PATH)
        print(f"Copied to public downloads: {PUBLIC_DOWNLOAD_PATH}")
    except Exception as e:
        print("Copy to public/downloads failed:", e)

    try:
        shutil.copy(FINAL_VIDEO_PATH, USER_VIDEOS_PATH)
        print(f"Copied to User Videos folder: {USER_VIDEOS_PATH}")
    except Exception as e:
        print("Copy to User Videos failed:", e)

    try:
        shutil.copy(FINAL_VIDEO_PATH, BACKUP_PATH)
        print(f"Copied to Backup folder: {BACKUP_PATH}")
    except Exception as e:
        print("Copy to Backup failed:", e)

    # Print final summary
    size_mb = os.path.getsize(FINAL_VIDEO_PATH) / (1024 * 1024)
    print(f"\nSUCCESS! Demonstration Video is ready:")
    print(f"File: {FINAL_VIDEO_PATH} ({size_mb:.2f} MB)")

if __name__ == "__main__":
    asyncio.run(main())
