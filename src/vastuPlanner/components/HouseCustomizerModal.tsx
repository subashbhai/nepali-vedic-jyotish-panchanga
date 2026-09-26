import React, { useState } from 'react';
import { VastuPlannerProject, PlannedRoom, RoomCategory, CompassDirection } from '../types';
import { 
  Layers, Plus, Trash2, DoorClosed, 
  Droplets, Zap, Tv, 
  X, Check, Save, Compass
} from 'lucide-react';

interface HouseCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: VastuPlannerProject;
  onUpdateProject: (updatedProject: VastuPlannerProject) => void;
}

const ROOM_CATEGORIES: { id: RoomCategory; nameNepali: string; defaultDir: CompassDirection }[] = [
  { id: 'living', nameNepali: 'बैठक कोठा (Living Room)', defaultDir: 'E' },
  { id: 'kitchen', nameNepali: 'भान्सा कोठा (Kitchen)', defaultDir: 'SE' },
  { id: 'master_bedroom', nameNepali: 'मास्टर बेड (Master Bed)', defaultDir: 'SW' },
  { id: 'bedroom', nameNepali: 'शयनकक्ष (Bedroom)', defaultDir: 'W' },
  { id: 'pooja', nameNepali: 'पूजा कोठा (Pooja Room)', defaultDir: 'NE' },
  { id: 'dining', nameNepali: 'भोजन कक्ष (Dining)', defaultDir: 'E' },
  { id: 'toilet', nameNepali: 'शौचालय / बाथरुम (Toilet/Bath)', defaultDir: 'NW' },
  { id: 'study', nameNepali: 'अध्ययन कक्ष (Study/Office)', defaultDir: 'N' },
  { id: 'store', nameNepali: 'भण्डार कोठा (Store)', defaultDir: 'SW' },
  { id: 'garage', nameNepali: 'पार्किङ / ग्यारेज (Garage)', defaultDir: 'S' },
  { id: 'balcony', nameNepali: 'बरण्डा / बालकनी (Balcony)', defaultDir: 'E' }
];

const AVAILABLE_APPLIANCES = [
  { id: 'sofa', nameNepali: 'सोफा सेट (Sofa)', icon: '🛋️' },
  { id: 'tv_unit', nameNepali: 'स्मार्ट TV र कन्सोल (TV Unit)', icon: '📺' },
  { id: 'bed', nameNepali: 'डबल खाट (Double Bed)', icon: '🛏️' },
  { id: 'dining_table', nameNepali: 'डाइनिङ टेबल (Dining)', icon: '🍽️' },
  { id: 'fridge', nameNepali: 'फ्रिज (Refrigerator)', icon: '🧊' },
  { id: 'stove', nameNepali: 'ग्यास चुलो (Gas Stove)', icon: '🔥' },
  { id: 'mandir', nameNepali: 'काठको मन्दिर र दियो (Mandir)', icon: '🪔' },
  { id: 'washing_machine', nameNepali: 'वासिङ मेसिन (Washer)', icon: '🧺' },
  { id: 'wardrobe', nameNepali: 'कपडा दराज (Wardrobe)', icon: '🚪' }
];

export const HouseCustomizerModal: React.FC<HouseCustomizerModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject
}) => {
  const [activeFloor, setActiveFloor] = useState<number>(0);
  const [rooms, setRooms] = useState<PlannedRoom[]>(project.rooms || []);
  const [floorCount, setFloorCount] = useState<number>(project.floorCount || 2);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    project.rooms && project.rooms.length > 0 ? project.rooms[0].id : null
  );

  if (!isOpen) return null;

  const floorRooms = rooms.filter(r => r.floorNumber === activeFloor);
  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  // Add a new room to active floor
  const handleAddRoom = () => {
    const newId = `room-${Date.now()}`;
    const newRoom: PlannedRoom = {
      id: newId,
      category: 'bedroom',
      nameNepali: `नयाँ कोठा (तला ${activeFloor})`,
      preferredDirection: 'W',
      floorNumber: activeFloor,
      minLength: 12,
      minWidth: 12,
      doorCount: 1,
      doorType: 'D2',
      windowCount: 2,
      windowType: 'W1',
      hasChhajja: true,
      hasPlumbing: false,
      lightPointsCount: 2,
      fanPointsCount: 1,
      powerSocketsCount: 2,
      appliances: ['bed'],
      priority: 'high'
    };
    setRooms([...rooms, newRoom]);
    setSelectedRoomId(newId);
  };

  // Delete a room
  const handleDeleteRoom = (id: string) => {
    const updated = rooms.filter(r => r.id !== id);
    setRooms(updated);
    if (selectedRoomId === id) {
      setSelectedRoomId(updated.length > 0 ? updated[0].id : null);
    }
  };

  // Update room attribute
  const updateRoomField = (id: string, field: keyof PlannedRoom, value: any) => {
    setRooms(rooms.map(r => (r.id === id ? { ...r, [field]: value } : r)));
  };

  // Toggle appliance in room
  const toggleAppliance = (roomId: string, applianceId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    const current = room.appliances || [];
    const exists = current.includes(applianceId);
    const updated = exists ? current.filter(a => a !== applianceId) : [...current, applianceId];
    updateRoomField(roomId, 'appliances', updated);
  };

  // Save changes back to main project
  const handleSave = () => {
    onUpdateProject({
      ...project,
      floorCount,
      rooms
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 via-amber-800 to-red-900 text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-xs bg-white/20 text-amber-200 px-3 py-0.5 rounded-full font-medium">
              इन्जिनियरिङ तथा इन्टेरियर कस्टमाइजर
            </span>
            <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
              <span>घरको तला, कोठा, झ्याल-ढोका, धारापानी र बत्ती व्यवस्थापन</span>
            </h2>
            <p className="text-xs text-amber-100 mt-0.5">
              प्रत्येक तलामा कति कोठा, कतिवटा झ्याल र ढोका, धारापानी फिटिङ, बिजुली बत्ती र घरायसी सामग्री (Appliances) थप्नुहोस् वा हटाउनुहोस्।
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Floor selector & Floor count bar */}
        <div className="bg-slate-100 p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <Layers className="w-4 h-4 text-red-800" />
              <span>तला छान्नुहोस्:</span>
            </span>
            {Array.from({ length: floorCount }).map((_, fIdx) => (
              <button
                key={fIdx}
                onClick={() => {
                  setActiveFloor(fIdx);
                  const firstOfFloor = rooms.find(r => r.floorNumber === fIdx);
                  if (firstOfFloor) setSelectedRoomId(firstOfFloor.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFloor === fIdx
                    ? 'bg-red-800 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                {fIdx === 0 ? 'भुइँतला (GF)' : fIdx === 1 ? 'पहिलो तला (1F)' : fIdx === 2 ? 'दोस्रो तला (2F)' : `तला ${fIdx}`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">कुल तला संख्या:</span>
            <select
              value={floorCount}
              onChange={(e) => setFloorCount(Number(e.target.value))}
              className="text-xs font-bold bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800"
            >
              <option value={1}>१ तला (Bungalow)</option>
              <option value={2}>२ तला (2 Storey)</option>
              <option value={3}>२.५ / ३ तला (Standard)</option>
              <option value={4}>४ तला (Apartment)</option>
            </select>
          </div>
        </div>

        {/* Two-Column Editor Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          
          {/* Left Column: Rooms in Active Floor */}
          <div className="md:col-span-5 p-4 bg-slate-50/70 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {activeFloor === 0 ? 'भुइँतला' : activeFloor === 1 ? 'पहिलो तला' : `तला ${activeFloor}`} का कोठाहरू ({floorRooms.length} वटा)
              </h3>
              <button
                onClick={handleAddRoom}
                className="px-2.5 py-1 text-xs font-semibold bg-red-800 text-white hover:bg-red-900 rounded-lg shadow-sm flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>नयाँ कोठा थप्नुहोस्</span>
              </button>
            </div>

            <div className="space-y-2">
              {floorRooms.map((room) => {
                const isSelected = room.id === selectedRoomId;
                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-white border-red-800 shadow-md ring-1 ring-red-800'
                        : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-700"></span>
                        <span>{room.nameNepali}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {room.minLength}' × {room.minWidth}' | दिशा: {room.preferredDirection || 'E'} | ढोका: {room.doorCount || 1}, झ्याल: {room.windowCount || 1}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRoom(room.id);
                      }}
                      className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded"
                      title="हटाउनुहोस्"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}

              {floorRooms.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                  यो तलामा हाल कुनै कोठा छैन। 'नयाँ कोठा थप्नुहोस्' थिच्नुहोस्।
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Selected Room Deep Customizer */}
          <div className="md:col-span-7 p-4 sm:p-5 overflow-y-auto space-y-4">
            {selectedRoom ? (
              <div className="space-y-5">
                
                {/* Basic Room Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">कोठाको नाम (Nepali Name)</label>
                    <input
                      type="text"
                      value={selectedRoom.nameNepali}
                      onChange={(e) => updateRoomField(selectedRoom.id, 'nameNepali', e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-red-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">कोठाको प्रकार (Category)</label>
                    <select
                      value={selectedRoom.category}
                      onChange={(e) => {
                        const cat = e.target.value as RoomCategory;
                        const match = ROOM_CATEGORIES.find(c => c.id === cat);
                        updateRoomField(selectedRoom.id, 'category', cat);
                        if (match) updateRoomField(selectedRoom.id, 'preferredDirection', match.defaultDir);
                      }}
                      className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-red-700"
                    >
                      {ROOM_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nameNepali}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">वास्तु दिशा (Preferred Direction)</label>
                    <select
                      value={selectedRoom.preferredDirection || 'E'}
                      onChange={(e) => updateRoomField(selectedRoom.id, 'preferredDirection', e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                    >
                      <option value="E">पूर्व (East - इन्द्र/सूर्य)</option>
                      <option value="SE">आग्नेय (South-East - अग्नि भान्सा)</option>
                      <option value="S">दक्षिण (South - यम)</option>
                      <option value="SW">नैऋत्य (South-West - मास्टर बेड)</option>
                      <option value="W">पश्चिम (West - वरुण)</option>
                      <option value="NW">वायव्य (North-West - हावा/शौचालय)</option>
                      <option value="N">उत्तर (North - कुबेर)</option>
                      <option value="NE">ईशान (North-East - पूजा/ईश्वर)</option>
                      <option value="CENTER">ब्रह्मस्थान (Center - आँगन)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700">लम्बाइ (Length Ft)</label>
                      <input
                        type="number"
                        value={selectedRoom.minLength}
                        onChange={(e) => updateRoomField(selectedRoom.id, 'minLength', Number(e.target.value))}
                        className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700">चौडाइ (Width Ft)</label>
                      <input
                        type="number"
                        value={selectedRoom.minWidth}
                        onChange={(e) => updateRoomField(selectedRoom.id, 'minWidth', Number(e.target.value))}
                        className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Doors & Windows (झ्याल र ढोका) */}
                <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80 space-y-3">
                  <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <DoorClosed className="w-4 h-4 text-amber-800" />
                    <span>झ्याल र ढोकाको संख्या तथा साइज (Doors & Windows)</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600">ढोका संख्या (Doors):</label>
                      <select
                        value={selectedRoom.doorCount || 1}
                        onChange={(e) => updateRoomField(selectedRoom.id, 'doorCount', Number(e.target.value))}
                        className="w-full mt-1 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                      >
                        <option value={1}>१ वटा</option>
                        <option value={2}>२ वटा</option>
                        <option value={3}>३ वटा</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600">ढोका प्रकार:</label>
                      <select
                        value={selectedRoom.doorType || 'D2'}
                        onChange={(e) => updateRoomField(selectedRoom.id, 'doorType', e.target.value)}
                        className="w-full mt-1 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="D1">D1 (मुख्य ३'६"×७')</option>
                        <option value="D2">D2 (आन्तरिक ३'×७')</option>
                        <option value="D3">D3 (शौचालय २'६"×७')</option>
                        <option value="sliding">स्लाइडिङ ग्लास डोर</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600">झ्याल संख्या (Windows):</label>
                      <select
                        value={selectedRoom.windowCount ?? 2}
                        onChange={(e) => updateRoomField(selectedRoom.id, 'windowCount', Number(e.target.value))}
                        className="w-full mt-1 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                      >
                        <option value={0}>० वटा (झ्याल छैन)</option>
                        <option value={1}>१ वटा झ्याल</option>
                        <option value={2}>२ वटा झ्याल</option>
                        <option value={3}>३ वटा झ्याल</option>
                        <option value={4}>४ वटा झ्याल</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600">झ्याल प्रकार:</label>
                      <select
                        value={selectedRoom.windowType || 'W1'}
                        onChange={(e) => updateRoomField(selectedRoom.id, 'windowType', e.target.value)}
                        className="w-full mt-1 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="W1">W1 (५'×४'६" ठूलो)</option>
                        <option value="W2">W2 (४'×४'६" मध्यम)</option>
                        <option value="V1">V1 (२'×१'६" भेन्टिलेसन)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section: Plumbing & Electrical (धारापानी र बिजुली बत्ती) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Plumbing */}
                  <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200 text-xs space-y-2">
                    <h4 className="font-bold text-blue-900 flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-blue-700" />
                      <span>धारापानी र निकास (Plumbing)</span>
                    </h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRoom.hasPlumbing || false}
                        onChange={(e) => updateRoomField(selectedRoom.id, 'hasPlumbing', e.target.checked)}
                        className="rounded text-blue-700 focus:ring-blue-600"
                      />
                      <span className="font-medium text-slate-700">यो कोठामा पानी पाइप/धारा छ</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRoom.attachedToilet || false}
                        onChange={(e) => updateRoomField(selectedRoom.id, 'attachedToilet', e.target.checked)}
                        className="rounded text-blue-700 focus:ring-blue-600"
                      />
                      <span className="font-medium text-slate-700">अट्याच्ड शौचालय (Attached Toilet)</span>
                    </label>
                  </div>

                  {/* Electrical */}
                  <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 text-xs space-y-2">
                    <h4 className="font-bold text-amber-900 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-700" />
                      <span>बिजुली बत्ती र फ्यान (Electrical)</span>
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">LED लाइट पोइन्ट:</span>
                      <select
                        value={selectedRoom.lightPointsCount || 2}
                        onChange={(e) => updateRoomField(selectedRoom.id, 'lightPointsCount', Number(e.target.value))}
                        className="px-2 py-0.5 text-xs bg-white border border-slate-300 rounded"
                      >
                        <option value={1}>१ वटा</option>
                        <option value={2}>२ वटा</option>
                        <option value={3}>३ वटा</option>
                        <option value={4}>४ वटा</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">सिलिङ फ्यान पोइन्ट:</span>
                      <select
                        value={selectedRoom.fanPointsCount ?? 1}
                        onChange={(e) => updateRoomField(selectedRoom.id, 'fanPointsCount', Number(e.target.value))}
                        className="px-2 py-0.5 text-xs bg-white border border-slate-300 rounded"
                      >
                        <option value={0}>० वटा</option>
                        <option value={1}>१ वटा</option>
                        <option value={2}>२ वटा</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section: Interior Decor & Home Appliances (घरायसी सामग्री राख्ने / हटाउने) */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Tv className="w-4 h-4 text-red-800" />
                      <span>इन्टेरियर डेकोर तथा घरायसी सामान (Home Appliances)</span>
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      राख्न / हटाउन क्लिक गर्नुहोस्
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AVAILABLE_APPLIANCES.map((app) => {
                      const isEquipped = (selectedRoom.appliances || []).includes(app.id);
                      return (
                        <button
                          key={app.id}
                          onClick={() => toggleAppliance(selectedRoom.id, app.id)}
                          className={`p-2 rounded-lg border text-left text-xs flex items-center gap-2 transition-all ${
                            isEquipped
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-sm">{app.icon}</span>
                          <span className="truncate flex-1 text-[11px]">{app.nameNepali}</span>
                          {isEquipped && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                बायाँबाट कोठा छान्नुहोस्
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            कुल कोठा: <strong>{rooms.length}</strong> वटा | कुल तला: <strong>{floorCount}</strong> तला
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg"
            >
              रद्द गर्नुहोस्
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-1.5 text-xs font-bold text-white bg-red-800 hover:bg-red-900 rounded-lg shadow-md flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>परिवर्तनहरू सेभ गर्नुहोस्</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
