import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  Monitor,
  Smartphone,
  Apple,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  RefreshCw,
  QrCode,
  HardDrive,
  Cpu,
  Wifi,
  WifiOff,
  Layers,
  ArrowRight,
  Flame,
  Check,
  AlertCircle,
  Copy,
  Lock,
  Globe,
  Server,
  FileCode,
  Play,
  Film,
  Volume2
} from 'lucide-react';
import {
  DEFAULT_DIRECT_DOWNLOADS,
  triggerDirectBrowserDownload,
  checkLatestRelease,
  CURRENT_APP_VERSION,
  formatFileSize,
  isDesktopApp,
  isAndroidDevice,
  getApkDirectDownloadUrl
} from '../../utils/appVersionManager';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import {
  getCurrentOfficialRelease,
  SoftwareReleaseRecord
} from '../../db/softwareReleaseStore';

interface ApplicationDownloadViewProps {
  onOpenModal?: () => void;
  onNavigateHome?: () => void;
}

export const ApplicationDownloadView: React.FC<ApplicationDownloadViewProps> = ({
  onOpenModal,
  onNavigateHome
}) => {
  const [downloadUrls, setDownloadUrls] = useState(DEFAULT_DIRECT_DOWNLOADS);
  const [remoteVer, setRemoteVer] = useState<string>(`v${CURRENT_APP_VERSION}`);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedChecksum, setCopiedChecksum] = useState<string | null>(null);
  const [activeVideoTab, setActiveVideoTab] = useState<'manual' | 'overview'>('manual');
  const { isInstallable, isInstalled, install } = usePWAInstall();

  // Dynamic official releases from Super Admin Store
  const [winRelease, setWinRelease] = useState<SoftwareReleaseRecord | null>(() => getCurrentOfficialRelease('windows'));
  const [androidRelease, setAndroidRelease] = useState<SoftwareReleaseRecord | null>(() => getCurrentOfficialRelease('android'));
  const [macRelease, setMacRelease] = useState<SoftwareReleaseRecord | null>(() => getCurrentOfficialRelease('mac'));

  const refreshOfficialReleases = useCallback(() => {
    const wr = getCurrentOfficialRelease('windows');
    const ar = getCurrentOfficialRelease('android');
    const mr = getCurrentOfficialRelease('mac');
    setWinRelease(wr);
    setAndroidRelease(ar);
    setMacRelease(mr);
    if (wr?.softwareVersion) {
      setRemoteVer(`v${wr.softwareVersion}`);
    } else if (ar?.softwareVersion) {
      setRemoteVer(`v${ar.softwareVersion}`);
    }
  }, []);

  const isAndroid = isAndroidDevice();

  useEffect(() => {
    refreshOfficialReleases();

    const handleUpdate = () => {
      refreshOfficialReleases();
    };

    window.addEventListener('software-release-updated', handleUpdate);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('balananda_software_release_channel');
      bc.onmessage = () => {
        refreshOfficialReleases();
      };
    } catch {}

    // Also check github releases as secondary fallback
    checkLatestRelease().then((rel) => {
      if (rel) {
        if (!winRelease && rel.version) setRemoteVer(rel.version.startsWith('v') ? rel.version : `v${rel.version}`);
        const setupAsset = rel.assets?.find(a => a.name.includes('setup') && a.name.endsWith('.exe'))?.downloadUrl;
        const portableAsset = rel.assets?.find(a => !a.name.includes('setup') && a.name.endsWith('.exe'))?.downloadUrl;
        const apkAsset = rel.assets?.find(a => a.name.endsWith('.apk'))?.downloadUrl;
        const dmgAsset = rel.assets?.find(a => a.name.endsWith('.dmg'))?.downloadUrl;
        const zipAsset = rel.assets?.find(a => a.name.endsWith('.zip'))?.downloadUrl;

        setDownloadUrls(prev => ({
          ...prev,
          windowsSetup: setupAsset || prev.windowsSetup,
          windowsPortable: portableAsset || prev.windowsPortable,
          androidApk: apkAsset || prev.androidApk,
          macDmg: dmgAsset || prev.macDmg,
          macZip: zipAsset || prev.macZip,
        }));
      }
    });

    return () => {
      window.removeEventListener('software-release-updated', handleUpdate);
      try {
        bc?.close();
      } catch {}
    };
  }, [refreshOfficialReleases, winRelease]);

  const handleDownload = (url: string, filename: string, label: string) => {
    setDownloadNotice(`${label} को डाउनलोड सुरु भयो...`);
    triggerDirectBrowserDownload(url, filename);
    setTimeout(() => {
      setDownloadNotice(null);
    }, 4500);
  };

  const handleCopyChecksum = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedChecksum(hash);
    setTimeout(() => setCopiedChecksum(null), 2500);
  };

  const effectiveAndroidRelease: SoftwareReleaseRecord = androidRelease || {
    id: 'rel_apk_105',
    softwareName: 'बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग - Android APK',
    softwareVersion: CURRENT_APP_VERSION,
    releaseNotes: 'एन्ड्रोइड मोबाइलका लागि प्रत्यक्ष APK इन्स्टलर। दैनिक पञ्चाङ्ग, राशिफल तथा डिजिटल वास्तु कम्पास।',
    originalFilename: 'nepali-vedic-jyotish-panchanga.apk',
    storageKey: getApkDirectDownloadUrl(),
    fileSizeBytes: 107062997,
    fileSizeFormatted: '102 MB',
    sha256Checksum: '',
    platform: 'android',
    platformNameNepali: 'Android मोबाइल (.apk)',
    releaseStatus: 'published',
    downloadCount: 3890,
    uploadedBy: 'Official Release',
    uploadedAtISO: new Date().toISOString(),
    publishedAtISO: new Date().toISOString(),
    publishedAtBS: '२०८१',
    isOfficialCurrent: true
  };

  const effectiveWinRelease: SoftwareReleaseRecord = winRelease || {
    id: 'rel_win_105',
    softwareName: 'बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग - Windows PC',
    softwareVersion: CURRENT_APP_VERSION,
    releaseNotes: 'सम्पूर्ण वैदिक ज्योतिष, ३६०° वास्तु कम्पास, षोडशवर्ग, चिना A4 PDF मुद्रण, दशा फलित तथा अफलाइन गणना।',
    originalFilename: 'nepali-vedic-jyotish-panchanga-setup-1.0.5.exe',
    storageKey: downloadUrls.windowsSetup,
    fileSizeBytes: 85200000,
    fileSizeFormatted: '81.2 MB',
    sha256Checksum: '',
    platform: 'windows',
    platformNameNepali: 'Windows कम्प्युटर (.exe)',
    releaseStatus: 'published',
    downloadCount: 1420,
    uploadedBy: 'Official Release',
    uploadedAtISO: new Date().toISOString(),
    publishedAtISO: new Date().toISOString(),
    publishedAtBS: '२०८१',
    isOfficialCurrent: true
  };

  const apkDirectUrl = effectiveAndroidRelease.storageKey || downloadUrls.androidApk || getApkDirectDownloadUrl();

  const handleCopyApkLink = () => {
    navigator.clipboard.writeText(apkDirectUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const qrTargetUrl = `${currentOrigin}${typeof window !== 'undefined' ? window.location.pathname : ''}?action=download-apk`;

  return (
    <div className="w-full space-y-8 animate-fadeIn pb-16 max-w-7xl mx-auto px-3 sm:px-4">
      {/* 1. Header Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#7A1C1C] via-[#941F1F] to-[#5C1105] text-white p-6 sm:p-10 shadow-2xl border-2 border-amber-400/60">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-red-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>आधिकारिक एप्लिकेसन डाउनलोड केन्द्र (Official App Downloads)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-serif tracking-tight leading-tight text-white">
            बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग एप
          </h1>

          <p className="text-xs sm:text-base text-amber-100/90 leading-relaxed font-sans">
            वेबसाइटका <span className="font-bold text-amber-300">सम्पूर्ण २०+ सुविधाहरू</span> (All Web Features) युक्त पूर्ण सफ्टवेयर। कुनै पनि सीमितता (No Limited Version) बिना सम्पूर्ण कुण्डली, पञ्चाङ्ग, फलदेश, विवाह, वास्तु तथा डिजिटल ग्रन्थहरू <span className="text-emerald-300 font-bold">१००% अफलाइन</span> चलाउनुहोस्।
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs">
            <span className="px-3 py-1 rounded-xl bg-white/15 border border-white/25 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                {winRelease || androidRelease
                  ? `आधिकारिक संस्करण: v${winRelease?.softwareVersion || androidRelease?.softwareVersion}`
                  : `पछिल्लो संस्करण: ${remoteVer}`}
              </span>
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/15 border border-white/25 font-bold flex items-center gap-1.5">
              <WifiOff className="w-4 h-4 text-amber-300" />
              <span>१००% अफलाइन सुरक्षित</span>
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/15 border border-white/25 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>SHA-256 प्रमाणित</span>
            </span>
          </div>
        </div>
      </div>

      {/* Download Alert Notice */}
      {downloadNotice && (
        <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 border-2 border-emerald-400 text-emerald-900 dark:text-emerald-200 text-sm font-bold flex items-center gap-3 shadow-lg animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* 2. Full HD Demonstration & Real Frontend User Manual Video Section */}
      <div className="bg-gradient-to-br from-[#7A1C1C] via-[#8C2222] to-[#5C1105] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-400/80 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-amber-300/30 pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/40 text-xs font-bold">
              <Film className="w-4 h-4 text-amber-300" />
              <span>आधिकारिक भिडियो मार्गदर्शिका (Official Video Walkthroughs)</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-serif text-white tracking-wide">
              {activeVideoTab === 'manual'
                ? 'सफ्टवेयरको वास्तविक इन्टरफेस तथा माउस कर्सर भिडियो निर्देशिका'
                : 'सफ्टवेयरको सम्पूर्ण A to Z फिचर परिचय तथा प्रस्तुति'}
            </h2>
            <p className="text-xs sm:text-sm text-amber-100/90 max-w-2xl leading-relaxed">
              {activeVideoTab === 'manual'
                ? 'वास्तविक सफ्टवेयर स्क्रिनमा माउस कर्सर राखेर नेपाली नारीको मिठासपूर्ण स्वरमा तयार पारिएको चरणबद्ध प्रयोगकर्ता निर्देशिका (User Manual)।'
                : 'नेपाली पुरुषको ओजस्वी स्वरमा सम्पूर्ण मेनु, सब-मेनु र प्रणालीको विस्तृत शास्त्रीय परिचय।'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {activeVideoTab === 'manual' ? (
              <a
                href="./downloads/balananda-jyotish-frontend-user-manual.mp4"
                download="balananda-jyotish-frontend-user-manual.mp4"
                onClick={() => setDownloadNotice('User Manual Video (.mp4) को डाउनलोड सुरु भयो...')}
                className="py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 cursor-pointer transition-transform active:scale-95 text-center"
              >
                <Download className="w-4 h-4 text-stone-950" />
                <span>निर्देशिका भिडियो डाउनलोड (महिला स्वर • ८.६ MB)</span>
              </a>
            ) : (
              <a
                href="./downloads/balananda-jyotish-demonstration-video.mp4"
                download="balananda-jyotish-demonstration-video.mp4"
                onClick={() => setDownloadNotice('Demonstration Video (.mp4) को डाउनलोड सुरु भयो...')}
                className="py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 cursor-pointer transition-transform active:scale-95 text-center"
              >
                <Download className="w-4 h-4 text-stone-950" />
                <span>परिचय भिडियो डाउनलोड (पुरुष स्वर • ७.० MB)</span>
              </a>
            )}
          </div>
        </div>

        {/* Video Mode Tabs */}
        <div className="flex items-center gap-2 flex-wrap pb-1">
          <button
            type="button"
            onClick={() => setActiveVideoTab('manual')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeVideoTab === 'manual'
                ? 'bg-amber-400 text-stone-950 shadow-md border-2 border-white'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            <span>🌸</span>
            <span>प्रत्यक्ष सफ्टवेयर निर्देशिका (Real UI + Mouse Pointer • महिला आवाज)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveVideoTab('overview')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeVideoTab === 'overview'
                ? 'bg-amber-400 text-stone-950 shadow-md border-2 border-white'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            <span>👑</span>
            <span>सफ्टवेयर फिचर परिचय (Software Overview • पुरुष आवाज)</span>
          </button>
        </div>

        {/* Video Player */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 rounded-2xl overflow-hidden border-2 border-amber-300/60 shadow-2xl bg-black">
            <video
              key={activeVideoTab}
              controls
              playsInline
              preload="metadata"
              poster="./balananda-logo.jpg"
              className="w-full h-auto max-h-[480px] object-contain mx-auto"
            >
              <source
                src={activeVideoTab === 'manual'
                  ? './downloads/balananda-jyotish-frontend-user-manual.mp4'
                  : './downloads/balananda-jyotish-demonstration-video.mp4'}
                type="video/mp4"
              />
              तपाईंको ब्राउजरले भिडियो ट्याग समर्थन गर्दैन। कृपया डाउनलोड लिङ्कबाट भिडियो डाउनलोड गर्नुहोस्।
            </video>
          </div>

          {/* 12 Chapters Overview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <Volume2 className="w-4 h-4" />
              <span>भिडियोमा समेटिएका १२ वटा खण्डहरू:</span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 text-xs">
              {[
                '१. सफ्टवेयर परिचय तथा प्रामाणिक शास्त्रहरू',
                '२. नयाँ प्रयोगकर्ता दर्ता (User Signup & Profile)',
                '३. सुरक्षित लगइन तथा २४ घण्टे निःशुल्क ट्रायल',
                '४. जन्मकुण्डली, नवमांश (D9) तथा १६ वर्ग कुण्डली',
                '५. विंशोत्तरी र योगिनी महादशा तथा ग्रह गोचर',
                '६. नेपाली पञ्चाङ्ग, पात्रो तथा दैनिक साइत-मुहूर्त',
                '७. ११६ शास्त्रीय प्रश्न ज्योतिष तथा संस्कृत श्लोक',
                '८. अंक ज्योतिष, केपी प्रणाली तथा नेमा ज्योतिष',
                '९. विवाह मेलापक तथा ३६ गुण अष्टकूट मिलान',
                '१०. वैदिक वास्तु शास्त्र, १६ दिशा तथा कम्पास',
                '११. बृहत् चिना, टिप्पन तथा A4 लेटरहेड प्रिन्ट',
                '१२. ५००+ ई-पुस्तकालय, AI ज्योतिषी र होस्टिङ'
              ].map((chap, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-stone-100 flex items-center gap-2 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-medium truncate">{chap}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Platform Grid (Windows, Android, Mac, iOS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        
        {/* PLATFORM 1: Windows (कम्प्युटर एप) */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border-2 border-blue-200 dark:border-blue-900/40 p-6 sm:p-7 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-colors" />

          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-300/60 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-md">
                  <Monitor className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">
                      Windows PC
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>आधिकारिक</span>
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Windows 10, 11 (64-bit / 32-bit) • v{effectiveWinRelease.softwareVersion} ({effectiveWinRelease.fileSizeFormatted})
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
              कम्प्युटरमा इन्स्टल गरी इन्टरनेट बिना नै द्रुत गतिमा सम्पूर्ण कुण्डली, पञ्चाङ्ग, फलदेश, चिना तथा A4 लेटरहेड प्रिन्ट गर्नुहोस्।
            </p>

            <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>१-क्लिक विन्डोज सेटअप इन्स्टलर (.exe)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>पेनड्राइभबाट चल्ने पोर्टेबल संस्करण समेत उपलब्ध</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>वेबसाइटका सम्पूर्ण सुविधाहरू १००% अफलाइन उपलब्ध</span>
              </li>
            </ul>

            {/* SHA-256 Checksum Pill */}
            {effectiveWinRelease?.sha256Checksum && (
              <div className="pt-1">
                <div className="bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2 text-[11px]">
                  <div className="truncate text-stone-500 dark:text-stone-400 font-mono">
                    <span className="font-bold text-stone-700 dark:text-stone-300">SHA-256: </span>
                    <span>{effectiveWinRelease.sha256Checksum.slice(0, 18)}...{effectiveWinRelease.sha256Checksum.slice(-8)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyChecksum(effectiveWinRelease.sha256Checksum)}
                    className="p-1 rounded bg-stone-200 dark:bg-stone-800 hover:bg-amber-400 hover:text-stone-950 transition-colors shrink-0 text-stone-700 dark:text-stone-300 cursor-pointer"
                    title="SHA-256 कपी गर्नुहोस्"
                  >
                    {copiedChecksum === effectiveWinRelease.sha256Checksum ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 space-y-2.5">
            <a
              href={effectiveWinRelease.storageKey}
              download={effectiveWinRelease.originalFilename}
              onClick={() => setDownloadNotice('Windows Official Setup (.exe) को डाउनलोड सुरु भयो...')}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 text-center"
            >
              <Download className="w-5 h-5" />
              <span>आधिकारिक Windows Setup (.exe) डाउनलोड ({effectiveWinRelease.fileSizeFormatted})</span>
            </a>

            <a
              href={downloadUrls.windowsPortable}
              download={`nepali-vedic-jyotish-panchanga-${effectiveWinRelease.softwareVersion}.exe`}
              onClick={() => setDownloadNotice('Windows Portable (.exe) को डाउनलोड सुरु भयो...')}
              className="w-full py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors text-center"
            >
              <HardDrive className="w-4 h-4" />
              <span>पोर्टेबल संस्करण (.exe - No Install) डाउनलोड</span>
            </a>
          </div>
        </div>

        {/* PLATFORM 2: Android (मोबाइल एप) */}
        <div className={`bg-white dark:bg-stone-900 rounded-3xl border-2 p-6 sm:p-7 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between relative overflow-hidden group ${
          isAndroid ? 'border-emerald-500 ring-2 ring-emerald-400/50' : 'border-emerald-200 dark:border-emerald-900/40'
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-colors" />

          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300/60 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-md">
                  <Smartphone className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">
                      Android APK
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>आधिकारिक</span>
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Samsung, Xiaomi, Vivo, Oppo, Realme, etc. • v{effectiveAndroidRelease.softwareVersion} ({effectiveAndroidRelease.fileSizeFormatted})
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
              मोबाइलमा सिधै इन्स्टल गरी जहाँसुकै पञ्चाङ्ग, दैनिक साइत, कुण्डली चक्र तथा वैदिक सेवाहरू प्रयोग गर्नुहोस्।
            </p>

            <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>सिधै APK डाउनलोड (कुनै झन्झट बिना १-क्लिकमा)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>मोबाइल क्यामेराबाट QR कोड स्क्यान गरी डाउनलोड गर्न मिल्ने</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>पूर्ण अफलाइन क्यास समर्थन तथा द्रुत रेस्पोन्स</span>
              </li>
            </ul>

            {/* SHA-256 Checksum Pill */}
            {effectiveAndroidRelease?.sha256Checksum && (
              <div className="pt-1">
                <div className="bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2 text-[11px]">
                  <div className="truncate text-stone-500 dark:text-stone-400 font-mono">
                    <span className="font-bold text-stone-700 dark:text-stone-300">SHA-256: </span>
                    <span>{effectiveAndroidRelease.sha256Checksum.slice(0, 18)}...{effectiveAndroidRelease.sha256Checksum.slice(-8)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyChecksum(effectiveAndroidRelease.sha256Checksum)}
                    className="p-1 rounded bg-stone-200 dark:bg-stone-800 hover:bg-amber-400 hover:text-stone-950 transition-colors shrink-0 text-stone-700 dark:text-stone-300 cursor-pointer"
                    title="SHA-256 कपी गर्नुहोस्"
                  >
                    {copiedChecksum === effectiveAndroidRelease.sha256Checksum ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 space-y-2.5">
            <a
              href={apkDirectUrl}
              download={effectiveAndroidRelease.originalFilename || 'nepali-vedic-jyotish-panchanga.apk'}
              onClick={() => setDownloadNotice('Android APK को डाउनलोड सुरु भयो...')}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 animate-pulse text-center"
            >
              <Download className="w-5 h-5" />
              <span>सिधै Android APK (.apk) डाउनलोड गर्नुहोस् ({effectiveAndroidRelease.fileSizeFormatted})</span>
            </a>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyApkLink}
                className="flex-1 py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <ExternalLink className="w-4 h-4" />}
                <span>{copiedLink ? 'लिङ्क कपी भयो!' : 'APK लिङ्क कपी गर्नुहोस्'}</span>
              </button>

              {isInstallable && !isInstalled && (
                <button
                  type="button"
                  onClick={install}
                  className="py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>होमस्क्रिनमा थप्नुहोस्</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* PLATFORM 3: Mac (macOS एप्पल एप) */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border-2 border-stone-200 dark:border-stone-800 p-6 sm:p-7 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 flex items-center justify-center shadow-md">
                  <Apple className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">
                      Apple Mac
                    </h2>
                    {macRelease?.isOfficialCurrent ? (
                      <span className="px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-300 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>आधिकारिक</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-300 text-[10px] font-bold">
                        macOS (.dmg)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Apple Silicon (M1/M2/M3/M4) तथा Intel Mac {macRelease ? `• v${macRelease.softwareVersion} (${macRelease.fileSizeFormatted})` : ''}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
              Apple MacBook, iMac तथा Mac mini का लागि नेटिभ DMG इन्स्टलर। रेटिना डिस्प्लेमा उच्च गुणस्तरको कुण्डली दृश्य।
            </p>

            <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>नेटिभ macOS DMG इन्स्टलर (.dmg)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>रेडिमेड उच्च रिजोलुसन देवनागरी फन्ट सपोर्ट</span>
              </li>
            </ul>

            {/* SHA-256 Checksum Pill */}
            {macRelease?.sha256Checksum && (
              <div className="pt-1">
                <div className="bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2 text-[11px]">
                  <div className="truncate text-stone-500 dark:text-stone-400 font-mono">
                    <span className="font-bold text-stone-700 dark:text-stone-300">SHA-256: </span>
                    <span>{macRelease.sha256Checksum.slice(0, 18)}...{macRelease.sha256Checksum.slice(-8)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyChecksum(macRelease.sha256Checksum)}
                    className="p-1 rounded bg-stone-200 dark:bg-stone-800 hover:bg-amber-400 hover:text-stone-950 transition-colors shrink-0 text-stone-700 dark:text-stone-300 cursor-pointer"
                    title="SHA-256 कपी गर्नुहोस्"
                  >
                    {copiedChecksum === macRelease.sha256Checksum ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6">
            {macRelease ? (
              <button
                type="button"
                onClick={() => handleDownload(
                  macRelease.storageKey,
                  macRelease.originalFilename,
                  'Apple Mac DMG (.dmg)'
                )}
                className="w-full py-3.5 px-4 rounded-2xl bg-stone-900 hover:bg-black text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <Download className="w-5 h-5" />
                <span>Apple Mac DMG (.dmg) डाउनलोड ({macRelease.fileSizeFormatted})</span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-stone-700 dark:text-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300 text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>हाल कुनै आधिकारिक macOS रिलिज प्रकाशित छैन</span>
                </div>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  सुपर प्रशासकले नयाँ macOS DMG संस्करण प्रकाशित गरेपछि यहाँ स्वतः उपलब्ध हुनेछ।
                </p>
              </div>
            )}
          </div>
        </div>

        {/* PLATFORM 4: iOS (iPhone / iPad) */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border-2 border-purple-200 dark:border-purple-900/40 p-6 sm:p-7 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-300/60 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-md">
                  <Smartphone className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">
                      Apple iOS
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 text-[10px] font-bold">
                      iPhone / iPad
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Safari Browser • १-क्लिक होमस्क्रिन इन्स्टल
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
              iPhone वा iPad मा Safari मार्फत खोल्नुहोस् र सिधै होम स्क्रिनमा थपी १००% अफलाइन एपको रूपमा चलाउनुहोस्।
            </p>

            <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 text-xs text-purple-900 dark:text-purple-200 space-y-1">
              <p className="font-bold">📱 कसरी इन्स्टल गर्ने?</p>
              <p>१. Safari मा यो वेबसाइट खोल्नुहोस्।</p>
              <p>२. तलको "Share" (शेयर) बटन थिच्नुहोस्।</p>
              <p>३. "Add to Home Screen" (होम स्क्रिनमा थप्नुहोस्) छान्नुहोस्।</p>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={() => {
                if (isInstallable) install();
                else alert('iPhone/iPad मा Safari को शेयर बटन थिचेर "Add to Home Screen" छान्नुहोस्।');
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <Sparkles className="w-5 h-5" />
              <span>iOS होम स्क्रिनमा थप्ने विधि</span>
            </button>
          </div>
        </div>

        {/* PLATFORM 5: Web Hosting (cPanel / VPS Production ZIP) */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border-2 border-amber-300 dark:border-amber-800 p-6 sm:p-7 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between relative overflow-hidden group md:col-span-2">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-colors" />

          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300/60 dark:border-amber-800 text-[#7A1C1C] dark:text-amber-400 flex items-center justify-center shadow-md">
                  <Globe className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">
                      वेबसाइट होस्टिङ जिप (cPanel / Web Hosting ZIP)
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1 border border-amber-300/40">
                      <Server className="w-3 h-3" />
                      <span>सिधै डोमेनमा चल्ने (Ready to Host)</span>
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Hostinger, Bluehost, Namecheap, GoDaddy, cPanel, Nginx, Apache वा VPS का लागि
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
              आफ्नै डोमेन (उदा: <code className="text-amber-700 dark:text-amber-400 font-bold">yourdomain.com</code>) मा वेबसाइट चलाउन यो कम्प्लिट जिप (ZIP) फाइल डाउनलोड गर्नुहोस्। cPanel को <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded font-mono text-xs">public_html</code> भित्र यो फाइल अपलोड गरी <strong>Extract (Unzip)</strong> गर्दा वेबसाइट तुरुन्तै सुरु हुन्छ।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700 text-xs">
                <span className="font-bold text-stone-900 dark:text-stone-100 block mb-0.5">📂 .htaccess समावेश</span>
                <span className="text-stone-500 dark:text-stone-400 text-[11px]">पेज रिफ्रेस गर्दा कुनै 404 Error नआउने</span>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700 text-xs">
                <span className="font-bold text-stone-900 dark:text-stone-100 block mb-0.5">⚡ GZIP & Speed Cache</span>
                <span className="text-stone-500 dark:text-stone-400 text-[11px]">उच्च गतिको वेब पर्फमेन्स र ब्रोडब्यान्ड अप्टिमाइजेसन</span>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700 text-xs">
                <span className="font-bold text-stone-900 dark:text-stone-100 block mb-0.5">📜 नेपाली गाइड संलग्न</span>
                <span className="text-stone-500 dark:text-stone-400 text-[11px]">cPanel तथा Nginx का लागि स्पष्ट चरणबद्ध विधि</span>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center gap-3">
            <a
              href="./downloads/nepali-vedic-jyotish-web-hosting-complete.zip"
              download="nepali-vedic-jyotish-web-hosting-complete.zip"
              onClick={() => setDownloadNotice('वेबसाइट होस्टिङ कम्प्लिट ZIP फाइलको डाउनलोड सुरु भयो...')}
              className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-[#7A1C1C] hover:from-amber-700 hover:to-[#5C1515] text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 text-center"
            >
              <Download className="w-5 h-5 text-amber-200" />
              <span>कम्प्लिट वेब होस्टिङ ZIP (.zip) डाउनलोड गर्नुहोस् (२३२ MB)</span>
            </a>

            <a
              href="./DEPLOYMENT_GUIDE_नेपाली.txt"
              target="_blank"
              rel="noreferrer"
              className="py-3.5 px-5 rounded-2xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <FileCode className="w-4 h-4 text-amber-600" />
              <span>होस्टिङ निर्देशिका पढ्नुहोस्</span>
            </a>
          </div>
        </div>

      </div>

      {/* 3. Comprehensive Features Summary (Same as Web App) */}
      <div className="bg-stone-50 dark:bg-stone-850 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-4">
        <h3 className="text-lg sm:text-xl font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-600" />
          <span>वेबसाइटका सम्पूर्ण २०+ सुविधाहरू (All Web Features Included)</span>
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
          डाउनलोड हुने प्रत्येक सफ्टवेयर (Windows, Android, Mac) मा वेबसाइटका कुनै पनि फिचर काटिएको छैन। निम्न सबै मोड्युलहरू १००% अफलाइन चल्नेछन्:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs font-semibold text-stone-800 dark:text-stone-200 pt-2">
          <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center gap-2">
            <span>📅</span> <span>नेपाली पञ्चाङ्ग तथा पात्रो</span>
          </div>
          <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center gap-2">
            <span>🔯</span> <span>जन्मकुण्डली तथा भाव चक्र</span>
          </div>
          <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center gap-2">
            <span>📜</span> <span>विंशोत्तरी तथा योगिनी दशा</span>
          </div>
          <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center gap-2">
            <span>🪐</span> <span>गोचर चक्र तथा साढेसाती</span>
          </div>
          <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center gap-2">
            <span>💍</span> <span>विवाह मेलापक कुण्डली मिलान</span>
          </div>
          <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center gap-2">
            <span>🧭</span> <span>वास्तु कम्पास तथा फ्लोर प्लान</span>
          </div>
          <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center gap-2">
            <span>📚</span> <span>वैदिक ई-पुस्तकालय (PDF)</span>
          </div>
          <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center gap-2">
            <span>🖨️</span> <span>लेटरहेड सहित A4 प्रिन्ट</span>
          </div>
        </div>
      </div>
    </div>
  );
};
