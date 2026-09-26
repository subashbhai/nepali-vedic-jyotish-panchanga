import React, { useState } from 'react';
import { Calendar, Clock, MapPin, DollarSign, FileText, Send, X, ShieldCheck, Paperclip, Navigation } from 'lucide-react';
import { LocationCoordinates, ServiceCategory, ServiceProvider, ServiceRequest, YajamanUser } from '../../types/yajamanTypes';
import { addNotification, generateBookingCode, getCurrentDateBS, getStoredServiceRequests, saveServiceRequests } from '../../db/yajamanStore';
import { DEFAULT_NEPAL_LOCATION } from '../../utils/geoUtils';

interface ServiceRequestModalProps {
  categories: ServiceCategory[];
  preSelectedProvider?: ServiceProvider | null;
  activeYajaman: YajamanUser | null;
  onClose: () => void;
  onSuccess: (request: ServiceRequest) => void;
}

export const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({
  categories,
  preSelectedProvider,
  activeYajaman,
  onClose,
  onSuccess,
}) => {
  const [yajamanName, setYajamanName] = useState(activeYajaman?.fullName || '');
  const [yajamanMobile, setYajamanMobile] = useState(activeYajaman?.mobile || '');
  const [yajamanEmail, setYajamanEmail] = useState(activeYajaman?.email || '');

  const [selectedCatId, setSelectedCatId] = useState(preSelectedProvider?.categories[0] || categories[0]?.id || 'cat_jyotish');
  const [serviceType, setServiceType] = useState(preSelectedProvider?.expertise[0] || 'गृहप्रवेश तथा वास्तुशान्ति पूजा');
  const [eventType, setEventType] = useState('वार्षिक पारिवारिक धार्मिक अनुष्ठान');

  const [preferredDateBS, setPreferredDateBS] = useState(getCurrentDateBS());
  const [preferredTime, setPreferredTime] = useState('बिहान ०८:०० बजे');

  const [district, setDistrict] = useState(activeYajaman?.district || 'काठमाडौँ');
  const [localLevel, setLocalLevel] = useState(activeYajaman?.localLevel || 'काठमाडौँ महानगरपालिका');
  const [addressName, setAddressName] = useState(activeYajaman?.address || 'काठमाडौँ');

  const [notes, setNotes] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState<number | undefined>(5000);

  const [attachment, setAttachment] = useState<{ url: string; name: string } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const handleAutoLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          setAddressName(`GPS Coordinates: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        },
        () => {
          setIsLocating(false);
          alert('GPS स्थान प्राप्त गर्न सकिएन।');
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachment({
        url: ev.target?.result as string,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yajamanName || !yajamanMobile) {
      alert('कृपया नाम र सम्पर्क नम्बर भर्नुहोस्।');
      return;
    }

    const selectedCat = categories.find((c) => c.id === selectedCatId);

    const location: LocationCoordinates = {
      latitude: activeYajaman?.location?.latitude || DEFAULT_NEPAL_LOCATION.latitude,
      longitude: activeYajaman?.location?.longitude || DEFAULT_NEPAL_LOCATION.longitude,
      addressName,
      district,
      localLevel,
    };

    const newReq: ServiceRequest = {
      id: `req_${Date.now()}`,
      bookingCode: generateBookingCode(),
      yajamanId: activeYajaman?.id || `yaj_${Date.now()}`,
      yajamanName,
      yajamanMobile,
      yajamanEmail,
      categoryId: selectedCatId,
      categoryNameNepali: selectedCat?.nameNepali || 'वैदिक सेवा',
      serviceType,
      eventType,
      preferredDateBS,
      preferredTime,
      location,
      additionalNotes: notes,
      specialRequirements,
      estimatedBudget,
      attachmentUrl: attachment?.url,
      attachmentName: attachment?.name,
      status: 'REQUESTED',
      currentRadiusKm: 3, // Initial radius step
      offeredProviderIds: preSelectedProvider ? [preSelectedProvider.id] : [],
      rejectedProviderIds: [],
      createdAtBS: getCurrentDateBS(),
      createdTimestamp: Date.now(),
      updatedTimestamp: Date.now(),
    };

    const allReqs = getStoredServiceRequests();
    saveServiceRequests([newReq, ...allReqs]);

    // Send Notification to Pre-selected Provider or Admin
    if (preSelectedProvider) {
      addNotification(
        preSelectedProvider.id,
        'PROVIDER',
        'नयाँ यजमान सेवा अनुरोध प्राप्त भयो!',
        `यजमान ${yajamanName} ले '${serviceType}' सेवाका लागि नयाँ अनुरोध पठाउनुभएको छ।`,
        undefined,
        newReq.id
      );
    }

    onSuccess(newReq);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-xl w-full p-6 text-stone-200 shadow-2xl my-8 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div>
            <h3 className="font-bold text-stone-100 text-lg flex items-center gap-2">
              <span>वैदिक सेवा अनुरोध गर्नुहोस्</span>
              {preSelectedProvider && (
                <span className="text-xs font-serif text-amber-400 font-normal">({preSelectedProvider.fullName})</span>
              )}
            </h3>
            <p className="text-xs text-stone-400">
              सेवा प्रदायकले अनुरोध स्वीकार गरेपछि मात्र तपाईंको प्रत्यक्ष फोन/सम्पर्कUnlocked हुनेछ।
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-stone-800 rounded-xl text-stone-400 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Privacy Security Note */}
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl flex items-center gap-2 text-emerald-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>गोपनीयता ग्यारेन्टी: तपाईंको सम्पर्क नम्बर केवल सेवा स्वीकार गर्ने सम्बन्धित विशेषज्ञलाई मात्र उपलब्ध हुनेछ।</span>
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-300 mb-1">यजमानको पूरा नाम *</label>
              <input
                type="text"
                required
                value={yajamanName}
                onChange={(e) => setYajamanName(e.target.value)}
                placeholder="उदा: रामप्रसाद शर्मा"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-300 mb-1">मोबाइल/सम्पर्क नम्बर *</label>
              <input
                type="text"
                required
                value={yajamanMobile}
                onChange={(e) => setYajamanMobile(e.target.value)}
                placeholder="९८४१००००००"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Service Category & Specific Service */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-300 mb-1">सेवा विधा (Service Category)</label>
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nameNepali}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-stone-300 mb-1">आवश्यक सेवा / कार्यविधि *</label>
              <input
                type="text"
                required
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                placeholder="उदा: गृहप्रवेश, रुद्री पाठ, जन्मकुण्डली निर्माण"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>कार्यक्रम हुने मिति (BS)</span>
              </label>
              <input
                type="text"
                required
                value={preferredDateBS}
                onChange={(e) => setPreferredDateBS(e.target.value)}
                placeholder="२०८३ वैशाख १५"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>समय</span>
              </label>
              <input
                type="text"
                required
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                placeholder="बिहान ०७:३० बजे"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>स्थान र ठेगाना</span>
              </label>
              <button
                type="button"
                onClick={handleAutoLocation}
                disabled={isLocating}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Navigation className="w-3 h-3" />
                <span>{isLocating ? 'स्थान पत्ता लगाउँदै...' : 'GPS Auto-Detect'}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="जिल्ला"
                className="bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                value={localLevel}
                onChange={(e) => setLocalLevel(e.target.value)}
                placeholder="स्थानीय तह"
                className="bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                value={addressName}
                onChange={(e) => setAddressName(e.target.value)}
                placeholder="टोल / मुख्य ठेगाना"
                className="bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Budget & File Attachment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-300 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>अनुमानित बजेट (रु. Optional)</span>
              </label>
              <input
                type="number"
                value={estimatedBudget || ''}
                onChange={(e) => setEstimatedBudget(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="५०००"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-300 mb-1 flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5 text-sky-400" />
                <span>कागजात / फोटो (Optional)</span>
              </label>
              <input
                type="file"
                onChange={handleFileUpload}
                accept="image/*,.pdf"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-1 text-[11px] text-stone-300 file:bg-stone-800 file:text-stone-200 file:border-none file:rounded-lg file:px-2 file:py-1 file:cursor-pointer"
              />
            </div>
          </div>

          {/* Notes & Special Requirements */}
          <div>
            <label className="block font-bold text-stone-300 mb-1">विशेष आवश्यकता तथा टिप्पणी</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="पूजाका लागि आवश्यक सामग्री वा विशेष निर्देशन भए उल्लेख गर्नुहोस्..."
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Submit Action */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>सेवा अनुरोध पठाउनुहोस् (Send Request)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl cursor-pointer"
            >
              रद्द
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
