import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Printer, 
  ShieldAlert, 
  Info, 
  Flame, 
  Droplets, 
  Wind, 
  Mountain, 
  Sun, 
  RotateCw, 
  FileCheck, 
  MapPin, 
  Maximize2,
  FolderPlus,
  Shovel,
  Layers,
  Plus,
  Trash2,
  Check,
  User,
  Phone,
  Calendar,
  FileText,
  FileDown,
  Download,
  ChevronDown,
  Image as ImageIcon,
  MessageCircle,
  Share2
} from 'lucide-react';
import { WhatsAppIcon, FacebookIcon, MessengerIcon } from './common/WhatsAppShareModal';
import { 
  VASTU_ZONES, 
  ROOM_CONFIGS, 
  VastuZone, 
  calculateVastuAuditScore, 
  getDirectionFromDegree 
} from '../utils/vastuEngine';
import { OrganizationProfile, BirthDetails } from '../types/astrology';
import { GaneshaHeaderCenter } from './GaneshaHeaderCenter';
import { VastuDigitalCompass } from './VastuDigitalCompass';
import { VastuPlannerModule } from '../vastuPlanner/VastuPlannerModule';
import { canUserPrintDocuments } from '../db/subscriptionStore';
import { VastuSinglePageReport } from './vastu/VastuSinglePageReport';
import { JyotishVastuLicenseHeader } from './common/JyotishVastuLicenseHeader';
import { sanitizeCloneForCanvas } from '../utils/pdfGenerator';

interface VastuViewProps {
  orgProfile?: OrganizationProfile;
  activeProfile?: BirthDetails | null;
  initialSubTab?: VastuSubTab;
  onSubTabChange?: (tab: VastuSubTab) => void;
  inModalWindow?: boolean;
  onCloseWindow?: () => void;
  onOpenPurchaseModal?: () => void;
}

export type VastuSubTab = 'project' | 'planner' | 'bhumi' | 'mandala' | 'compass' | 'audit' | 'panchatattva' | 'report';

// Vastu Project Interface
export interface VastuProject {
  id: string;
  projectName: string;
  clientName: string;
  clientPhone: string;
  address: string;
  propertyType: 'residential' | 'commercial' | 'industrial' | 'plot';
  constructionStage: 'vacant_plot' | 'planning' | 'under_construction' | 'completed' | 'renovation';
  facingDirection: 'east' | 'north' | 'west' | 'south' | 'ne' | 'se' | 'sw' | 'nw';
  plotAreaSqFt: string;
  createdAt: string;
  notes: string;
  
  // Land Test State
  bhumiTest: {
    soilColor: 'white' | 'red' | 'yellow' | 'black';
    soilTaste: 'sweet' | 'astringent' | 'bitter_sour' | 'pungent';
    pitTestResult: 'excess' | 'equal' | 'deficient';
    waterRetention: 'retained' | 'damp' | 'dry';
    slopeDirection: 'NE' | 'E' | 'N' | 'NW' | 'SE' | 'W' | 'S' | 'SW';
    plotShape: 'square' | 'rectangular' | 'gomukhi' | 'singhmukhi' | 'irregular';
  };

  // Room Placement Audit State
  roomPlacements: Record<string, string>;
}

const DEFAULT_PROJECTS: VastuProject[] = [
  {
    id: 'proj-1',
    projectName: 'शान्ति निकेतन निवास',
    clientName: 'रामचन्द्र श्रेष्ठ',
    clientPhone: '९८५१२३४५६७',
    address: 'भक्तपुर, नेपाल',
    propertyType: 'residential',
    constructionStage: 'planning',
    facingDirection: 'east',
    plotAreaSqFt: '१६०० sq.ft (५ आना)',
    createdAt: new Date().toISOString().split('T')[0],
    notes: 'नयाँ साढे दुई तले आवासीय भवनको वास्तु नक्सा डिजाइन।',
    bhumiTest: {
      soilColor: 'white',
      soilTaste: 'sweet',
      pitTestResult: 'excess',
      waterRetention: 'retained',
      slopeDirection: 'NE',
      plotShape: 'rectangular'
    },
    roomPlacements: {
      main_entrance: 'NE',
      kitchen: 'SE',
      master_bedroom: 'SW',
      pooja_room: 'NE',
      toilet_bathroom: 'NW',
      underground_water: 'NE',
      staircase: 'S',
      cash_locker: 'SW'
    }
  }
];

export const VastuView: React.FC<VastuViewProps> = ({ 
  orgProfile, 
  activeProfile, 
  initialSubTab,
  onSubTabChange,
  inModalWindow = false,
  onCloseWindow,
  onOpenPurchaseModal,
}) => {
  const [activeSubTab, setActiveSubTabState] = useState<VastuSubTab>(initialSubTab || 'project');
  
  const handleSelectSubTab = (tab: VastuSubTab) => {
    setActiveSubTabState(tab);
    if (onSubTabChange) {
      onSubTabChange(tab);
    }
  };

  // Synchronize when initialSubTab changes from external navigation (e.g. Navigation Vastu Menu)
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTabState(initialSubTab);
    }
  }, [initialSubTab]);

  // Projects state
  const [projects, setProjects] = useState<VastuProject[]>(() => {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        const saved = window.localStorage.getItem('sukdev_vastu_projects');
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PROJECTS;
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'proj-1');
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
  const [projectToastMessage, setProjectToastMessage] = useState<string | null>(null);

  // Active Project Data
  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0] || DEFAULT_PROJECTS[0];

  // Sync back to localstorage when projects change
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        window.localStorage.setItem('sukdev_vastu_projects', JSON.stringify(projects));
      }
    } catch (e) {
      console.error(e);
    }
  }, [projects]);

  // Form State for creating a new project
  const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [newClientName, setNewClientName] = useState<string>(activeProfile?.name || '');
  const [newClientPhone, setNewClientPhone] = useState<string>('');
  const [newAddress, setNewAddress] = useState<string>(activeProfile?.location?.name || 'काठमाडौँ, नेपाल');
  const [newPropertyType, setNewPropertyType] = useState<VastuProject['propertyType']>('residential');
  const [newConstructionStage, setNewConstructionStage] = useState<VastuProject['constructionStage']>('planning');
  const [newFacingDirection, setNewFacingDirection] = useState<VastuProject['facingDirection']>('east');
  const [newPlotArea, setNewPlotArea] = useState<string>('१६०० sq.ft');
  const [newNotes, setNewNotes] = useState<string>('');

  // Mandala selected zone
  const [selectedZoneId, setSelectedZoneId] = useState<string>('NE');

  // Compass state
  const [degree, setDegree] = useState<number>(45);
  const [isLiveGyro, setIsLiveGyro] = useState<boolean>(false);

  const selectedZone = VASTU_ZONES.find((z) => z.id === selectedZoneId) || VASTU_ZONES[0];
  const compassZone = getDirectionFromDegree(degree);
  const auditResult = calculateVastuAuditScore(currentProject.roomPlacements);

  // Compass Gyroscope handling
  useEffect(() => {
    if (!isLiveGyro) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        setDegree(Math.round(360 - event.alpha));
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, [isLiveGyro]);

  // Helper to update current project details
  const updateCurrentProject = (updater: (prevProj: VastuProject) => VastuProject) => {
    setProjects(prev => prev.map(p => p.id === currentProject.id ? updater(p) : p));
  };

  // Handle Create Project
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const newProj: VastuProject = {
      id: `proj-${Date.now()}`,
      projectName: newProjectName.trim() || 'नयाँ वास्तु परियोजना',
      clientName: newClientName.trim() || 'गृहस्वामी',
      clientPhone: newClientPhone.trim(),
      address: newAddress.trim() || 'नेपाल',
      propertyType: newPropertyType,
      constructionStage: newConstructionStage,
      facingDirection: newFacingDirection,
      plotAreaSqFt: newPlotArea.trim() || '१००० sq.ft',
      createdAt: new Date().toISOString().split('T')[0],
      notes: newNotes.trim(),
      bhumiTest: {
        soilColor: 'white',
        soilTaste: 'sweet',
        pitTestResult: 'excess',
        waterRetention: 'retained',
        slopeDirection: 'NE',
        plotShape: 'rectangular'
      },
      roomPlacements: {
        main_entrance: 'NE',
        kitchen: 'SE',
        master_bedroom: 'SW',
        pooja_room: 'NE',
        toilet_bathroom: 'NW',
        underground_water: 'NE',
        staircase: 'S',
        cash_locker: 'SW'
      }
    };

    setProjects(prev => [newProj, ...prev]);
    setSelectedProjectId(newProj.id);
    setIsCreatingProject(false);
    
    // Reset form
    setNewProjectName('');
    setNewNotes('');
  };

  // Handle Delete Project
  const handleDeleteProject = (id: string, name: string) => {
    if (projects.length <= 1) {
      setProjectToastMessage('कमसेकम एउटा परियोजना हुनु अनिवार्य छ।');
      setTimeout(() => setProjectToastMessage(null), 3500);
      return;
    }
    setProjectToDelete({ id, name });
  };

  const confirmDeleteProject = () => {
    if (!projectToDelete) return;
    const filtered = projects.filter(p => p.id !== projectToDelete.id);
    setProjects(filtered);
    if (selectedProjectId === projectToDelete.id) {
      setSelectedProjectId(filtered[0]?.id || '');
    }
    const deletedName = projectToDelete.name;
    setProjectToDelete(null);
    setProjectToastMessage(`"${deletedName}" परियोजना सफलतापूर्वक हटाइयो।`);
    setTimeout(() => setProjectToastMessage(null), 3500);
  };

  // Handle Room Placement Change
  const handlePlacementChange = (roomId: string, dirId: string) => {
    updateCurrentProject(proj => ({
      ...proj,
      roomPlacements: {
        ...proj.roomPlacements,
        [roomId]: dirId
      }
    }));
  };

  // Handle Bhumi Test Change
  const handleBhumiChange = (field: keyof VastuProject['bhumiTest'], val: any) => {
    updateCurrentProject(proj => ({
      ...proj,
      bhumiTest: {
        ...proj.bhumiTest,
        [field]: val
      }
    }));
  };

  const [isExportingVastuPDF, setIsExportingVastuPDF] = useState(false);
  const [isExportingVastuPNG, setIsExportingVastuPNG] = useState(false);
  const [isVastuDownloadOpen, setIsVastuDownloadOpen] = useState(false);
  const [isReportSectionDownloadOpen, setIsReportSectionDownloadOpen] = useState(false);
  const [isVastuShareOpen, setIsVastuShareOpen] = useState(false);
  const [isReportSectionShareOpen, setIsReportSectionShareOpen] = useState(false);
  const vastuDownloadRef = useRef<HTMLDivElement>(null);
  const reportSectionDownloadRef = useRef<HTMLDivElement>(null);
  const vastuShareRef = useRef<HTMLDivElement>(null);
  const reportSectionShareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (vastuDownloadRef.current && !vastuDownloadRef.current.contains(e.target as Node)) {
        setIsVastuDownloadOpen(false);
      }
      if (reportSectionDownloadRef.current && !reportSectionDownloadRef.current.contains(e.target as Node)) {
        setIsReportSectionDownloadOpen(false);
      }
      if (vastuShareRef.current && !vastuShareRef.current.contains(e.target as Node)) {
        setIsVastuShareOpen(false);
      }
      if (reportSectionShareRef.current && !reportSectionShareRef.current.contains(e.target as Node)) {
        setIsReportSectionShareOpen(false);
      }
    };
    if (isVastuDownloadOpen || isReportSectionDownloadOpen || isVastuShareOpen || isReportSectionShareOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVastuDownloadOpen, isReportSectionDownloadOpen, isVastuShareOpen, isReportSectionShareOpen]);

  const executeVastuSinglePagePrint = () => {
    const docEl = document.getElementById('vastu-single-page-report');
    if (!docEl) {
      window.print();
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const pri = iframe.contentWindow;
    if (!pri) {
      window.print();
      document.body.removeChild(iframe);
      return;
    }

    const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((tag) => tag.outerHTML)
      .join('\n');

    pri.document.open();
    pri.document.write(`
      <!DOCTYPE html>
      <html lang="ne">
        <head>
          <meta charset="utf-8" />
          <title>वास्तु प्रतिवेदन - ${currentProject.projectName}</title>
          ${styleTags}
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background-color: #FFFDF9 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
              overflow: hidden !important;
              width: 210mm !important;
              height: 296mm !important;
            }
            #vastu-single-page-report {
              width: 210mm !important;
              max-width: 210mm !important;
              height: 296mm !important;
              max-height: 296mm !important;
              margin: 0 auto !important;
              box-shadow: none !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .no-print { display: none !important; }
          </style>
        </head>
        <body>
          ${docEl.outerHTML}
        </body>
      </html>
    `);
    pri.document.close();

    setTimeout(() => {
      try {
        pri.focus();
        pri.print();
      } catch (err) {
        console.error('Print iframe failed, falling back to window.print():', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    }, 400);
  };

  const handlePrint = () => {
    const check = canUserPrintDocuments('vastu');
    if (!check.allowed) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('trial-print-blocked', { detail: { reason: check.reasonNepali, docType: 'vastu' } }));
      }
      return;
    }

    if (activeSubTab !== 'report') {
        handleSelectSubTab('report');
      setTimeout(() => {
        executeVastuSinglePagePrint();
      }, 300);
    } else {
      executeVastuSinglePagePrint();
    }
  };

  const handleDownloadVastuPDF = async () => {
    if (isExportingVastuPDF) return;
    setIsExportingVastuPDF(true);

    try {
      if (activeSubTab !== 'report') {
          handleSelectSubTab('report');
        await new Promise((r) => setTimeout(r, 300));
      }

      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const docEl = document.getElementById('vastu-single-page-report');
      if (!docEl) throw new Error('Vastu document element not found');

      const canvas = await html2canvas(docEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFDF9',
        windowWidth: 1200,
        onclone: (clonedDoc, clonedEl) => {
          sanitizeCloneForCanvas(clonedDoc, clonedEl);
          clonedEl.style.transform = 'none';
          clonedEl.style.boxShadow = 'none';
          clonedEl.style.margin = '0 auto';
          clonedEl.style.width = '210mm';
          clonedEl.style.height = '296mm';
        },
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

      const cleanName = currentProject.projectName.replace(/[\s\/:]+/g, '_');
      pdf.save(`Vastu_Report_${cleanName}.pdf`);
    } catch (err) {
      console.error('Failed to export Vastu PDF:', err);
    } finally {
      setIsExportingVastuPDF(false);
    }
  };

  const handleDownloadVastuPNG = async () => {
    if (isExportingVastuPNG) return;
    setIsExportingVastuPNG(true);

    try {
      if (activeSubTab !== 'report') {
        handleSelectSubTab('report');
        await new Promise((r) => setTimeout(r, 300));
      }

      const [{ default: html2canvas }] = await Promise.all([import('html2canvas')]);
      const docEl = document.getElementById('vastu-single-page-report');
      if (!docEl) throw new Error('Vastu document element not found');

      const canvas = await html2canvas(docEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFDF9',
        windowWidth: 1200,
        onclone: (clonedDoc, clonedEl) => {
          sanitizeCloneForCanvas(clonedDoc, clonedEl);
          clonedEl.style.transform = 'none';
          clonedEl.style.boxShadow = 'none';
          clonedEl.style.margin = '0 auto';
          clonedEl.style.width = '210mm';
          clonedEl.style.height = '296mm';
        },
      });

      const cleanName = currentProject.projectName.replace(/[\s\/:]+/g, '_');
      canvas.toBlob((blob) => {
        if (!blob) throw new Error('Blob conversion failed');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Vastu_Report_${cleanName}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (err) {
      console.error('Failed to download Vastu PNG:', err);
    } finally {
      setIsExportingVastuPNG(false);
    }
  };

  const getVastuShareText = () => {
    return `॥ बालानन्द वैदिक वास्तुशास्त्र तथा भवन मूल्याङ्कन प्रतिवेदन ॥\n🏠 परियोजना: ${currentProject.projectName} (${currentProject.clientName})\n📍 स्थान: ${currentProject.address}\n📐 वास्तु प्राप्ताङ्क: ${auditResult.percentage}% (${auditResult.gradeNepali})\n\n— बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा\n🌐 ${typeof window !== 'undefined' ? window.location.href : 'https://suwashdmk.com'}`;
  };

  const handleShareVastuWhatsApp = () => {
    setIsVastuShareOpen(false);
    setIsReportSectionShareOpen(false);
    const text = getVastuShareText();
    let phone = currentProject.clientPhone ? currentProject.clientPhone.replace(/\D/g, '') : '';
    if (phone.length === 10 && phone.startsWith('9')) {
      phone = '977' + phone;
    }
    const encoded = encodeURIComponent(text);
    const waUrl = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  const handleShareVastuFacebook = () => {
    setIsVastuShareOpen(false);
    setIsReportSectionShareOpen(false);
    const text = getVastuShareText();
    const url = typeof window !== 'undefined' ? window.location.href : '';
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank', 'width=620,height=540');
  };

  const handleShareVastuMessenger = async () => {
    setIsVastuShareOpen(false);
    setIsReportSectionShareOpen(false);
    const text = getVastuShareText();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
    } catch {}
    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (isMobile) {
      window.location.href = `fb-messenger://share?link=${encodeURIComponent(url)}`;
    } else {
      window.open('https://www.messenger.com/', '_blank');
    }
    setProjectToastMessage('वास्तु प्रतिवेदन कपी भयो र Messenger खुल्दैछ!');
    setTimeout(() => setProjectToastMessage(null), 3000);
  };

  const handleCopyVastuShareText = async () => {
    setIsVastuShareOpen(false);
    setIsReportSectionShareOpen(false);
    const text = getVastuShareText();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setProjectToastMessage('वास्तु प्रतिवेदन विवरण क्लिपबोर्डमा कपी भयो!');
        setTimeout(() => setProjectToastMessage(null), 3000);
      }
    } catch {}
  };

  // Calculate Land Test Rating
  const evaluateBhumiScore = () => {
    const bt = currentProject.bhumiTest;
    let score = 0;
    const notes: string[] = [];

    // Soil Color
    if (bt.soilColor === 'white') { score += 25; notes.push('माटोको सेतो रङ्ग सात्त्विक तथा उत्तम मानिन्छ (विप्र भूमि)।'); }
    else if (bt.soilColor === 'red') { score += 20; notes.push('रातो माटो ऊर्जावान र तेजस्वी हुन्छ (क्षत्रिय भूमि)।'); }
    else if (bt.soilColor === 'yellow') { score += 18; notes.push('पहेँलो माटो व्यापार र समृद्धिका लागि उत्तम मानिन्छ (वैश्य भूमि)।'); }
    else { score += 10; notes.push('कालो/मैलो माटोमा जैविक सुधार आवश्यक मानिन्छ।'); }

    // Pit Fill Test
    if (bt.pitTestResult === 'excess') { score += 25; notes.push('खाल्डो खनेर माटो पुर्दा माटो उब्रिनु भूमिमा घनत्व र स्थायित्वको प्रतीक (उत्तम भूमि) हो।'); }
    else if (bt.pitTestResult === 'equal') { score += 18; notes.push('माटो बराबर हुनु मध्यम फलदायी हो।'); }
    else { score += 5; notes.push('माटो घट्नु भूमि खुकुलो वा कमजोर भएको संकेत (अधम भूमि) हो।'); }

    // Water Retention
    if (bt.waterRetention === 'retained') { score += 25; notes.push('खाल्डोमा पानी सोसिने गति ढिलो हुनु उत्तम जल-धारण क्षमता र उर्वरताको प्रतीक हो।'); }
    else if (bt.waterRetention === 'damp') { score += 15; notes.push('पानी सोसिए पनि चिस्यान रहनु मध्यम भूमि हो।'); }
    else { score += 5; notes.push('पानी तुरुन्तै सुक्नु बालुवायुक्त वा कमजोर माटो हो।'); }

    // Slope
    if (['NE', 'E', 'N'].includes(bt.slopeDirection)) { score += 25; notes.push('ईशान/पूर्व/उत्तरतर्फको ढलान शुभ उर्जा र धन प्रवाहका लागि अति उत्तम।'); }
    else if (['NW', 'SE'].includes(bt.slopeDirection)) { score += 15; notes.push('वायव्य/आग्नेय ढलान मध्यम।'); }
    else { score += 5; notes.push('दक्षिण/नैऋत्यतर्फ ढलान हुनु दोषयुक्त, जग उठाउँदा उत्तर-पूर्व होचो बनाउनुहोस्।'); }

    return { score, notes };
  };

  const bhumiEval = evaluateBhumiScore();

  return (
    <div className="min-w-0 max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-6 text-stone-900 dark:text-stone-100 font-sans">
      
      {/* Dedicated Demo, Name, and Duration Status Bar for Vastu */}
      <JyotishVastuLicenseHeader
        moduleName="वास्तुशास्त्र"
        onOpenPurchase={onOpenPurchaseModal}
      />

      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-amber-700 via-red-800 to-amber-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-amber-600/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-300/40 flex items-center justify-center text-amber-200 shrink-0 shadow-inner">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-serif tracking-wide text-amber-100 flex items-center justify-center sm:justify-start gap-2">
              <span>वैदिक वास्तुशास्त्र परामर्श केन्द्र</span>
              <span className="text-xs bg-amber-400 text-stone-900 font-sans font-bold px-2.5 py-0.5 rounded-full">
                {currentProject.projectName}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-amber-200/90 mt-0.5">
              वास्तु परियोजना व्यवस्थापन, भूमि परीक्षण, ८१-पद वास्तुपुरुष मण्डल, दिशा कम्पास र तोडफोडविहीन वास्तु उपचार
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrint}
            className="bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 border border-yellow-500"
            title="A4 प्रिन्ट (दोहोरो पहेँलो र हरियो स्वस्तिक बोर्डर)"
          >
            <Printer className="w-4 h-4" />
            <span>प्रिन्ट</span>
          </button>

          {/* Download Dropdown */}
          <div className="relative" ref={vastuDownloadRef}>
            <button
              type="button"
              onClick={() => setIsVastuDownloadOpen((p) => !p)}
              disabled={isExportingVastuPDF || isExportingVastuPNG}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 disabled:opacity-60"
              title="प्रतिवेदन डाउनलोड गर्नुहोस् (PDF / PNG)"
            >
              {isExportingVastuPDF || isExportingVastuPNG ? (
                <span className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>डाउनलोड</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isVastuDownloadOpen ? 'rotate-180' : ''}`} />
            </button>

            {isVastuDownloadOpen && (
              <div className="absolute right-0 mt-1.5 w-32 bg-white dark:bg-stone-900 border border-amber-500/40 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsVastuDownloadOpen(false);
                    handleDownloadVastuPDF();
                  }}
                  disabled={isExportingVastuPDF}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-stone-800 hover:text-amber-700 dark:hover:text-amber-300 transition cursor-pointer text-left"
                >
                  <FileDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsVastuDownloadOpen(false);
                    handleDownloadVastuPNG();
                  }}
                  disabled={isExportingVastuPNG}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-stone-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer text-left border-t border-stone-100 dark:border-stone-800"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>PNG</span>
                </button>
              </div>
            )}
          </div>

          {/* Share Dropdown Button */}
          <div className="relative" ref={vastuShareRef}>
            <button
              type="button"
              onClick={() => setIsVastuShareOpen((prev) => !prev)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
              title="सामाजिक सञ्जालमा सेयर गर्नुहोस्"
            >
              <Share2 className="w-4 h-4" />
              <span>सेयर</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isVastuShareOpen ? 'rotate-180' : ''}`} />
            </button>

            {isVastuShareOpen && (
              <div className="absolute right-0 top-full mt-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xl z-50 py-1 min-w-[170px] overflow-hidden divide-y divide-stone-100 dark:divide-stone-800 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={handleShareVastuWhatsApp}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-emerald-50 dark:hover:bg-stone-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  <WhatsAppIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareVastuFacebook}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-blue-50 dark:hover:bg-stone-800 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer text-left"
                >
                  <FacebookIcon className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Facebook</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareVastuMessenger}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-sky-50 dark:hover:bg-stone-800 hover:text-sky-600 dark:hover:text-sky-400 transition cursor-pointer text-left"
                >
                  <MessengerIcon className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>Messenger</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyVastuShareText}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-stone-800 hover:text-amber-600 dark:hover:text-amber-400 transition cursor-pointer text-left"
                >
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>विवरण कपी गर्नुहोस्</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN SIDEBAR LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SIDEBAR NAVIGATION (DESKTOP & MOBILE RESPONSIVE) */}
        <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-4">
          
          {/* NAVIGATION CARD */}
          <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-2xl p-3.5 shadow-sm space-y-2">
            <div className="px-2 py-1.5 border-b border-amber-100 dark:border-stone-800 flex items-center justify-between">
              <span className="text-xs font-bold font-serif text-red-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-600" />
                <span>वास्तु मोड्युलहरू</span>
              </span>
              <span className="text-[10px] bg-amber-100 dark:bg-stone-800 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                ७ मुख्य सेवा
              </span>
            </div>

            <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto scrollbar-none pb-1 lg:pb-0">
              <button
                onClick={() => handleSelectSubTab('project')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-between cursor-pointer shrink-0 ${
                  activeSubTab === 'project'
                    ? 'bg-red-800 text-white shadow-md ring-2 ring-red-800/30'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-amber-100/60 dark:hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FolderPlus className="w-4 h-4 shrink-0 text-amber-400" />
                  <span className="whitespace-nowrap">नयाँ वास्तु परियोजना</span>
                </div>
                {activeSubTab === 'project' && <Check className="w-4 h-4 text-amber-300 hidden sm:inline" />}
              </button>

              <button
                onClick={() => handleSelectSubTab('planner')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-between cursor-pointer shrink-0 ${
                  activeSubTab === 'planner'
                    ? 'bg-red-800 text-white shadow-md ring-2 ring-red-800/30'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-amber-100/60 dark:hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 shrink-0 text-amber-400" />
                  <span className="whitespace-nowrap">वास्तु भवन योजना (2D/3D)</span>
                </div>
                {activeSubTab === 'planner' && <Check className="w-4 h-4 text-amber-300 hidden sm:inline" />}
              </button>

              <button
                onClick={() => handleSelectSubTab('bhumi')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-between cursor-pointer shrink-0 ${
                  activeSubTab === 'bhumi'
                    ? 'bg-red-800 text-white shadow-md ring-2 ring-red-800/30'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-amber-100/60 dark:hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Shovel className="w-4 h-4 shrink-0 text-amber-400" />
                  <span className="whitespace-nowrap">भूमि परीक्षण (Soil Test)</span>
                </div>
                {activeSubTab === 'bhumi' && <Check className="w-4 h-4 text-amber-300 hidden sm:inline" />}
              </button>

              <button
                onClick={() => handleSelectSubTab('mandala')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-between cursor-pointer shrink-0 ${
                  activeSubTab === 'mandala'
                    ? 'bg-red-800 text-white shadow-md ring-2 ring-red-800/30'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-amber-100/60 dark:hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 shrink-0 text-amber-400" />
                  <span className="whitespace-nowrap">वास्तुपुरुष मण्डल</span>
                </div>
                {activeSubTab === 'mandala' && <Check className="w-4 h-4 text-amber-300 hidden sm:inline" />}
              </button>

              <button
                onClick={() => handleSelectSubTab('compass')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-between cursor-pointer shrink-0 ${
                  activeSubTab === 'compass'
                    ? 'bg-red-800 text-white shadow-md ring-2 ring-red-800/30'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-amber-100/60 dark:hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 shrink-0 text-amber-400" />
                  <span className="whitespace-nowrap">दिशा निर्धारण (Compass)</span>
                </div>
                {activeSubTab === 'compass' && <Check className="w-4 h-4 text-amber-300 hidden sm:inline" />}
              </button>

              <button
                onClick={() => handleSelectSubTab('audit')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-between cursor-pointer shrink-0 ${
                  activeSubTab === 'audit'
                    ? 'bg-red-800 text-white shadow-md ring-2 ring-red-800/30'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-amber-100/60 dark:hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-400" />
                  <span className="whitespace-nowrap">संरचना वास्तु परीक्षण</span>
                </div>
                {activeSubTab === 'audit' && <Check className="w-4 h-4 text-amber-300 hidden sm:inline" />}
              </button>

              <button
                onClick={() => handleSelectSubTab('panchatattva')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-between cursor-pointer shrink-0 ${
                  activeSubTab === 'panchatattva'
                    ? 'bg-red-800 text-white shadow-md ring-2 ring-red-800/30'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-amber-100/60 dark:hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
                  <span className="whitespace-nowrap">पञ्चतत्त्व चक्र</span>
                </div>
                {activeSubTab === 'panchatattva' && <Check className="w-4 h-4 text-amber-300 hidden sm:inline" />}
              </button>

              <button
                onClick={() => handleSelectSubTab('report')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-between cursor-pointer shrink-0 ${
                  activeSubTab === 'report'
                    ? 'bg-red-800 text-white shadow-md ring-2 ring-red-800/30'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-amber-100/60 dark:hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4 shrink-0 text-amber-400" />
                  <span className="whitespace-nowrap">वास्तु प्रतिवेदन</span>
                </div>
                {activeSubTab === 'report' && <Check className="w-4 h-4 text-amber-300 hidden sm:inline" />}
              </button>
            </nav>
          </div>

          {/* QUICK ACTIVE PROJECT SUMMARY WIDGET */}
          <div className="hidden lg:block bg-gradient-to-br from-amber-900 to-red-950 text-white p-4 rounded-2xl shadow-sm border border-amber-700/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wide text-amber-300">सक्रिय परियोजना</span>
              <span className="text-[10px] bg-amber-400 text-stone-900 font-bold px-2 py-0.5 rounded-full">
                {auditResult.gradeNepali}
              </span>
            </div>

            <div>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg bg-stone-900/90 text-amber-100 border border-amber-600/50 focus:outline-none cursor-pointer"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.projectName} ({p.clientName})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 text-xs text-amber-100/90 pt-1">
              <p className="flex justify-between">
                <span className="text-amber-200/70">गृहस्वामी:</span>
                <span className="font-bold">{currentProject.clientName}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-amber-200/70">वास्तु अङ्क:</span>
                <span className="font-bold text-amber-300">{auditResult.percentage}% ({auditResult.totalScore}/{auditResult.maxScore})</span>
              </p>
            </div>
          </div>

        </aside>

        {/* MAIN MODULE CONTENT AREA */}
        <main className="lg:col-span-9 space-y-6">

      {/* ========================================================= */}
      {/* MODULE: वास्तु भवन योजना (VASTU BUILDING PLANNER 2D/3D) */}
      {/* ========================================================= */}
      {activeSubTab === 'planner' && (
        <VastuPlannerModule />
      )}

      {/* ========================================================= */}
      {/* MODULE 1: नयाँ वास्तु परियोजना (PROJECT MANAGEMENT HUB) */}
      {/* ========================================================= */}
      {activeSubTab === 'project' && (
        <div className="space-y-6">
          
          {/* ACTIVE PROJECT BANNER & SWITCHER */}
          <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200 dark:border-stone-800 pb-4">
              <div>
                <h2 className="text-lg font-bold font-serif text-red-900 dark:text-amber-300 flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-amber-600" />
                  <span>वास्तु परामर्श परियोजना सूची (Vastu Projects Hub)</span>
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  तपाईंका सम्पूर्ण ग्राहक वा घर/घडेरीका वास्तु परामर्श परियोजनाहरू यहाँ सुरक्षित राख्नुहोस् र व्यवस्थापन गर्नुहोस्।
                </p>
              </div>

              <button
                onClick={() => setIsCreatingProject(!isCreatingProject)}
                className="bg-red-800 hover:bg-red-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>नयाँ परियोजना थप्नुहोस्</span>
              </button>
            </div>

            {/* CREATE PROJECT FORM (COLLAPSIBLE) */}
            {isCreatingProject && (
              <form onSubmit={handleCreateProject} className="bg-amber-50/60 dark:bg-stone-800/80 border-2 border-amber-300 dark:border-stone-700 p-4 rounded-xl space-y-4 text-xs">
                <h3 className="font-bold text-sm text-red-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>नयाँ वास्तु परामर्श परियोजना दर्ता</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      परियोजनाको नाम (Project Name) *:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा: शिव निवास / अन्नपूर्णा कम्प्लेक्स"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="w-full font-semibold px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-red-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      गृहस्वामी / ग्राहकको नाम (Client Name) *:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा: गोविन्द प्रसाद अधिकारी"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      className="w-full font-semibold px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-red-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      सम्पर्क नम्बर (Phone):
                    </label>
                    <input
                      type="text"
                      placeholder="९८XXXXXXXX"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      className="w-full font-semibold px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-red-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      स्थान / ठेगाना (Location) *:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा: काठमाडौँ-१०, बानेश्वर"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      className="w-full font-semibold px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-red-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      संरचनाको प्रकार (Type):
                    </label>
                    <select
                      value={newPropertyType}
                      onChange={(e) => setNewPropertyType(e.target.value as any)}
                      className="w-full font-semibold px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 cursor-pointer"
                    >
                      <option value="residential">आवासीय घर (Residential House)</option>
                      <option value="commercial">व्यावसायिक भवन (Commercial Building)</option>
                      <option value="industrial">उद्योग / कलकारखाना (Industrial / Factory)</option>
                      <option value="plot">खाली घडेरी (Plot Land)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      निर्माणको चरण (Stage):
                    </label>
                    <select
                      value={newConstructionStage}
                      onChange={(e) => setNewConstructionStage(e.target.value as any)}
                      className="w-full font-semibold px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 cursor-pointer"
                    >
                      <option value="vacant_plot">खाली घडेरी (Vacant Land)</option>
                      <option value="planning">नक्सा पास / योजना (Planning)</option>
                      <option value="under_construction">निर्माणाधीन (Under Construction)</option>
                      <option value="completed">बनेको पुरानाे घर (Completed / Old House)</option>
                      <option value="renovation">पुनर्निर्माण / मर्मत (Renovation)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      मुख्य मोडा / ढोकाको दिशा (Facing):
                    </label>
                    <select
                      value={newFacingDirection}
                      onChange={(e) => setNewFacingDirection(e.target.value as any)}
                      className="w-full font-semibold px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 cursor-pointer"
                    >
                      <option value="east">पूर्व मुखी (East)</option>
                      <option value="north">उत्तर मुखी (North)</option>
                      <option value="west">पश्चिम मुखी (West)</option>
                      <option value="south">दक्षिण मुखी (South)</option>
                      <option value="ne">ईशान मुखी (NE)</option>
                      <option value="se">आग्नेय मुखी (SE)</option>
                      <option value="sw">नैऋत्य मुखी (SW)</option>
                      <option value="nw">वायव्य मुखी (NW)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      घडेरीको क्षेत्रफल (Plot Area):
                    </label>
                    <input
                      type="text"
                      placeholder="उदा: १५०० sq.ft / ४ आना"
                      value={newPlotArea}
                      onChange={(e) => setNewPlotArea(e.target.value)}
                      className="w-full font-semibold px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-red-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      विशेष नोटहरू (Notes):
                    </label>
                    <input
                      type="text"
                      placeholder="विशेष माग वा टिप्पणीहरू"
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      className="w-full font-semibold px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-red-800"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200 dark:border-stone-700">
                  <button
                    type="button"
                    onClick={() => setIsCreatingProject(false)}
                    className="px-3.5 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-300 cursor-pointer"
                  >
                    रद्द गर्नुहोस्
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>सुरक्षित गर्नुहोस्</span>
                  </button>
                </div>
              </form>
            )}

            {/* PROJECT LIST CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((proj) => {
                const isSelected = proj.id === currentProject.id;
                const projScore = calculateVastuAuditScore(proj.roomPlacements);

                return (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProjectId(proj.id)}
                    className={`p-4 rounded-xl border-2 transition cursor-pointer relative space-y-3 ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-stone-800/90 border-amber-500 shadow-md ring-2 ring-amber-500/30'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide block">
                          {proj.propertyType === 'residential' ? 'आवासीय घर' : proj.propertyType === 'commercial' ? 'व्यावसायिक' : 'घडेरी'}
                        </span>
                        <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                          <span>{proj.projectName}</span>
                          {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                        </h3>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(proj.id, proj.projectName);
                        }}
                        className="text-stone-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                        title="परियोजना हटाउनुहोस्"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1 text-xs text-stone-600 dark:text-stone-300">
                      <p className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span>गृहस्वामी: <strong>{proj.clientName}</strong></span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>ठेगाना: {proj.address}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-stone-400" />
                        <span>मोडा: <strong className="capitalize">{proj.facingDirection} Facing</strong></span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-amber-200 dark:border-stone-800 flex items-center justify-between text-xs font-bold">
                      <span className="text-amber-900 dark:text-amber-300">
                        वास्तु प्राप्ताङ्क: {projScore.percentage}%
                      </span>
                      <span className="text-[10px] bg-amber-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100 px-2 py-0.5 rounded-full font-mono">
                        {proj.createdAt}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* ACTIVE PROJECT SUMMARY PANEL */}
          <div className="bg-amber-50 dark:bg-stone-900/80 border border-amber-300 dark:border-stone-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold font-serif text-base text-red-900 dark:text-amber-300 flex items-center gap-2">
              <Info className="w-5 h-5 text-amber-600" />
              <span>सक्रिय परियोजना: {currentProject.projectName} (विवरण)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white dark:bg-stone-800 p-3 rounded-xl border border-stone-200 dark:border-stone-700">
                <span className="block text-stone-500 text-[10px] font-bold">गृहस्वामी</span>
                <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">{currentProject.clientName}</span>
              </div>
              <div className="bg-white dark:bg-stone-800 p-3 rounded-xl border border-stone-200 dark:border-stone-700">
                <span className="block text-stone-500 text-[10px] font-bold">फोन</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{currentProject.clientPhone || 'नराखिएको'}</span>
              </div>
              <div className="bg-white dark:bg-stone-800 p-3 rounded-xl border border-stone-200 dark:border-stone-700">
                <span className="block text-stone-500 text-[10px] font-bold">क्षेत्रफल</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{currentProject.plotAreaSqFt}</span>
              </div>
              <div className="bg-white dark:bg-stone-800 p-3 rounded-xl border border-stone-200 dark:border-stone-700">
                <span className="block text-stone-500 text-[10px] font-bold">वास्तु अवस्था</span>
                <span className="font-bold text-red-800 dark:text-amber-300">{auditResult.gradeNepali}</span>
              </div>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed bg-white/60 dark:bg-stone-850 p-2.5 rounded-lg border border-amber-200/50">
              <strong>विशेष टिप्पणी:</strong> {currentProject.notes || 'कुनै अतिरिक्त नोट छैन।'}
            </p>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* MODULE 2: भूमि परीक्षण (VEDIC BHUMI PARIKSHAN / SOIL TEST) */}
      {/* ========================================================= */}
      {activeSubTab === 'bhumi' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-6">
            
            <div className="text-center max-w-xl mx-auto space-y-1.5">
              <h2 className="text-xl font-bold font-serif text-red-900 dark:text-amber-300 flex items-center justify-center gap-2">
                <Shovel className="w-6 h-6 text-amber-600" />
                <span>शास्त्रीय भूमि परीक्षण (Vedic Bhumi Parikshan)</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                भवन निर्माण गर्नुअघि घडेरीको माटोको रङ्ग, स्वाद, खनिएको खाल्डो पुर्ने परीक्षण (Pit Fill) र जल-धारण क्षमताको परीक्षण गरिन्छ।
              </p>
            </div>

            {/* BHUMI TEST INPUT FORM */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* 1. Soil Color */}
              <div className="bg-amber-50/50 dark:bg-stone-800/60 p-4 rounded-xl border border-amber-200 dark:border-stone-700 space-y-2">
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                  १. माटोको रङ्ग (Soil Color):
                </label>
                <select
                  value={currentProject.bhumiTest.soilColor}
                  onChange={(e) => handleBhumiChange('soilColor', e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-amber-300 dark:border-stone-600 bg-white dark:bg-stone-900 cursor-pointer"
                >
                  <option value="white">सेतो माटो (White / Brahmin - सर्वोत्कृष्ट)</option>
                  <option value="red">रातो माटो (Red / Kshatriya - उत्तम)</option>
                  <option value="yellow">पहेँलो माटो (Yellow / Vaishya - मध्यम)</option>
                  <option value="black">कालो / मैलो माटो (Black / Shudra - सामान्य)</option>
                </select>
                <p className="text-[11px] text-stone-500">
                  शास्त्र अनुसार सेतो वा रातो माटो भएको घडेरी अति सात्त्विक मानिन्छ।
                </p>
              </div>

              {/* 2. Pit Fill Test */}
              <div className="bg-amber-50/50 dark:bg-stone-800/60 p-4 rounded-xl border border-amber-200 dark:border-stone-700 space-y-2">
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                  २. खाल्डो खनेर पुर्ने परीक्षण (Pit Fill Test):
                </label>
                <select
                  value={currentProject.bhumiTest.pitTestResult}
                  onChange={(e) => handleBhumiChange('pitTestResult', e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-amber-300 dark:border-stone-600 bg-white dark:bg-stone-900 cursor-pointer"
                >
                  <option value="excess">माटो उब्रियो (Excess Soil - उत्तम)</option>
                  <option value="equal">बराबर भयो (Equal - मध्यम)</option>
                  <option value="deficient">माटो घट्यो (Deficient - अधम)</option>
                </select>
                <p className="text-[11px] text-stone-500">
                  १ हात खनेर सोही माटोले पुर्दा उब्रिएमा भूमिको घनत्व उत्तम रहेको मानिन्छ।
                </p>
              </div>

              {/* 3. Water Retention Test */}
              <div className="bg-amber-50/50 dark:bg-stone-800/60 p-4 rounded-xl border border-amber-200 dark:border-stone-700 space-y-2">
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                  ३. जल-धारण क्षमता (Water Retention Test):
                </label>
                <select
                  value={currentProject.bhumiTest.waterRetention}
                  onChange={(e) => handleBhumiChange('waterRetention', e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-amber-300 dark:border-stone-600 bg-white dark:bg-stone-900 cursor-pointer"
                >
                  <option value="retained">पानी सोसिएन / यथावत् रह्यो (Retained - उत्तम)</option>
                  <option value="damp">चिस्यान रह्यो (Damp - मध्यम)</option>
                  <option value="dry">पानी तुरुन्तै सुक्यो (Dry / Absorbed - कमजोर)</option>
                </select>
                <p className="text-[11px] text-stone-500">
                  खाल्डोमा जल भरेर १०० कदम हिँडेर हेर्दा जल नघटेमा शुभ फल मिल्छ।
                </p>
              </div>

              {/* 4. Slope Direction */}
              <div className="bg-amber-50/50 dark:bg-stone-800/60 p-4 rounded-xl border border-amber-200 dark:border-stone-700 space-y-2">
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                  ४. घडेरीको ढलान दिशा (Plot Slope):
                </label>
                <select
                  value={currentProject.bhumiTest.slopeDirection}
                  onChange={(e) => handleBhumiChange('slopeDirection', e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-amber-300 dark:border-stone-600 bg-white dark:bg-stone-900 cursor-pointer"
                >
                  <option value="NE">उत्तर-पूर्व (ईशान) ढलान - सर्वोत्कृष्ट</option>
                  <option value="E">पूर्व ढलान - अति शुभ</option>
                  <option value="N">उत्तर ढलान - धनप्रद</option>
                  <option value="NW">उत्तर-पश्चिम ढलान - मध्यम</option>
                  <option value="SE">दक्षिण-पूर्व ढलान - आग्नेय</option>
                  <option value="S">दक्षिण ढलान - दोषयुक्त</option>
                  <option value="SW">दक्षिण-पश्चिम (नैऋत्य) ढलान - महादोष</option>
                  <option value="W">पश्चिम ढलान - मध्यम</option>
                </select>
                <p className="text-[11px] text-stone-500">
                  पानीको बहाव उत्तर वा पूर्वतर्फ हुनु समृद्धिप्रद मानिन्छ।
                </p>
              </div>

              {/* 5. Plot Shape */}
              <div className="bg-amber-50/50 dark:bg-stone-800/60 p-4 rounded-xl border border-amber-200 dark:border-stone-700 space-y-2">
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                  ५. घडेरीको ज्यामितीय आकार (Plot Shape):
                </label>
                <select
                  value={currentProject.bhumiTest.plotShape}
                  onChange={(e) => handleBhumiChange('plotShape', e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-amber-300 dark:border-stone-600 bg-white dark:bg-stone-900 cursor-pointer"
                >
                  <option value="square">वर्ग आकार (Square - १:१)</option>
                  <option value="rectangular">आयात आकार (Rectangular - १:२ सम्म)</option>
                  <option value="gomukhi">गोमुखी (Gomukhi - आवासका लागि शुभ)</option>
                  <option value="singhmukhi">सिंहमुखी (Singhmukhi - व्यापारका लागि शुभ)</option>
                  <option value="irregular">विषम / काटिएको (Irregular Shape)</option>
                </select>
              </div>

            </div>

            {/* BHUMI EVALUATION SCORE DISPLAY */}
            <div className="bg-gradient-to-r from-amber-800 to-red-900 text-white rounded-xl p-5 shadow-md space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase text-amber-200 tracking-wider">
                    शास्त्रीय भूमि गुणस्तर मूल्याङ्कन
                  </span>
                  <h3 className="text-2xl font-black font-serif mt-0.5">
                    भूमि योग्यता अङ्क: {bhumiEval.score} / १००
                  </h3>
                </div>
                <div className="bg-amber-400 text-stone-900 font-black px-4 py-1.5 rounded-full text-xs">
                  {bhumiEval.score >= 80 ? 'उत्तम भूमि (A Grade)' : bhumiEval.score >= 60 ? 'मध्यम भूमि (B Grade)' : 'उपचार आवश्यक भूमि (C Grade)'}
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-amber-600/50 text-xs text-amber-100">
                <h4 className="font-bold text-amber-200">ज्योतिषीय निष्कर्ष तथा टिप्पणीहरू:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {bhumiEval.notes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODULE 3: वास्तुपुरुष मण्डल (81-PADA MANDALA & 9 ZONES) */}
      {/* ========================================================= */}
      {activeSubTab === 'mandala' && (
        <div className="space-y-6">
          <div className="bg-amber-50 dark:bg-stone-900/60 border border-amber-200 dark:border-stone-800 rounded-xl p-4 text-xs sm:text-sm text-stone-800 dark:text-stone-200 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">८१-पद वास्तुपुरुष मण्डल ग्रिड र दिशा विश्लेषण:</p>
              <p className="mt-0.5 text-stone-600 dark:text-stone-400">
                तल दिइएको ९-क्षेत्रको मण्डल ग्रिडमा कुनै पनि दिशा क्लिक गर्नुहोस्। सो दिशाका अधिष्ठात्री देवता, दिक्पाल, तत्त्व, अनुकूल र बर्जित प्रयोग तथा वैदिक वास्तु उपचार विस्तृत रूपमा प्रदर्शित हुनेछन्।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* 3x3 GRID DIAGRAM (81-PADA VASTU PURUSHA REPRESENTATION) */}
            <div className="lg:col-span-6 bg-stone-900 border-2 border-amber-500/60 rounded-2xl p-4 shadow-xl text-white">
              <div className="flex items-center justify-between mb-3 border-b border-amber-500/30 pb-2">
                <span className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>वास्तुपुरुष मण्डल ग्रिड (Navagrah & Dikpal)</span>
                </span>
                <span className="text-xs text-amber-200/80 font-mono">उत्तर 🡱 (North Top)</span>
              </div>

              {/* 3x3 MATRIX */}
              <div className="grid grid-cols-3 gap-2 aspect-square max-w-md mx-auto relative p-2 bg-stone-950 rounded-xl border border-stone-800">
                
                {/* VASTU PURUSHA OVERLAY ARTWORK BACKGROUND */}
                <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center p-6">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-amber-400">
                    <circle cx="75" cy="25" r="12" fill="none" stroke="currentColor" strokeWidth="2" />
                    <line x1="75" y1="25" x2="25" y2="75" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
                    <path d="M 20 70 L 30 80 M 25 75 L 35 85" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>

                {/* ROW 1: NW ( वायव्य ), N ( उत्तर ), NE ( ईशान ) */}
                <button
                  onClick={() => setSelectedZoneId('NW')}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center transition cursor-pointer relative z-10 ${
                    selectedZoneId === 'NW'
                      ? 'bg-amber-600 text-white border-amber-300 shadow-lg scale-105'
                      : 'bg-stone-900/90 hover:bg-stone-800 border-stone-700 text-stone-200'
                  }`}
                >
                  <Wind className="w-5 h-5 text-sky-400 mb-1" />
                  <span className="text-xs font-bold">वायव्य (NW)</span>
                  <span className="text-[10px] text-stone-400">वायु • चन्द्र</span>
                </button>

                <button
                  onClick={() => setSelectedZoneId('N')}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center transition cursor-pointer relative z-10 ${
                    selectedZoneId === 'N'
                      ? 'bg-amber-600 text-white border-amber-300 shadow-lg scale-105'
                      : 'bg-stone-900/90 hover:bg-stone-800 border-stone-700 text-stone-200'
                  }`}
                >
                  <Droplets className="w-5 h-5 text-emerald-400 mb-1" />
                  <span className="text-xs font-bold">उत्तर (N)</span>
                  <span className="text-[10px] text-amber-300">कुबेर • बुध</span>
                </button>

                <button
                  onClick={() => setSelectedZoneId('NE')}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center transition cursor-pointer relative z-10 ${
                    selectedZoneId === 'NE'
                      ? 'bg-amber-600 text-white border-amber-300 shadow-lg scale-105'
                      : 'bg-stone-900/90 hover:bg-stone-800 border-stone-700 text-stone-200'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-amber-400 mb-1" />
                  <span className="text-xs font-bold">ईशान (NE)</span>
                  <span className="text-[10px] text-amber-200 font-bold">शिव • गुरु</span>
                </button>

                {/* ROW 2: W ( पश्चिम ), CENTER ( ब्रह्मस्थान ), E ( पूर्व ) */}
                <button
                  onClick={() => setSelectedZoneId('W')}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center transition cursor-pointer relative z-10 ${
                    selectedZoneId === 'W'
                      ? 'bg-amber-600 text-white border-amber-300 shadow-lg scale-105'
                      : 'bg-stone-900/90 hover:bg-stone-800 border-stone-700 text-stone-200'
                  }`}
                >
                  <Droplets className="w-5 h-5 text-blue-400 mb-1" />
                  <span className="text-xs font-bold">पश्चिम (W)</span>
                  <span className="text-[10px] text-stone-400">वरुण • शनि</span>
                </button>

                <button
                  onClick={() => setSelectedZoneId('CENTER')}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center transition cursor-pointer relative z-10 ${
                    selectedZoneId === 'CENTER'
                      ? 'bg-amber-600 text-white border-amber-300 shadow-lg scale-105'
                      : 'bg-amber-950/80 hover:bg-amber-900 border-amber-600/80 text-amber-100'
                  }`}
                >
                  <Maximize2 className="w-5 h-5 text-amber-300 mb-1" />
                  <span className="text-xs font-bold">ब्रह्मस्थान</span>
                  <span className="text-[10px] text-amber-300">आकाश • ब्रह्मा</span>
                </button>

                <button
                  onClick={() => setSelectedZoneId('E')}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center transition cursor-pointer relative z-10 ${
                    selectedZoneId === 'E'
                      ? 'bg-amber-600 text-white border-amber-300 shadow-lg scale-105'
                      : 'bg-stone-900/90 hover:bg-stone-800 border-stone-700 text-stone-200'
                  }`}
                >
                  <Sun className="w-5 h-5 text-amber-400 mb-1" />
                  <span className="text-xs font-bold">पूर्व (E)</span>
                  <span className="text-[10px] text-amber-300">इन्द्र • सूर्य</span>
                </button>

                {/* ROW 3: SW ( नैऋत्य ), S ( दक्षिण ), SE ( आग्नेय ) */}
                <button
                  onClick={() => setSelectedZoneId('SW')}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center transition cursor-pointer relative z-10 ${
                    selectedZoneId === 'SW'
                      ? 'bg-amber-600 text-white border-amber-300 shadow-lg scale-105'
                      : 'bg-stone-900/90 hover:bg-stone-800 border-stone-700 text-stone-200'
                  }`}
                >
                  <Mountain className="w-5 h-5 text-amber-600 mb-1" />
                  <span className="text-xs font-bold">नैऋत्य (SW)</span>
                  <span className="text-[10px] text-stone-400">पृथ्वी • राहु</span>
                </button>

                <button
                  onClick={() => setSelectedZoneId('S')}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center transition cursor-pointer relative z-10 ${
                    selectedZoneId === 'S'
                      ? 'bg-amber-600 text-white border-amber-300 shadow-lg scale-105'
                      : 'bg-stone-900/90 hover:bg-stone-800 border-stone-700 text-stone-200'
                  }`}
                >
                  <Flame className="w-5 h-5 text-red-400 mb-1" />
                  <span className="text-xs font-bold">दक्षिण (S)</span>
                  <span className="text-[10px] text-stone-400">यम • मङ्गल</span>
                </button>

                <button
                  onClick={() => setSelectedZoneId('SE')}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center transition cursor-pointer relative z-10 ${
                    selectedZoneId === 'SE'
                      ? 'bg-amber-600 text-white border-amber-300 shadow-lg scale-105'
                      : 'bg-stone-900/90 hover:bg-stone-800 border-stone-700 text-stone-200'
                  }`}
                >
                  <Flame className="w-5 h-5 text-orange-400 mb-1" />
                  <span className="text-xs font-bold">आग्नेय (SE)</span>
                  <span className="text-[10px] text-amber-300">अग्नि • शुक्र</span>
                </button>

              </div>

              <div className="text-center text-xs text-amber-200/80 mt-4 italic">
                * वास्तुपुरुषको टाउको ईशान (NE) मा र गोडा नैऋत्य (SW) कोणमा रहन्छ।
              </div>
            </div>

            {/* ZONE DETAILS CARD */}
            <div className="lg:col-span-6 bg-white dark:bg-stone-900 border-2 border-amber-300 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-amber-200 dark:border-stone-800 pb-3">
                <div>
                  <h2 className="text-xl font-bold font-serif text-red-900 dark:text-amber-300 flex items-center gap-2">
                    <span>{selectedZone.nameNepali}</span>
                    <span className="text-xs bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full font-mono font-bold">
                      {selectedZone.code} ({selectedZone.degrees})
                    </span>
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {selectedZone.nameSanskrit} • दिक्पाल: <strong className="text-stone-800 dark:text-stone-200">{selectedZone.deity}</strong>
                  </p>
                </div>
              </div>

              {/* QUICK STATS */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-amber-50 dark:bg-stone-800 p-2.5 rounded-xl border border-amber-200 dark:border-stone-700">
                  <span className="block text-stone-500 dark:text-stone-400 text-[10px]">तत्त्व (Element)</span>
                  <span className="font-bold text-amber-900 dark:text-amber-200">{selectedZone.element}</span>
                </div>
                <div className="bg-amber-50 dark:bg-stone-800 p-2.5 rounded-xl border border-amber-200 dark:border-stone-700">
                  <span className="block text-stone-500 dark:text-stone-400 text-[10px]">स्वामी ग्रह</span>
                  <span className="font-bold text-amber-900 dark:text-amber-200">{selectedZone.rulingPlanet}</span>
                </div>
                <div className="bg-amber-50 dark:bg-stone-800 p-2.5 rounded-xl border border-amber-200 dark:border-stone-700">
                  <span className="block text-stone-500 dark:text-stone-400 text-[10px]">अनुकूल रङ्ग</span>
                  <span className="font-bold text-amber-900 dark:text-amber-200">{selectedZone.favorableColor}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-1">
                  विशेषता र प्रभाव
                </h4>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-850 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
                  {selectedZone.characteristics}
                </p>
              </div>

              {/* USAGES GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/50 p-3 rounded-xl space-y-1.5">
                  <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>उपयुक्त / शुभ प्रयोग</span>
                  </h4>
                  <ul className="text-xs text-emerald-900 dark:text-emerald-200 space-y-1 list-disc list-inside">
                    {selectedZone.bestUsages.map((use, idx) => (
                      <li key={idx}>{use}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800/50 p-3 rounded-xl space-y-1.5">
                  <h4 className="text-xs font-bold text-red-800 dark:text-red-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>बर्जित / दोषयुक्त प्रयोग</span>
                  </h4>
                  <ul className="text-xs text-red-900 dark:text-red-200 space-y-1 list-disc list-inside">
                    {selectedZone.avoidUsages.map((avoid, idx) => (
                      <li key={idx}>{avoid}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* DOSHA IMPACT & REMEDIES */}
              <div className="bg-amber-50/80 dark:bg-stone-800/60 border border-amber-200 dark:border-stone-700 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  <span>वैदिक वास्तु उपचार तथा उपायहरू (Vedokta Remedies)</span>
                </div>
                <ul className="text-xs text-stone-700 dark:text-stone-300 space-y-1.5 list-disc list-inside">
                  {selectedZone.remedies.map((rem, idx) => (
                    <li key={idx} className="leading-relaxed">{rem}</li>
                  ))}
                </ul>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODULE 4: DIRECTION DETERMINATION & COMPASS */}
      {/* ========================================================= */}
      {activeSubTab === 'compass' && (
        <div className="space-y-6">
          <VastuDigitalCompass
            activeProfile={activeProfile}
            initialDegree={degree}
            onApplyDirection={(dirCode) => {
              updateCurrentProject((prev) => ({
                ...prev,
                facingDirection: dirCode as any
              }));
              setDegree(degree);
            }}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* MODULE 5: VASTU AUDIT CHECKLIST & AUTOMATED SCORING */}
      {/* ========================================================= */}
      {activeSubTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-6">
            
            {/* ROOM PLACEMENT SELECTION MATRIX */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold font-serif text-red-900 dark:text-amber-300 flex items-center justify-between">
                <span>कोठा तथा संरचनाको अवस्थिति मिलाउनुहोस् ({currentProject.projectName})</span>
                <span className="text-xs font-sans text-stone-500 font-normal">८ वटा मुख्य संरचना परीक्षण</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ROOM_CONFIGS.map((room) => {
                  const currentDir = currentProject.roomPlacements[room.id] || 'NE';
                  const optionDetails = room.options[currentDir] || {
                    directionId: currentDir,
                    rating: 'average',
                    points: 5,
                    remarksNepali: 'सामान्य'
                  };

                  let badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
                  if (optionDetails.rating === 'severe') badgeColor = 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
                  if (optionDetails.rating === 'bad') badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';

                  return (
                    <div
                      key={room.id}
                      className="bg-amber-50/50 dark:bg-stone-800/50 border border-amber-200 dark:border-stone-700 p-4 rounded-xl space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-200">
                          {room.nameNepali}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                          अङ्क: {optionDetails.points}/१०
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-500 dark:text-stone-400 shrink-0">अवस्थित दिशा:</span>
                        <select
                          value={currentDir}
                          onChange={(e) => handlePlacementChange(room.id, e.target.value)}
                          className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-stone-600 bg-white dark:bg-stone-900 cursor-pointer"
                        >
                          {VASTU_ZONES.map((z) => (
                            <option key={z.id} value={z.id}>
                              {z.nameNepali} ({z.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <p className="text-xs text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-900 p-2 rounded-lg border border-stone-200 dark:border-stone-800 leading-relaxed">
                        {optionDetails.remarksNepali}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AUTOMATED VASTU SCORE DISPLAY */}
            <div className={`p-6 rounded-2xl border-2 space-y-4 ${auditResult.gradeColor}`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
                    समग्र वास्तु मूल्याङ्कन नतिजा (Vastu Audit Result)
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black font-serif mt-1">
                    {auditResult.gradeNepali} ({auditResult.percentage}%)
                  </h3>
                  <p className="text-xs font-semibold mt-1 max-w-xl">
                    {auditResult.summaryNepali}
                  </p>
                </div>

                <div className="w-24 h-24 rounded-full bg-white dark:bg-stone-900 border-4 border-current flex flex-col items-center justify-center shadow-lg shrink-0">
                  <span className="text-xs text-stone-500 font-bold">प्राप्ताङ्क</span>
                  <span className="text-xl font-black">{auditResult.totalScore}</span>
                  <span className="text-[10px] text-stone-400">/ {auditResult.maxScore}</span>
                </div>
              </div>

              {/* DOSHAS & REMEDIES SUMMARY */}
              {auditResult.doshas.length > 0 && (
                <div className="bg-white/90 dark:bg-stone-900/90 p-4 rounded-xl border border-red-300 dark:border-red-900 space-y-2 text-stone-900 dark:text-stone-100">
                  <h4 className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>पहिचान भएका वास्तु दोषहरू र समाधान (Identified Doshas & Remedies)</span>
                  </h4>
                  <div className="space-y-2">
                    {auditResult.doshas.map((d, idx) => (
                      <div key={idx} className="text-xs border-b border-stone-200 dark:border-stone-800 pb-2 last:border-none">
                        <strong className="text-red-900 dark:text-red-300">{d.roomName}:</strong> {d.remark}
                        {d.remedy && (
                          <div className="text-emerald-800 dark:text-emerald-300 font-semibold mt-0.5 bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded">
                            💡 तोडफोडविहीन उपचार: {d.remedy}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODULE 6: PANCHATATTVA & ROOM MATRIX */}
      {/* ========================================================= */}
      {activeSubTab === 'panchatattva' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm space-y-6">
            
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-xl font-bold font-serif text-red-900 dark:text-amber-300 flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-600" />
                <span>पञ्चतत्त्व (५ Elements) सन्तुलन चक्र</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                वैदिक वास्तुशास्त्र अनुसार घरमा जल, अग्नि, पृथ्वी, वायु र आकाश तत्त्वको सन्तुलन हुनु अनिवार्य छ।
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { name: 'जल तत्त्व (Water)', dir: 'ईशान / उत्तर', color: 'नीलो / सेतो', icon: Droplets, bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-300' },
                { name: 'अग्नि तत्त्व (Fire)', dir: 'आग्नेय / दक्षिण', color: 'रातो / सुन्तला', icon: Flame, bg: 'bg-red-50 dark:bg-red-950/40 border-red-300' },
                { name: 'पृथ्वी तत्त्व (Earth)', dir: 'नैऋत्य', color: 'पहेँलो / माटो', icon: Mountain, bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-300' },
                { name: 'वायु तत्त्व (Air)', dir: 'वायव्य / पूर्व', color: 'हल्का हरियो / खरानी', icon: Wind, bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300' },
                { name: 'आकाश तत्त्व (Space)', dir: 'ब्रह्मस्थान (केन्द्र)', color: 'खुल्ला / सेतो', icon: Sun, bg: 'bg-stone-50 dark:bg-stone-800 border-stone-300' },
              ].map((t, idx) => {
                const Icon = t.icon;
                return (
                  <div key={idx} className={`p-4 rounded-xl border space-y-2 text-center ${t.bg}`}>
                    <Icon className="w-6 h-6 mx-auto text-stone-700 dark:text-stone-200" />
                    <h3 className="font-bold text-xs text-stone-900 dark:text-stone-100">{t.name}</h3>
                    <p className="text-[10px] text-stone-600 dark:text-stone-400">दिशा: {t.dir}</p>
                    <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300">रङ्ग: {t.color}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-amber-50 dark:bg-stone-800/80 p-4 rounded-xl border border-amber-200 dark:border-stone-700 space-y-2 text-xs text-stone-800 dark:text-stone-200">
              <h4 className="font-bold text-sm text-red-900 dark:text-amber-300">
                घडेरीको आकार वास्तु (Plot Shape Analysis):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-white dark:bg-stone-900 p-3 rounded-lg border border-stone-200 dark:border-stone-800">
                  <strong className="text-emerald-700 dark:text-emerald-400">वर्ग आकार (Square Plot):</strong> लम्बाइ र चौडाइ बराबर (१:१)। अति शुभ, सर्वत्र समृद्धि।
                </div>
                <div className="bg-white dark:bg-stone-900 p-3 rounded-lg border border-stone-200 dark:border-stone-800">
                  <strong className="text-emerald-700 dark:text-emerald-400">आयात आकार (Rectangular Plot):</strong> १:२ सम्मको अनुपात उत्तम। स्वास्थ्य र सुख प्रदान गर्दछ।
                </div>
                <div className="bg-white dark:bg-stone-900 p-3 rounded-lg border border-stone-200 dark:border-stone-800">
                  <strong className="text-amber-700 dark:text-amber-400">गोमुखी घडेरी (Gomukhi Plot):</strong> अगाडि साँघुरो, पछाडि फराकिलो। आवासका लागि अति शुभ।
                </div>
                <div className="bg-white dark:bg-stone-900 p-3 rounded-lg border border-stone-200 dark:border-stone-800">
                  <strong className="text-blue-700 dark:text-blue-400">सिंहमुखी घडेरी (Singhmukhi Plot):</strong> अगाडि फराकिलो, पछाडि साँघुरो। व्यापार र व्यावसायिक भवनका लागि उत्तम।
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODULE 7: PRINTABLE VASTU REPORT & CERTIFICATE            */}
      {/* ========================================================= */}
      {activeSubTab === 'report' && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="flex items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-amber-200 dark:border-stone-800 shadow-xs print:hidden flex-wrap">
            <div className="flex items-center gap-2.5 text-xs text-stone-700 dark:text-stone-300">
              <span className="p-1.5 rounded-lg bg-yellow-100 text-yellow-800 font-bold text-sm">卐</span>
              <div>
                <strong className="text-stone-900 dark:text-stone-100 block">आधिकारिक A4 वास्तु प्रतिवेदन</strong>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  पहेँलो दोहोरो लाइन र बीचमा हरियो स्वस्तिक (卐) को वैदिक बोर्डर सहित
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handlePrint}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95 border border-yellow-600/30"
                title="A4 प्रिन्ट"
              >
                <Printer className="w-4 h-4" />
                <span>प्रिन्ट</span>
              </button>

              {/* Download Dropdown */}
              <div className="relative" ref={reportSectionDownloadRef}>
                <button
                  type="button"
                  onClick={() => setIsReportSectionDownloadOpen((p) => !p)}
                  disabled={isExportingVastuPDF || isExportingVastuPNG}
                  className="bg-[#D97706] hover:bg-[#b45309] text-white font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-60"
                  title="प्रतिवेदन डाउनलोड गर्नुहोस् (PDF / PNG)"
                >
                  {isExportingVastuPDF || isExportingVastuPNG ? (
                    <span className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>डाउनलोड</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isReportSectionDownloadOpen ? 'rotate-180' : ''}`} />
                </button>

                {isReportSectionDownloadOpen && (
                  <div className="absolute right-0 mt-1.5 w-32 bg-white dark:bg-stone-900 border border-amber-500/40 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsReportSectionDownloadOpen(false);
                        handleDownloadVastuPDF();
                      }}
                      disabled={isExportingVastuPDF}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-stone-800 hover:text-amber-700 dark:hover:text-amber-300 transition cursor-pointer text-left"
                    >
                      <FileDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsReportSectionDownloadOpen(false);
                        handleDownloadVastuPNG();
                      }}
                      disabled={isExportingVastuPNG}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-stone-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer text-left border-t border-stone-100 dark:border-stone-800"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>PNG</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Share Dropdown Button */}
              <div className="relative" ref={reportSectionShareRef}>
                <button
                  type="button"
                  onClick={() => setIsReportSectionShareOpen((prev) => !prev)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="सामाजिक सञ्जालमा सेयर गर्नुहोस्"
                >
                  <Share2 className="w-4 h-4" />
                  <span>सेयर</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isReportSectionShareOpen ? 'rotate-180' : ''}`} />
                </button>

                {isReportSectionShareOpen && (
                  <div className="absolute right-0 top-full mt-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xl z-50 py-1 min-w-[170px] overflow-hidden divide-y divide-stone-100 dark:divide-stone-800 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={handleShareVastuWhatsApp}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-emerald-50 dark:hover:bg-stone-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer text-left"
                    >
                      <WhatsAppIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleShareVastuFacebook}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-blue-50 dark:hover:bg-stone-800 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer text-left"
                    >
                      <FacebookIcon className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>Facebook</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleShareVastuMessenger}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-sky-50 dark:hover:bg-stone-800 hover:text-sky-600 dark:hover:text-sky-400 transition cursor-pointer text-left"
                    >
                      <MessengerIcon className="w-4 h-4 text-sky-500 shrink-0" />
                      <span>Messenger</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyVastuShareText}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-stone-800 hover:text-amber-600 dark:hover:text-amber-400 transition cursor-pointer text-left"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>विवरण कपी गर्नुहोस्</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 1-PAGE A4 REPORT CONTAINER */}
          <div className="flex justify-center my-2 overflow-x-auto p-1 bg-stone-100 dark:bg-stone-950/60 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-inner py-6">
            <VastuSinglePageReport
              currentProject={currentProject}
              auditResult={auditResult}
              bhumiEval={bhumiEval}
              orgProfile={orgProfile}
            />
          </div>
        </div>
      )}

        </main>
      </div>

      {/* Delete Project Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                परियोजना हटाउन चाहनुहुन्छ?
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                तपाईं <strong>"{projectToDelete.name}"</strong> वास्तु परियोजना मेटाउन लाग्नुभएको छ। यसका सबै कोठा अडिट तथा विवरणहरू हटाइनेछ।
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={confirmDeleteProject}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                हो, मेटाउनुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Toast Notification */}
      {projectToastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-4 py-3 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{projectToastMessage}</span>
        </div>
      )}

    </div>
  );
};
