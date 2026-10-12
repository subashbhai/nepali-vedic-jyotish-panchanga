import React, { useState, useEffect } from 'react';
import {
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
  ArrowUpRight,
  HardDrive,
  FileCode,
  Globe
} from 'lucide-react';
import {
  SoftwareReleaseRecord,
  SoftwarePlatform,
  loadAllSoftwareReleases,
  fetchReleasesFromServer,
  uploadSoftwareFileToServer,
  serverSetOfficialRelease,
  serverDeleteRelease,
  calculateFileSha256,
  getPlatformLabelNepali,
  createSoftwareRelease
} from '../../../db/softwareReleaseStore';

export const AdminSoftwareUploadSection: React.FC = () => {
  const [releases, setReleases] = useState<SoftwareReleaseRecord[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Upload Form State
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [softwareName, setSoftwareName] = useState('बालानन्द वैदिक ज्योतिष तथा वास्तु सेवा');
  const [softwareVersion, setSoftwareVersion] = useState('1.0.6');
  const [platform, setPlatform] = useState<SoftwarePlatform>('windows');
  const [storageKeyLink, setStorageKeyLink] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('नयाँ कार्यसम्पादन सुधार, तीव्र गणना र अद्यावधिक वैदिक पञ्चाङ्ग डेटा।');
  const [publishImmediately, setPublishImmediately] = useState(true);
  const [sha256Checksum, setSha256Checksum] = useState('');
  const [isHashing, setIsHashing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const list = await fetchReleasesFromServer();
    setReleases(list);
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsHashing(true);

    // Auto detect platform from extension
    const nameLower = file.name.toLowerCase();
    if (nameLower.endsWith('.apk')) {
      setPlatform('android');
    } else if (nameLower.endsWith('.dmg') || nameLower.endsWith('.pkg')) {
      setPlatform('mac');
    } else if (nameLower.endsWith('.exe') || nameLower.endsWith('.msi')) {
      setPlatform('windows');
    }

    try {
      const hash = await calculateFileSha256(file);
      setSha256Checksum(hash);
      showToast(`फाइल तयार: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
    } catch {
      showToast('ह्यास गणनामा सामान्य समस्या आएपनि फाइल अपलोड गर्न सकिन्छ।');
    } finally {
      setIsHashing(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadMode === 'file') {
      if (!selectedFile) {
        alert('कृपया अपलोड गर्नको लागि पहिले सफ्टवेयर इन्स्टलर फाइल छान्नुहोस् (.exe, .apk, .dmg, आदि)।');
        return;
      }

      setIsUploading(true);
      setUploadProgress(10);

      const result = await uploadSoftwareFileToServer({
        file: selectedFile,
        softwareVersion: softwareVersion.trim() || '1.0.6',
        platform,
        softwareName,
        releaseNotes,
        publishImmediately,
        onProgress: (p) => setUploadProgress(p)
      });

      setIsUploading(false);

      if (result.success) {
        showToast(result.message, 'success');
        setSelectedFile(null);
        setSha256Checksum('');
        await loadData();
      } else {
        showToast(result.message, 'error');
      }
    } else {
      // Manual Link Mode
      if (!storageKeyLink.trim() || !softwareVersion.trim()) {
        alert('कृपया संस्करण नम्बर र डाउनलोड URL अनिवार्य रूपमा भर्नुहोस्।');
        return;
      }

      createSoftwareRelease({
        softwareName,
        softwareVersion: softwareVersion.trim(),
        releaseNotes,
        originalFilename: `balananda-${platform}-${softwareVersion}.${platform === 'android' ? 'apk' : platform === 'mac' ? 'dmg' : 'exe'}`,
        storageKey: storageKeyLink.trim(),
        fileSizeBytes: 45000000,
        sha256Checksum: sha256Checksum.trim() || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        platform,
        publishImmediately
      });

      showToast(`संस्करण ${softwareVersion} सफलतापूर्वक रिलिज सूचीमा थपियो!`);
      setStorageKeyLink('');
      await loadData();
    }
  };

  const handleSetOfficial = async (id: string) => {
    const res = await serverSetOfficialRelease(id);
    if (res.success) {
      await loadData();
      showToast(res.message, 'success');
    }
  };

  const handleDelete = async (id: string, ver: string) => {
    if (confirm(`के तपाईं निश्चित हुनुहुन्छ? संस्करण ${ver} हटाउन चाहनुहुन्छ?`)) {
      const res = await serverDeleteRelease(id);
      if (res.success) {
        await loadData();
        showToast(res.message, 'success');
      }
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('डाउनलोड लिङ्क क्लिपबोर्डमा कपी गरियो!');
  };

  const currentOfficialWindows = releases.find(r => r.platform === 'windows' && r.isOfficialCurrent);
  const currentOfficialAndroid = releases.find(r => r.platform === 'android' && r.isOfficialCurrent);
  const currentOfficialMac = releases.find(r => r.platform === 'mac' && r.isOfficialCurrent);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg animate-in fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Upload className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold font-serif text-amber-300">
                आधिकारिक सफ्टवेयर इन्स्टलर अपलोड तथा रिलिज व्यवस्थापन
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-1">
              यहाँबाट Windows (.exe), Android (.apk), र Mac (.dmg) सफ्टवेयरका वास्तविक फाइलहरू सर्भरमा सिधै अपलोड गर्नुहोस्।
              अपलोड भएपछि सम्पूर्ण प्रयोगकर्ताहरूले एप वा वेबसाइटबाट सिधै डाउनलोड गर्न सक्नेछन्।
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border border-stone-700 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>ताजा गर्नुहोस्</span>
        </button>
      </div>

      {/* 3 Platform Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Windows Card */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Windows (.exe)</span>
                <span className="text-[10px] text-stone-400">कम्प्युटर इन्स्टलर</span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              currentOfficialWindows ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-stone-800 text-stone-400'
            }`}>
              {currentOfficialWindows ? `v${currentOfficialWindows.softwareVersion}` : 'अनुपलब्ध'}
            </span>
          </div>

          {currentOfficialWindows ? (
            <div className="space-y-1.5 text-[11px] text-stone-300 bg-stone-950 p-2.5 rounded-xl border border-stone-850">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">फाइल साइज:</span>
                <span className="font-mono font-bold text-amber-300">{currentOfficialWindows.fileSizeFormatted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">डाउनलोड गणना:</span>
                <span className="font-bold text-emerald-400">{currentOfficialWindows.downloadCount} पटक</span>
              </div>
              <div className="pt-1.5 flex gap-1.5">
                <a
                  href={currentOfficialWindows.storageKey}
                  download={currentOfficialWindows.originalFilename}
                  className="flex-1 py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold text-center flex items-center justify-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>डाउनलोड परीक्षण</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy(currentOfficialWindows.storageKey, currentOfficialWindows.id)}
                  className="p-1 px-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-[10px] transition-colors"
                  title="लिङ्क कपी"
                >
                  {copiedId === currentOfficialWindows.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-stone-500 italic py-2">हाल कुनै आधिकारिक Windows रिलिज छैन। तलबाट फाइल अपलोड गर्नुहोस्।</p>
          )}
        </div>

        {/* Android Card */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Android (.apk)</span>
                <span className="text-[10px] text-stone-400">मोबाइल एप इन्स्टलर</span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              currentOfficialAndroid ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-stone-800 text-stone-400'
            }`}>
              {currentOfficialAndroid ? `v${currentOfficialAndroid.softwareVersion}` : 'अनुपलब्ध'}
            </span>
          </div>

          {currentOfficialAndroid ? (
            <div className="space-y-1.5 text-[11px] text-stone-300 bg-stone-950 p-2.5 rounded-xl border border-stone-850">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">फाइल साइज:</span>
                <span className="font-mono font-bold text-amber-300">{currentOfficialAndroid.fileSizeFormatted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">डाउनलोड गणना:</span>
                <span className="font-bold text-emerald-400">{currentOfficialAndroid.downloadCount} पटक</span>
              </div>
              <div className="pt-1.5 flex gap-1.5">
                <a
                  href={currentOfficialAndroid.storageKey}
                  download={currentOfficialAndroid.originalFilename}
                  className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold text-center flex items-center justify-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>APK परीक्षण</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy(currentOfficialAndroid.storageKey, currentOfficialAndroid.id)}
                  className="p-1 px-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-[10px] transition-colors"
                  title="लिङ्क कपी"
                >
                  {copiedId === currentOfficialAndroid.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-stone-500 italic py-2">हाल कुनै आधिकारिक Android रिलिज छैन। तलबाट APK फाइल अपलोड गर्नुहोस्।</p>
          )}
        </div>

        {/* Mac Card */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Apple className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Apple macOS (.dmg)</span>
                <span className="text-[10px] text-stone-400">Mac इन्स्टलर</span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              currentOfficialMac ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-stone-800 text-stone-400'
            }`}>
              {currentOfficialMac ? `v${currentOfficialMac.softwareVersion}` : 'अनुपलब्ध'}
            </span>
          </div>

          {currentOfficialMac ? (
            <div className="space-y-1.5 text-[11px] text-stone-300 bg-stone-950 p-2.5 rounded-xl border border-stone-850">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">फाइल साइज:</span>
                <span className="font-mono font-bold text-amber-300">{currentOfficialMac.fileSizeFormatted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">डाउनलोड गणना:</span>
                <span className="font-bold text-emerald-400">{currentOfficialMac.downloadCount} पटक</span>
              </div>
              <div className="pt-1.5 flex gap-1.5">
                <a
                  href={currentOfficialMac.storageKey}
                  download={currentOfficialMac.originalFilename}
                  className="flex-1 py-1 px-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold text-center flex items-center justify-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>DMG परीक्षण</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy(currentOfficialMac.storageKey, currentOfficialMac.id)}
                  className="p-1 px-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-[10px] transition-colors"
                  title="लिङ्क कपी"
                >
                  {copiedId === currentOfficialMac.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-stone-500 italic py-2">हाल कुनै आधिकारिक Mac रिलिज छैन। तलबाट DMG फाइल अपलोड गर्नुहोस्।</p>
          )}
        </div>
      </div>

      {/* Main Upload Box */}
      <div className="bg-stone-900 border-2 border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>नयाँ सफ्टवेयर रिलिज अपलोड तथा प्रकाशन फारम</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              कम्प्युटरबाट नयाँ सफ्टवेयर इन्स्टलर फाइल सिधै अपलोड गर्नुहोस् वा बाह्य URL लिङ्क दर्ता गर्नुहोस्।
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-950 p-1 rounded-xl border border-stone-800">
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                uploadMode === 'file'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>प्रत्यक्ष फाइल अपलोड (सिफारिस)</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('link')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                uploadMode === 'link'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>बाह्य URL लिङ्क</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-5">
          {/* File Picker Zone */}
          {uploadMode === 'file' ? (
            <div className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 rounded-3xl p-6 bg-amber-500/5 text-center transition-all group">
              <input
                type="file"
                id="software-installer-file"
                accept=".exe,.msi,.apk,.dmg,.pkg,.zip,.AppImage,.deb"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="software-installer-file"
                className="cursor-pointer flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner border border-amber-500/30">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <span className="font-bold text-sm text-stone-100 block">
                    {selectedFile ? selectedFile.name : 'कम्प्युटरबाट सफ्टवेयर इन्स्टलर फाइल छान्नुहोस्'}
                  </span>
                  <span className="text-xs text-stone-400 mt-1 block">
                    समर्थित ढाँचाहरू: <strong className="text-amber-300">.exe, .apk, .dmg, .msi, .zip</strong> (अधिकतम ५०० MB)
                  </span>
                </div>

                {selectedFile && (
                  <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-3 max-w-md w-full text-xs text-left space-y-1">
                    <div className="flex items-center justify-between text-stone-300">
                      <span>फाइलको नाम:</span>
                      <strong className="text-white truncate max-w-[200px]">{selectedFile.name}</strong>
                    </div>
                    <div className="flex items-center justify-between text-stone-300">
                      <span>साइज:</span>
                      <strong className="text-amber-300">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</strong>
                    </div>
                    {sha256Checksum && (
                      <div className="pt-1 text-[10px] text-stone-400 font-mono break-all">
                        SHA-256: {sha256Checksum}
                      </div>
                    )}
                  </div>
                )}

                {isHashing && (
                  <span className="text-amber-400 text-xs font-bold animate-pulse">
                    ह्यास तथा इन्टिग्रिटी परीक्षण हुँदैछ...
                  </span>
                )}
              </label>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-300">
                प्रत्यक्ष डाउनलोड URL (GitHub Releases वा Cloud Storage Link): *
              </label>
              <input
                type="text"
                required
                value={storageKeyLink}
                onChange={(e) => setStorageKeyLink(e.target.value)}
                placeholder="https://github.com/subashbhai/.../releases/download/v1.0.6/nepali-vedic-jyotish-setup.exe"
                className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-3 text-xs text-stone-100 outline-none focus:border-amber-500 font-mono"
              />
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">
                सफ्टवेयर संस्करण (Software Version): *
              </label>
              <input
                type="text"
                required
                value={softwareVersion}
                onChange={(e) => setSoftwareVersion(e.target.value)}
                placeholder="1.0.6"
                className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-3 text-xs text-stone-100 outline-none focus:border-amber-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">
                प्लेटफर्म (Platform): *
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as SoftwarePlatform)}
                className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-3 text-xs text-stone-100 outline-none focus:border-amber-500 font-bold"
              >
                <option value="windows">Windows कम्प्युटर (.exe)</option>
                <option value="android">Android मोबाइल (.apk)</option>
                <option value="mac">Apple macOS (.dmg)</option>
                <option value="all">सबै प्लेटफर्म (Universal)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">
                सफ्टवेयरको शीर्षक / नाम:
              </label>
              <input
                type="text"
                value={softwareName}
                onChange={(e) => setSoftwareName(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-3 text-xs text-stone-100 outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              रिलिज नोट तथा नयाँ सुविधाहरू (Release Notes):
            </label>
            <textarea
              rows={2}
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              placeholder="यस संस्करणमा थपिएका नयाँ सुविधाहरू, सुधार र बग फिक्सहरू..."
              className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-3 text-xs text-stone-100 outline-none focus:border-amber-500"
            />
          </div>

          {/* Publish Immediately Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-950/80 p-3.5 rounded-2xl border border-stone-800">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={publishImmediately}
                onChange={(e) => setPublishImmediately(e.target.checked)}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
              />
              <div>
                <span className="font-bold text-xs text-stone-100 block">
                  अपलोड हुनासाथ आधिकारिक मुख्य डाउनलोडका रूपमा प्रकाशित गर्नुहोस् (Publish as Official Current)
                </span>
                <span className="text-[10px] text-stone-400">
                  यो अन गर्दा सबै प्रयोगकर्ताको स्क्रिनमा यो नयाँ संस्करण डाउनलोड बटनमा तत्काल उपलब्ध हुनेछ।
                </span>
              </div>
            </label>

            <button
              type="submit"
              disabled={isUploading || isHashing}
              className={`px-6 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shrink-0 ${
                isUploading || isHashing
                  ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-stone-950 hover:brightness-110 active:scale-95 font-extrabold'
              }`}
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>सर्भरमा अपलोड हुँदैछ ({uploadProgress}%)...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>सफ्टवेयर फाइल सर्भरमा अपलोड गर्नुहोस्</span>
                </>
              )}
            </button>
          </div>

          {/* Progress bar */}
          {isUploading && (
            <div className="space-y-1">
              <div className="w-full bg-stone-950 h-2.5 rounded-full overflow-hidden border border-stone-800">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-amber-400 font-bold text-center">
                फाइल सर्भरमा सुरक्षित रूपमा स्थानान्तरण हुँदैछ, कृपया प्रतीक्षा गर्नुहोस्...
              </p>
            </div>
          )}
        </form>
      </div>

      {/* Uploaded Software Releases Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>सर्भरमा उपलब्ध सम्पूर्ण सफ्टवेयर रिलिजहरूको अभिलेख ({releases.length})</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              हालसम्म प्रकाशित सम्पूर्ण सफ्टवेयर प्याकेज, साइज, डाउनलोड लिङ्क र आधिकारिक स्थिति।
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">प्लेटफर्म</th>
                <th className="py-3 px-3">संस्करण</th>
                <th className="py-3 px-3">फाइलको नाम</th>
                <th className="py-3 px-3">साइज</th>
                <th className="py-3 px-3">स्थिति</th>
                <th className="py-3 px-3">डाउनलोड संख्या</th>
                <th className="py-3 px-3 text-right">कार्यहरू</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-850">
              {releases.map((rel) => {
                const isWin = rel.platform === 'windows';
                const isApk = rel.platform === 'android';
                const isMac = rel.platform === 'mac';

                return (
                  <tr key={rel.id} className="hover:bg-stone-850/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {isWin ? (
                          <Laptop className="w-4 h-4 text-blue-400 shrink-0" />
                        ) : isApk ? (
                          <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : isMac ? (
                          <Apple className="w-4 h-4 text-purple-400 shrink-0" />
                        ) : (
                          <HardDrive className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <span className="font-bold text-stone-200">
                          {rel.platformNameNepali || getPlatformLabelNepali(rel.platform)}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-amber-300 bg-stone-950 px-2 py-0.5 rounded-lg border border-stone-800">
                        v{rel.softwareVersion}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="min-w-0 max-w-[200px]">
                        <span className="font-mono text-stone-300 block truncate" title={rel.originalFilename}>
                          {rel.originalFilename}
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono truncate block" title={rel.storageKey}>
                          {rel.storageKey}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-stone-300">
                      {rel.fileSizeFormatted}
                    </td>

                    <td className="py-3 px-3">
                      {rel.isOfficialCurrent ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>आधिकारिक सक्रिय</span>
                        </span>
                      ) : rel.releaseStatus === 'published' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          प्रकाशित
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-800 text-stone-400">
                          मस्यौदा (Draft)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono text-stone-300">
                      {rel.downloadCount || 0} पटक
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Direct Download Test */}
                        <a
                          href={rel.storageKey}
                          download={rel.originalFilename}
                          className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition-colors cursor-pointer"
                          title="यो फाइल सिधै डाउनलोड गरेर परीक्षण गर्नुहोस्"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>

                        {/* Copy URL */}
                        <button
                          type="button"
                          onClick={() => handleCopy(rel.storageKey, rel.id)}
                          className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition-colors cursor-pointer"
                          title="डाउनलोड URL कपी गर्नुहोस्"
                        >
                          {copiedId === rel.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Set Official */}
                        {!rel.isOfficialCurrent && (
                          <button
                            type="button"
                            onClick={() => handleSetOfficial(rel.id)}
                            className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                            title="यो संस्करणलाई मुख्य आधिकारिक डाउनलोड बनाउनुहोस्"
                          >
                            आधिकारिक बनाउनुहोस्
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDelete(rel.id, rel.softwareVersion)}
                          className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 rounded-lg transition-colors cursor-pointer"
                          title="हटाउनुहोस्"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
