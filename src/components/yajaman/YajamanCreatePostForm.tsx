import React, { useState } from 'react';
import { 
  PlusCircle, 
  Image as ImageIcon, 
  MapPin, 
  Calendar, 
  Clock, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Info,
  X
} from 'lucide-react';
import { YajamanPost, ServiceCategory } from '../../types/yajamanTypes';
import { saveYajamanPost, getStoredServiceCategories, logYajamanAction } from '../../db/yajamanStore';
import { convertADToBS } from '../../utils/nepaliCalendar';

interface YajamanCreatePostFormProps {
  currentUserId: string;
  currentUserName: string;
  currentUserPhoto?: string;
  currentUserRole?: string;
  currentUserPhone?: string;
  currentUserEmail?: string;
  currentUserDistrict?: string;
  currentUserLocalLevel?: string;
  isVerified?: boolean;
  onPostCreated: (newPost: YajamanPost) => void;
  onCancel: () => void;
}

export const YajamanCreatePostForm: React.FC<YajamanCreatePostFormProps> = ({
  currentUserId,
  currentUserName,
  currentUserPhoto,
  currentUserRole = 'PANDIT',
  currentUserPhone = '९८४१००००००',
  currentUserEmail = 'service@gmail.com',
  currentUserDistrict = 'काठमाडौँ',
  currentUserLocalLevel = 'काठमाडौँ महानगरपालिका',
  isVerified = false,
  onPostCreated,
  onCancel,
}) => {
  const categories = getStoredServiceCategories();

  const [title, setTitle] = useState('');
  const [categoryCode, setCategoryCode] = useState(categories[0]?.code || 'grihapravesh');
  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState(currentUserDistrict);
  const [localLevel, setLocalLevel] = useState(currentUserLocalLevel);
  const [availableDates, setAvailableDates] = useState('');
  const [availableTimes, setAvailableTimes] = useState('');
  const [estimatedFee, setEstimatedFee] = useState('');
  const [requiredSamagri, setRequiredSamagri] = useState('');
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1609137144822-0a13d7890b0e?auto=format&fit=crop&q=80&w=600'
  ]);
  const [agreeRules, setAgreeRules] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPhoto = () => {
    if (photoUrlInput.trim() && !photos.includes(photoUrlInput.trim())) {
      setPhotos([...photos, photoUrlInput.trim()]);
      setPhotoUrlInput('');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !agreeRules) return;

    setIsSubmitting(true);

    const today = new Date().toISOString().split('T')[0];
    const bs = convertADToBS(today);
    const dateBS = `${bs.year}-${bs.month.toString().padStart(2, '0')}-${bs.day.toString().padStart(2, '0')}`;

    const selectedCategory = categories.find(c => c.code === categoryCode);

    // Mask phone & email for public preview
    const phoneClean = currentUserPhone.replace(/\s+/g, '');
    const maskedPhone = phoneClean.length >= 6 
      ? `${phoneClean.slice(0, 4)}******` 
      : '९८४१******';

    const emailParts = currentUserEmail.split('@');
    const maskedEmail = emailParts.length === 2
      ? `${emailParts[0].slice(0, 3)}***@${emailParts[1]}`
      : '***@gmail.com';

    const newPost: YajamanPost = {
      id: `yp_post_${Date.now()}`,
      authorId: currentUserId,
      authorName: currentUserName,
      authorPhoto: currentUserPhoto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
      authorRole: (currentUserRole as any) || 'PANDIT',
      isVerified,
      title: title.trim(),
      description: description.trim(),
      serviceType: serviceType.trim() || selectedCategory?.nameNepali || 'धार्मिक कर्मकाण्ड',
      categoryCode,
      categoryNameNepali: selectedCategory?.nameNepali || 'धार्मिक सेवा',
      district: district || 'काठमाडौँ',
      localLevel: localLevel || '',
      availableDates: availableDates.trim() || 'छलफल अनुसार',
      availableTimes: availableTimes.trim() || 'सल्लाह बमोजिम',
      estimatedFee: estimatedFee.trim() || 'शास्त्रीय दक्षिणा (पारस्परिक समझदारी)',
      requiredSamagri: requiredSamagri.trim() || 'नियमित पूजा सामग्री',
      photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1609137144822-0a13d7890b0e?auto=format&fit=crop&q=80&w=600'],
      likesCount: 0,
      likedUserIds: [],
      sharesCount: 0,
      savedUserIds: [],
      commentsCount: 0,
      comments: [],
      contactPreference: 'यजमान सेवा पोर्टल अनुरोध',
      contactPhoneMasked: maskedPhone,
      contactEmailMasked: maskedEmail,
      visibility: 'PUBLIC',
      status: 'APPROVED', // Auto approved for verified / logged in user or admin moderation
      isFeatured: false,
      createdAtBS: dateBS,
      createdAtTimestamp: Date.now(),
    };

    saveYajamanPost(newPost);
    logYajamanAction(currentUserId, currentUserName, 'CREATE_POST', 'POST', newPost.id, `नयाँ पोस्ट सिर्जना गरियो: ${newPost.title}`);

    setTimeout(() => {
      setIsSubmitting(false);
      onPostCreated(newPost);
    }, 500);
  };

  return (
    <div className="bg-white dark:bg-[#1E1B18] rounded-3xl border border-amber-200 dark:border-stone-700 shadow-xl p-5 sm:p-8 space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/60 text-[#7A1C1C] dark:text-amber-400 rounded-2xl">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
              नयाँ सेवा वा अनुष्ठान पोस्ट सिर्जना गर्नुहोस्
            </h2>
            <p className="text-xs text-stone-500">
              यजमान तथा समुदायसँग आफ्नो धार्मिक, वैदिक वा ज्योतिष सेवा साझा गर्नुहोस्
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Post Title */}
        <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
            पोस्टको मुख्य शीर्षक <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="उदा. आगामी शुभ मुहूर्तमा गृहप्रवेश तथा वास्तुशान्ति पूजा सेवा"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-4 py-2.5 text-sm text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        {/* Category & Service Type Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              सेवा वर्गीकरण (Category) <span className="text-rose-600">*</span>
            </label>
            <select
              value={categoryCode}
              onChange={(e) => {
                setCategoryCode(e.target.value);
                const found = categories.find(c => c.code === e.target.value);
                if (found && !serviceType) setServiceType(found.nameNepali);
              }}
              className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.code}>
                  {cat.nameNepali}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              विशिष्ट सेवा प्रकार (Specific Service)
            </label>
            <input
              type="text"
              placeholder="उदा. वास्तुशान्ति, रुद्री, कुलपूजा, सत्यनारायण आदि"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
            सेवा तथा संकल्पको पूर्ण विवरण <span className="text-rose-600">*</span>
          </label>
          <textarea
            rows={4}
            required
            placeholder="शास्त्रीय विधि, प्रक्रिया, अनुभव, सेवाको विशेषता र यजमानलाई आवश्यक पर्ने जानकारी खुलाएर लेख्नुहोस्..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl p-3.5 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
          />
        </div>

        {/* Location Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              जिल्ला (District)
            </label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              स्थानीय तह वा क्षेत्र (Local Level)
            </label>
            <input
              type="text"
              value={localLevel}
              placeholder="उदा. काठमाडौँ महानगरपालिका / वडा नं. ३"
              onChange={(e) => setLocalLevel(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Availability & Dakshina Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              उपलब्ध मिति / दिन
            </label>
            <input
              type="text"
              placeholder="उदा. फागुन १ देखि १५ गतेसम्म"
              value={availableDates}
              onChange={(e) => setAvailableDates(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              समय तालिका (Time Slots)
            </label>
            <input
              type="text"
              placeholder="उदा. बिहान ०६:३० देखि दिउँसो ०१:००"
              value={availableTimes}
              onChange={(e) => setAvailableTimes(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              अनुमानित दक्षिणा / शुल्क
            </label>
            <input
              type="text"
              placeholder="उदा. शास्त्रीय दक्षिणा वा पारस्परिक"
              value={estimatedFee}
              onChange={(e) => setEstimatedFee(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Required Samagri */}
        <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
            पूजा/अनुष्ठानका लागि आवश्यक मुख्य सामग्रीहरू
          </label>
          <input
            type="text"
            placeholder="उदा. पञ्चामृत, तील, कुश, दुबो, हवन सामग्री, कलश, रक्तवस्त्र"
            value={requiredSamagri}
            onChange={(e) => setRequiredSamagri(e.target.value)}
            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        {/* Photos Management */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
            तस्बिरहरू (Photos / Image URLs)
          </label>
          
          <div className="flex items-center gap-2">
            <input
              type="url"
              placeholder="तस्बिरको URL लिङ्क राख्नुहोस्..."
              value={photoUrlInput}
              onChange={(e) => setPhotoUrlInput(e.target.value)}
              className="flex-1 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddPhoto}
              disabled={!photoUrlInput.trim()}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              तस्बिर थप्नुहोस्
            </button>
          </div>

          {photos.length > 0 && (
            <div className="flex items-center gap-3 overflow-x-auto py-2">
              {photos.map((ph, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-amber-300 shrink-0 group">
                  <img src={ph} alt={`photo-${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                    title="हटाउनुहोस्"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Privacy & Safety Note */}
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-stone-800/60 border border-amber-200 dark:border-stone-700 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#7A1C1C] dark:text-amber-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>गोपनीयता र सुरक्षा नीति</span>
          </div>
          <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
            तपाईंको फोन नम्बर र व्यक्तिगत इमेल सार्वजनिक फिडमा सिधै देखिने छैन (Masked रहनेछ)। यजमानले सेवा अनुरोध पठाएर तपाईंले स्वीकार गरेपछि मात्र सम्पर्क आदानप्रदान हुनेछ।
          </p>
        </div>

        {/* Agreement Checkbox */}
        <label className="flex items-start gap-2.5 text-xs text-stone-700 dark:text-stone-300 cursor-pointer pt-1">
          <input
            type="checkbox"
            required
            checked={agreeRules}
            onChange={(e) => setAgreeRules(e.target.checked)}
            className="mt-0.5 rounded text-[#7A1C1C] focus:ring-amber-500 w-4 h-4 cursor-pointer"
          />
          <span>
            म यो सेवा/पोस्ट सही, तथ्यपरक तथा सनातन शास्त्रीय मर्यादा अनुरूप रहेको प्रमाणित गर्दछु र यजमान सेवा पोर्टलका नियम तथा सर्तहरू पालना गर्न मञ्जुर छु।
          </span>
        </label>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
          >
            रद्द गर्नुहोस्
          </button>

          <button
            type="submit"
            disabled={!agreeRules || isSubmitting}
            className="flex items-center gap-2 bg-[#7A1C1C] hover:bg-[#9B2C2C] disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all text-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isSubmitting ? 'प्रकाशन हुँदैछ...' : 'पोस्ट प्रकाशित गर्नुहोस्'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
