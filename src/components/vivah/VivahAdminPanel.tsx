import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Unlock, 
  Lock, 
  Clock, 
  Award, 
  Eye, 
  Search,
  Activity,
  History,
  Check,
  Ban,
  FileCheck,
  Maximize2
} from 'lucide-react';
import { 
  VivahProfile, 
  VivahAdvertisement, 
  VivahRequest, 
  VivahReport, 
  VivahAuditLog,
  ConnectionRequestStatus 
} from '../../types/vivahTypes';

interface VivahAdminPanelProps {
  profiles: VivahProfile[];
  advertisements: VivahAdvertisement[];
  requests: VivahRequest[];
  reports: VivahReport[];
  auditLogs: VivahAuditLog[];
  onApproveAd: (adId: string) => void;
  onRejectAd: (adId: string, reason: string) => void;
  onVerifyProfile: (profileId: string) => void;
  onApproveContactRelease: (requestId: string) => void;
  onResolveReport: (reportId: string, notes: string) => void;
}

export const VivahAdminPanel: React.FC<VivahAdminPanelProps> = ({
  profiles,
  advertisements,
  requests,
  reports,
  auditLogs,
  onApproveAd,
  onRejectAd,
  onVerifyProfile,
  onApproveContactRelease,
  onResolveReport,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'METRICS' | 'ADS' | 'VERIFICATIONS' | 'CONTACT_RELEASES' | 'REPORTS' | 'AUDIT'>('METRICS');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);

  const pendingAds = advertisements.filter(a => a.status === 'PENDING_REVIEW');
  const pendingVerifications = profiles.filter(p => p.verificationStatus === 'PENDING' || (p.idDocumentUrl && p.verificationLevel !== 'ADMIN_VERIFIED'));
  const pendingContactReleases = requests.filter(r => r.status === 'CONTACT_RELEASE_REQUESTED');
  const openReports = reports.filter(r => r.status === 'OPEN' || r.status === 'UNDER_REVIEW');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-950 text-white p-6 rounded-3xl border border-stone-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-3 py-0.5 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>विवाह मोडरेटर र एडमिन कन्ट्रोल (Marriage Admin Dashboard)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-100">
            विवाह प्रणाली एडमिन सुपरभिजन (Admin Supervision)
          </h2>
          <p className="text-xs text-stone-300">
            विवाह विज्ञापन स्वीकृति, प्रोफाइल प्रमाणीकरण, सम्पर्क सेयरिङ नियन्त्रण र उजुरी व्यवस्थापन।
          </p>
        </div>
      </div>

      {/* Admin Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setActiveAdminTab('METRICS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'METRICS' ? 'bg-[#D97706] text-white shadow' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>तथ्याङ्क (Analytics)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('ADS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'ADS' ? 'bg-[#D97706] text-white shadow' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>विवाह विज्ञापन स्वीकृति ({pendingAds.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('VERIFICATIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'VERIFICATIONS' ? 'bg-[#D97706] text-white shadow' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>प्रोफाइल प्रमाणीकरण ({pendingVerifications.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('CONTACT_RELEASES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'CONTACT_RELEASES' ? 'bg-[#D97706] text-white shadow' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
          }`}
        >
          <Unlock className="w-4 h-4" />
          <span>सम्पर्क सेयर स्वीकृति ({pendingContactReleases.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('REPORTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'REPORTS' ? 'bg-[#D97706] text-white shadow' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>उजुरी/केस ({openReports.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('AUDIT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'AUDIT' ? 'bg-[#D97706] text-white shadow' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
          }`}
        >
          <History className="w-4 h-4" />
          <span>अडिट लग (Audit Logs)</span>
        </button>
      </div>

      {/* Analytics Overview Tab */}
      {activeAdminTab === 'METRICS' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1E1B18] p-4 rounded-2xl border border-[#E6E0D5] dark:border-stone-800">
            <span className="text-xs text-stone-500 block">कुल वर/वधू प्रोफाइलहरू</span>
            <span className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 font-serif">{profiles.length}</span>
          </div>
          <div className="bg-white dark:bg-[#1E1B18] p-4 rounded-2xl border border-[#E6E0D5] dark:border-stone-800">
            <span className="text-xs text-stone-500 block">प्रमाणित प्रोफाइलहरू</span>
            <span className="text-2xl font-extrabold text-emerald-600 font-serif">
              {profiles.filter(p => p.verificationLevel === 'ADMIN_VERIFIED').length}
            </span>
          </div>
          <div className="bg-white dark:bg-[#1E1B18] p-4 rounded-2xl border border-[#E6E0D5] dark:border-stone-800">
            <span className="text-xs text-stone-500 block">सक्रिय विज्ञापनहरू</span>
            <span className="text-2xl font-extrabold text-[#D97706] font-serif">
              {advertisements.filter(a => a.status === 'APPROVED').length}
            </span>
          </div>
          <div className="bg-white dark:bg-[#1E1B18] p-4 rounded-2xl border border-[#E6E0D5] dark:border-stone-800">
            <span className="text-xs text-stone-500 block">सम्पर्क सेयर गरिएका सम्बन्धहरू</span>
            <span className="text-2xl font-extrabold text-sky-600 font-serif">
              {requests.filter(r => r.status === 'APPROVED_BY_ADMIN').length}
            </span>
          </div>
        </div>
      )}

      {/* Ads Review Tab */}
      {activeAdminTab === 'ADS' && (
        <div className="space-y-4">
          {pendingAds.length === 0 ? (
            <div className="bg-white dark:bg-[#1E1B18] p-8 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 text-center text-xs text-stone-500">
              स्वीकृतिको लागि कुनै पनि नयाँ विवाह विज्ञापन पेन्डिङ छैन।
            </div>
          ) : (
            pendingAds.map((ad) => (
              <div key={ad.id} className="bg-white dark:bg-[#1E1B18] p-5 rounded-2xl border border-amber-300 shadow-sm space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                    {ad.gender === 'GROOM' ? 'वर विज्ञापन' : 'वधू विज्ञापन'} | {ad.adCode}
                  </span>
                  <span className="text-stone-400">मिति: {new Date(ad.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="font-bold text-base font-serif">{ad.candidateName}</h4>
                <p><strong>शिक्षा/पेशा:</strong> {ad.education} ({ad.profession})</p>
                <p><strong>परिवार:</strong> {ad.familySummary}</p>
                <p><strong>अपेक्षा:</strong> {ad.partnerExpectations}</p>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => onApproveAd(ad.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl shadow"
                  >
                    स्वीकृत गर्नुहोस् (Approve)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const reason = prompt('अस्वीकार गर्नुको कारण लेख्नुहोस्:');
                      if (reason) onRejectAd(ad.id, reason);
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-xl shadow"
                  >
                    अस्वीकार गर्नुहोस् (Reject)
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Verifications Review Tab */}
      {activeAdminTab === 'VERIFICATIONS' && (
        <div className="space-y-4">
          {profiles.filter(p => p.verificationLevel !== 'ADMIN_VERIFIED').map((p) => (
            <div key={p.id} className="bg-white dark:bg-[#1E1B18] p-4 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4 text-xs">
              <div>
                <h4 className="font-bold text-sm">{p.userFullName} ({p.displayFirstName})</h4>
                <p className="text-stone-500">{p.profileCode} | {p.currentDistrict} | {p.contactPhone}</p>
                {p.idDocumentUrl && (
                  <div className="pt-1.5 flex items-center gap-2">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" />
                      {p.idDocumentType || 'परिचयपत्र कागजात'} पेश भएको छ
                    </span>
                    {(p.idDocumentUrl.startsWith('data:image') || p.idDocumentUrl.startsWith('http')) && (
                      <a
                        href={p.idDocumentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-600 underline font-semibold flex items-center gap-0.5 hover:text-amber-800"
                      >
                        <Maximize2 className="w-3 h-3" />
                        हेर्नुहोस् (Open)
                      </a>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => onVerifyProfile(p.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl shadow shrink-0"
              >
                प्रमाणीकरण स्वीकृत गर्नुहोस् (Grant Verified Badge)
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Contact Release Approvals Tab */}
      {activeAdminTab === 'CONTACT_RELEASES' && (
        <div className="space-y-4">
          {pendingContactReleases.length === 0 ? (
            <div className="bg-white dark:bg-[#1E1B18] p-8 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 text-center text-xs text-stone-500">
              सम्पर्क सेयरिङ स्वीकृतिका लागि कुनै पेन्डिङ अनुरोध छैन।
            </div>
          ) : (
            pendingContactReleases.map((req) => (
              <div key={req.id} className="bg-white dark:bg-[#1E1B18] p-5 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-sm">{req.senderName} ↔ {req.receiverName}</h4>
                  <p className="text-stone-500">दुवै पक्षबाट विवाह अनुरोध स्वीकृत भई सम्पर्क खुला गर्ने सहमति प्राप्त भएको छ।</p>
                </div>

                <button
                  type="button"
                  onClick={() => onApproveContactRelease(req.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl shadow shrink-0 flex items-center gap-1.5"
                >
                  <Unlock className="w-4 h-4" />
                  <span>सम्पर्क सेयरिङ स्वीकृत (Release Contact Info)</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Audit Log Tab */}
      {activeAdminTab === 'AUDIT' && (
        <div className="bg-white dark:bg-[#1E1B18] p-5 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 space-y-3 text-xs">
          <h4 className="font-bold font-serif text-sm">प्रणाली अडिट लग (System Audit Logs)</h4>
          <div className="space-y-2">
            {auditLogs.length === 0 ? (
              <p className="text-stone-400">अडिट लग खाली छ।</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-2.5 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center justify-between font-mono">
                  <span>[{new Date(log.timestamp).toLocaleTimeString()}] <strong>{log.actorName}:</strong> {log.action} - {log.details}</span>
                  <span className="text-[10px] text-stone-400">{log.targetType}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
