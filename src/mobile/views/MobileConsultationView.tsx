import React, { useState } from 'react';
import {
  UserCheck,
  Star,
  Clock,
  Phone,
  Video,
  FileText,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  MessageCircle,
  Plus
} from 'lucide-react';
import {
  MobileAstrologerInfo,
  MobileConsultationBooking,
  MobileUserProfile
} from '../types/mobileJyotishTypes';
import {
  getApprovedMobileAstrologers
} from '../services/mobileAstrologyService';
import {
  getMobileBookings,
  saveMobileBooking
} from '../db/mobileAuthStore';

export const MobileConsultationView: React.FC<{ user: MobileUserProfile | null }> = ({ user }) => {
  const astrologers = getApprovedMobileAstrologers();
  const [bookings, setBookings] = useState<MobileConsultationBooking[]>(getMobileBookings);
  const [selectedAstrologer, setSelectedAstrologer] = useState<MobileAstrologerInfo | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Form states for booking
  const [consultType, setConsultType] = useState<'audio' | 'video' | 'detailed_written'>('audio');
  const [topic, setTopic] = useState('जन्मकुण्डली तथा ग्रह शान्ति परामर्श');
  const [notes, setNotes] = useState('');

  const handleBookAppointment = () => {
    if (!selectedAstrologer) return;
    const newBooking: MobileConsultationBooking = {
      id: `book_${Date.now()}`,
      userId: user?.id || 'usr_mobile_guest',
      astrologerId: selectedAstrologer.id,
      astrologerNameNepali: selectedAstrologer.nameNepali,
      consultationType: consultType,
      topic,
      scheduledDateBS: '२०८१ असोज २०',
      scheduledTime: 'दिनको ११:३० बजे',
      status: 'pending',
      feeNPR:
        consultType === 'audio'
          ? selectedAstrologer.feeAudioCallNPR
          : consultType === 'video'
          ? selectedAstrologer.feeVideoCallNPR
          : selectedAstrologer.feeReportNPR,
      isPaid: false,
      inquiryNotes: notes,
      createdAtISO: new Date().toISOString()
    };

    saveMobileBooking(newBooking);
    setBookings([newBooking, ...bookings]);
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setSelectedAstrologer(null);
    }, 2500);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-stone-800 rounded-2xl p-4 shadow-md">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-amber-400" />
          <h2 className="font-bold text-sm text-stone-100 font-serif">
            प्रत्यक्ष ज्योतिषी परामर्श सेवा
          </h2>
        </div>
        <p className="text-[11px] text-stone-400 mt-1">
          नेपालका वरिष्ठ तथा आधिकारिक वैदिक ज्योतिषाचार्यहरूसँग सिधै संवाद गर्नुहोस्
        </p>
      </div>

      {/* 2. Astrologers List */}
      <div className="space-y-3">
        <h3 className="font-bold text-xs text-stone-300 flex items-center justify-between px-1">
          <span>उपलब्ध ज्योतिषीहरूको सूची</span>
          <span className="text-[10px] text-amber-500 font-mono">Verified Astrologers</span>
        </h3>

        {astrologers.map(astro => (
          <div
            key={astro.id}
            className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3 shadow-md transition-all hover:border-amber-500/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xl shrink-0">
                  {astro.nameNepali[0]}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-stone-100">{astro.nameNepali}</h4>
                    {astro.verifiedBadge && (
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] text-amber-300">{astro.titleNepali}</p>
                  <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-1">
                    <span className="flex items-center gap-0.5 text-yellow-400 font-bold">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{astro.rating}</span>
                    </span>
                    <span>•</span>
                    <span>{astro.experienceYears} वर्ष अनुभव</span>
                  </div>
                </div>
              </div>

              <span className="text-[9px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                आज उपलब्ध
              </span>
            </div>

            {/* Specialties */}
            <div className="flex flex-wrap gap-1">
              {astro.specialtiesNepali.map((s, idx) => (
                <span
                  key={idx}
                  className="text-[10px] bg-stone-950 text-stone-300 px-2 py-0.5 rounded-md border border-stone-800"
                >
                  {s}
                </span>
              ))}
            </div>

            {/* Fees & Action */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-800/80">
              <div className="text-xs">
                <span className="text-[10px] text-stone-400 block">परामर्श शुल्क</span>
                <span className="font-black text-amber-300 font-mono">
                  रु. {astro.feeAudioCallNPR} बाट सुरु
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAstrologer(astro)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
              >
                <span>अपोइन्टमेन्ट लिनुहोस्</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Booking Modal / Dialog */}
      {selectedAstrologer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3">
          <div className="bg-stone-900 border border-amber-500/50 rounded-3xl p-5 w-full max-w-md space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div>
                <h3 className="font-bold text-sm text-stone-100 font-serif">
                  परामर्श अपोइन्टमेन्ट फारम
                </h3>
                <p className="text-[11px] text-amber-300">
                  ज्योतिषी: {selectedAstrologer.nameNepali}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAstrologer(null)}
                className="p-1 text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-bold text-sm text-stone-100">
                  अपोइन्टमेन्ट अनुरोध दर्ता भयो!
                </h4>
                <p className="text-xs text-stone-400">
                  ज्योतिषी सचिवालयबाट तपाईंको फोन/WhatsApp मा सम्पर्क गरी समय निश्चित गरिनेछ।
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-stone-400 mb-1 font-bold">
                    परामर्श माध्यम (Consultation Mode):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setConsultType('audio')}
                      className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        consultType === 'audio'
                          ? 'bg-amber-500 text-stone-950 border-amber-400'
                          : 'bg-stone-950 text-stone-300 border-stone-800'
                      }`}
                    >
                      <Phone className="w-4 h-4 mx-auto mb-1" />
                      <span>अडियो कल</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsultType('video')}
                      className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        consultType === 'video'
                          ? 'bg-amber-500 text-stone-950 border-amber-400'
                          : 'bg-stone-950 text-stone-300 border-stone-800'
                      }`}
                    >
                      <Video className="w-4 h-4 mx-auto mb-1" />
                      <span>भिडियो कल</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsultType('detailed_written')}
                      className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        consultType === 'detailed_written'
                          ? 'bg-amber-500 text-stone-950 border-amber-400'
                          : 'bg-stone-950 text-stone-300 border-stone-800'
                      }`}
                    >
                      <FileText className="w-4 h-4 mx-auto mb-1" />
                      <span>लिखित फलित</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 mb-1 font-bold">
                    परामर्शको मुख्य विषय (Inquiry Topic):
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100"
                  >
                    <option value="जन्मकुण्डली तथा ग्रह शान्ति परामर्श">जन्मकुण्डली तथा ग्रह शान्ति परामर्श</option>
                    <option value="विवाह तथा दाम्पत्य जीवन विश्लेषण">विवाह तथा दाम्पत्य जीवन विश्लेषण</option>
                    <option value="करियर, जागिर तथा व्यवसाय मार्गनिर्देशन">करियर, जागिर तथा व्यवसाय मार्गनिर्देशन</option>
                    <option value="दशा महादशा र आगामी समय फलित">दशा महादशा र आगामी समय फलित</option>
                    <option value="शुभ मुहूर्त तथा मांगलिक कार्य">शुभ मुहूर्त तथा मांगलिक कार्य</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 mb-1 font-bold">
                    थप प्रश्न वा विशेष टिपोट (ऐच्छिक):
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="तपाईंले जान्न चाहेको मुख्य जिज्ञासा यहाँ लेख्नुहोस्..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100"
                  />
                </div>

                <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 block">कुल शुल्क</span>
                    <span className="font-black text-amber-300 text-sm">
                      रु.{' '}
                      {consultType === 'audio'
                        ? selectedAstrologer.feeAudioCallNPR
                        : consultType === 'video'
                        ? selectedAstrologer.feeVideoCallNPR
                        : selectedAstrologer.feeReportNPR}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleBookAppointment}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
                  >
                    अनुरोध पेश गर्नुहोस्
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Previous Booking History */}
      {bookings.length > 0 && (
        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4 space-y-2.5 shadow-md">
          <h4 className="font-bold text-xs text-stone-200 pb-2 border-b border-stone-800">
            तपाईंका अपोइन्टमेन्टहरू (My Appointments)
          </h4>
          <div className="space-y-2">
            {bookings.map(b => (
              <div
                key={b.id}
                className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-amber-200 block">{b.topic}</span>
                  <span className="text-[10px] text-stone-400">
                    ज्योतिषी: {b.astrologerNameNepali} • {b.scheduledDateBS} ({b.scheduledTime})
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  प्रक्रियामा
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
