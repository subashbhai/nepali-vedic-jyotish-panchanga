import React from 'react';
import { 
  Heart, 
  Share2, 
  Bookmark, 
  MessageSquare, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight,
  Send,
  User,
  MoreVertical,
  Flag
} from 'lucide-react';
import { YajamanPost } from '../../types/yajamanTypes';

interface YajamanPostCardProps {
  post: YajamanPost;
  currentUserId?: string;
  isLoggedIn: boolean;
  onLikeClick: (post: YajamanPost) => void;
  onShareClick: (post: YajamanPost) => void;
  onSaveClick: (post: YajamanPost) => void;
  onCardClick: (post: YajamanPost) => void;
  onRequestServiceClick: (post: YajamanPost) => void;
  onReportClick: (post: YajamanPost) => void;
}

export const YajamanPostCard: React.FC<YajamanPostCardProps> = ({
  post,
  currentUserId,
  isLoggedIn,
  onLikeClick,
  onShareClick,
  onSaveClick,
  onCardClick,
  onRequestServiceClick,
  onReportClick,
}) => {
  const isLiked = currentUserId ? post.likedUserIds.includes(currentUserId) : false;
  const isSaved = currentUserId ? post.savedUserIds.includes(currentUserId) : false;

  return (
    <article className="bg-white dark:bg-[#1E1B18] rounded-2xl border border-amber-200/80 dark:border-stone-800 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between">
      {/* Post Author Header */}
      <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800/80">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={post.authorPhoto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250'}
                alt={post.authorName}
                className="w-11 h-11 rounded-full object-cover border-2 border-amber-300 dark:border-stone-700"
                loading="lazy"
              />
              {post.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-xs" title="प्रमाणित पुरोहित/पण्डित">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                  {post.authorName}
                </h4>
                {post.isVerified && (
                  <span className="inline-flex items-center gap-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    प्रमाणित
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-stone-500 flex-wrap">
                <span>📍 {post.district}</span>
                <span>•</span>
                <span>मिति: वि.सं. {post.createdAtBS}</span>
              </div>
            </div>
          </div>

          {/* Action Menu / Report */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReportClick(post);
            }}
            className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="उजुरी / रिपोर्ट गर्नुहोस्"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>

        {/* Post Title & Badge */}
        <div className="mt-3.5 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-amber-100 dark:bg-amber-950/50 text-[#7A1C1C] dark:text-amber-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/50">
              {post.categoryNameNepali}
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">
              {post.serviceType}
            </span>
          </div>

          <h3 
            onClick={() => onCardClick(post)}
            className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-stone-100 hover:text-[#7A1C1C] dark:hover:text-amber-400 transition-colors cursor-pointer leading-snug"
          >
            {post.title}
          </h3>

          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 line-clamp-3 leading-relaxed">
            {post.description}
          </p>
        </div>
      </div>

      {/* Post Photo Gallery (if present) */}
      {post.photos && post.photos.length > 0 && (
        <div 
          onClick={() => onCardClick(post)}
          className="relative h-48 sm:h-56 bg-stone-100 dark:bg-stone-900 overflow-hidden cursor-pointer group"
        >
          <img
            src={post.photos[0]}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {post.photos.length > 1 && (
            <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-1 rounded-lg">
              +{post.photos.length - 1} थप तस्बिर
            </div>
          )}
          {post.estimatedFee && (
            <div className="absolute bottom-2.5 left-2.5 bg-amber-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
              💰 {post.estimatedFee}
            </div>
          )}
        </div>
      )}

      {/* Service Highlight Strip */}
      <div className="px-4 py-2.5 bg-amber-50/40 dark:bg-stone-900/40 border-b border-stone-100 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400 flex items-center justify-between gap-2 flex-wrap">
        {post.availableDates ? (
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>उपलब्ध: {post.availableDates}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>शास्त्रीय अनुष्ठान सेवा</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => onCardClick(post)}
          className="text-[#7A1C1C] dark:text-amber-400 font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer ml-auto"
        >
          <span>विस्तृत हेर्नुहोस्</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Social Engagement Bar */}
      <div className="p-3 sm:px-5 sm:py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Like Button */}
          <button
            type="button"
            onClick={() => onLikeClick(post)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isLiked
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 ring-1 ring-rose-300 dark:ring-rose-800'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            title={isLoggedIn ? 'मनपर्‍यो (Like)' : 'Like गर्न लगइन गर्नुहोस्'}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
            <span>{post.likesCount}</span>
          </button>

          {/* Comment Count / Click */}
          <button
            type="button"
            onClick={() => onCardClick(post)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="टिप्पणीहरू हेर्नुहोस्"
          >
            <MessageSquare className="w-4 h-4 text-stone-500" />
            <span>{post.commentsCount || post.comments.length}</span>
          </button>

          {/* Social Share Button */}
          <button
            type="button"
            onClick={() => onShareClick(post)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="सामाजिक सञ्जालमा सेयर गर्नुहोस्"
          >
            <Share2 className="w-4 h-4 text-blue-600" />
            <span>{post.sharesCount > 0 ? post.sharesCount : 'सेयर'}</span>
          </button>
        </div>

        {/* Right Actions: Bookmark & Request */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSaveClick(post)}
            className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
              isSaved
                ? 'bg-amber-100 dark:bg-stone-800 text-amber-700 dark:text-amber-300'
                : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            title={isSaved ? 'सुरक्षित गरिएको छ' : 'सुरक्षित राख्नुहोस्'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => onRequestServiceClick(post)}
            className="flex items-center gap-1 bg-[#7A1C1C] hover:bg-[#9B2C2C] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">सेवा अनुरोध</span>
            <span className="sm:hidden">अनुरोध</span>
          </button>
        </div>
      </div>
    </article>
  );
};
