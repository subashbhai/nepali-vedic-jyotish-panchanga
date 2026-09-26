import React, { useState, useEffect } from 'react';
import { Product } from '../../types/vedicStoreTypes';
import { X, Star, ShoppingCart, Check, Package, BookOpen, Truck, ShieldCheck, Heart, AlertTriangle, Minus, Plus } from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  isInWishlist: boolean;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  isInWishlist,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string>(product?.imageUrl || '');

  useEffect(() => {
    if (product?.imageUrl) {
      setSelectedImage(product.imageUrl);
      setQuantity(1);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const gallery = [product.imageUrl, ...(product.galleryImages || [])];
  const isOutOfStock = product.stockQuantity <= 0;
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.sellingPrice;
  const unitPrice = hasDiscount ? product.discountPrice! : product.sellingPrice;

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < product.stockQuantity) setQuantity(quantity + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1C1917] border border-[#E6E0D5] dark:border-stone-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto text-[#2D241E] dark:text-stone-100 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Left Column: Image Gallery */}
          <div className="space-y-3">
            <div className="aspect-[4/3] rounded-2xl bg-stone-100 dark:bg-stone-900 overflow-hidden relative border border-[#E6E0D5] dark:border-stone-800">
              <img
                src={selectedImage}
                alt={product.nameNepali}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => onToggleWishlist(product)}
                className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md shadow-md transition-all ${
                  isInWishlist ? 'bg-red-500 text-white' : 'bg-white/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-200 hover:bg-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Gallery */}
            {gallery.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImage === img
                        ? 'border-[#D97706] ring-2 ring-[#D97706]/30'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Delivery & Assurance Info Box */}
            <div className="bg-stone-50 dark:bg-stone-900/60 rounded-2xl p-4 border border-[#E6E0D5] dark:border-stone-800 space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-stone-700 dark:text-stone-300">
                <Truck className="w-4 h-4 text-[#D97706] shrink-0" />
                <span><strong>नेपालभर डेलिभरी उपलब्ध:</strong> काठमाडौँ उपत्यकामा २४ घण्टा भित्र, बाहिर २-३ दिन भित्र।</span>
              </div>
              <div className="flex items-center gap-2.5 text-stone-700 dark:text-stone-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>१००% शुद्ध र प्रामाणिक:</strong> वैदिक विधिपूर्वक तयार पारिएको सक्कली सामग्री र ग्रन्थ।</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Order Actions */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs text-[#D97706] dark:text-amber-400 font-semibold">
                <span>{product.subCategory || product.category}</span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold">{product.rating.toFixed(1)}</span>
                  <span className="text-stone-400">({product.reviewsCount} समीक्षा)</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#1A1A1A] dark:text-stone-100 leading-snug">
                {product.nameNepali}
              </h2>

              <p className="text-xs text-stone-500 font-mono">
                SKU: {product.sku} | Barcode: {product.barcode} | Weight: {product.weightGram ? `${product.weightGram}g` : 'N/A'}
              </p>

              {/* Price Box */}
              <div className="flex items-baseline gap-3 p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200/60 dark:border-amber-900/40">
                <span className="text-2xl font-black text-[#D97706] dark:text-amber-400 font-mono">
                  रु. {unitPrice.toLocaleString('ne-NP')}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-stone-400 line-through font-mono">
                    रु. {product.sellingPrice.toLocaleString('ne-NP')}
                  </span>
                )}
                {hasDiscount && (
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                    बचत: रु. {(product.sellingPrice - unitPrice).toLocaleString('ne-NP')}
                  </span>
                )}
              </div>

              {/* Full Description */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">विस्तृत विवरण (Description):</h4>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  {product.fullDescription}
                </p>
              </div>

              {/* Package Included Items checklist */}
              {product.packageItems && product.packageItems.length > 0 && (
                <div className="bg-stone-50 dark:bg-stone-900/80 p-3.5 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#D97706] dark:text-amber-400">
                    <Package className="w-4 h-4" />
                    <span>यस Package भित्र समावेश सम्पूर्ण सामग्रीहरू ({product.packageItems.length} थान):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                    {product.packageItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-stone-700 dark:text-stone-300">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Book Details section */}
              {product.bookDetails && (
                <div className="bg-amber-50/50 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-200/50 dark:border-amber-900/30 text-xs space-y-1.5">
                  <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    <span>पुस्तकालय विवरण (Book Information):</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-stone-700 dark:text-stone-300">
                    <div><strong>लेखक:</strong> {product.bookDetails.author}</div>
                    <div><strong>प्रकाशक:</strong> {product.bookDetails.publisher}</div>
                    <div><strong>कुल पृष्ठ:</strong> {product.bookDetails.pages}</div>
                    <div><strong>भाषा:</strong> {product.bookDetails.language}</div>
                    <div className="col-span-2"><strong>विषय:</strong> {product.bookDetails.subject}</div>
                  </div>
                </div>
              )}

              {/* Stock Quantity selector */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300">परिमाण (Quantity):</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDecrease}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold font-mono text-sm">{quantity}</span>
                  <button
                    type="button"
                    onClick={handleIncrease}
                    disabled={quantity >= product.stockQuantity || isOutOfStock}
                    className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-stone-500 ml-2">({product.unit})</span>
                </div>
              </div>
            </div>

            {/* Bottom Modal Actions */}
            <div className="pt-4 border-t border-[#E6E0D5] dark:border-stone-800 space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(product, quantity);
                    onClose();
                  }}
                  disabled={isOutOfStock}
                  className="py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-amber-100 dark:bg-stone-800 text-[#D97706] dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-stone-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onBuyNow(product, quantity);
                    onClose();
                  }}
                  disabled={isOutOfStock}
                  className="py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#D97706] text-white hover:bg-[#B45309] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
