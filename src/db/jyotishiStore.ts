import { ConsultationRecord, FeeReceipt, PrintLogEntry } from '../types/astrology';

const STORAGE_KEY_CONSULTATIONS = 'nepali_astro_consultations_v1';
const STORAGE_KEY_RECEIPTS = 'nepali_astro_receipts_v1';
const STORAGE_KEY_PRINT_LOGS = 'nepali_astro_print_logs_v1';

// Initial Seed Consultations
export const DEFAULT_CONSULTATIONS: ConsultationRecord[] = [
  {
    id: 'cons_1',
    profileId: 'sample_1',
    clientName: 'राम शर्मा (Sample)',
    dateBS: '२०८२ फागुन २०',
    dateAD: '2026-03-04',
    topic: 'करियर तथा व्यापार परामर्श',
    notes: 'दशमेश सूर्य र बृहस्पतिको शुभ दृष्टि रहेकाले आगामी वैशाखदेखि नयाँ व्यवसाय थाल्नु फलदायी रहनेछ। महादशा अनुकूल छ।',
    remediesSuggested: ['सूर्य नमस्कार नियमित गर्ने', 'आइतबार गहुँ र सख्खर दान गर्ने', 'आदित्य हृदय स्तोत्र पाठ'],
    feeAmount: 1500,
    paymentStatus: 'सम्पन्न',
    nextFollowUpBS: '२०८३ जेठ १०',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cons_2',
    profileId: 'sample_2',
    clientName: 'सीता देवी (Sample)',
    dateBS: '२०८२ माघ १५',
    dateAD: '2026-01-29',
    topic: 'विवाह मिलान तथा गुण मिलान',
    notes: 'भकूट र नाडी गुण उत्तम। कुल २८ गुण मिलान भएको। मङ्गल दोषको निवारणका लागि मङ्गलवार व्रत बस्न सुझाव।',
    remediesSuggested: ['मङ्गलवार हनुमान चालीसा पाठ', 'लाल चन्दन धारण'],
    feeAmount: 2000,
    paymentStatus: 'सम्पन्न',
    nextFollowUpBS: '२०८३ असार ०५',
    createdAt: new Date().toISOString(),
  },
];

// Initial Seed Receipts
export const DEFAULT_RECEIPTS: FeeReceipt[] = [
  {
    id: 'rec_101',
    receiptNo: '१०१',
    clientName: 'राम शर्मा (Sample)',
    profileId: 'sample_1',
    dateBS: '२०८२ फागुन २०',
    serviceTitle: 'पूर्ण जन्मकुण्डली एवं करियर परामर्श',
    totalFee: 1500,
    paidAmount: 1500,
    balanceAmount: 0,
    paymentMethod: 'ई-सेवा / फोनपे',
    notes: 'परामर्श रसिद चुक्ता भयो।',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rec_102',
    receiptNo: '१०२',
    clientName: 'सीता देवी (Sample)',
    profileId: 'sample_2',
    dateBS: '२०८२ माघ १५',
    serviceTitle: 'विवाह मिलान एवं कुण्डली परीक्षण',
    totalFee: 2000,
    paidAmount: 2000,
    balanceAmount: 0,
    paymentMethod: 'नगद',
    notes: 'विवाह गुण मिलान प्रतिवेदन सहित।',
    createdAt: new Date().toISOString(),
  },
];

// Initial Seed Print Logs
export const DEFAULT_PRINT_LOGS: PrintLogEntry[] = [
  {
    id: 'print_1',
    clientName: 'राम शर्मा (Sample)',
    profileId: 'sample_1',
    documentType: 'जन्म टिपन (Birth Tipan)',
    printedAtBS: '२०८२ फागुन २० - ११:३० बजे',
    paperSize: 'A4',
    copiesCount: 2,
    status: 'मुद्रित',
  },
  {
    id: 'print_2',
    clientName: 'सीता देवी (Sample)',
    profileId: 'sample_2',
    documentType: 'विवाह मिलान प्रतिवेदन (Vivah Milan Report)',
    printedAtBS: '२०८२ माघ १५ - १५:४५ बजे',
    paperSize: 'A4',
    copiesCount: 1,
    status: 'मुद्रित',
  },
];

// Store Helper Functions
export function getStoredConsultations(): ConsultationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONSULTATIONS);
    if (!raw) {
      saveConsultations(DEFAULT_CONSULTATIONS);
      return DEFAULT_CONSULTATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_CONSULTATIONS;
  }
}

export function saveConsultations(data: ConsultationRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY_CONSULTATIONS, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save consultations', e);
  }
}

export function addConsultation(record: Omit<ConsultationRecord, 'id' | 'createdAt'>): ConsultationRecord {
  const current = getStoredConsultations();
  const newRec: ConsultationRecord = {
    ...record,
    id: `cons_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newRec, ...current];
  saveConsultations(updated);
  return newRec;
}

export function getStoredReceipts(): FeeReceipt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECEIPTS);
    if (!raw) {
      saveReceipts(DEFAULT_RECEIPTS);
      return DEFAULT_RECEIPTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_RECEIPTS;
  }
}

export function saveReceipts(data: FeeReceipt[]) {
  try {
    localStorage.setItem(STORAGE_KEY_RECEIPTS, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save receipts', e);
  }
}

export function addReceipt(receipt: Omit<FeeReceipt, 'id' | 'createdAt'>): FeeReceipt {
  const current = getStoredReceipts();
  const newRec: FeeReceipt = {
    ...receipt,
    id: `rec_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newRec, ...current];
  saveReceipts(updated);
  return newRec;
}

export function getStoredPrintLogs(): PrintLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRINT_LOGS);
    if (!raw) {
      savePrintLogs(DEFAULT_PRINT_LOGS);
      return DEFAULT_PRINT_LOGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_PRINT_LOGS;
  }
}

export function savePrintLogs(data: PrintLogEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY_PRINT_LOGS, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save print logs', e);
  }
}

export function logPrintAction(entry: Omit<PrintLogEntry, 'id'>): PrintLogEntry {
  const current = getStoredPrintLogs();
  const newLog: PrintLogEntry = {
    ...entry,
    id: `print_${Date.now()}`,
  };
  const updated = [newLog, ...current];
  savePrintLogs(updated);
  return newLog;
}
