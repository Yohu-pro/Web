import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../lib/CartContext';
import { X, ShoppingBag, Plus, Minus, Trash2, Mail, Phone, MapPin, User, FileText, CheckCircle2, Loader2, Landmark } from 'lucide-react';
import { SiteConfig } from '../types';

export default function CartDrawer({ config }: { config?: SiteConfig }) {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart, cartCount } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    taxId: '',
    phone: '',
    address: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'transfer'>('cod');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ orderCode: string; totalPriceStr: string } | null>(null);

  // Parse price helper to estimate total subtotal in client
  const parsePrice = (priceStr: string): number => {
    // Standardize price like: "12.500.000", "12.500.000đ", etc.
    const cleanNum = priceStr.replace(/[^0-9]/g, '');
    return cleanNum ? parseInt(cleanNum, 10) : 0;
  };

  const formatPrice = (priceNum: number): string => {
    return priceNum.toLocaleString('vi-VN') + 'đ';
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const itemPrice = parsePrice(item.price);
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập họ tên';
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    // Basic phone validation matching standard VN mobile (9-11 digits)
    const phoneClean = formData.phone.replace(/[^0-9]/g, '');
    if (phoneClean.length < 9 || phoneClean.length > 11) {
      newErrors.phone = 'Số điện thoại không hợp lệ (9 - 11 chữ số)';
    }
    if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ giao hàng';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: formData,
          items: cart,
          totalPrice: formatPrice(calculateTotal())
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Gửi đơn hàng thất bại');
      }

      const result = await response.json();
      setOrderSuccess({
        orderCode: result.orderCode,
        totalPriceStr: formatPrice(calculateTotal())
      });
      clearCart();
      // Clear form except contact details for quick reuse if desired
      setFormData({
        name: '',
        businessName: '',
        taxId: '',
        phone: '',
        address: ''
      });
    } catch (error: any) {
      console.error('Lỗi khi gửi đơn hàng:', error);
      alert(error.message || 'Hệ thống đang bận. Vui lòng liên hệ hotline để được hỗ trợ nhanh nhất.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeDrawer = () => {
    setIsCartOpen(false);
    // Only reset order success after drawer transition animation has completed
    setTimeout(() => {
      setOrderSuccess(null);
    }, 300);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950 z-[9990]"
            onClick={closeDrawer}
          />

          {/* Sliding Cart Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:max-w-md md:max-w-lg bg-white shadow-2xl z-[9999] flex flex-col h-full max-h-screen overflow-hidden border-l border-slate-100"
          >
            {/* Header */}
            <div className="bg-[#000033] text-white p-5 flex items-center justify-between border-b border-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider">Giỏ hàng của bạn</h2>
                  <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">{cartCount} sản phẩm</p>
                </div>
              </div>
              <button
                onClick={closeDrawer}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:scale-105 active:scale-95 transition-all outline-none border-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-grow overflow-y-auto overflow-x-hidden p-6 space-y-6">
              {orderSuccess ? (
                /* SUCCESS STATE */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center space-y-6"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-inner">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Đặt hàng thành công!</h3>
                    <p className="text-slate-500 text-sm max-w-sm">Cảm ơn quý khách. Đơn hàng của quý khách đã được ghi nhận trên hệ thống chung của Yohu Việt Nam.</p>
                  </div>

                  <div className="w-full bg-slate-50 rounded-2xl p-6 border border-slate-100 text-left space-y-3 font-mono text-xs max-w-sm">
                    <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                      <span className="text-slate-400 font-bold">MÃ ĐƠN HÀNG:</span>
                      <span className="text-blue-700 font-black">{orderSuccess.orderCode}</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                      <span className="text-slate-400 font-bold">TRẠNG THÁI:</span>
                      <span className="text-emerald-600 font-black">CHỜ XÁC NHẬN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">TỔNG TIỀN:</span>
                      <span className="text-red-600 font-black">{orderSuccess.totalPriceStr}</span>
                    </div>
                  </div>

                   {paymentMethod === 'transfer' && (
                    <div className="w-full bg-blue-50/50 rounded-2xl p-5 border border-blue-100 text-left space-y-3 max-w-sm">
                      <div className="flex items-center gap-2 border-b border-blue-100 pb-1.5 justify-center sm:justify-start">
                        <Landmark className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider">Thông tin chuyển tiền</h4>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ngân hàng</span>
                          <span className="font-bold text-slate-800">{config?.bank_name || "Ngân hàng Quân đội - MB Bank"}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Số tài khoản</span>
                            <span className="font-mono font-bold text-slate-900 text-sm tracking-widest">{config?.bank_account_number || "0339606969"}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(config?.bank_account_number || "0339606969");
                              alert("Đã sao chép số tài khoản!");
                            }}
                            className="px-2 py-1 bg-blue-50 text-[10px] font-bold text-blue-600 rounded hover:bg-blue-100 active:scale-95 transition-all outline-none border-none cursor-pointer"
                          >
                            Sao chép
                          </button>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tên người thụ hưởng</span>
                          <span className="font-bold text-slate-800 uppercase">{config?.bank_account_name || "Phạm Văn Khải"}</span>
                        </div>
                        <div className="flex justify-between items-center bg-blue-600/5 p-2 rounded-lg border border-blue-100/50">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Nội dung ghi chú</span>
                            <span className="font-mono font-black text-blue-700 text-sm">{orderSuccess.orderCode}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(orderSuccess.orderCode);
                              alert("Đã sao chép nội dung chuyển khoản!");
                            }}
                            className="px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded hover:bg-blue-700 active:scale-95 transition-all outline-none border-none cursor-pointer"
                          >
                            Sao chép
                          </button>
                        </div>
                      </div>
                      <p className="text-[9px] text-blue-600 font-medium italic mt-1 leading-relaxed">
                        * Quý khách vui lòng điền chính xác mã đơn hàng ở nội dung ghi chú chuyển tiền để hệ thống Yohu đối soát tự động nhanh nhất.
                      </p>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 font-medium italic max-w-xs">
                    * Đội ngũ chăm sóc khách hàng Yohu Việt Nam sẽ chủ động gọi tới SĐT của bạn sớm nhất để xác thực vận chuyển.
                  </p>

                  <button
                    onClick={closeDrawer}
                    className="w-full max-w-xs py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors active:scale-95"
                  >
                    Tiếp tục mua sắm
                  </button>
                </motion.div>
              ) : cart.length === 0 ? (
                /* EMPTY STATE */
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 font-black text-xs uppercase tracking-wider">Giỏ hàng trống</p>
                    <p className="text-slate-400 text-xs font-medium">Vui lòng quay lại tìm kiếm thêm các dòng linh kiện, sản phẩm cao cấp.</p>
                  </div>
                </div>
              ) : (
                /* ITEMS LIST + FORM */
                <div className="space-y-8">
                  {/* Cart Items List */}
                  <div className="space-y-4">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Sản phẩm đã chọn</h3>
                    <div className="divide-y divide-slate-100">
                      {cart.map((item) => (
                        <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0 group">
                          {/* Image */}
                          <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden p-2 flex items-center justify-center border border-slate-50 shrink-0">
                            <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                          </div>

                          {/* Info */}
                          <div className="flex-grow flex flex-col justify-between">
                            <div>
                              <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-tight line-clamp-1 leading-tight">{item.name}</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Đơn vị: {item.unit}</p>
                            </div>

                            <div className="flex items-center justify-between">
                              {/* Quantity selection */}
                              <div className="flex items-center border border-slate-100 rounded-lg p-0.5 bg-slate-50/50">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-200 text-slate-500 active:scale-90 transition-all border-none outline-none"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-xs font-black text-slate-800">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-200 text-slate-500 active:scale-90 transition-all border-none outline-none"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-red-600 tracking-tight">
                                  {formatPrice(parsePrice(item.price) * item.quantity)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-slate-300 hover:text-red-600 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
                                  title="Xóa"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subtotal Display */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Tổng tiền tạm tính</p>
                      <p className="text-slate-400 text-[10px] italic">Chưa bao gồm VAT & vận chuyển</p>
                    </div>
                    <p className="text-xl font-black text-red-600 tracking-tight">
                      {formatPrice(calculateTotal())}
                    </p>
                  </div>

                  {/* Checkout Form */}
                  <form onSubmit={handleSubmit} className="space-y-5 pt-4 border-t border-slate-100">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Thông tin giao hàng</h3>

                    <div className="space-y-4">
                      {/* Name */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex justify-between">
                          <span>Họ tên người nhận *</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Ví dụ: Nguyễn Văn A"
                            className={`w-full bg-slate-50 border ${errors.name ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-100 focus:border-blue-600/50'} focus:ring-4 focus:ring-blue-600/5 focus:bg-white rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-slate-800 outline-none transition-all`}
                          />
                        </div>
                        {errors.name && <p className="text-red-500 text-[10px] font-bold">{errors.name}</p>}
                      </div>

                      {/* Business Unit & Tax Code (2 columns on tablet/desktop) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Cửa hàng / DN</label>
                          <div className="relative">
                            <FileText className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              name="businessName"
                              value={formData.businessName}
                              onChange={handleInputChange}
                              placeholder="Nếu có"
                              className="w-full bg-slate-50 border border-slate-100 focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/5 focus:bg-white rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-slate-800 outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Mã số thuế</label>
                          <div className="relative">
                            <FileText className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              name="taxId"
                              value={formData.taxId}
                              onChange={handleInputChange}
                              placeholder="Nếu cần xuất HĐ"
                              className="w-full bg-slate-50 border border-slate-100 focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/5 focus:bg-white rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-slate-800 outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Số điện thoại *</label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Ví dụ: 0973480488"
                            className={`w-full bg-slate-50 border ${errors.phone ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-100 focus:border-blue-600/50'} focus:ring-4 focus:ring-blue-600/5 focus:bg-white rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-slate-800 outline-none transition-all`}
                          />
                        </div>
                        {errors.phone && <p className="text-red-500 text-[10px] font-bold">{errors.phone}</p>}
                      </div>

                      {/* Address */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Địa chỉ giao hàng *</label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện..."
                            className={`w-full bg-slate-50 border ${errors.address ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-100 focus:border-blue-600/50'} focus:ring-4 focus:ring-blue-600/5 focus:bg-white rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-slate-800 outline-none transition-all`}
                          />
                        </div>
                        {errors.address && <p className="text-red-500 text-[10px] font-bold">{errors.address}</p>}
                      </div>

                      {/* Payment Method Selector */}
                      <div className="space-y-2 pt-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                          Phương thức thanh toán *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('cod')}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              paymentMethod === 'cod'
                                ? 'bg-blue-50/50 border-blue-500 text-blue-700 font-bold shadow-sm'
                                : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-500'
                            }`}
                          >
                            <ShoppingBag className="w-4 h-4 mb-1 text-slate-400 select-none pointer-events-none" />
                            <span className="text-[10px] uppercase block tracking-wider select-none pointer-events-none">Thanh toán (COD)</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('transfer')}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              paymentMethod === 'transfer'
                                ? 'bg-blue-50/50 border-blue-500 text-blue-700 font-bold shadow-sm'
                                : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-500'
                            }`}
                          >
                            <Landmark className="w-4 h-4 mb-1 text-blue-500 select-none pointer-events-none" />
                            <span className="text-[10px] uppercase block tracking-wider select-none pointer-events-none">Chuyển khoản trước</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-wider shadow-lg shadow-red-200 transition-all duration-300"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang xử lý đơn...
                        </>
                      ) : (
                        <>GỬI ĐƠN HÀNG NGAY</>
                      )}
                    </button>
                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2 bg-slate-50 py-2 rounded-lg">
                      🔒 Bảo mật thông tin mua sắm tuyệt đối
                    </p>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
