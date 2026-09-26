import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Phone,
  MessageSquare,
  Lock,
  Unlock,
  ShieldCheck,
  Check,
  CheckCheck,
  Play,
  Pause,
  Trash2,
  CornerUpLeft,
  X,
  Download,
  AlertCircle,
  ExternalLink,
  Volume2
} from 'lucide-react';

import { ChatMessage, CallSession } from '../../types/communicationTypes';
import {
  deleteMessageForSelf,
  getMessagesByBooking,
  isContactUnlocked,
  markMessagesAsRead,
  sendChatMessage,
  initiateCallSession
} from '../../db/communicationStore';

interface SecureChatPanelProps {
  bookingId: string;
  bookingCode?: string;
  currentUserId: string;
  currentUserName: string;
  currentUserType: 'YAJAMAN' | 'PROVIDER';
  peerUserId: string;
  peerUserName: string;
  peerUserPhone?: string;
  peerUserEmail?: string;
  peerUserPhoto?: string;
  peerTitle?: string;
  onInitiateCall?: (session: CallSession) => void;
  onReportUser?: () => void;
  onClose?: () => void;
}

export const SecureChatPanel: React.FC<SecureChatPanelProps> = ({
  bookingId,
  bookingCode,
  currentUserId,
  currentUserName,
  currentUserType,
  peerUserId,
  peerUserName,
  peerUserPhone,
  peerUserEmail,
  peerUserPhoto,
  peerTitle,
  onInitiateCall,
  onReportUser,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [replyToMsg, setReplyToMsg] = useState<ChatMessage | null>(null);

  // Voice recording states
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  // Media attachment states
  const [selectedFile, setSelectedFile] = useState<{
    url: string;
    name: string;
    type: string;
    sizeStr: string;
  } | null>(null);

  // Playing voice message tracker
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);

  const isUnlocked = isContactUnlocked(bookingId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load messages and mark read
  useEffect(() => {
    if (!bookingId) return;
    const list = getMessagesByBooking(bookingId, currentUserId);
    setMessages(list);
    markMessagesAsRead(bookingId, currentUserId);

    const interval = setInterval(() => {
      const fresh = getMessagesByBooking(bookingId, currentUserId);
      setMessages(fresh);
      markMessagesAsRead(bookingId, currentUserId);
    }, 2000);

    return () => clearInterval(interval);
  }, [bookingId, currentUserId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice Recording Timer
  useEffect(() => {
    let interval: any;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  // Send Text / Attachment
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isUnlocked) return;

    if (selectedFile) {
      const isImg = selectedFile.type.startsWith('image/');
      sendChatMessage(
        bookingId,
        currentUserId,
        currentUserName,
        currentUserType,
        isImg ? 'image' : 'document',
        {
          textContent: textInput.trim() || undefined,
          attachmentUrl: selectedFile.url,
          attachmentName: selectedFile.name,
          attachmentType: selectedFile.type,
          attachmentSize: selectedFile.sizeStr,
          replyToMessageId: replyToMsg?.id,
          replyToText: replyToMsg?.textContent || replyToMsg?.attachmentName,
        }
      );
      setSelectedFile(null);
      setTextInput('');
      setReplyToMsg(null);
      refreshMessages();
      return;
    }

    if (!textInput.trim()) return;

    sendChatMessage(
      bookingId,
      currentUserId,
      currentUserName,
      currentUserType,
      'text',
      {
        textContent: textInput.trim(),
        replyToMessageId: replyToMsg?.id,
        replyToText: replyToMsg?.textContent,
      }
    );

    setTextInput('');
    setReplyToMsg(null);
    refreshMessages();
  };

  // Send Voice Recording
  const handleSendVoiceMessage = () => {
    if (!recordingSeconds) return;

    // Simulated recorded audio data URL
    const simulatedAudioUrl = 'https://actions.google.com/sounds/v1/ambiences/outdoor_park.ogg';

    sendChatMessage(
      bookingId,
      currentUserId,
      currentUserName,
      currentUserType,
      'voice',
      {
        attachmentUrl: simulatedAudioUrl,
        voiceDurationSeconds: recordingSeconds,
      }
    );

    setIsRecordingVoice(false);
    setRecordingSeconds(0);
    setRecordedAudioUrl(null);
    refreshMessages();
  };

  const handleStartVoiceRecord = () => {
    setIsRecordingVoice(true);
    setRecordingSeconds(0);
  };

  const handleCancelVoiceRecord = () => {
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
  };

  const refreshMessages = () => {
    const fresh = getMessagesByBooking(bookingId, currentUserId);
    setMessages(fresh);
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('फाइल साइज १० MB भन्दा सानो हुनुपर्छ।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
      setSelectedFile({
        url,
        name: file.name,
        type: file.type,
        sizeStr,
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle Calling
  const handleCallClick = () => {
    if (!isUnlocked) return;
    const session = initiateCallSession(
      bookingId,
      currentUserId,
      currentUserName,
      currentUserType,
      undefined,
      peerUserId,
      peerUserName,
      currentUserType === 'YAJAMAN' ? 'PROVIDER' : 'YAJAMAN',
      peerUserPhoto
    );

    if (session && onInitiateCall) {
      onInitiateCall(session);
    }
  };

  const formatVoiceTime = (sec?: number) => {
    if (!sec) return '00:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl">
      
      {/* Top Header */}
      <div className="bg-stone-900 border-b border-stone-800 p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-amber-500/40 bg-stone-800 overflow-hidden flex items-center justify-center">
            {peerUserPhoto ? (
              <img src={peerUserPhoto} alt={peerUserName} className="w-full h-full object-cover" />
            ) : (
              <MessageSquare className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-stone-100 text-sm flex items-center gap-2">
              <span>{peerUserName}</span>
              {isUnlocked && (
                <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] rounded-full font-bold">
                  सम्पर्क Unlocked
                </span>
              )}
            </h4>
            <p className="text-[11px] text-amber-400/90 font-serif">
              {peerTitle || (currentUserType === 'YAJAMAN' ? 'सेवा प्रदायक' : 'यजमान')} {bookingCode ? `(${bookingCode})` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* In-App Call Button */}
          <button
            onClick={handleCallClick}
            disabled={!isUnlocked}
            className={`p-2 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
              isUnlocked
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow'
                : 'bg-stone-800 text-stone-500 cursor-not-allowed'
            }`}
            title={isUnlocked ? 'सुरक्षित इन-एप कल गर्नुहोस्' : 'स्वीकृत भएपछि मात्र कल सम्भव'}
          >
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">इन-एप कल</span>
          </button>

          {/* Report Button */}
          {onReportUser && (
            <button
              onClick={onReportUser}
              className="p-2 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
              title="रिपोर्ट गर्नुहोस्"
            >
              <AlertCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Direct Contact Unlocked Section */}
      {isUnlocked && (peerUserPhone || peerUserEmail) && (
        <div className="bg-emerald-950/40 border-b border-emerald-900/60 p-2.5 px-4 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-emerald-300 font-bold">
            <Unlock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Direct Contact Unlocked:</span>
            {peerUserPhone && <span className="font-mono text-stone-200">{peerUserPhone}</span>}
          </div>

          <div className="flex items-center gap-2">
            {peerUserPhone && (
              <a
                href={`https://wa.me/${peerUserPhone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>WhatsApp</span>
              </a>
            )}
            {peerUserPhone && (
              <a
                href={`tel:${peerUserPhone}`}
                className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-colors"
              >
                <Phone className="w-3 h-3 text-amber-400" />
                <span>फोन</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Main Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]">
        
        {/* Contact Privacy Shield Banner if NOT Unlocked */}
        {!isUnlocked && (
          <div className="bg-amber-950/60 border border-amber-800/80 p-4 rounded-2xl text-center space-y-2 max-w-md mx-auto my-6 shadow-xl">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-amber-300 text-sm">सम्पर्क privacy सुरक्षा सक्रिय छ</h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              सेवा प्रदायकले तपाईंको सेवा अनुरोध <strong>स्वीकार (ACCEPT)</strong> गरेपछि मात्र प्रत्यक्ष च्याट, इन-एप कल तथा व्यक्तिगत फोन नम्बर unlocked हुनेछ।
            </p>
          </div>
        )}

        {/* System Welcome Message */}
        {isUnlocked && messages.length === 0 && (
          <div className="text-center py-6 text-xs text-stone-500 space-y-1">
            <ShieldCheck className="w-6 h-6 mx-auto text-emerald-500" />
            <p className="text-stone-300 font-bold">सुरक्षित च्याट संवाद सुरु भयो</p>
            <p>यहाँ पठाएका सन्देश, भ्वाइस र फाइलहरू पूर्णरूपमा सुरक्षित छन्।</p>
          </div>
        )}

        {/* Render Messages */}
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1 group`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl text-xs relative shadow-md ${
                  isMe
                    ? 'bg-amber-600 text-stone-950 font-medium rounded-tr-none'
                    : 'bg-stone-800 text-stone-100 border border-stone-700/80 rounded-tl-none'
                }`}
              >
                {/* Reply Indicator */}
                {msg.replyToText && (
                  <div
                    className={`p-1.5 px-2.5 rounded-lg mb-2 text-[11px] border-l-2 ${
                      isMe ? 'bg-amber-700/60 border-stone-950 text-stone-900 font-bold' : 'bg-stone-900/80 border-amber-500 text-stone-300'
                    }`}
                  >
                    {msg.replyToText}
                  </div>
                )}

                {/* Text Content */}
                {msg.textContent && (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.textContent}</p>
                )}

                {/* Voice Message Player */}
                {msg.messageType === 'voice' && (
                  <div className="flex items-center gap-3 py-1">
                    <button
                      onClick={() =>
                        setPlayingMsgId(playingMsgId === msg.id ? null : msg.id)
                      }
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-transform cursor-pointer ${
                        isMe ? 'bg-stone-950 text-amber-400' : 'bg-amber-500 text-stone-950'
                      }`}
                    >
                      {playingMsgId === msg.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-1">
                        <Volume2 className="w-3.5 h-3.5 text-stone-400" />
                        <span className="font-bold text-[11px] font-mono">
                          भ्वाइस म्यासेज ({formatVoiceTime(msg.voiceDurationSeconds)})
                        </span>
                      </div>
                      <div className="h-1.5 w-32 bg-stone-700/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${playingMsgId === msg.id ? 'w-full animate-pulse bg-emerald-400' : 'w-1/3 bg-amber-400'}`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Attachment */}
                {msg.messageType === 'image' && msg.attachmentUrl && (
                  <div className="mt-1 space-y-1">
                    <img
                      src={msg.attachmentUrl}
                      alt="Attachment"
                      className="rounded-xl max-h-48 w-full object-cover border border-stone-950/20"
                    />
                    {msg.attachmentName && (
                      <p className="text-[10px] opacity-80 truncate">{msg.attachmentName}</p>
                    )}
                  </div>
                )}

                {/* Document Attachment */}
                {msg.messageType === 'document' && msg.attachmentUrl && (
                  <div className={`p-2.5 rounded-xl flex items-center justify-between gap-3 border my-1 ${
                    isMe ? 'bg-amber-700/50 border-amber-800 text-stone-950' : 'bg-stone-900 border-stone-700 text-stone-100'
                  }`}>
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-5 h-5 shrink-0 text-amber-300" />
                      <div className="truncate">
                        <p className="font-bold truncate text-[11px]">{msg.attachmentName || 'Document.pdf'}</p>
                        <p className="text-[10px] opacity-75">{msg.attachmentSize || 'PDF Document'}</p>
                      </div>
                    </div>
                    <a
                      href={msg.attachmentUrl}
                      download={msg.attachmentName || 'document.pdf'}
                      className="p-1.5 bg-stone-950/40 hover:bg-stone-950 text-white rounded-lg transition-colors cursor-pointer shrink-0"
                      title="डाउनलोड गर्नुहोस्"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {/* Message Footer Info */}
                <div className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${isMe ? 'text-stone-900 font-bold' : 'text-stone-400'}`}>
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMe && (
                    <span>
                      {msg.status === 'read' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-stone-950" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-stone-800" />
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Message Action Controls */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-[10px] text-stone-500 px-1">
                <button
                  onClick={() => setReplyToMsg(msg)}
                  className="hover:text-amber-400 flex items-center gap-0.5 cursor-pointer"
                >
                  <CornerUpLeft className="w-3 h-3" />
                  <span>जवाफ</span>
                </button>
                <button
                  onClick={() => {
                    deleteMessageForSelf(msg.id, currentUserId);
                    refreshMessages();
                  }}
                  className="hover:text-rose-400 flex items-center gap-0.5 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>हटाउनुहोस्</span>
                </button>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected File Preview Box */}
      {selectedFile && (
        <div className="bg-stone-900 border-t border-stone-800 p-2.5 px-4 flex items-center justify-between text-xs text-stone-200">
          <div className="flex items-center gap-2 truncate">
            {selectedFile.type.startsWith('image/') ? (
              <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <FileText className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="font-bold truncate">{selectedFile.name}</span>
            <span className="text-[10px] text-stone-400">({selectedFile.sizeStr})</span>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="p-1 hover:bg-stone-800 rounded-lg text-stone-400 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Reply Banner */}
      {replyToMsg && (
        <div className="bg-stone-900 border-t border-stone-800 p-2 px-4 flex items-center justify-between text-xs text-stone-300">
          <div className="truncate">
            <span className="text-amber-400 font-bold">जवाफ दिँदै: </span>
            <span>{replyToMsg.textContent || replyToMsg.attachmentName}</span>
          </div>
          <button
            onClick={() => setReplyToMsg(null)}
            className="p-1 text-stone-400 hover:bg-stone-800 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Voice Recording Control Banner */}
      {isRecordingVoice ? (
        <div className="bg-stone-900 border-t border-stone-800 p-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-bold text-rose-400 font-mono">
              भ्वाइस रेकर्डिङ: {formatVoiceTime(recordingSeconds)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancelVoiceRecord}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl cursor-pointer"
            >
              रद्द
            </button>
            <button
              onClick={handleSendVoiceMessage}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>पठाउनुहोस्</span>
            </button>
          </div>
        </div>
      ) : (
        /* Chat Input Form */
        <form
          onSubmit={handleSendMessage}
          className="bg-stone-900 border-t border-stone-800 p-2.5 flex items-center gap-2"
        >
          {/* File Attachment Hidden Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
          />

          <button
            type="button"
            disabled={!isUnlocked}
            onClick={() => fileInputRef.current?.click()}
            className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
              isUnlocked ? 'bg-stone-800 text-amber-400 hover:bg-stone-700' : 'bg-stone-800/50 text-stone-600 cursor-not-allowed'
            }`}
            title="फाइल वा फोटो संलग्न गर्नुहोस्"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={!isUnlocked}
            onClick={handleStartVoiceRecord}
            className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
              isUnlocked ? 'bg-stone-800 text-amber-400 hover:bg-stone-700' : 'bg-stone-800/50 text-stone-600 cursor-not-allowed'
            }`}
            title="भ्वाइस म्यासेज रेकर्ड गर्नुहोस्"
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={textInput}
            disabled={!isUnlocked}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={
              isUnlocked ? 'यहाँ सन्देश लेख्नुहोस्...' : 'अनुरोध स्वीकार भएपछि च्याट सक्रिय हुनेछ'
            }
            className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!isUnlocked || (!textInput.trim() && !selectedFile)}
            className={`p-2.5 rounded-xl font-bold transition-all cursor-pointer ${
              isUnlocked && (textInput.trim() || selectedFile)
                ? 'bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md'
                : 'bg-stone-800 text-stone-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}

    </div>
  );
};
