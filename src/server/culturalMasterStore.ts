/**
 * Master Cultural Data Store (Gotra & Jaat/Barna)
 * Balananda Vaidik Sewa
 * 
 * Provides an authoritative, centralized master list of cultural and Vedic
 * gotras and communities with searchable access and admin maintenance.
 */

import fs from 'fs';
import path from 'path';

export interface CulturalMasterItem {
  id: string;
  category: 'gotra' | 'jaat_barna';
  nameNepali: string;
  nameEnglish?: string;
  isActive: boolean;
  sortOrder: number;
  createdAtISO: string;
}

export const INITIAL_GOTRAS: Array<{ nameNepali: string; nameEnglish?: string }> = [
  { nameNepali: 'कश्यप (Kashyapa)', nameEnglish: 'Kashyapa' },
  { nameNepali: 'भारद्वाज (Bharadwaja)', nameEnglish: 'Bharadwaja' },
  { nameNepali: 'अङ्गिरा / अंगिरस (Angirasa)', nameEnglish: 'Angirasa' },
  { nameNepali: 'अत्रि (Atri)', nameEnglish: 'Atri' },
  { nameNepali: 'गौतम (Gautama)', nameEnglish: 'Gautama' },
  { nameNepali: 'वशिष्ठ (Vashistha)', nameEnglish: 'Vashistha' },
  { nameNepali: 'विश्वामित्र (Vishwamitra)', nameEnglish: 'Vishwamitra' },
  { nameNepali: 'जमदग्नि (Jamadagni)', nameEnglish: 'Jamadagni' },
  { nameNepali: 'कौशिक (Kaushika)', nameEnglish: 'Kaushika' },
  { nameNepali: 'पराशर (Parashara)', nameEnglish: 'Parashara' },
  { nameNepali: 'उपमन्यु (Upamanyu)', nameEnglish: 'Upamanyu' },
  { nameNepali: 'धनञ्जय (Dhananjaya)', nameEnglish: 'Dhananjaya' },
  { nameNepali: 'माण्डव्य (Mandavya)', nameEnglish: 'Mandavya' },
  { nameNepali: 'गर्ग (Garga)', nameEnglish: 'Garga' },
  { nameNepali: 'शाण्डिल्य (Shandilya)', nameEnglish: 'Shandilya' },
  { nameNepali: 'मुद्गल (Mudgala)', nameEnglish: 'Mudgala' },
  { nameNepali: 'वत्स (Vatsa)', nameEnglish: 'Vatsa' },
  { nameNepali: 'कुत्स (Kutsa)', nameEnglish: 'Kutsa' },
  { nameNepali: 'कपिल (Kapila)', nameEnglish: 'Kapila' },
  { nameNepali: 'अगस्ति (Agasti)', nameEnglish: 'Agasti' },
  { nameNepali: 'भृगु (Bhrigu)', nameEnglish: 'Bhrigu' },
  { nameNepali: 'शौनक (Shaunaka)', nameEnglish: 'Shaunaka' },
  { nameNepali: 'कौण्डिन्य (Kaundinya)', nameEnglish: 'Kaundinya' },
  { nameNepali: 'हरित (Harita)', nameEnglish: 'Harita' },
  { nameNepali: 'स्वगोत्र / आफ्नै (Swagotra)', nameEnglish: 'Swagotra' },
  { nameNepali: 'अन्य / सूचीमा छैन (Other)', nameEnglish: 'Other' }
];

export const INITIAL_JAAT_BARNA: Array<{ nameNepali: string; nameEnglish?: string }> = [
  { nameNepali: 'ब्राह्मण - उपाध्याय (Brahmin Upadhyaya)', nameEnglish: 'Brahmin Upadhyaya' },
  { nameNepali: 'ब्राह्मण - जैसी (Brahmin Jaisi)', nameEnglish: 'Brahmin Jaisi' },
  { nameNepali: 'क्षेत्री (Chhetri)', nameEnglish: 'Chhetri' },
  { nameNepali: 'ठकुरी (Thakuri)', nameEnglish: 'Thakuri' },
  { nameNepali: 'सन्न्यासी / दशनामी (Sannyasi / Giri / Puri / Bharati)', nameEnglish: 'Sannyasi' },
  { nameNepali: 'नेवार - विभिन्न समुदाय (Newar Community)', nameEnglish: 'Newar' },
  { nameNepali: 'गुरुङ (Gurung)', nameEnglish: 'Gurung' },
  { nameNepali: 'मगर (Magar)', nameEnglish: 'Magar' },
  { nameNepali: 'राई (Rai)', nameEnglish: 'Rai' },
  { nameNepali: 'लिम्बु (Limbu)', nameEnglish: 'Limbu' },
  { nameNepali: 'तामाङ (Tamang)', nameEnglish: 'Tamang' },
  { nameNepali: 'शेर्पा (Sherpa)', nameEnglish: 'Sherpa' },
  { nameNepali: 'थारु (Tharu)', nameEnglish: 'Tharu' },
  { nameNepali: 'यादव (Yadav)', nameEnglish: 'Yadav' },
  { nameNepali: 'मधेसी विभिन्न समुदाय (Madhesi Community)', nameEnglish: 'Madhesi' },
  { nameNepali: 'दलित / शिल्पी समुदाय (Shilpi Community)', nameEnglish: 'Shilpi' },
  { nameNepali: 'अन्य / सूचीमा छैन (Other)', nameEnglish: 'Other' }
];

const LOCAL_DATA_FILE = path.join(process.cwd(), 'data', 'master_cultural_data.json');

export class CulturalMasterStore {
  private static instance: CulturalMasterStore;
  private items: CulturalMasterItem[] = [];

  private constructor() {
    this.loadFromDisk();
  }

  public static getInstance(): CulturalMasterStore {
    if (!CulturalMasterStore.instance) {
      CulturalMasterStore.instance = new CulturalMasterStore();
    }
    return CulturalMasterStore.instance;
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(LOCAL_DATA_FILE)) {
        this.items = JSON.parse(fs.readFileSync(LOCAL_DATA_FILE, 'utf-8'));
      } else {
        this.items = this.generateInitialSeed();
        this.persist();
      }
    } catch {
      this.items = this.generateInitialSeed();
    }
  }

  private generateInitialSeed(): CulturalMasterItem[] {
    const list: CulturalMasterItem[] = [];
    let order = 1;

    INITIAL_GOTRAS.forEach(g => {
      list.push({
        id: `gotra_${order}`,
        category: 'gotra',
        nameNepali: g.nameNepali,
        nameEnglish: g.nameEnglish,
        isActive: true,
        sortOrder: order++,
        createdAtISO: new Date().toISOString()
      });
    });

    INITIAL_JAAT_BARNA.forEach(j => {
      list.push({
        id: `jaat_${order}`,
        category: 'jaat_barna',
        nameNepali: j.nameNepali,
        nameEnglish: j.nameEnglish,
        isActive: true,
        sortOrder: order++,
        createdAtISO: new Date().toISOString()
      });
    });

    return list;
  }

  private persist(): void {
    try {
      const dir = path.dirname(LOCAL_DATA_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(this.items, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[CulturalMasterStore] Failed to persist:', e);
    }
  }

  public getItems(category?: 'gotra' | 'jaat_barna'): CulturalMasterItem[] {
    if (!category) return this.items.filter(i => i.isActive);
    return this.items.filter(i => i.category === category && i.isActive);
  }

  public getGotras(): CulturalMasterItem[] {
    return this.getItems('gotra');
  }

  public getJaatBarna(): CulturalMasterItem[] {
    return this.getItems('jaat_barna');
  }

  public addItem(item: {
    category: 'gotra' | 'jaat_barna';
    nameNepali: string;
    nameEnglish?: string;
  }): CulturalMasterItem {
    const newItem: CulturalMasterItem = {
      id: `${item.category}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      category: item.category,
      nameNepali: item.nameNepali.trim(),
      nameEnglish: item.nameEnglish?.trim(),
      isActive: true,
      sortOrder: this.items.length + 1,
      createdAtISO: new Date().toISOString()
    };
    this.items.push(newItem);
    this.persist();
    return newItem;
  }
}

export const culturalMasterStore = CulturalMasterStore.getInstance();
