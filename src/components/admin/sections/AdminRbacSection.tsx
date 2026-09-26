import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Key,
  Check,
  X,
  AlertTriangle,
  Save,
  RotateCcw,
  Users
} from 'lucide-react';
import { SystemRole, DEFAULT_ROLE_PERMISSIONS, getRoleLabelNepali } from '../../../db/rbacStore';

export const ALL_GRANULAR_PERMISSIONS = [
  { code: 'VIEW', labelNepali: 'हेर्न पाउने (View Access)', desc: 'डेटा वा रिपोर्ट अवलोकन गर्ने अधिकार' },
  { code: 'CREATE', labelNepali: 'सिर्जना गर्न पाउने (Create)', desc: 'नयाँ रेकर्ड वा अर्डर थप्ने अधिकार' },
  { code: 'EDIT', labelNepali: 'सम्पादन (Edit)', desc: 'विद्यमान तथ्याङ्क परिवर्तन गर्ने अधिकार' },
  { code: 'DELETE', labelNepali: 'हटाउन पाउने (Delete)', desc: 'रेकर्ड वा डेटा मेट्ने उच्च अधिकार' },
  { code: 'APPROVE', labelNepali: 'स्वीकृति दिन पाउने (Approve)', desc: 'विशेषज्ञ वा सदस्य निवेदन स्वीकृत गर्ने' },
  { code: 'REJECT', labelNepali: 'अस्वीकृत गर्न पाउने (Reject)', desc: 'निवेदन वा अनुरोध खारेज गर्ने' },
  { code: 'VERIFY', labelNepali: 'भुक्तानी प्रमाणीकरण (Verify Payment)', desc: 'eSewa/Bank रसिद जाँच गरी स्वीकृत गर्ने' },
  { code: 'EXPORT', labelNepali: 'एक्सपोर्ट गर्न पाउने (Export PDF/CSV)', desc: 'प्रतिवेदनहरू डाउनलोड तथा प्रिन्ट गर्ने' },
  { code: 'MANAGE', labelNepali: 'पूर्ण व्यवस्थापन (Full Management)', desc: 'मोड्युलका सबै कार्य नियन्त्रण गर्ने' },
  { code: 'SETTINGS', labelNepali: 'प्रणाली सेटिङ्स (System Settings)', desc: 'दर, नियम र संस्थागत विवरण बदल्ने' },
];

export const AdminRbacSection: React.FC = () => {
  const [rolePermissions, setRolePermissions] = useState<Record<SystemRole, string[]>>({
    SUPER_ADMIN: ['*'],
    STORE_ADMIN: ['VIEW', 'CREATE', 'EDIT', 'APPROVE', 'VERIFY', 'EXPORT', 'MANAGE'],
    POS_STAFF: ['VIEW', 'CREATE', 'EXPORT'],
    CUSTOMER: ['VIEW', 'CREATE'],
    MARRIAGE_USER: ['VIEW', 'CREATE', 'EDIT'],
    MARRIAGE_MODERATOR: ['VIEW', 'EDIT', 'APPROVE', 'REJECT', 'VERIFY', 'MANAGE'],
  });

  const [selectedRole, setSelectedRole] = useState<SystemRole>('STORE_ADMIN');
  const [isSaved, setIsSaved] = useState(false);

  const togglePermission = (permCode: string) => {
    const current = rolePermissions[selectedRole] || [];
    let updated: string[];
    if (current.includes(permCode)) {
      updated = current.filter(p => p !== permCode);
    } else {
      updated = [...current, permCode];
    }
    setRolePermissions({ ...rolePermissions, [selectedRole]: updated });
    setIsSaved(false);
  };

  const handleSaveMatrix = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>उन्नत भूमिका र अधिकार नियन्त्रण (RBAC Matrix & Granular Permissions)</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            प्रणालीका हरेक भूमिकाका लागि सूक्ष्म पहुँच अधिकार (Granular Access Controls) तोक्नुहोस्।
          </p>
        </div>

        <button
          onClick={handleSaveMatrix}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold rounded-xl text-xs shadow transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSaved ? 'सुरक्षित भयो!' : 'अधिकार मेट्रिक्स बचत गर्नुहोस्'}</span>
        </button>
      </div>

      {/* Role Selection Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-2 overflow-x-auto">
        {(['SUPER_ADMIN', 'STORE_ADMIN', 'POS_STAFF', 'CUSTOMER'] as SystemRole[]).map(role => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedRole === role
                ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            {getRoleLabelNepali(role)} {role === 'SUPER_ADMIN' && '(Full Access)'}
          </button>
        ))}
      </div>

      {/* Permission Checkboxes Matrix */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div>
            <h3 className="font-bold text-stone-100 text-sm">
              {getRoleLabelNepali(selectedRole)} को लागि तोकिएका अधिकारहरू
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              {selectedRole === 'SUPER_ADMIN' ? 'Super Admin सँग सबै अधिकार पूर्ण रूपमा सुरक्षित हुन्छ।' : 'आवश्यकता अनुसार बक्समा टिक लगाउनुहोस्।'}
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-amber-950 text-amber-300 px-3 py-1 rounded-full border border-amber-800">
            {rolePermissions[selectedRole]?.length || 0} Permissions
          </span>
        </div>

        {selectedRole === 'SUPER_ADMIN' ? (
          <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-amber-200">मुख्य प्रशासक (Super Admin) - असीमित पूर्ण पहुँच</p>
              <p className="text-amber-300/80">
                Super Admin सँग प्रणालीको कुनै पनि भागमा बिना कुनै प्रतिबन्ध पूर्ण पहुँच छ। यो अधिकार हटाउन वा परिमार्जन गर्न मिल्दैन।
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ALL_GRANULAR_PERMISSIONS.map(perm => {
              const isChecked = rolePermissions[selectedRole]?.includes(perm.code) || rolePermissions[selectedRole]?.includes('*');
              return (
                <div
                  key={perm.code}
                  onClick={() => togglePermission(perm.code)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                    isChecked
                      ? 'bg-amber-950/30 border-amber-500/50 text-stone-100 shadow-sm'
                      : 'bg-stone-950/50 border-stone-800/80 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs">{perm.labelNepali}</span>
                      <span className="text-[10px] font-mono bg-stone-800 px-1.5 py-0.5 rounded text-stone-300">
                        {perm.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 leading-tight">{perm.desc}</p>
                  </div>

                  <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                    isChecked ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-transparent border border-stone-700'
                  }`}>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
