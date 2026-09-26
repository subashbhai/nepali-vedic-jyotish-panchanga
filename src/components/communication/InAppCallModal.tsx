import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, ShieldCheck, User } from 'lucide-react';
import { CallSession, CallStatus } from '../../types/communicationTypes';
import { updateCallStatus } from '../../db/communicationStore';

interface InAppCallModalProps {
  session: CallSession;
  currentUserId: string;
  onClose: () => void;
}

export const InAppCallModal: React.FC<InAppCallModalProps> = ({ session, currentUserId, onClose }) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(session.status);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [durationSeconds, setDurationSeconds] = useState(0);

  const isCaller = currentUserId === session.callerId;
  const peerName = isCaller ? session.receiverName : session.callerName;
  const peerPhoto = isCaller ? session.receiverPhoto : session.callerPhoto;
  const peerRole = isCaller ? (session.receiverType === 'PROVIDER' ? 'सेवा प्रदायक' : 'यजमान') : (session.callerType === 'PROVIDER' ? 'सेवा प्रदायक' : 'यजमान');

  // Simulate call progression (calling -> ringing -> connected)
  useEffect(() => {
    let timer: any;
    if (callStatus === 'calling') {
      timer = setTimeout(() => {
        setCallStatus('ringing');
        updateCallStatus(session.id, 'ringing');
      }, 2000);
    } else if (callStatus === 'ringing') {
      timer = setTimeout(() => {
        setCallStatus('connected');
        updateCallStatus(session.id, 'connected');
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [callStatus, session.id]);

  // Live duration counter when connected
  useEffect(() => {
    let interval: any;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const handleEndCall = () => {
    setCallStatus('ended');
    updateCallStatus(session.id, 'ended', { durationSeconds });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleRejectCall = () => {
    setCallStatus('rejected');
    updateCallStatus(session.id, 'rejected');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800 rounded-3xl p-6 text-stone-100 flex flex-col items-center shadow-2xl relative overflow-hidden">
        
        {/* Top Encryption Security Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-[11px] font-bold text-emerald-400 mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>सुरक्षित एन्क्रिप्टेड इन-एप कल</span>
        </div>

        {/* User Avatar with Ring Effect */}
        <div className="relative my-4">
          {callStatus === 'calling' || callStatus === 'ringing' ? (
            <div className="absolute -inset-3 rounded-full bg-amber-500/20 animate-ping" />
          ) : null}
          <div className="w-28 h-28 rounded-full border-2 border-amber-500/50 p-1 bg-stone-900 relative z-10 shadow-xl overflow-hidden flex items-center justify-center">
            {peerPhoto ? (
              <img src={peerPhoto} alt={peerName} className="w-full h-full object-cover rounded-full" />
            ) : (
              <User className="w-12 h-12 text-stone-500" />
            )}
          </div>
        </div>

        {/* Peer Info */}
        <h3 className="text-xl font-bold text-stone-100 mt-2 text-center">{peerName}</h3>
        <p className="text-xs text-amber-400 font-serif mb-4">{peerRole}</p>

        {/* Call Status Indicator */}
        <div className="my-3 text-center">
          {callStatus === 'calling' && (
            <p className="text-sm font-semibold text-stone-400 animate-pulse">सम्पर्क गर्दैछ... (Calling)</p>
          )}
          {callStatus === 'ringing' && (
            <p className="text-sm font-semibold text-amber-400 animate-pulse">घण्टी जाँदैछ... (Ringing)</p>
          )}
          {callStatus === 'connected' && (
            <p className="text-base font-bold text-emerald-400 font-mono tracking-wider">
              {formatDuration(durationSeconds)}
            </p>
          )}
          {callStatus === 'ended' && (
            <p className="text-sm font-bold text-stone-400">कल समाप्त भयो ({formatDuration(durationSeconds)})</p>
          )}
          {callStatus === 'rejected' && (
            <p className="text-sm font-bold text-rose-400">कल अस्वीकृत भयो</p>
          )}
        </div>

        {/* Control Action Bar */}
        <div className="w-full mt-8 flex items-center justify-center gap-6">
          {callStatus === 'connected' && (
            <>
              {/* Mute Toggle */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isMuted ? 'bg-rose-900/80 text-rose-300 border border-rose-700' : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
                }`}
                title={isMuted ? 'माइक्रोफोन अन गर्नुहोस्' : 'माइक्रोफोन बन्द गर्नुहोस्'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-950 transition-all cursor-pointer transform active:scale-95"
                title="कल समाप्त गर्नुहोस्"
              >
                <PhoneOff className="w-7 h-7" />
              </button>

              {/* Speaker Toggle */}
              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  !isSpeakerOn ? 'bg-stone-800 text-stone-500' : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
                }`}
                title="स्पीकर बदल्नुहोस्"
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </>
          )}

          {(callStatus === 'calling' || callStatus === 'ringing') && (
            <div className="flex gap-6 items-center">
              {!isCaller && (
                <button
                  onClick={() => {
                    setCallStatus('connected');
                    updateCallStatus(session.id, 'connected');
                  }}
                  className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-950 transition-all cursor-pointer"
                  title="कल उठाउनुहोस्"
                >
                  <Phone className="w-6 h-6" />
                </button>
              )}
              <button
                onClick={handleRejectCall}
                className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-950 transition-all cursor-pointer"
                title="कल रद्द गर्नुहोस्"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          )}

          {(callStatus === 'ended' || callStatus === 'rejected') && (
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl cursor-pointer"
            >
              बन्द गर्नुहोस्
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
