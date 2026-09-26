/**
 * Vedic Deity Schedule & Astrological Lordship per Day of the Week (वार तथा वाराधिप-देवता प्रणाली)
 * 
 * In Vedic astrology and the classical Brihat Samhita / Muhurta Chintamani, 
 * every day of the week (Vara / बार) has:
 * 1. A Planetary Ruler (ग्रहाधिपति / Graha Lord)
 * 2. An Auspicious Presiding Deity (अधिदेवता / Swami Bhagawan)
 * 3. Dedicated Bija Mantra and Vedic Shloka
 * 4. Auspicious Color, Direction & Sadhana Recommendation
 */

export interface DayDeityInfo {
  dayIndex: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  dayNameNepali: string; // e.g. "आइतबार" / "आइतवार"
  dayNameSanskrit: string; // e.g. "रविवासरः / भानुवासरः"
  grahaLord: string; // e.g. "सूर्य देव (Sun)"
  deityName: string; // e.g. "भगवान् श्री सूर्यनारायण"
  deityShortTitle: string; // e.g. "आरोग्यता तथा तेजका स्वामी"
  imagePath: string; // e.g. "/assets/deities/sunday_surya.jpg"
  bijaMantra: string; // e.g. "ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः।"
  vedicGayatriMantra: string; // e.g. "ॐ आदित्याय विद्महे मार्तण्डाय धीमहि तन्नः सूर्यः प्रचोदयात्।"
  vedicShloka: string; // Traditional shloka in Devanagari
  favorableColor: string; // e.g. "रातो, केशरी, सुनौलो"
  favorableDirection: string; // e.g. "पूर्व दिशा"
  worshipBlessings: string; // Blessings of the day
  sankalpaSnippet: string; // Sanskrit sankalpa deity remembrance
}

export const VEDIC_DAY_DEITIES: DayDeityInfo[] = [
  // 0. आइतवार (Sunday) - Surya Narayana
  {
    dayIndex: 0,
    dayNameNepali: 'आइतबार',
    dayNameSanskrit: 'रविवासरः (भानुवासरः)',
    grahaLord: 'सूर्य देव (Sun / भास्कर)',
    deityName: 'भगवान् श्री सूर्यनारायण',
    deityShortTitle: 'प्रत्यक्ष ज्योतिःस्वरूप, आरोग्यता तथा आत्मबलका स्वामी',
    imagePath: '/assets/deities/sunday_surya.jpg',
    bijaMantra: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः। ॐ घृणिः सूर्याय नमः।',
    vedicGayatriMantra: 'ॐ आदित्याय विद्महे मार्तण्डाय धीमहि तन्नः सूर्यः प्रचोदयात्।',
    vedicShloka: 'जपाकुसुमसंकाशं काश्यपेयं महाद्युतिम्।\nतमोऽरिं सर्वपापघ्नं प्रणतोऽस्मि दिवाकरम्॥',
    favorableColor: 'रातो, केशरी, सुनौलो तथा ताम्र',
    favorableDirection: 'पूर्व दिशा (East)',
    worshipBlessings: 'आरोग्य लाभ, कार्यसिद्धि, प्रशासनिक सफलता, पितृकृपा तथा तेजस्वी व्यक्तित्व।',
    sankalpaSnippet: 'श्रीसूर्यनारायणप्रीत्यर्थं प्रत्यक्षभास्करानुग्रहेण...',
  },

  // 1. सोमवार (Monday) - Lord Shiva / Pashupatinath
  {
    dayIndex: 1,
    dayNameNepali: 'सोमबार',
    dayNameSanskrit: 'सोमवासरः (इन्दुवासरः)',
    grahaLord: 'चन्द्र देव (Moon / सोम)',
    deityName: 'भगवान् श्री पशुपतिनाथ (देवाधिदेव महादेव)',
    deityShortTitle: 'कल्याणकारी शङ्कर, मानसिक शान्ति तथा मोक्षका दाता',
    imagePath: '/assets/deities/monday_shiva.jpg',
    bijaMantra: 'ॐ नमः शिवाय। ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः।',
    vedicGayatriMantra: 'ॐ तत्पुरुषाय विद्महे महादेवाय धीमहि तन्नो रुद्रः प्रचोदयात्।',
    vedicShloka: 'दधिशङ्खतुषाराभं क्षीरोदार्णवसम्भवम्।\nनमामि शशिनं सोमं शम्भोर्मुकुटभूषणम्॥',
    favorableColor: 'धवल सेतो, चाँदी तथा हल्का मोती रङ्ग',
    favorableDirection: 'वायव्य दिशा (North-West)',
    worshipBlessings: 'मानसिक शान्ति, एकाग्रता, मातृसुख, पारिवारिक सौहार्द तथा सकल भय निवारण।',
    sankalpaSnippet: 'श्रीपशुपतिनाथशम्भोः प्रीत्यर्थं चन्द्रमसोऽनुकूलतासिद्धये...',
  },

  // 2. मङ्गलबार (Tuesday) - Hanuman Ji & Ganesha
  {
    dayIndex: 2,
    dayNameNepali: 'मङ्गलबार',
    dayNameSanskrit: 'भौमवासरः (कुजवासरः)',
    grahaLord: 'मङ्गल देव (Mars / भौम)',
    deityName: 'संकटमोचन श्री हनुमान् जी तथा विघ्नहर्ता श्री गणेश',
    deityShortTitle: 'बल-बुद्धि-विद्या दाता, सकल संकट तथा बाधा निवारक',
    imagePath: '/assets/deities/tuesday_hanuman.jpg',
    bijaMantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः। ॐ हं हनुमते रुद्रात्मकाय हुं फट्।',
    vedicGayatriMantra: 'ॐ आञ्जनेयाय विद्महे वायुपुत्राय धीमहि तन्नो हनुमत् प्रचोदयात्।',
    vedicShloka: 'मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम्।\nवातात्मजं वानरयूथमुख्यं श्रीरामदूतं शरणं प्रपद्ये॥',
    favorableColor: 'गाढा रातो, सिन्दूरी, मुगा तथा केशरी',
    favorableDirection: 'दक्षिण दिशा (South)',
    worshipBlessings: 'साहस, पराक्रम, ऋणमुक्ति, शत्रु पराजय, भूमि लाभ तथा सकल बाधा नाश।',
    sankalpaSnippet: 'श्रीसंकटमोचनहनुमत्प्रीत्यर्थं विघ्नविनाशकगणेशानुग्रहेण...',
  },

  // 3. बुधवार (Wednesday) - Lord Krishna / Budha Narayana
  {
    dayIndex: 3,
    dayNameNepali: 'बुधवार',
    dayNameSanskrit: 'सौम्यवासरः (बुधवासरः)',
    grahaLord: 'बुध देव (Mercury / सौम्य)',
    deityName: 'भगवान् श्री कृष्ण तथा बुध नारायण',
    deityShortTitle: 'विद्या-बुद्धि, वाणी, व्यापार तथा कला-कौशलका स्वामी',
    imagePath: '/assets/deities/wednesday_krishna.jpg',
    bijaMantra: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः। ॐ क्लीं कृष्णाय गोविन्दाय नमः।',
    vedicGayatriMantra: 'ॐ सौम्यरूपाय विद्महे वाणेशाय धीमहि तन्नो सौम्यः प्रचोदयात्।',
    vedicShloka: 'प्रियङ्गुकलिकाश्यामं रूपेणाप्रतिमं बुधम्।\nसौम्यं सौम्यगुणोपेतं तं बुधं प्रणमाम्यहम्॥',
    favorableColor: 'हरियो, पन्ना रङ्ग तथा हल्का पहेँलो-हरियो',
    favorableDirection: 'उत्तर दिशा (North)',
    worshipBlessings: 'बुद्धि विवेक, वाणीमा प्रभावकारिता, व्यापार-वाणिज्यमा लाभ तथा अध्ययनमा सिद्धि।',
    sankalpaSnippet: 'श्रीकृष्णगोविन्दप्रीत्यर्थं सौम्यग्रहानुकूलतासिद्धये...',
  },

  // 4. बिहीबार (Thursday) - Lord Vishnu / Brihaspati
  {
    dayIndex: 4,
    dayNameNepali: 'बिहीबार',
    dayNameSanskrit: 'गुरुवासरः (बृहस्पतिवासरः)',
    grahaLord: 'देवगुरु बृहस्पति (Jupiter / गुरु)',
    deityName: 'जगत्पति भगवान् श्रीहरि विष्णु तथा देवगुरु',
    deityShortTitle: 'सद्ज्ञान, धर्म, सुसन्तान तथा सर्वमङ्गलका दाता',
    imagePath: '/assets/deities/thursday_vishnu.jpg',
    bijaMantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः। ॐ नमो भगवते वासुदेवाय।',
    vedicGayatriMantra: 'ॐ नारायणाय विद्महे वासुदेवाय धीमहि तन्नो विष्णुः प्रचोदयात्।',
    vedicShloka: 'शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं\nविश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम्।\nलक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यं\nवन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम्॥',
    favorableColor: 'पहेँलो, सुनौलो, पीताम्बर तथा केशर',
    favorableDirection: 'ईशान दिशा (North-East)',
    worshipBlessings: 'विद्या-ज्ञान, सन्तानसुख, गुरु-ब्राह्मण कृपा, आध्यात्मिक उन्नति तथा दीर्घायुष्य।',
    sankalpaSnippet: 'श्रीमन्नारायणप्रीत्यर्थं देवगुरुबृहस्पत्यनुग्रहेण...',
  },

  // 5. शुक्रवार (Friday) - Mata Mahalakshmi / Durga
  {
    dayIndex: 5,
    dayNameNepali: 'शुक्रवार',
    dayNameSanskrit: 'शुक्रवासरः (भृगुवासरः)',
    grahaLord: 'शुक्र देव (Venus / भार्गव)',
    deityName: 'माता श्री महालक्ष्मी तथा जगदम्बा भगवती दुर्गा',
    deityShortTitle: 'धन-धान्य, ऐश्वर्य, सौभाग्य तथा सौन्दर्यकी अधिष्ठात्री',
    imagePath: '/assets/deities/friday_lakshmi.jpg',
    bijaMantra: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः। ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः।',
    vedicGayatriMantra: 'ॐ महालक्ष्म्यै च विद्महे विष्णुपत्न्यै च धीमहि तन्नो लक्ष्मीः प्रचोदयात्।',
    vedicShloka: 'नमस्तेऽस्तु महामाये श्रीपीठे सुरपूजिते।\nशङ्खचक्रगदाहस्ते महालक्ष्मि नमोऽस्तु ते॥',
    favorableColor: 'चहकिलो सेतो, गुलाफी, रेशमी तथा चाँदी रङ्ग',
    favorableDirection: 'आग्नेय दिशा (South-East)',
    worshipBlessings: 'धन-सम्पत्ति, वैवाहिक सुख, भौतिक समृद्धि, कला तथा आन्तरिक आनन्द।',
    sankalpaSnippet: 'श्रीमहालक्ष्मीदुर्गाभगवतीप्रीत्यर्थं भार्गवानुकूलतासिद्धये...',
  },

  // 6. शनिवार (Saturday) - Shani Dev & Hanuman
  {
    dayIndex: 6,
    dayNameNepali: 'शनिवार',
    dayNameSanskrit: 'शनिवासरः (मन्दवासरः)',
    grahaLord: 'शनि देव (Saturn / मन्द / छायापुत्र)',
    deityName: 'कर्मफलदाता भगवान् श्री शनिदेव तथा रुद्र हनुमान्',
    deityShortTitle: 'न्यायप्रिय दण्डनायक, आयु, धैर्य तथा कर्मसाधनाका स्वामी',
    imagePath: '/assets/deities/saturday_shani.jpg',
    bijaMantra: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः। ॐ शं शनैश्चराय नमः।',
    vedicGayatriMantra: 'ॐ काकध्वजाय विद्महे खड्गहस्ताय धीमहि तन्नो मन्दः प्रचोदयात्।',
    vedicShloka: 'नीलाञ्जनसमाभासं रविपुत्रं यमाग्रजम्।\nछायामार्तण्डसम्भूतं तं नमामि शनैश्चरम्॥',
    favorableColor: 'कालो, गाढा नीलो, बैजनी तथा फलाम रङ्ग',
    favorableDirection: 'पश्चिम दिशा (West)',
    worshipBlessings: 'कर्मसिद्धि, साढेसाती तथा ढैय्या शान्ति, दीर्घायु, स्थिर सम्पत्ति तथा धैर्य वृद्धि।',
    sankalpaSnippet: 'श्रीशनैश्चरमहाराजप्रीत्यर्थं कर्मदोषनिवृत्त्यर्थं...',
  }
];

/**
 * Resolves day deity details based on day name or date
 */
export function getDayDeityInfo(dayNameNepali?: string, dateAD?: string): DayDeityInfo {
  if (dayNameNepali) {
    const clean = dayNameNepali.trim().toLowerCase();
    if (clean.includes('आइत') || clean.includes('रवि') || clean.includes('sun')) return VEDIC_DAY_DEITIES[0];
    if (clean.includes('सोम') || clean.includes('इन्दु') || clean.includes('mon')) return VEDIC_DAY_DEITIES[1];
    if (clean.includes('मङ्गल') || clean.includes('मंगल') || clean.includes('भौम') || clean.includes('tue')) return VEDIC_DAY_DEITIES[2];
    if (clean.includes('बुध') || clean.includes('सौम्य') || clean.includes('wed')) return VEDIC_DAY_DEITIES[3];
    if (clean.includes('बिही') || clean.includes('विही') || clean.includes('बृहस्पति') || clean.includes('गुरु') || clean.includes('thu')) return VEDIC_DAY_DEITIES[4];
    if (clean.includes('शुक्र') || clean.includes('भृगु') || clean.includes('fri')) return VEDIC_DAY_DEITIES[5];
    if (clean.includes('शनि') || clean.includes('मन्द') || clean.includes('sat')) return VEDIC_DAY_DEITIES[6];
  }

  if (dateAD) {
    try {
      const d = new Date(dateAD);
      if (!isNaN(d.getTime())) {
        const dayIdx = d.getDay(); // 0 = Sunday
        return VEDIC_DAY_DEITIES[dayIdx];
      }
    } catch {
      // Fallback
    }
  }

  const todayIdx = new Date().getDay();
  return VEDIC_DAY_DEITIES[todayIdx];
}
