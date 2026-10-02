/**
 * Vastu Core — Report Module
 * Generates formatted data for print and PDF export with:
 * "बालानन्द वैदिक वास्तु सेवा" (Balananda Vedic Vastu Sewa)
 */

import { VastuAnalysisResult, RoomPlacementEntry } from './vastuAnalysis';
import { VastuPrimaryDirection, getVastuDirectionByCode } from './vastuDirections';
import { VASTU_ROOM_CATEGORIES } from './vastuRules';

export interface VastuProjectMetadata {
  id: string;
  projectName: string;
  ownerName: string;
  propertyType: 'आवासीय घर' | 'व्यापारिक भवन' | 'कार्यालय' | 'घडेरी / प्लट';
  facingDirection: VastuPrimaryDirection;
  address: string;
  contactNumber?: string;
  plotDimensions?: string;
  constructionStatus?: 'प्रस्तावित (नक्सा)' | 'निर्माणाधीन' | 'बनेको पुरानो घर';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormattedVastuReportData {
  branding: {
    title: string;
    subtitle: string;
    organization: string;
    sealText: string;
    generatedAtNepali: string;
  };
  project: VastuProjectMetadata;
  analysis: VastuAnalysisResult;
  roomPlacements: Array<{
    roomId: string;
    roomName: string;
    directionCode: string;
    directionName: string;
    status: string;
    statusColor: string;
  }>;
}

export function compileVastuReportData(
  project: VastuProjectMetadata,
  placements: RoomPlacementEntry[],
  analysis: VastuAnalysisResult
): FormattedVastuReportData {
  const roomPlacements = placements.map((p) => {
    const cat = VASTU_ROOM_CATEGORIES.find((c) => c.id === p.roomId);
    const dir = getVastuDirectionByCode(p.direction);
    const rule = cat?.directionRules[p.direction];

    let status = 'मध्यम अनुकूल';
    let statusColor = 'text-stone-700 bg-stone-100';

    if (rule?.rating === 'excellent') {
      status = 'सर्वोत्कृष्ट (A+)';
      statusColor = 'text-emerald-700 bg-emerald-50';
    } else if (rule?.rating === 'good') {
      status = 'शुभ (A)';
      statusColor = 'text-teal-700 bg-teal-50';
    } else if (rule?.rating === 'bad') {
      status = 'दोषयुक्त (C)';
      statusColor = 'text-amber-800 bg-amber-50';
    } else if (rule?.rating === 'severe') {
      status = 'गम्भीर दोष (D)';
      statusColor = 'text-rose-700 bg-rose-50';
    }

    return {
      roomId: p.roomId,
      roomName: p.customName || cat?.nameNepali || p.roomId,
      directionCode: p.direction,
      directionName: dir.nameNepali,
      status,
      statusColor,
    };
  });

  return {
    branding: {
      title: 'बालानन्द वैदिक वास्तु सेवा',
      subtitle: 'शास्त्रोक्त गृह वास्तु तथा पञ्चमहाभूत सन्तुलन विश्लेषण प्रतिवेदन',
      organization: 'बालानन्द वैदिक ज्योतिष तथा वास्तु अनुसन्धान केन्द्र',
      sealText: 'वैदिक वास्तु शास्त्र सम्मत • तोडफोडरहित प्राकृतिक उपचार',
      generatedAtNepali: new Date().toLocaleDateString('ne-NP'),
    },
    project,
    analysis,
    roomPlacements,
  };
}
