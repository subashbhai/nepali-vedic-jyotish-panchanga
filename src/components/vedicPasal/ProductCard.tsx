import React from 'react';
import { Product } from '../../types/vedicStoreTypes';
import { Star, ShoppingCart, Eye, Heart, Check, Package, BookOpen, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isInWishlist: boolean;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onOpenSamagriList?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isInWishlist,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onViewDetails,
  onOpenSamagriList,
}) => {
  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= product.minStockLevel;
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.sellingPrice;

  const discountPercent = hasDiscount
    ? Math.round(((product.sellingPrice - (product.discountPrice || 0)) / product.sellingPrice) * 100)
    : 0;

  return (
    <div className="bg-white dark:bg-[#231F1C] border border-[#E6E0D5] dark:border-stone-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group relative">
      {/* Product Image Box */}
      <div className="relative aspect-[4/3] bg-stone-100 dark:bg-stone-900 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.nameNepali}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {hasDiscount && (
            <span className="bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              {discountPercent}% छूट
            </span>
          )}
          {product.category === 'puja_package' && (
            <span className="bg-[#D97706] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <Package className="w-3 h-3" /> Package
            </span>
          )}
          {product.bookDetails && (
            <span className="bg-amber-800 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> पुस्तक
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={() => onToggleWishlist(product)}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
            isInWishlist
              ? 'bg-red-500 text-white'
              : 'bg-white/80 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:text-red-500 hover:bg-white'
          }`}
          title={isInWishlist ? 'इच्छासूचीबाट हटाउनुहोस्' : 'इच्छासूचीमा राख्नुहोस्'}
        >
          <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Stock Badge Overlay if Low/Out */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center p-3 text-center">
            <span className="bg-stone-900/90 text-red-400 font-bold text-xs px-3 py-1.5 rounded-xl border border-red-500/40 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" /> समाप्त (Out of Stock)
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Sub-Category / Category label */}
          <div className="flex items-center justify-between text-[11px] text-[#D97706] dark:text-amber-400 font-medium">
            <span className="truncate max-w-[160px]">{product.subCategory || product.category}</span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-bold">{product.rating.toFixed(1)}</span>
              <span className="text-stone-400">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onViewDetails(product)}
            className="font-bold text-sm sm:text-base text-[#1A1A1A] dark:text-stone-100 line-clamp-2 hover:text-[#D97706] transition-colors cursor-pointer leading-snug font-serif"
          >
            {product.nameNepali}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Package items count or book details */}
          {(product.category === 'puja_package' || (product.packageItems && product.packageItems.length > 0)) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenSamagriList) {
                  onOpenSamagriList(product);
                } else {
                  onViewDetails(product);
                }
              }}
              className="w-full text-left group/badge text-[11px] font-bold text-amber-900 dark:text-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/60 dark:to-stone-900 px-2.5 py-1.5 rounded-xl border border-amber-300/80 dark:border-amber-700/80 hover:border-amber-500 hover:shadow-xs transition-all flex items-center justify-between gap-1 cursor-pointer"
              title="सामग्री र परिमाणको पूर्ण सूची हेर्नुहोस्"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Package className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>कुल {product.packageItems?.length || 26} प्रकारका सामग्री</span>
              </span>
              <span className="text-[10px] text-[#D97706] dark:text-amber-400 font-extrabold underline shrink-0">
                (सूची हेर्नुहोस् 📋)
              </span>
            </button>
          )}

          {product.bookDetails && (
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              लेखक: <strong className="text-stone-700 dark:text-stone-200">{product.bookDetails.author}</strong>
            </p>
          )}
        </div>

        {/* Stock & Price Footer */}
        <div className="pt-2 border-t border-[#E6E0D5]/80 dark:border-stone-800 space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs text-stone-500 dark:text-stone-400 mr-1">मूल्य:</span>
              <span className="text-base sm:text-lg font-extrabold text-[#D97706] dark:text-amber-400 font-mono">
                रु. {(hasDiscount ? product.discountPrice : product.sellingPrice)?.toLocaleString('ne-NP')}
              </span>
              {hasDiscount && (
                <span className="ml-1.5 text-xs text-stone-400 line-through font-mono">
                  रु. {product.sellingPrice.toLocaleString('ne-NP')}
                </span>
              )}
            </div>

            {/* Availability pill */}
            <div>
              {isOutOfStock ? (
                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900">
                  सकियो
                </span>
              ) : isLowStock ? (
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900">
                  बाँकी: {product.stockQuantity} {product.unit}
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                  स्टक: उपलब्ध ({product.stockQuantity} {product.unit})
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-100 dark:bg-stone-800 text-[#D97706] dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>

            <button
              type="button"
              onClick={() => onBuyNow(product)}
              disabled={isOutOfStock}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#D97706] text-white hover:bg-[#B45309] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1 shadow-sm"
            >
              <span>Buy Now</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onViewDetails(product)}
            className="w-full text-center text-[11px] font-semibold text-stone-500 hover:text-[#D97706] dark:text-stone-400 dark:hover:text-amber-400 py-0.5 flex items-center justify-center gap-1"
          >
            <Eye className="w-3 h-3" />
            <span>विस्तृत विवरण हेर्नुहोस् (View Details)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
