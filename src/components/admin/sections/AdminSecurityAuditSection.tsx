import React from 'react';
import { ShieldCheck, Lock, Activity, Eye, Search, AlertTriangle } from 'lucide-react';
import { AdminAuditLogRecord } from '../../../db/adminStore';

interface AdminSecurityAuditSectionProps {
  auditLogs: AdminAuditLogRecord[];
  onRefresh: () => void;
}

export const AdminSecurityAuditSection: React.FC<AdminSecurityAuditSectionProps> = ({ auditLogs, onRefresh }) => {
  return (
    <div className="space-y-6">
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            <span>सुरक्षा केन्द्र तथा अडिट लग इतिहास (Security & Audit Trail)</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">प्रशासकिय गतिविधिहरू, लगइन प्रयास र प्रणाली परिवर्तनको अभेद्य रेकर्ड।</p>
        </div>
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-md overflow-x-auto">
        <table className="w-full text-left text-xs text-stone-300">
          <thead className="bg-stone-950 text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-800">
            <tr>
              <th className="p-3">मिति र समय</th>
              <th className="p-3">प्रशासक / भूमिका</th>
              <th className="p-3">क्याटेगोरी</th>
              <th className="p-3">कार्य विवरण</th>
              <th className="p-3">लक्षित व्यक्ति/विषय</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800">
            {auditLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-stone-500 italic">कुनै अडिट लग भेटिएन।</td>
              </tr>
            ) : (
              auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-stone-800/40">
                  <td className="p-3 font-mono text-stone-400">{log.timestampBS}</td>
                  <td className="p-3 font-bold text-stone-100">{log.adminUsername} ({log.adminRoleNameNepali})</td>
                  <td className="p-3 text-amber-300 uppercase font-mono text-[10px]">{log.actionCategory}</td>
                  <td className="p-3 text-stone-200">{log.actionTitleNepali} - {log.detailsNepali}</td>
                  <td className="p-3 font-bold text-stone-300">{log.targetName}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
