import React, { useState, useMemo } from 'react';
import { NEPAL_HOUSE_DESIGNS, NepalHouseDesign } from '../data/nepalHouseDesigns';
import { 
  Building2, Home, Compass, CheckCircle2, 
  ArrowRight, Search, Sparkles, X, 
  Layers, Ruler, Award, Eye, Wrench, Zap, Droplets
} from 'lucide-react';

interface NepalDesignsGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDesign: (design: NepalHouseDesign) => void;
}

export const NepalDesignsGalleryModal: React.FC<NepalDesignsGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectDesign
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'rcc' | 'roof'>('all');
  const [selectedDirection, setSelectedDirection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDesign, setPreviewDesign] = useState<NepalHouseDesign | null>(null);

  const filteredDesigns = useMemo(() => {
    return NEPAL_HOUSE_DESIGNS.filter(d => {
      if (activeCategory !== 'all' && d.category !== activeCategory) return false;
      if (selectedDirection !== 'all' && d.facingDirection !== selectedDirection) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          d.nameNepali.toLowerCase().includes(q) ||
          d.nameEnglish.toLowerCase().includes(q) ||
          d.plotAana.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeCategory, selectedDirection, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 via-red-800 to-orange-700 text-white p-5 sm:p-6 flex items-center justify-between relative">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-200 text-xs px-3 py-1 rounded-full font-medium border border-amber-300/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>नेपालको परिवेश अनुकूल ३२+ इन्जिनियरिङ नक्सा सङ्ग्रह</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>वास्तुसम्मत नेपाली घरका नक्साहरू (Nepal House Blueprints)</span>
            </h2>
            <p className="text-amber-100 text-xs sm:text-sm max-w-2xl">
              RCC पिल्लर फ्रेम तथा मौलिक छाना भएका नक्साहरू — पूर्ण नापजाँच, इन्जिनियरिङ मापदण्ड, झ्याल-ढोका, धारापानी र बिजुली वाइरिङ सहित।
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors text-white/90 hover:text-white"
            title="बन्द गर्नुहोस्"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeCategory === 'all'
                  ? 'bg-red-800 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-300'
              }`}
            >
              सबै ({NEPAL_HOUSE_DESIGNS.length})
            </button>
            <button
              onClick={() => setActiveCategory('rcc')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeCategory === 'rcc'
                  ? 'bg-blue-700 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-300'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>🏢 RCC पिल्लर प्रणाली (१६)</span>
            </button>
            <button
              onClick={() => setActiveCategory('roof')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeCategory === 'roof'
                  ? 'bg-amber-700 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-300'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>🏯 नेपाली छाना/परम्परागत (१६)</span>
            </button>
          </div>

          {/* Search and Direction Filter */}
          <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
            <div className="relative flex-grow sm:w-56">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="नक्सा खोज्नुहोस्..."
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700 text-slate-800"
              />
            </div>
            <select
              value={selectedDirection}
              onChange={(e) => setSelectedDirection(e.target.value)}
              className="px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700 text-slate-800"
            >
              <option value="all">सबै मोहोडा (Facing)</option>
              <option value="E">पूर्व (East)</option>
              <option value="N">उत्तर (North)</option>
              <option value="S">दक्षिण (South)</option>
              <option value="W">पश्चिम (West)</option>
              <option value="NE">ईशान (North-East)</option>
            </select>
          </div>
        </div>

        {/* Content Body: Grid of Designs */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDesigns.map((design) => (
              <div
                key={design.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col overflow-hidden hover:border-red-400 group"
              >
                {/* Card Top Banner */}
                <div className={`p-4 ${design.category === 'rcc' ? 'bg-gradient-to-r from-blue-900 to-indigo-900' : 'bg-gradient-to-r from-amber-900 to-orange-950'} text-white relative`}>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white/20 text-white backdrop-blur-sm">
                      {design.category === 'rcc' ? '🏢 RCC Frame' : '🏯 Traditional Roof'}
                    </span>
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-md">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>वास्तु स्कोर: {design.vastuScore}%</span>
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white leading-snug line-clamp-1 group-hover:text-amber-300 transition-colors">
                    {design.nameNepali}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-300 mt-2">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      <span>{design.floorsCount} तला</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      <span>{design.facingDirection} मोहोडा</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Ruler className="w-3.5 h-3.5 text-amber-400" />
                      <span>{design.plotAana}</span>
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {design.description}
                  </p>

                  {/* Engineering Specs Pills */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500">पिल्लर संख्या:</span>
                      <span className="font-semibold text-slate-800">{design.columnsCount} वटा ({design.columnSize})</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500">बिल्ट-अप एरिया:</span>
                      <span className="font-semibold text-slate-800">{design.builtUpAreaSqFt} sq.ft</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500">कुल कोठा संख्या:</span>
                      <span className="font-semibold text-slate-800">{design.rooms.length} वटा</span>
                    </div>
                  </div>

                  {/* Vastu highlights tags */}
                  <div className="flex flex-wrap gap-1">
                    {design.vastuHighlights.slice(0, 2).map((vh, i) => (
                      <span key={i} className="text-[11px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{vh}</span>
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                    <button
                      onClick={() => setPreviewDesign(design)}
                      className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1 flex-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>विस्तृत हेर्नुहोस्</span>
                    </button>
                    <button
                      onClick={() => {
                        onSelectDesign(design);
                        onClose();
                      }}
                      className="px-3 py-2 text-xs font-semibold text-white bg-red-800 hover:bg-red-900 rounded-lg transition-colors flex items-center justify-center gap-1 flex-1 shadow-sm"
                    >
                      <span>नक्सा लोड गर्नुहोस्</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDesigns.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p className="text-base font-semibold">कुनै नक्सा फेला परेन।</p>
              <p className="text-xs mt-1">कृपया खोज शब्द वा फिल्टर परिवर्तन गर्नुहोस्।</p>
            </div>
          )}
        </div>

        {/* Detailed Preview Modal Overlay if preview is clicked */}
        {previewDesign && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-slate-300">
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div>
                  <span className="text-xs font-semibold text-red-800 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                    {previewDesign.categoryLabelNepali}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">{previewDesign.nameNepali}</h3>
                  <p className="text-xs text-slate-500">{previewDesign.nameEnglish}</p>
                </div>
                <button
                  onClick={() => setPreviewDesign(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-4 text-xs text-slate-700">
                <p className="leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {previewDesign.description}
                </p>

                {/* Technical Specifications */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-sm">
                    <Wrench className="w-4 h-4 text-red-800" />
                    <span>इन्जिनियरिङ तथा स्ट्रक्चरल विवरण</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div><strong>घडेरी क्षेत्रफल:</strong> {previewDesign.plotAana}</div>
                    <div><strong>लम्बाइ × चौडाइ:</strong> {previewDesign.plotLengthFt}' × {previewDesign.plotWidthFt}'</div>
                    <div><strong>पिल्लर संख्या:</strong> {previewDesign.columnsCount} वटा ({previewDesign.columnSize})</div>
                    <div><strong>डण्डी (Rebar):</strong> {previewDesign.rebarSpecification}</div>
                    <div><strong>कुल निर्मित क्षेत्रफल:</strong> {previewDesign.builtUpAreaSqFt} sq.ft</div>
                    <div><strong>वास्तु सन्तुलन स्कोर:</strong> {previewDesign.vastuScore}% (अत्युत्तम)</div>
                  </div>
                </div>

                {/* Room Schedule */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-sm">
                    <Layers className="w-4 h-4 text-red-800" />
                    <span>कोठाहरूको नामावली तथा नाप ({previewDesign.rooms.length} वटा कोठा)</span>
                  </h4>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {previewDesign.rooms.map((r, i) => (
                      <div key={i} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-400">{i + 1}.</span>
                          <span className="font-medium text-slate-800">{r.nameNepali}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {r.floorNumber === 0 ? 'तला ० (GF)' : r.floorNumber === 1 ? 'तला १ (1F)' : 'तला २ (2F)'}
                          </span>
                        </div>
                        <div className="text-slate-600">
                          {r.minLength}' × {r.minWidth}' | दिशा: {r.preferredDirection || 'CENTER'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plumbing & Electrical */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200">
                    <h5 className="font-bold text-blue-900 flex items-center gap-1 mb-1.5">
                      <Droplets className="w-3.5 h-3.5 text-blue-700" />
                      <span>धारा, पानी तथा निकास (Plumbing)</span>
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-blue-950 text-[11px]">
                      {previewDesign.plumbingFeatures.map((pf, idx) => (
                        <li key={idx}>{pf}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                    <h5 className="font-bold text-amber-900 flex items-center gap-1 mb-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-700" />
                      <span>बिजुली बत्ती तथा सोलार (Electrical)</span>
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-amber-950 text-[11px]">
                      {previewDesign.electricalFeatures.map((ef, idx) => (
                        <li key={idx}>{ef}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={() => setPreviewDesign(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  बन्द गर्नुहोस्
                </button>
                <button
                  onClick={() => {
                    onSelectDesign(previewDesign);
                    setPreviewDesign(null);
                    onClose();
                  }}
                  className="px-5 py-2 text-xs font-bold text-white bg-red-800 hover:bg-red-900 rounded-xl shadow-md flex items-center gap-2"
                >
                  <span>यो नक्सा पूर्ण रूपमा लोड गर्नुहोस्</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>कुल उपलब्ध डिजाइन: {NEPAL_HOUSE_DESIGNS.length} वटा (RCC: १६, परम्परागत/छाना: १६)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            बन्द गर्नुहोस्
          </button>
        </div>
      </div>
    </div>
  );
};
