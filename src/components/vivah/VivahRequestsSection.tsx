import React, { useState } from 'react';
import { 
  Send, 
  Inbox, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Lock, 
  Unlock, 
  Phone, 
  Mail, 
  MessageSquare,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { VivahRequest, VivahProfile, ConnectionRequestStatus } from '../../types/vivahTypes';

interface VivahRequestsSectionProps {
  requests: VivahRequest[];
  currentProfile: VivahProfile | null;
  onUpdateRequestStatus: (requestId: string, newStatus: ConnectionRequestStatus, notes?: string) => void;
  onOpenChatWithUser?: (targetUserId: string, targetName: string) => void;
}

export const VivahRequestsSection: React.FC<VivahRequestsSectionProps> = ({
  requests,
  currentProfile,
  onUpdateRequestStatus,
  onOpenChatWithUser,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'RECEIVED' | 'SENT'>('RECEIVED');

  if (!currentProfile) {
    return (
      <div className="bg-white dark:bg-[#1E1B18] p-8 rounded-3xl border border-[#E6E0D5] text-center space-y-3">
        <UserCheck className="w-12 h-12 text-[#D97706] mx-auto" />
        <h3 className="font-bold font-serif text-lg">कृपया पहिले आफ्नो विवाह प्रोफाइल चयन/दर्ता गर्नुहोस्।</h3>
        <p className="text-xs text-stone-500">अनुरोधहरू व्यवस्थापन गर्न प्रोफाइल सक्रिय हुनुपर्दछ।</p>
      </div>
    );
  }

  const receivedRequests = requests.filter(r => r.receiverProfileId === currentProfile.id || r.receiverUserId === currentProfile.userId);
  const sentRequests = requests.filter(r => r.senderProfileId === currentProfile.id || r.senderUserId === currentProfile.userId);

  const activeList = activeSubTab === 'RECEIVED' ? receivedRequests : sentRequests;

  const getStatusBadge = (status: ConnectionRequestStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> पर्खाइमा (Pending)
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200 text-xs font-bold px-2.5 py-1 rounded-lg border border-sky-300 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> अनुरोध स्वीकृत (Request Accepted)
          </span>
        );
      case 'CONTACT_RELEASE_REQUESTED':
        return (
          <span className="bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200 text-xs font-bold px-2.5 py-1 rounded-lg border border-purple-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> एडमिन स्वीकृति पर्खाइमा (Contact Release Pending)
          </span>
        );
      case 'APPROVED_BY_ADMIN':
        return (
          <span className="bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-300 flex items-center gap-1">
            <Unlock className="w-3.5 h-3.5" /> सम्पर्क खुला गरियो (Contact Shared & Active)
          </span>
        );
      case 'DECLINED':
      case 'REJECTED_BY_ADMIN':
        return (
          <span className="bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 text-xs font-bold px-2.5 py-1 rounded-lg border border-rose-300 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> अस्वीकृत (Declined)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('RECEIVED')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 ${
            activeSubTab === 'RECEIVED'
              ? 'bg-[#D97706] text-white shadow'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>प्राप्त अनुरोधहरू (Received)</span>
          <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px]">
            {receivedRequests.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('SENT')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 ${
            activeSubTab === 'SENT'
              ? 'bg-[#D97706] text-white shadow'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>पठाइएका अनुरोधहरू (Sent)</span>
          <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px]">
            {sentRequests.length}
          </span>
        </button>
      </div>

      {/* Requests List */}
      {activeList.length === 0 ? (
        <div className="bg-white dark:bg-[#1E1B18] p-8 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 text-center space-y-2">
          <Inbox className="w-10 h-10 text-stone-400 mx-auto" />
          <h4 className="font-bold text-stone-700 dark:text-stone-300">कुनै पनि {activeSubTab === 'RECEIVED' ? 'प्राप्त' : 'पठाइएको'} अनुरोध भेटिएन।</h4>
          <p className="text-xs text-stone-500">सुयोग्य जोडी खोजेर विवाह अनुरोध पठाउन सक्नुहुन्छ।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeList.map((req) => {
            const isReceived = activeSubTab === 'RECEIVED';
            const partnerName = isReceived ? req.senderName : req.receiverName;
            const partnerPhoto = isReceived ? req.senderPhoto : req.receiverPhoto;

            return (
              <div
                key={req.id}
                className="bg-white dark:bg-[#1E1B18] p-5 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={partnerPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'}
                      alt={partnerName}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/40"
                    />
                    <div>
                      <h3 className="font-bold text-base font-serif text-stone-900 dark:text-stone-100">
                        {partnerName}
                      </h3>
                      <p className="text-xs text-stone-500">
                        मिति: {new Date(req.createdAt).toLocaleDateString('ne-NP')}
                      </p>
                    </div>
                  </div>

                  <div>{getStatusBadge(req.status)}</div>
                </div>

                {req.initialMessage && (
                  <p className="bg-stone-50 dark:bg-stone-900/60 p-3 rounded-xl border border-stone-200 dark:border-stone-800 text-xs italic text-stone-700 dark:text-stone-300">
                    "{req.initialMessage}"
                  </p>
                )}

                {/* Status-based Action Controls */}
                <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  {/* Status: PENDING */}
                  {req.status === 'PENDING' && isReceived && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => onUpdateRequestStatus(req.id, 'ACCEPTED')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl shadow transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>अनुरोध स्वीकार गर्नुहोस्</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateRequestStatus(req.id, 'DECLINED')}
                        className="bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold py-2 px-4 rounded-xl transition-colors"
                      >
                        अस्वीकार
                      </button>
                    </div>
                  )}

                  {/* Status: ACCEPTED */}
                  {req.status === 'ACCEPTED' && (
                    <div className="flex flex-wrap items-center justify-between w-full gap-2 bg-amber-50/80 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800/60">
                      <div className="text-amber-900 dark:text-amber-200 font-medium">
                        दुवै पक्षले विवाह अनुरोध स्वीकार गर्नुभएको छ। सम्पर्क सेयरिङका लागि एडमिन स्वीकृति पठाउनुहोस्।
                      </div>
                      <button
                        type="button"
                        onClick={() => onUpdateRequestStatus(req.id, 'CONTACT_RELEASE_REQUESTED')}
                        className="bg-[#D97706] hover:bg-[#B45309] text-white font-bold py-2 px-4 rounded-xl shadow transition-colors shrink-0"
                      >
                        सम्पर्क खुला गर्न अनुरोध पठाउनुहोस्
                      </button>
                    </div>
                  )}

                  {/* Status: APPROVED_BY_ADMIN */}
                  {req.status === 'APPROVED_BY_ADMIN' && (
                    <div className="w-full space-y-2 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <Unlock className="w-4 h-4 text-emerald-600" />
                          सम्पर्क खुला गरिएको छ (Contact Permitted)
                        </span>
                        {onOpenChatWithUser && (
                          <button
                            type="button"
                            onClick={() => onOpenChatWithUser(isReceived ? req.senderUserId : req.receiverUserId, partnerName)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 shadow"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>सुरक्षित च्याट खोल्नुहोस्</span>
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-800 dark:text-stone-200 font-mono text-xs pt-1">
                        <div>फोन नम्बर: {isReceived ? req.senderPhone : req.receiverPhone}</div>
                        <div>गोपनीयता प्रमाणीकरण: एडमिनद्वारा स्वीकृत</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
