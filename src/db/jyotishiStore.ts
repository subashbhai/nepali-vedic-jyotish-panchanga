import { ConsultationRecord, FeeReceipt, PrintLogEntry } from '../types/astrology';

const STORAGE_KEY_CONSULTATIONS = 'nepali_astro_consultations_v1';
const STORAGE_KEY_RECEIPTS = 'nepali_astro_receipts_v1';
const STORAGE_KEY_PRINT_LOGS = 'nepali_astro_print_logs_v1';

// Initial Consultations, Receipts, Print Logs (empty by default; user-scoped upon sign-in/use)
export const DEFAULT_CONSULTATIONS: ConsultationRecord[] = [];
export const DEFAULT_RECEIPTS: FeeReceipt[] = [];
export const DEFAULT_PRINT_LOGS: PrintLogEntry[] = [];

// Store Helper Functions
export function getStoredConsultations(): ConsultationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONSULTATIONS);
    if (!raw) {
      return [];
    }
    const parsed: ConsultationRecord[] = JSON.parse(raw);
    const cleaned = Array.isArray(parsed)
      ? parsed.filter(
          (c) =>
            c &&
            !c.profileId?.startsWith('sample_') &&
            !c.clientName?.includes('(Sample)') &&
            c.clientName !== 'राम शर्मा' &&
            c.clientName !== 'सीता देवी'
        )
      : [];
    return cleaned;
  } catch (e) {
    return [];
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
      return [];
    }
    const parsed: FeeReceipt[] = JSON.parse(raw);
    const cleaned = Array.isArray(parsed)
      ? parsed.filter(
          (r) =>
            r &&
            !r.profileId?.startsWith('sample_') &&
            !r.clientName?.includes('(Sample)') &&
            r.clientName !== 'राम शर्मा' &&
            r.clientName !== 'सीता देवी'
        )
      : [];
    return cleaned;
  } catch (e) {
    return [];
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
      return [];
    }
    const parsed: PrintLogEntry[] = JSON.parse(raw);
    const cleaned = Array.isArray(parsed)
      ? parsed.filter(
          (l) =>
            l &&
            !l.profileId?.startsWith('sample_') &&
            !l.clientName?.includes('(Sample)') &&
            l.clientName !== 'राम शर्मा' &&
            l.clientName !== 'सीता देवी'
        )
      : [];
    return cleaned;
  } catch (e) {
    return [];
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
