import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Share2, 
  Bookmark, 
  Send, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  MessageSquare, 
  Phone, 
  Mail, 
  Lock, 
  Flag, 
  Trash2, 
  CornerDownRight, 
  CheckCircle2, 
  HelpCircle,
  FileText
} from 'lucide-react';
import { YajamanPost, YajamanComment } from '../../types/yajamanTypes';
import { addYajamanPostComment, deleteYajamanPostComment } from '../../db/yajamanStore';

interface YajamanPostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: YajamanPost | null;
  currentUserId?: string;
  currentUserName?: string;
  currentUserPhoto?: string;
  isLoggedIn: boolean;
  onLikeClick: (post: YajamanPost) => void;
  onShareClick: (post: YajamanPost) => void;
  onSaveClick: (post: YajamanPost) => void;
  onRequestServiceClick: (post: YajamanPost) => void;
  onReportClick: (targetType: 'POST' | 'COMMENT', id: string, nameOrTitle: string) => void;
  onCommentsUpdated?: () => void;
}

export const YajamanPostDetailModal: React.FC<YajamanPostDetailModalProps> = ({
  isOpen,
  onClose,
  post,
  currentUserId,
  currentUserName = 'सेवाग्राही यजमान',
  currentUserPhoto,
  isLoggedIn,
  onLikeClick,
  onShareClick,
  onSaveClick,
  onRequestServiceClick,
  onReportClick,
  onCommentsUpdated,
}) => {
  const [commentText, setCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState<YajamanComment | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  if (!isOpen || !post) return null;

  const isLiked = currentUserId ? post.likedUserIds.includes(currentUserId) : false;
  const isSaved = currentUserId ? post.savedUserIds.includes(currentUserId) : false;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUserId) return;

    addYajamanPostComment(post.id, {
      authorId: currentUserId,
      authorName: currentUserName,
      authorPhoto: currentUserPhoto,
      text: commentText.trim(),
    });

    setCommentText('');
    setReplyTarget(null);
    if (onCommentsUpdated) onCommentsUpdated();
  };

  const handleDeleteComment = (commentId: string, authorId: string) => {
    if (!currentUserId) return;
    deleteYajamanPostComment(post.id, commentId, authorId, false);
    if (onCommentsUpdated) onCommentsUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-[#1E1B18] rounded-3xl shadow-2xl border border-amber-200 dark:border-stone-700 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:px-6 py-3.5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3 bg-amber-50/40 dark:bg-stone-900/60 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={post.authorPhoto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250'}
                alt={post.authorName}
                className="w-10 h-10 rounded-full object-cover border border-amber-300 dark:border-stone-700"
              />
              {post.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-xs">
                  <ShieldCheck className="w-3 h-3" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                  {post.authorName}
                </h4>
                {post.isVerified && (
                  <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    प्रमाणित
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500">
                📍 {post.district} {post.localLevel ? `(${post.localLevel})` : ''} • वि.सं. {post.createdAtBS}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onReportClick('POST', post.id, post.title)}
              className="p-2 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="उजुरी गर्नुहोस्"
            >
              <Flag className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="बन्द गर्नुहोस्"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Post Title & Category */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-amber-100 dark:bg-amber-950/60 text-[#7A1C1C] dark:text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                {post.categoryNameNepali}
              </span>
              <span className="text-xs text-stone-500 font-medium">
                • {post.serviceType}
              </span>
            </div>

            <h2 className="text-lg sm:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 leading-snug">
              {post.title}
            </h2>
          </div>

          {/* Photos Carousel/Gallery */}
          {post.photos && post.photos.length > 0 && (
            <div className="space-y-2">
              <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900">
                <img
                  src={post.photos[selectedPhotoIndex] || post.photos[0]}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {post.photos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {post.photos.map((ph, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        selectedPhotoIndex === idx
                          ? 'border-amber-600 scale-105 shadow-sm'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={ph} alt={`photo-${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              सेवा तथा अनुष्ठानको पूर्ण विवरण
            </h4>
            <p className="text-sm sm:text-base text-stone-700 dark:text-stone-200 leading-relaxed whitespace-pre-line bg-stone-50/60 dark:bg-stone-900/40 p-4 rounded-2xl border border-stone-200/60 dark:border-stone-800">
              {post.description}
            </p>
          </div>

          {/* Service Specifications Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {post.availableDates && (
              <div className="p-3.5 bg-amber-50/50 dark:bg-stone-900/50 rounded-xl border border-amber-200/60 dark:border-stone-800 space-y-1">
                <div className="text-[11px] font-bold text-[#7A1C1C] dark:text-amber-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>उपलब्ध मिति / मुहूर्त</span>
                </div>
                <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                  {post.availableDates}
                </p>
              </div>
            )}

            {post.availableTimes && (
              <div className="p-3.5 bg-amber-50/50 dark:bg-stone-900/50 rounded-xl border border-amber-200/60 dark:border-stone-800 space-y-1">
                <div className="text-[11px] font-bold text-[#7A1C1C] dark:text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>समय तालिका</span>
                </div>
                <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                  {post.availableTimes}
                </p>
              </div>
            )}

            {post.estimatedFee && (
              <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 space-y-1">
                <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>अनुमानित सेवा शुल्क / दक्षिणा</span>
                </div>
                <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                  {post.estimatedFee}
                </p>
              </div>
            )}

            {post.requiredSamagri && (
              <div className="p-3.5 bg-amber-50/50 dark:bg-stone-900/50 rounded-xl border border-amber-200/60 dark:border-stone-800 space-y-1">
                <div className="text-[11px] font-bold text-[#7A1C1C] dark:text-amber-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>आवश्यक पूजा सामग्री</span>
                </div>
                <p className="text-xs font-medium text-stone-700 dark:text-stone-300">
                  {post.requiredSamagri}
                </p>
              </div>
            )}
          </div>

          {/* Privacy Protected Contact Box */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-stone-800/60 border border-amber-200 dark:border-stone-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>गोपनीयता तथा सम्पर्क प्रणाली</span>
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                फोन: <span className="font-mono">{post.contactPhoneMasked || '९८४१******'}</span> • इमेल: <span className="font-mono">{post.contactEmailMasked || '***@gmail.com'}</span>
              </p>
              <p className="text-[10px] text-stone-500">
                सेवा अनुरोध पठाएर दुवै पक्ष सहमत भएपछि प्रत्यक्ष सम्पर्क विवरण खुल्नेछ।
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onRequestServiceClick(post);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#7A1C1C] hover:bg-[#9B2C2C] text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all text-xs cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-amber-300" />
              <span>सेवा अनुरोध पठाउनुहोस्</span>
            </button>
          </div>

          {/* Comments Section */}
          <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span>टिप्पणीहरू ({post.comments?.length || 0})</span>
              </h3>
            </div>

            {/* Comment Box Form */}
            {isLoggedIn ? (
              <form onSubmit={handleAddComment} className="space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    type="text"
                    placeholder={replyTarget ? `${replyTarget.authorName} लाई जवाफ लेख्नुहोस्...` : 'यस सेवा सम्बन्धी सोधपुछ वा टिप्पणी लेख्नुहोस्...'}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="bg-[#7A1C1C] hover:bg-[#9B2C2C] disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-300" />
                    <span>टिप्पणी</span>
                  </button>
                </div>
                {replyTarget && (
                  <div className="text-[11px] text-stone-500 flex items-center gap-2 pl-1">
                    <span>जवाफ दिँदै हुनुहुन्छ: <strong>{replyTarget.authorName}</strong></span>
                    <button
                      type="button"
                      onClick={() => setReplyTarget(null)}
                      className="text-rose-600 hover:underline"
                    >
                      रद्द गर्नुहोस्
                    </button>
                  </div>
                )}
              </form>
            ) : (
              <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 flex items-center justify-between gap-2">
                <span>टिप्पणी गर्न तथा प्रश्न सोध्न लगइन गर्नुहोस्।</span>
                <span className="text-[#7A1C1C] dark:text-amber-400 font-bold">लगइन आवश्यक</span>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3 pt-1">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comm) => (
                  <div 
                    key={comm.id}
                    className="p-3.5 bg-stone-50/70 dark:bg-stone-900/60 rounded-xl border border-stone-200/70 dark:border-stone-800 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-200 dark:bg-stone-700 text-amber-900 dark:text-amber-200 font-bold text-xs flex items-center justify-center">
                          {comm.authorName.charAt(0)}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                            {comm.authorName}
                          </span>
                          <span className="text-[10px] text-stone-400 ml-2">
                            वि.सं. {comm.createdAtBS}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[11px]">
                        {isLoggedIn && (
                          <button
                            type="button"
                            onClick={() => setReplyTarget(comm)}
                            className="text-stone-500 hover:text-amber-600 px-2 py-0.5 rounded cursor-pointer"
                          >
                            जवाफ
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onReportClick('COMMENT', comm.id, `टिप्पणी (${comm.authorName})`)}
                          className="text-stone-400 hover:text-rose-600 px-1 py-0.5 cursor-pointer"
                          title="टिप्पणी रिपोर्ट गर्नुहोस्"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                        {currentUserId === comm.authorId && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comm.id, comm.authorId)}
                            className="text-stone-400 hover:text-rose-600 px-1 py-0.5 cursor-pointer"
                            title="हटाउनुहोस्"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed pl-9">
                      {comm.text}
                    </p>

                    {/* Replies if any */}
                    {comm.replies && comm.replies.length > 0 && (
                      <div className="pl-9 space-y-2 pt-1">
                        {comm.replies.map((rep) => (
                          <div key={rep.id} className="p-2.5 bg-amber-50/50 dark:bg-stone-800/60 rounded-lg border-l-2 border-amber-500 space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <strong className="text-stone-900 dark:text-stone-100 flex items-center gap-1">
                                <CornerDownRight className="w-3 h-3 text-amber-600" />
                                {rep.authorName}
                              </strong>
                              <span className="text-[10px] text-stone-400">वि.सं. {rep.createdAtBS}</span>
                            </div>
                            <p className="text-xs text-stone-700 dark:text-stone-300 pl-4">
                              {rep.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-400 italic py-2">
                  अहिले सम्म कुनै टिप्पणी छैन। पहिलो टिप्पणी गर्नुहोस्!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="p-3 sm:px-6 py-3 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1E1B18] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onLikeClick(post)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isLiked
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 ring-1 ring-rose-300'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
              <span>{post.likesCount} मनपर्‍यो</span>
            </button>

            <button
              type="button"
              onClick={() => onSaveClick(post)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isSaved
                  ? 'bg-amber-100 dark:bg-stone-800 text-amber-700 dark:text-amber-300'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600' : ''}`} />
              <span>{isSaved ? 'सुरक्षित छ' : 'सुरक्षित'}</span>
            </button>

            <button
              type="button"
              onClick={() => onShareClick(post)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>सेयर ({post.sharesCount})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRequestServiceClick(post)}
            className="flex items-center gap-2 bg-[#7A1C1C] hover:bg-[#9B2C2C] text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all text-xs cursor-pointer"
          >
            <Send className="w-4 h-4 text-amber-300" />
            <span>सेवा अनुरोध</span>
          </button>
        </div>
      </div>
    </div>
  );
};
