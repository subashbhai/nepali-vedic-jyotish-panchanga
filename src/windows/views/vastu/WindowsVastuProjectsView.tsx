import React, { useState } from 'react';
import { 
  Building, 
  Plus, 
  MapPin, 
  Compass, 
  Trash2, 
  Check, 
  ArrowRight,
  Sparkles,
  Phone,
  Home
} from 'lucide-react';
import { VastuProjectMetadata } from '../../../core/vastu/vastuReport';
import { VastuPrimaryDirection, VASTU_PRIMARY_DIRECTIONS } from '../../../core/vastu/vastuDirections';
import { 
  getAllVastuProjects, 
  saveVastuProject, 
  deleteVastuProject 
} from '../../db/windowsSecureStore';

interface WindowsVastuProjectsViewProps {
  activeProjectId: string;
  onSelectProject: (projectId: string) => void;
  onNavigateToFloorPlan: () => void;
}

export const WindowsVastuProjectsView: React.FC<WindowsVastuProjectsViewProps> = ({
  activeProjectId,
  onSelectProject,
  onNavigateToFloorPlan,
}) => {
  const [projects, setProjects] = useState<VastuProjectMetadata[]>(() => getAllVastuProjects());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [projectName, setProjectName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [propertyType, setPropertyType] = useState<VastuProjectMetadata['propertyType']>('आवासीय घर');
  const [facingDirection, setFacingDirection] = useState<VastuPrimaryDirection>('E');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [plotDimensions, setPlotDimensions] = useState('३० x ४० फिट');
  const [constructionStatus, setConstructionStatus] = useState<VastuProjectMetadata['constructionStatus']>('बनेको पुरानो घर');
  const [notes, setNotes] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !ownerName.trim()) return;

    const newProject: VastuProjectMetadata = {
      id: `vp_${Date.now()}`,
      projectName: projectName.trim(),
      ownerName: ownerName.trim(),
      propertyType,
      facingDirection,
      address: address.trim() || 'नेपाल',
      contactNumber: contactNumber.trim(),
      plotDimensions: plotDimensions.trim(),
      constructionStatus,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveVastuProject(newProject);
    const updated = getAllVastuProjects();
    setProjects(updated);
    onSelectProject(newProject.id);
    setIsCreateModalOpen(false);

    // Reset Form
    setProjectName('');
    setOwnerName('');
    setAddress('');
    setContactNumber('');
    setNotes('');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (projects.length <= 1) {
      alert('कम्तीमा एउटा प्रोजेक्ट रहिरहनुपर्छ।');
      return;
    }
    if (confirm('के तपाईं यो वास्तु प्रोजेक्ट मेटाउन निश्चित हुनुहुन्छ?')) {
      deleteVastuProject(id);
      const updated = getAllVastuProjects();
      setProjects(updated);
      if (activeProjectId === id && updated[0]) {
        onSelectProject(updated[0].id);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h2 className="text-xl font-black text-stone-900 dark:text-stone-100 font-serif flex items-center gap-2">
            <span>🏠</span>
            <span>वास्तु प्रोजेक्ट व्यवस्थापन (Vastu Projects)</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            ग्राहक तथा घरधनीको भवन अनुसार छुट्टाछुट्टै वास्तु प्रोजेक्ट सिर्जना गर्नुहोस् र विश्लेषण गर्नुहोस्।
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>नयाँ वास्तु प्रोजेक्ट थप्नुहोस्</span>
        </button>
      </div>

      {/* Projects Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => {
          const isActive = p.id === activeProjectId;
          const dirInfo = VASTU_PRIMARY_DIRECTIONS.find((d) => d.code === p.facingDirection);

          return (
            <div
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'border-emerald-600 bg-white dark:bg-stone-900 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/60 hover:border-emerald-400'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-base">
                      🏠
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 font-serif leading-tight">
                        {p.projectName}
                      </h3>
                      <span className="text-[10px] text-stone-500 font-medium">
                        मालिक: {p.ownerName}
                      </span>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>सक्रिय</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleDelete(p.id, e)}
                      className="p-1 text-stone-400 hover:text-rose-500 transition-colors"
                      title="प्रोजेक्ट मेटाउनुहोस्"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-emerald-600" />
                    <span>मोहडा (Facing): <strong>{dirInfo?.nameNepali || p.facingDirection}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>स्थान: {p.address || 'नेपाल'}</span>
                  </div>
                  {p.plotDimensions && (
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                      <span>क्षेत्रफल: {p.plotDimensions} • {p.propertyType}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <span className="text-[10px] text-stone-400">
                  {p.constructionStatus}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProject(p.id);
                    onNavigateToFloorPlan();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <span>फ्लोर प्लान हेर्नुहोस्</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#FAF8F5] dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="text-base font-black text-stone-900 dark:text-stone-100 font-serif flex items-center gap-2">
                <span>🏠</span>
                <span>नयाँ वास्तु प्रोजेक्ट सिर्जना</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    घर / भवनको नाम *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="उदा. शान्ति निवास"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    घरधनीको नाम *
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="उदा. गोपाल शर्मा"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    घरको मुख्य मोहडा (Facing Direction)
                  </label>
                  <select
                    value={facingDirection}
                    onChange={(e) => setFacingDirection(e.target.value as VastuPrimaryDirection)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium"
                  >
                    {VASTU_PRIMARY_DIRECTIONS.filter((d) => d.code !== 'CENTER').map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.nameNepali} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    सम्पत्ति प्रकार (Property Type)
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium"
                  >
                    <option value="आवासीय घर">आवासीय घर</option>
                    <option value="व्यापारिक भवन">व्यापारिक भवन</option>
                    <option value="कार्यालय">कार्यालय</option>
                    <option value="घडेरी / प्लट">घडेरी / प्लट</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    ठेगाना / स्थान
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="उदा. काठमाडौँ, महाराजगन्ज"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    सम्पर्क फोन नम्बर
                  </label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="९८..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    जग्गा / भवनको नाप
                  </label>
                  <input
                    type="text"
                    value={plotDimensions}
                    onChange={(e) => setPlotDimensions(e.target.value)}
                    placeholder="उदा. ३५ फिट x ४० फिट"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    निर्माणको अवस्था
                  </label>
                  <select
                    value={constructionStatus}
                    onChange={(e) => setConstructionStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium"
                  >
                    <option value="बनेको पुरानो घर">बनेको पुरानो घर</option>
                    <option value="निर्माणाधीन">निर्माणाधीन</option>
                    <option value="प्रस्तावित (नक्सा)">प्रस्तावित (नक्सा पास चरण)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold hover:bg-stone-100 cursor-pointer"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  प्रोजेक्ट सुरक्षित गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
