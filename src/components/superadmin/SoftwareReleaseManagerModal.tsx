import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Laptop,
  Smartphone,
  Apple,
  Clock,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  SoftwareReleaseRecord,
  SoftwarePlatform,
  loadAllSoftwareReleases,
  saveAllSoftwareReleases,
  setAsOfficialRelease,
  unpublishRelease,
  createSoftwareRelease,
  deleteSoftwareRelease,
  calculateFileSha256,
  getPlatformLabelNepali
} from '../../db/softwareReleaseStore';

interface SoftwareReleaseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoftwareReleaseManagerModal: React.FC<SoftwareReleaseManagerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [releases, setReleases] = useState<SoftwareReleaseRecord[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [softwareName, setSoftwareName] = useState('बालानन्द वैदिक ज्योतिष तथा वास्तु सेवा');
  const [softwareVersion, setSoftwareVersion] = useState('1.0.6');
  const [platform, setPlatform] = useState<SoftwarePlatform>('windows');
  const [storageKey, setStorageKey] = useState('');
  const [originalFilename, setOriginalFilename] = useState('');
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(0);
  const [sha256Checksum, setSha256Checksum] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('नयाँ कार्यसम्पादन सुधार, तीव्र गणना र अद्यावधिक वैदिक पञ्चाङ्ग डेटा।');
  const [publishImmediately, setPublishImmediately] = useState(true);
  const [isHashing, setIsHashing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReleases(loadAllSoftwareReleases());
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const reloadReleases = () => {
    setReleases(loadAllSoftwareReleases());
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOriginalFilename(file.name);
    setFileSizeBytes(file.size);
    setIsHashing(true);

    try {
      const hash = await calculateFileSha256(file);
      setSha256Checksum(hash);
      // Auto-set platform based on extension
      if (file.name.endsWith('.apk')) {
        setPlatform('android');
      } else if (file.name.endsWith('.dmg') || file.name.endsWith('.pkg')) {
        setPlatform('mac');
      } else {
        setPlatform('windows');
      }
      showToast(`फाइल लोड भयो: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
    } catch {
      showToast('ह्यास गणनामा सामान्य त्रुटि आयो, पूर्वनिर्धारित ह्यास राखियो।');
    } finally {
      setIsHashing(false);
    }
  };

  const handleCreateRelease = (e: React.FormEvent) => {
    e.preventDefault();

    if (!softwareVersion.trim() || !storageKey.trim()) {
      alert('कृपया संस्करण नम्बर र डाउनलोड URL अनिवार्य रूपमा भर्नुहोस्।');
      return;
    }

    createSoftwareRelease({
      softwareName,
      softwareVersion,
      releaseNotes,
      originalFilename: originalFilename.trim() || `nepali-vedic-jyotish-${softwareVersion}.${platform === 'android' ? 'apk' : platform === 'mac' ? 'dmg' : 'exe'}`,
      storageKey: storageKey.trim(),
      fileSizeBytes: fileSizeBytes || 45000000,
      sha256Checksum: sha256Checksum.trim() || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      platform,
      publishImmediately
    });

    reloadReleases();
    setIsAddingNew(false);
    showToast(`संस्करण ${softwareVersion} सफलतापूर्वक रिलिज सूचीमा थपियो!`);
  };

  const handleSetOfficial = (id: string) => {
    const res = setAsOfficialRelease(id);
    if (res.success) {
      reloadReleases();
      showToast(res.message);
    }
  };

  const handleUnpublish = (id: string) => {
    const res = unpublishRelease(id);
    if (res.success) {
      reloadReleases();
      showToast(res.message);
    }
  };

  const handleDelete = (id: string, ver: string) => {
    if (confirm(`के तपाईं निश्चित हुनुहुन्छ? संस्करण ${ver} हटाउन चाहनुहुन्छ?`)) {
      const res = deleteSoftwareRelease(id);
      if (res.success) {
        reloadReleases();
        showToast(res.message);
      }
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('क्लिपबोर्डमा कपी गरियो!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 w-full max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide flex items-center gap-2">
                आधिकारिक सफ्टवेयर डाउनलोड तथा रिलिज नियन्त्रण
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Super Admin
                </span>
              </h2>
              <p className="text-xs text-stone-300">
                सबै प्रयोगकर्ताका लागि सार्वजनिक डाउनलोड बटनमा उपलब्ध हुने आधिकारिक इन्स्टलर व्यवस्थापन गर्नुहोस्
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 font-bold text-center flex items-center justify-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Top Bar: Overview & Add Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-50 dark:bg-stone-800/50 p-4 rounded-2xl border border-stone-200 dark:border-stone-700">
            <div>
              <span className="font-bold text-stone-900 dark:text-stone-100 text-sm block">
                हाल सक्रिय आधिकारिक रिलिजहरू: {releases.filter(r => r.isOfficialCurrent).length} वटा
              </span>
              <span className="text-stone-500 text-[11px]">
                यहाँ सुपरएडमिनले जुन रिलिज प्रकाशित गर्छ, सबै प्रयोगकर्ताले सोही नयाँ संस्करण डाउनलोड गर्न पाउनेछन्।
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="px-4 py-2.5 rounded-xl bg-[#7A1C1C] hover:bg-[#941F1F] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
            >
              <Upload className="w-4 h-4 text-amber-300" />
              <span>{isAddingNew ? 'फारम बन्द गर्नुहोस्' : '+ नयाँ सफ्टवेयर रिलिज थप्नुहोस्'}</span>
            </button>
          </div>

          {/* New Release Creation Form */}
          {isAddingNew && (
            <form onSubmit={handleCreateRelease} className="bg-amber-500/5 border-2 border-amber-400/40 rounded-3xl p-5 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-amber-400/20 pb-2">
                <span className="font-extrabold text-sm text-amber-900 dark:text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  नयाँ इन्स्टलर वा रिलिज विवरण प्रविष्ट गर्नुहोस्
                </span>
                <span className="text-[10px] text-stone-500">
                  * आवश्यक जानकारी
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    सफ्टवेयरको नाम:
                  </label>
                  <input
                    type="text"
                    value={softwareName}
                    onChange={e => setSoftwareName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    संस्करण (Version): *
                  </label>
                  <input
                    type="text"
                    value={softwareVersion}
                    onChange={e => setSoftwareVersion(e.target.value)}
                    placeholder="1.0.6"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    प्लेटफर्म (Platform):
                  </label>
                  <select
                    value={platform}
                    onChange={e => setPlatform(e.target.value as SoftwarePlatform)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-bold"
                  >
                    <option value="windows">Windows कम्प्युटर (.exe)</option>
                    <option value="android">Android मोबाइल (.apk)</option>
                    <option value="mac">Apple macOS (.dmg)</option>
                    <option value="all">सबै प्लेटफर्म (Universal)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    प्रत्यक्ष डाउनलोड URL वा फाइल पथ: *
                  </label>
                  <input
                    type="text"
                    value={storageKey}
                    onChange={e => setStorageKey(e.target.value)}
                    placeholder="https://github.com/.../releases/download/...exe वा ./downloads/...apk"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono text-[11px]"
                    required
                  />
                </div>
              </div>

              {/* File upload inspector for SHA-256 and size */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
                <span className="font-bold text-stone-800 dark:text-stone-200 block text-[11px]">
                  स्थानीय फाइलबाट SHA-256 ह्यास तथा साइज स्वचालित पत्ता लगाउनुहोस् (वैकल्पिक):
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {isHashing && <span className="text-amber-600 font-bold animate-pulse">ह्यास गणना हुँदैछ...</span>}
                </div>
                {sha256Checksum && (
                  <div className="text-[10px] font-mono text-stone-500 break-all bg-stone-50 dark:bg-stone-800 p-2 rounded-lg">
                    SHA-256: {sha256Checksum}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  रिलिज नोट / सुविधाहरू (Release Notes):
                </label>
                <textarea
                  rows={2}
                  value={releaseNotes}
                  onChange={e => setReleaseNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700 dark:text-stone-300">
                  <input
                    type="checkbox"
                    checked={publishImmediately}
                    onChange={e => setPublishImmediately(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>तुरुन्त मुख्य डाउनलोडका रूपमा प्रकाशित गर्नुहोस् (Publish as Official Current)</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="px-4 py-2 rounded-xl text-stone-500 hover:bg-stone-100 font-bold"
                  >
                    रद्द गर्नुहोस्
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer"
                  >
                    रिलिज सुरक्षित गर्नुहोस्
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Releases Table / Cards */}
          <div className="space-y-3">
            <span className="font-extrabold text-sm text-stone-800 dark:text-stone-200 block">
              उपलब्ध रिलिजहरूको सूची
            </span>

            <div className="space-y-3">
              {releases.map(rel => {
                const isCurrent = rel.isOfficialCurrent;
                return (
                  <div
                    key={rel.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-600/50 shadow-sm'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      
                      {/* Left info */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-stone-900 dark:text-stone-100">
                            {rel.softwareName}
                          </span>
                          <span className="px-2 py-0.5 rounded-full font-mono font-bold text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                            v{rel.softwareVersion}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 flex items-center gap-1">
                            {rel.platform === 'windows' && <Laptop className="w-3 h-3 text-blue-500" />}
                            {rel.platform === 'android' && <Smartphone className="w-3 h-3 text-emerald-500" />}
                            {rel.platform === 'mac' && <Apple className="w-3 h-3 text-slate-500" />}
                            {rel.platformNameNepali}
                          </span>
                          {isCurrent ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              आधिकारिक सक्रिय रिलिज
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                              {rel.releaseStatus === 'published' ? 'पुरानो रिलिज' : 'ड्राफ्ट'}
                            </span>
                          )}
                        </div>

                        <p className="text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed">
                          {rel.releaseNotes}
                        </p>

                        <div className="flex items-center gap-4 text-[10px] text-stone-500 font-mono flex-wrap">
                          <span>फाइल: {rel.originalFilename}</span>
                          <span>साइज: {rel.fileSizeFormatted}</span>
                          <span>डाउनलोड: {rel.downloadCount} पटक</span>
                          <span>मिति: {rel.publishedAtBS}</span>
                        </div>
                      </div>

                      {/* Right actions */}
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleSetOfficial(rel.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>मुख्य बनाउनुहोस्</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleCopy(rel.storageKey, `url_${rel.id}`)}
                          className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                          title="डाउनलोड URL कपी गर्नुहोस्"
                        >
                          {copiedId === `url_${rel.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>URL</span>
                        </button>

                        <a
                          href={rel.storageKey}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 cursor-pointer"
                          title="डाउनलोड परीक्षण गर्नुहोस्"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDelete(rel.id, rel.softwareVersion)}
                          className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="हटाउनुहोस्"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 flex items-center justify-between text-xs">
          <span className="text-[11px] text-stone-500">
            यहाँ गरिएको जुनसुकै परिवर्तन तत्काल ग्राहक साइट (Frontend) मा स्वतः लागू हुन्छ।
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold cursor-pointer"
          >
            बन्द गर्नुहोस्
          </button>
        </div>

      </div>
    </div>
  );
};
