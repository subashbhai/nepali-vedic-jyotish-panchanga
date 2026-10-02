/**
 * Windows Offline Application Types
 * Dual-Service Architecture: Jyotish Sewa + Vastu Sewa
 */

export type WindowsPrimaryService = 'HOME' | 'JYOTISH' | 'VASTU';

export type WindowsJyotishTab = 
  | 'DASHBOARD'
  | 'KUNDALI'
  | 'DASHA'
  | 'PANCHAANGA'
  | 'GOCHAR'
  | 'MATCHING'
  | 'REPORTS'
  | 'PROFILES';

export type WindowsVastuTab =
  | 'PROJECTS'
  | 'FLOOR_PLAN'
  | 'ANALYSIS'
  | 'REMEDIES'
  | 'REPORT';

export interface WindowsNavigationState {
  service: WindowsPrimaryService;
  jyotishTab: WindowsJyotishTab;
  vastuTab: WindowsVastuTab;
}
