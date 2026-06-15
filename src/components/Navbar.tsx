import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "../lib/CartContext";
import { SiteConfig, DEFAULT_PRODUCT_CATEGORIES } from "../types";
import EditableImage from "./EditableImage";
import EditableText from "./EditableText";
import { 
  UserCircle, 
  ShoppingCart, 
  Search, 
  Menu, 
  X,
  Phone, 
  Facebook,
  ChevronDown,
  ChevronRight
} from "lucide-react";

export default function Navbar({ config }: { config: SiteConfig }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  
  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const categories = config.custom_categories || DEFAULT_PRODUCT_CATEGORIES;
  
  const toSlug = (str: string) => {
    if (!str) return "";
    return str.toLowerCase()
      .trim()
      .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
      .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
      .replace(/ì|í|ị|ỉ|ĩ/g, "i")
      .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
      .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
      .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const deleteSubcategory = async (mainCat: string, subCat: string) => {
    const updatedCategories = { ...categories };
    updatedCategories[mainCat] = updatedCategories[mainCat].filter(s => s !== subCat);
    
    // Update config locally and in Firestore
    const updatedConfig = { ...config, custom_categories: updatedCategories };
    
    try {
      const resp = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedConfig)
      });
      if (resp.ok) {
        alert("Đã xóa mục con!");
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi khi xóa!");
    }
  };

  const mainMenuItems = [
    { label: "TRANG CHỦ", path: "/" },
    ...Object.entries(categories).map(([mainCat, subCats]) => ({
        label: mainCat,
        path: `/category/${toSlug(mainCat)}`,
        dropdown: subCats.map(sub => ({ label: sub, path: `/category/${toSlug(sub)}` }))
    })),
    { label: "HỖ TRỢ", path: "/support" }
  ];

  const subMenuItems = [
    { label: "HỆ THỐNG QUẢN LÝ BÁN HÀNG", path: "/system", special: true },
    { 
      label: "NHẬP ĐƠN HÀNG", 
      path: "https://docs.google.com/forms/d/e/1FAIpQLSfcKsOtdKXirlZQVS6yCD9qc4L3ddoQeqgonRraym5fmXi9Ow/viewform?usp=sharing&ouid=116077349834800113921", 
      special: true 
    },
    { label: "HƯỚNG DẪN VẬN HÀNH", path: "/guides", special: true }
  ];

  const renderMenuItem = (item: any, i: number) => {
    const isExternal = item.path.startsWith('http');
    const LinkComponent = isExternal ? 'a' as any : Link;
    const linkProps = isExternal 
      ? { href: item.path, target: "_blank", rel: "noopener noreferrer" } 
      : { to: item.path };

    const isActive = !isExternal && location.pathname === item.path && !item.special;

    return (
      <li key={i} className="group relative">
        <LinkComponent 
          {...linkProps}
          className={`flex items-center gap-2 px-5 py-4 text-[10.5px] font-bold tracking-[0.15em] transition-all relative overflow-hidden border-r border-white/5 uppercase h-[56px]
            ${item.special 
              ? "text-yellow-400 bg-yellow-500/5 hover:bg-yellow-500/10 font-bold" 
              : isActive
                ? "bg-red-700 text-white font-extrabold"
                : "text-slate-300 hover:text-white hover:bg-white/[0.03]"}`}
        >
          <span className="relative z-10">{item.label}</span>
          {item.dropdown && (
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors duration-300 transform group-hover:rotate-180" />
          )}
          
          {/* Glowing Accent Line */}
          <div className={`absolute bottom-0 left-0 w-full h-[3px] bg-red-600 transition-transform duration-300 origin-left
            ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} 
          />
        </LinkComponent>

        {item.dropdown && (
          <div className="absolute top-[100%] left-0 w-72 bg-[#04091E] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-[60] py-1.5 rounded-b-2xl">
            {item.dropdown.map((sub: any, j: number) => {
              const subLabel = typeof sub === 'string' ? sub : sub.label;
              const subPath = getSubPath(sub, item.path);
              return (
                <Link 
                  key={j} 
                  to={subPath} 
                  className="flex items-center justify-between px-7 py-4 text-[10px] font-black text-white/90 border-b border-white/5 hover:text-yellow-400 hover:bg-white/5 transition-all group/sub"
                >
                  <span className="uppercase tracking-widest group-hover/sub:translate-x-1 transition-transform">{subLabel}</span>
                  <ChevronRight className="w-3 h-3 text-slate-500 group-hover/sub:text-yellow-400 transition-colors" />
                </Link>
              );
            })}
          </div>
        )}
      </li>
    );
  };

  const getSubTabParam = (label: string): string => {
    const norm = label.toLowerCase();
    if (norm.includes("hybrid") || norm.includes("bồn cầu")) return "hybrid";
    if (norm.includes("hòa lưới") || norm.includes("sen vòi")) return "grid-tied";
    if (norm.includes("lưu trữ") || norm.includes("sen cây")) return "storage";
    if (norm.includes("pin") || norm.includes("phụ kiện") || norm.includes("linh kiện")) return "panels";
    return "hybrid";
  };

  const getSubPath = (sub: string | { label: string; path: string }, itemPath: string) => {
    if (typeof sub === 'string') {
      return `${itemPath}?tab=${getSubTabParam(sub)}`;
    }
    return sub.path;
  };

  return (
    <header className="w-full relative z-[100]">
      {/* Top Bar */}
      <div className="w-full bg-[#000033] py-2.5 px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-white text-[10px] font-black uppercase tracking-[0.15em]">
          <div className="flex items-center gap-8">
            <a href={`tel:${config.hotline}`} className="flex items-center gap-2 hover:text-yellow-400 transition-colors group">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-3 h-3 fill-current group-hover:text-yellow-400" />
              </div>
              <span className="opacity-80 group-hover:opacity-100 italic">Hotline: {config.hotline}</span>
            </a>
            <div className="hidden lg:flex items-center gap-3 border-l border-white/10 pl-8">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="opacity-60 italic">Hàng Chính Hãng 100% Giá Tốt Nhất</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href={config.facebook} target="_blank" rel="noreferrer" className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-all border border-white/10">
              <Facebook className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white py-4 lg:py-8 px-6 relative shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-800 border border-slate-100 active:scale-95 transition-all"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 lg:gap-4 group">
            <div className="h-10 lg:h-16 w-auto min-w-[40px] lg:min-w-[60px]">
              <EditableImage 
                id="site_logo" 
                defaultSrc="https://firebasestorage.googleapis.com/v0/b/ai-studio-assets.appspot.com/o/yohu_logo_placeholder.png?alt=media" 
                alt="Yohu Logo"
                className="h-full w-auto object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline">
                <div className="text-xl lg:text-3xl font-black text-green-700 tracking-tighter uppercase">
                  <EditableText id="brand_name_part1" defaultText="YOHU" />
                </div>
                <span className="text-xs lg:text-base font-bold text-red-600 ml-0.5">®</span>
              </div>
              <div className="text-[7px] lg:text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] -mt-1">
                <EditableText id="brand_tagline" defaultText="Vietnam" />
              </div>
            </div>
          </Link>

          {/* Navigation Menu (Desktop) */}
          <div className="hidden lg:flex flex-grow max-w-xl mx-8">
            <div className="w-full flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3 focus-within:ring-4 focus-within:ring-blue-600/5 focus-within:border-blue-600/20 transition-all group">
              <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Tìm kiếm sản phẩm..." 
                className="bg-transparent border-none outline-none text-sm w-full ml-4 font-medium text-slate-700 placeholder:text-slate-300" 
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <Link to="/admin" className="h-10 lg:h-12 flex items-center gap-2 px-3 lg:px-5 bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-100 rounded-xl lg:rounded-2xl transition-all group" title="Bảng quản trị / Đăng nhập">
              <UserCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden xl:block text-[10px] font-black uppercase tracking-widest">Đăng nhập</span>
            </Link>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative group cursor-pointer w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-xl lg:rounded-2xl hover:scale-105 transition-all shadow-xl shadow-slate-900/10 border-none outline-none"
              title="Xem giỏ hàng"
            >
              <ShoppingCart className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 bg-red-600 text-white text-[8px] lg:text-[9px] font-black w-4 h-4 lg:w-5 lg:h-5 rounded-lg border-2 border-white flex items-center justify-center shadow-lg">{cartCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Menu Desktop Row */}
      <nav className="bg-[#04091E] hidden lg:block sticky top-0 z-50 shadow-[0_15px_30px_-15px_rgba(0,0,0,0.5)] border-y border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col w-full">
            <ul className="flex items-center justify-center w-full flex-wrap border-b border-white/5">
              {mainMenuItems.map((item, i) => renderMenuItem(item, i))}
            </ul>
            <ul className="flex items-center justify-center w-full flex-wrap">
              {subMenuItems.map((item, i) => renderMenuItem(item, i))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] lg:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-[120] lg:hidden flex flex-col shadow-2xl shadow-black/50"
            >
              <div className="p-6 bg-[#000033] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold">Y</div>
                  <span className="font-black tracking-tighter uppercase text-sm">Yohu Việt Nam</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-4 space-y-2">
                {[...mainMenuItems, ...subMenuItems].map((item: any, i) => {
                   const isExternal = item.path.startsWith('http');
                   const LinkComponent = isExternal ? 'a' as any : Link;
                   const linkProps = isExternal 
                     ? { href: item.path, target: "_blank", rel: "noopener noreferrer" } 
                     : { to: item.path };

                   return (
                     <div key={i} className="border-b border-slate-50 last:border-none pb-2">
                        <LinkComponent 
                          {...linkProps}
                          className={`flex items-center justify-between p-4 rounded-xl font-black text-xs tracking-widest uppercase transition-all
                            ${item.special ? "text-red-600 bg-red-50" : "text-slate-700 hover:bg-slate-50"}`}
                        >
                          {item.label}
                          {!item.dropdown && <ChevronRight className="w-4 h-4 opacity-20" />}
                        </LinkComponent>
                        
                        {item.dropdown && (
                          <div className="pl-4 mt-1 space-y-1">
                            {item.dropdown.map((sub: any, j: number) => {
                              const subLabel = typeof sub === 'string' ? sub : sub.label;
                              const subPath = getSubPath(sub, item.path);
                              return (
                                <Link 
                                  key={j} 
                                  to={subPath} 
                                  className="flex items-center gap-3 p-3 text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-all"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                  <span className="uppercase">{subLabel}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                     </div>
                   );
                })}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <a href={`tel:${config.hotline}`} className="flex items-center gap-3 p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200 active:scale-95 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Gọi ngay Hotline</p>
                    <p className="text-sm font-bold">{config.hotline}</p>
                  </div>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
