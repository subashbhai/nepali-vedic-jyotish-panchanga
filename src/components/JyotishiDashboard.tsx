import React from 'react';
import { JyotishMainView, JyotishMainViewProps } from './JyotishMainView';

export interface JyotishiDashboardProps extends Omit<JyotishMainViewProps, 'onExit'> {
  onExit?: () => void;
}

export const JyotishiDashboard: React.FC<JyotishiDashboardProps> = (props) => {
  return (
    <JyotishMainView
      {...props}
      onExit={props.onExit || (() => props.onNavigate('dashboard'))}
    />
  );
};

export default JyotishiDashboard;
