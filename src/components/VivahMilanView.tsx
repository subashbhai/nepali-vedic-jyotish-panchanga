import React, { memo } from 'react';
import { BirthDetails } from '../types/astrology';
import { VivahMainView } from './vivah/VivahMainView';
import { RBACSession } from '../db/rbacStore';

interface VivahMilanViewProps {
  profiles: BirthDetails[];
  activeProfile?: BirthDetails;
  rbacSession?: RBACSession | null;
  onOpenAuthModal?: () => void;
}

export const VivahMilanView: React.FC<VivahMilanViewProps> = memo(({
  profiles,
  activeProfile,
  rbacSession,
  onOpenAuthModal,
}) => {
  return (
    <div className="w-full">
      <VivahMainView
        rbacSession={rbacSession}
        onOpenAuthModal={onOpenAuthModal}
      />
    </div>
  );
});
