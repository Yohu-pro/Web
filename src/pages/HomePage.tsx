import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SiteConfig } from "../types";
import { ShoppingCart, Star, Phone, Facebook, Mail, MapPin, FileText, Download, ExternalLink, LayoutDashboard, Info, X, Image as ImageIcon, Search, Check, ShieldCheck } from "lucide-react";
import { PRODUCTS } from "../data/products";
import EditableText from "../components/EditableText";
import EditableImage from "../components/EditableImage";
import { useAdmin } from "../lib/AdminContext";
import { useCart } from "../lib/CartContext";

import EditableProductCarousel from "../components/EditableProductCarousel";

export default function HomePage({ config }: { config: SiteConfig }) {
  const { isAuthenticated, isEditMode, customData, updateCustomData } = useAdmin();
  const { addToCart } = useCart();
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  // States for Consulting Modal and Technical Training documents
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [consultSuccess, setConsultSuccess] = useState(false);
  const [consultForm, setConsultForm] = useState({ name: "", phone: "", service: "Tư vấn Giải pháp", content: "" });
  const [pdfSearch, setPdfSearch] = useState("");
  const [pdfFilter, setPdfFilter] = useState("all");
  const [uploadingPdfId, setUploadingPdfId] = useState<string | null>(null);
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockMessage, setLockMessage] = useState("");

  const handlePdfUploadInRow = async (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdfId(docId);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const resp = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) {
        throw new Error("Không thể tải tệp lên máy chủ Yohu.");
      }

      const resData = await resp.json();
      if (resData.url) {
        await updateCustomData(`pdf_url_${docId}`, resData.url);
        alert(`Tải tài liệu lên thành công!`);
      } else {
        throw new Error(resData.error || "Không nhận được liên kết tệp.");
      }
    } catch (err: any) {
      console.error(err);
      alert(`Lỗi khi tải tệp lên: ${err.message || err}`);
    } finally {
      setUploadingPdfId(null);
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  const trainingPdfs = [
    {
      id: "doc_1",
      title: customData["doc_title_doc_1"] || "Catalogue Thiết Bị Vệ Sinh, Bếp & Bồn Nước YOHU 2025",
      category: "catalogue",
      size: "4.8 MB",
      date: "06/2025",
      url: customData["pdf_url_doc_1"] || config.catalogue_url || "https://drive.google.com/file/d/16pXjde58KCV14_pgvW3W8Z1i_9UYJMzX/view?usp=sharing",
    },
    {
      id: "doc_2",
      title: customData["doc_title_doc_2"] || "Cẩm Nang Lắp Đặt Bơm Nhiệt & Điều Hòa Dân Dụng",
      category: "installation",
      size: "3.5 MB",
      date: "05/2025",
      url: customData["pdf_url_doc_2"] || config.catalogue_url || "https://drive.google.com/file/d/16pXjde58KCV14_pgvW3W8Z1i_9UYJMzX/view?usp=sharing",
    },
    {
      id: "doc_3",
      title: customData["doc_title_doc_3"] || "Quy Trình Đào Tạo Vận Hành Hệ Thống Năng Lượng Mặt Trời Hybrid",
      category: "training",
      size: "5.2 MB",
      date: "04/2025",
      url: customData["pdf_url_doc_3"] || config.catalogue_url || "https://drive.google.com/file/d/16pXjde58KCV14_pgvW3W8Z1i_9UYJMzX/view?usp=sharing",
    },
    {
      id: "doc_4",
      title: customData["doc_title_doc_4"] || "Bảng Báo Giá Điện Lạnh, Sen Vòi & Máy Lọc Nước Mới Nhất",
      category: "price",
      size: "2.1 MB",
      date: "06/2025",
      url: customData["pdf_url_doc_4"] || config.price_list_url || "#",
    }
  ];

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultForm.name || !consultForm.phone) {
      alert("Vui lòng nhập đầy đủ tên và số điện thoại của bạn!");
      return;
    }
    setConsultSuccess(true);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance("Yêu cầu của bạn đã được tiếp nhận thành công. Chuyên gia Yohu Việt Nam sẽ trực tiếp gọi điện tư vấn cho bạn trong ít phút.");
      utter.lang = 'vi-VN';
      
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => v.lang.startsWith('vi'));
      if (viVoice) utter.voice = viVoice;
      
      window.speechSynthesis.speak(utter);
    }
    setTimeout(() => {
      setIsConsultModalOpen(false);
      setConsultSuccess(false);
      setConsultForm({ name: "", phone: "", service: "Tư vấn Giải pháp", content: "" });
    }, 4000);
  };

  const customProducts = config.custom_products || [];
  const consolidatedProducts = [...PRODUCTS, ...customProducts];

  // Balanced collection of Best Selling Products (reducing solar monopoly, including toilets, showers, and accessories)
  const toiletProducts = consolidatedProducts.filter(p => {
    const categoryLower = (p.category || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return categoryLower.includes("bon cau") || categoryLower.includes("toilet") || categoryLower.includes("ve sinh");
  }).slice(0, 2);
  
  const faucetProducts = consolidatedProducts.filter(p => {
    const categoryLower = (p.category || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return categoryLower === "sen voi" || categoryLower.includes("voi");
  }).slice(0, 2);
  
  const scProducts = consolidatedProducts.filter(p => {
    const categoryLower = (p.category || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return categoryLower.includes("sen cay");
  }).slice(0, 1);
  
  const pkProducts = consolidatedProducts.filter(p => {
    const categoryNormalized = p.category?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
    return categoryNormalized.includes("linh kien") || categoryNormalized.includes("phu kien");
  }).slice(0, 1);
  
  const tankProducts = consolidatedProducts.filter(p => {
    const categoryLower = (p.category || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return categoryLower === "bon nuoc hwata" || categoryLower.includes("bon nuoc");
  }).slice(0, 1);
  
  const solarProducts = consolidatedProducts.filter(p => {
    const categoryLower = (p.category || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return categoryLower === "bo nang luong mat troi" || categoryLower.includes("mat troi") || categoryLower.includes("solar");
  }).slice(0, 1);

  // Combine static and custom products so custom ones show up instantly on front section!
  const featuredProducts = [
    ...tankProducts,
    ...solarProducts,
    ...toiletProducts,
    ...faucetProducts,
    ...scProducts,
    ...pkProducts,
    ...customProducts
  ].filter((p, index, self) => self.findIndex(t => t.id === p.id) === index).slice(0, 8);

  const priceListUrl = config.price_list_url || "#";
  const catalogueUrl = config.catalogue_url || "#";

  const getEmbedUrl = (url: string | null): string => {
    if (!url) return "";
    if (url.includes("drive.google.com")) {
      let embedUrl = url;
      if (embedUrl.includes("/view")) {
        const viewIndex = embedUrl.indexOf("/view");
        embedUrl = embedUrl.substring(0, viewIndex) + "/preview";
      } else if (embedUrl.includes("/open?id=")) {
        embedUrl = embedUrl.replace("/open?id=", "/file/d/") + "/preview";
      }
      return embedUrl;
    }
    return url;
  };

  return (
    <div className="bg-white font-sans">
      {/* ... (Previous sections HERO, Partner, Products remain the same) */}

      <AnimatePresence>
        {viewerUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/90 flex flex-col"
          >
            <div className="p-4 flex justify-between items-center bg-slate-900 border-b border-white/10">
              <h3 className="text-white font-bold uppercase tracking-widest text-sm">Xem tài liệu trực tuyến</h3>
              <button 
                onClick={() => setViewerUrl(null)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                title="Đóng (Close)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-grow relative bg-slate-800">
               <iframe 
                 src={getEmbedUrl(viewerUrl)} 
                 className="w-full h-full border-none"
                 title="Document Viewer"
               />
               <div className="absolute inset-0 pointer-events-none border-[12px] border-slate-900/50" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Banner Section */}
      <section className="px-6 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-2xl overflow-hidden shadow-sm aspect-[16/7] bg-slate-100 relative group">
            <EditableImage 
              id="hero_banner"
              defaultSrc={config.hero_image || "https://images.unsplash.com/photo-1542332213-94582aa20379?auto=format&fit=crop&q=80&w=1200"} 
              alt="Main Banner" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden md:flex flex-col gap-4">
            <div className="flex-grow rounded-2xl overflow-hidden shadow-sm bg-slate-100 relative group">
              <EditableImage 
                id="banner_side_1"
                defaultSrc="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                alt="Sidebar banner" 
              />
              <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />
            </div>
            <div className="flex-grow rounded-2xl overflow-hidden shadow-sm bg-slate-100 relative group">
              <EditableImage 
                id="banner_side_2"
                defaultSrc="https://images.unsplash.com/photo-1620627812632-2bd169473f7d?auto=format&fit=crop&q=80&w=600" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                alt="Sidebar banner" 
              />
              <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Partner Section */}
      <section className="py-24 px-6 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 space-y-4">
             <div className="inline-block text-[10px] bg-red-50 text-red-700 font-extrabold px-3 py-1 rounded-full uppercase tracking-widest">
               <EditableText id="service_tag" defaultText="Dịch vụ & Đồng hành" />
             </div>
             <h2 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter italic">
               <EditableText id="service_main_title" defaultText="Yohu Việt Nam: Người đồng hành Tận tâm" />
             </h2>
             <div className="text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">
               <EditableText id="service_sub_desc" defaultText="Không chỉ cung cấp sản phẩm cao cấp, chúng tôi mang tới những giải pháp thực tế hỗ trợ tối đa cho sự thành công của khách hàng và đối tác đại lý toàn quốc." />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
             {/* Card 1: Tư Vấn */}
             <div className="p-10 bg-white rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500 flex flex-col justify-between group">
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-8 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                     <Phone className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">
                    <EditableText id="card_1_title" defaultText="Tư vấn giải pháp 24/7" />
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    <EditableText id="card_1_desc" defaultText="Hỗ trợ tính toán hiệu suất điều hòa, thiết bị bếp và bồn nước inox theo dự án thực tế của quý đối tác." />
                  </p>
                </div>
                <div 
                  onClick={() => setIsConsultModalOpen(true)}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-[10px] tracking-widest uppercase shadow-lg shadow-blue-600/15 active:scale-95 transition-all text-center cursor-pointer"
                >
                  <EditableText id="card_1_btn" defaultText="GỬI YÊU CẦU TƯ VẤN" />
                </div>
             </div>

             {/* Card 2: Số hóa quản lý (Google Sheets) */}
             <div className="p-10 bg-white rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500 flex flex-col justify-between group">
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-8 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                     <LayoutDashboard className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">
                    <EditableText id="card_2_title" defaultText="Số hóa quản lý" />
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    <EditableText id="card_2_desc" defaultText="Hệ thống bán hàng thông minh đồng bộ Google Sheets, hỗ trợ nhập liệu rảnh tay bằng câu lệnh giọng nói AI." />
                  </p>
                </div>
                <div className="space-y-2">
                  <a 
                    href="/system"
                    className="w-full py-4 bg-slate-900 hover:bg-red-700 text-white font-bold rounded-2xl text-[10px] tracking-widest uppercase shadow-md active:scale-95 transition-all block text-center"
                  >
                    <EditableText id="card_2_btn_main" defaultText="HỆ THỐNG QUẢN LÝ BÁN HÀNG" />
                  </a>
                  <div 
                    onClick={(e) => {
                      e.preventDefault();
                      if (!isAuthenticated) {
                        setLockMessage("Đồng bộ dữ liệu từ Google Sheets là tác vụ quản trị bảo mật của YOHU. Vui lòng đăng nhập Admin để thực hiện.");
                        setShowLockModal(true);
                      } else {
                        window.open(`https://docs.google.com/spreadsheets/d/${config.sheet_id || "163ZiScOOL2R9YJalt4RiBhPKZvV9yisVosD3lgeu5iQ"}`, "_blank", "noopener,noreferrer");
                      }
                    }}
                    className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-200 text-emerald-800 font-extrabold rounded-xl text-[9px] tracking-widest uppercase transition-all block text-center text-xs cursor-pointer"
                  >
                     <EditableText id="card_2_btn_sync" defaultText="Đồng bộ Google Sheets 📊" />
                  </div>
                </div>
             </div>

             {/* Card 3: Đào Tạo Kỹ Thuật */}
             <div className="p-10 bg-white rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500 flex flex-col justify-between group">
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-8 shadow-sm group-hover:bg-red-600 group-hover:text-white transition-all duration-500">
                     <FileText className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">
                    <EditableText id="card_3_title" defaultText="Đào tạo kỹ thuật" />
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    <EditableText id="card_3_desc" defaultText="Xem trực tiếp hoặc tải Catalogue hướng dẫn sử dụng, đấu nối Hybrid, lắp đặt điều hòa Daikin-Panasonic." />
                  </p>
                </div>
                <div 
                  onClick={() => {
                    document.getElementById("technical-docs-vault")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-[10px] tracking-widest uppercase shadow-lg shadow-red-600/15 active:scale-95 transition-all text-center cursor-pointer"
                >
                  <EditableText id="card_3_btn" defaultText="TRA CỨU TÀI LIỆU KỸ THUẬT" />
                </div>
             </div>
          </div>

          {/* Inline Technical Documents Center */}
          <div id="technical-docs-vault" className="bg-white rounded-3xl border border-slate-100 p-8 md:p-12 shadow-md space-y-8 scroll-mt-20">
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div>
                   <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                      <FileText className="w-6 h-6 text-red-600" />
                      <EditableText id="technical_doc_title" defaultText="Tài liệu & Đào tạo kỹ thuật" />
                   </h3>
                   <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                     <EditableText id="technical_doc_subtitle" defaultText="Tải về hoặc xem trực tuyến các tệp đào tạo và catalogue mới nhất" />
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                   <div className="relative flex-grow sm:w-64">
                      <Search className="w-4 h-4 text-slate-350 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="Tìm tài liệu..."
                        value={pdfSearch} 
                        onChange={(e) => setPdfSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold placeholder:text-slate-300 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all text-slate-700"
                      />
                   </div>
                   <select
                     value={pdfFilter}
                     onChange={(e) => setPdfFilter(e.target.value)}
                     className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 outline-none focus:border-red-500 bg-white"
                   >
                     <option value="all">Tất cả tài liệu</option>
                     <option value="catalogue">Catalogue</option>
                     <option value="installation">Lắp đặt</option>
                     <option value="training">Đào tạo</option>
                     <option value="price">Báo giá</option>
                   </select>
                </div>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-black text-slate-350 uppercase tracking-widest">
                         <th className="py-4 px-2">Tên tài liệu / Tệp hướng dẫn</th>
                         <th className="py-4 px-2 hidden sm:table-cell">Lĩnh vực</th>
                         <th className="py-4 px-2 text-center">Dung lượng</th>
                         <th className="py-4 px-2 text-center hidden md:table-cell">Cập nhật</th>
                         <th className="py-4 px-2 text-right">Lựa chọn thao tác</th>
                      </tr>
                   </thead>
                   <tbody>
                      {trainingPdfs
                        .filter(doc => {
                          const matchesSearch = doc.title.toLowerCase().includes(pdfSearch.toLowerCase());
                          const matchesCategory = pdfFilter === "all" || doc.category === pdfFilter;
                          return matchesSearch && matchesCategory;
                        })
                        .map((doc, idx) => (
                           <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 px-2">
                                 <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 font-bold">
                                       PDF
                                    </div>
                                    <div>
                                       <span className="text-xs font-bold text-slate-800 block line-clamp-1">{doc.title}</span>
                                       <span className="text-[9px] text-slate-400 capitalize sm:hidden">{doc.category}</span>
                                    </div>
                                 </div>

                                 {isEditMode && (
                                   <div className="mt-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2 max-w-lg text-left">
                                     <div className="space-y-1">
                                       <span className="text-[9px] font-extrabold text-blue-700/80 uppercase tracking-wider block">Gắn link tài liệu:</span>
                                       <input 
                                         type="text"
                                         placeholder="Nhập hoặc dán URL mới..."
                                         value={customData[`pdf_url_${doc.id}`] || doc.url || ""}
                                         onChange={(e) => updateCustomData(`pdf_url_${doc.id}`, e.target.value)}
                                         className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:border-blue-500 outline-none transition-all"
                                       />
                                     </div>
                                     
                                     <div className="space-y-1">
                                       <span className="text-[9px] font-extrabold text-blue-700/80 uppercase tracking-wider block">Hoặc tải tài liệu lên trực tiếp:</span>
                                       <div className="flex items-center gap-2">
                                         <input 
                                           type="file"
                                           id={`file-upload-pdf-${doc.id}`}
                                           className="hidden"
                                           onChange={(e) => handlePdfUploadInRow(doc.id, e)}
                                         />
                                         <button 
                                           type="button"
                                           onClick={() => document.getElementById(`file-upload-pdf-${doc.id}`)?.click()}
                                           className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-extrabold uppercase tracking-widest transition-all cursor-pointer"
                                         >
                                           Chọn & Tải Tệp Lên 📤
                                         </button>
                                         {uploadingPdfId === doc.id && (
                                           <span className="text-[9px] font-bold text-blue-600 animate-pulse bg-blue-50 px-2 py-0.5 rounded"> Đang tải lên...</span>
                                         )}
                                         {customData[`pdf_url_${doc.id}`] && (
                                           <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Đã liên kết thành công ✅</span>
                                         )}
                                       </div>
                                     </div>
                                   </div>
                                 )}
                              </td>
                              <td className="py-4 px-2 hidden sm:table-cell">
                                 <span className="text-[10px] font-extrabold uppercase bg-slate-100 text-slate-500 px-2 py-1 rounded">
                                    {doc.category === "catalogue" ? "Catalogue" : doc.category === "installation" ? "Lắp Đặt" : doc.category === "training" ? "Đào tạo kỹ sư" : "Bản báo giá"}
                                 </span>
                              </td>
                              <td className="py-4 px-2 text-center text-xs font-semibold text-slate-500">
                                 {doc.size}
                              </td>
                              <td className="py-4 px-2 text-center text-xs font-medium text-slate-400 hidden md:table-cell">
                                 {doc.date}
                              </td>
                              <td className="py-4 px-2 text-right">
                                 <div className="inline-flex gap-2">
                                    <button 
                                      onClick={() => {
                                        if (doc.url && doc.url !== "#") {
                                          setViewerUrl(doc.url);
                                        } else {
                                          alert("Đường dẫn xem tài liệu chưa được cấu hình.");
                                        }
                                      }}
                                      className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all"
                                    >
                                       Xem trực tiếp
                                    </button>
                                    <a 
                                      href={doc.url} 
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-red-700 text-white rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all"
                                    >
                                       Tải về tệp PDF
                                    </a>
                                 </div>
                              </td>
                           </tr>
                      ))}
                      {trainingPdfs.filter(doc => {
                          const matchesSearch = doc.title.toLowerCase().includes(pdfSearch.toLowerCase());
                          const matchesCategory = pdfFilter === "all" || doc.category === pdfFilter;
                          return matchesSearch && matchesCategory;
                        }).length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-slate-400 text-xs font-medium">Không tìm thấy tài liệu phù hợp.</td>
                          </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      </section>

      {/* Product Grid Section (replacing old logic) */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12 border-b-2 border-red-600 pb-4">
             <div className="flex flex-col">
                <EditableText id="featured_title" defaultText="Sản phẩm bán chạy" as="h2" className="text-2xl font-black text-slate-800 uppercase tracking-tighter" />
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mt-1">
                  <EditableText id="featured_subtitle" defaultText="Best Selling Products" />
                </span>
             </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100 border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white p-6 flex flex-col group hover:shadow-2xl transition-all duration-500 relative">
                <div className="relative aspect-square mb-8 overflow-hidden rounded-2xl bg-slate-50/50 p-4">
                  <EditableProductCarousel 
                    id={`prod_imgs_${product.id}`}
                    defaultImages={product.images && product.images.length > 0 ? product.images : [product.image]}
                    alt={product.name}
                  />
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-lg z-10 pointer-events-none">HOT</div>
                </div>
                
                <h3 className="text-[13px] font-black text-slate-800 text-center uppercase tracking-tight leading-snug min-h-[48px] mb-4 group-hover:text-blue-700 transition-colors">
                  <EditableText id={`prod_name_${product.id}`} defaultText={product.name} />
                </h3>
                
                <div className="flex justify-center gap-1 mb-5">
                  {[...Array(product.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                
                <div className="text-center mb-8">
                  <div className="inline-flex flex-col items-center">
                    <span className="text-red-600 font-black text-2xl tracking-tighter">
                      <EditableText id={`prod_price_${product.id}`} defaultText={product.price} />
                    </span>
                    {product.oldPrice && (
                      <span className="text-slate-300 text-[11px] line-through italic mt-0.5">
                        <EditableText id={`prod_oldprice_${product.id}`} defaultText={product.oldPrice} />
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-auto space-y-3 px-2">
                   <button onClick={() => addToCart(product)} className="w-full py-4 bg-slate-900 hover:bg-red-700 text-white rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase transition-all active:scale-95">
                      <ShoppingCart className="w-4 h-4" /> Mua ngay
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* PDF Price List Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-900 to-[#000033] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/5 skew-x-12 translate-x-1/2" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <FileText className="w-3.5 h-3.5" />
                Cập nhật mới nhất 2025
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tight leading-tight">
                <EditableText id="pdf_section_title" defaultText="Bảng giá & Catalogue sản phẩm" />
              </h2>
              <div className="text-slate-400 text-lg leading-relaxed">
                <EditableText id="pdf_section_desc" defaultText="Xem trực tiếp hoặc tải về bảng giá chi tiết các sản phẩm bồn nước, thiết bị vệ sinh và máy năng lượng mặt trời mới nhất của Yohu Việt Nam." />
              </div>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="w-full flex flex-col gap-4 mb-4">
                  <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5 space-y-4">
                    <p className="text-white text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" /> Bảng giá sản phẩm
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={() => setViewerUrl(priceListUrl)}
                        className="px-6 py-3 bg-blue-600 hover:bg-white hover:text-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Xem trực tuyến
                      </button>
                      <a 
                        href={priceListUrl} 
                        download
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" /> Tải về bản PDF
                      </a>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5 space-y-4">
                    <p className="text-white text-sm font-black uppercase tracking-widest flex items-center gap-2">
                       <ImageIcon className="w-4 h-4 text-green-500" /> Catalogue Yohu 2025
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={() => setViewerUrl(catalogueUrl)}
                        className="px-6 py-3 bg-green-600 hover:bg-white hover:text-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-xl shadow-green-600/20"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Xem trực tuyến
                      </button>
                      <a 
                        href={catalogueUrl} 
                        download
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" /> Tải về bản PDF
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-5/12">
               <div className="relative group">
                  <div className="absolute inset-0 bg-blue-600 blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border-8 border-white/10 shadow-2xl rotate-2 group-hover:rotate-0 transition-transform duration-700 bg-slate-800">
                    <EditableImage 
                      id="pdf_preview_img" 
                      defaultSrc="https://firebasestorage.googleapis.com/v0/b/ai-studio-assets.appspot.com/o/pdf_preview_placeholder.png?alt=media" 
                      className="w-full h-full object-cover"
                      alt="Price List Preview"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                    <div className="absolute bottom-10 left-10 right-10 flex flex-col items-center">
                        <FileText className="w-16 h-16 text-blue-500 mb-4 animate-bounce" />
                        <p className="text-white font-black uppercase tracking-widest text-sm text-center">Catalogue 2025</p>
                        <p className="text-white/40 text-[10px] uppercase mt-1">Yohu Vietnam Industry</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div className="inline-block border-b-4 border-blue-600 pb-2">
              <EditableText id="about_title" defaultText="Về chúng tôi" as="h2" className="text-2xl font-black text-slate-900 uppercase" />
            </div>
            <div className="space-y-6 text-slate-600 text-sm leading-relaxed text-justify">
              <EditableText 
                id="about_description" 
                defaultText={`Trung tâm phân phối ${config.company_name} chính hãng là địa chỉ uy tín cung cấp các sản phẩm inox cao cấp như bồn nước inox, chậu rửa inox, bàn ghế inox, được sản xuất với công nghệ tiên tiến từ Đài Loan.`} 
                as="p"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <EditableText id="tphcm_title" defaultText="Khu vực TP.HCM" as="h4" className="font-black text-[#990000] text-sm uppercase mb-4 border-b border-slate-100 pb-2" />
                <address className="not-italic text-xs space-y-2 text-slate-500">
                   <p className="flex items-start gap-2"><MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" /> Lô II-1, Cụm 1, Nhóm CN II, KCN Tân Bình, Q. Tân Phú, Tp. HCM</p>
                   <p className="flex items-center gap-2 font-bold text-slate-900"><Phone className="w-4 h-4 text-red-600" /> {config.hotline}</p>
                </address>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <EditableText id="mb_title" defaultText="Khu vực Miền Bắc" as="h4" className="font-black text-[#990000] text-sm uppercase mb-4 border-b border-slate-100 pb-2" />
                <address className="not-italic text-xs space-y-2 text-slate-500">
                   <p className="flex items-start gap-2"><MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" /> {config.address}</p>
                   <p className="flex items-center gap-2 font-bold text-slate-900"><Phone className="w-4 h-4 text-red-600" /> {config.zalo}</p>
                </address>
              </div>
            </div>
          </div>
          
          <div className="relative">
             <div className="rounded-3xl overflow-hidden shadow-2xl skew-y-3 hover:skew-y-0 transition-transform duration-700 bg-white border-8 border-white">
                <EditableImage 
                  id="about_image"
                  defaultSrc="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800"
                  className="w-full h-full object-cover" 
                  alt="Xưởng sản xuất" 
                />
             </div>
             <div className="absolute -bottom-6 -left-6 bg-red-700 text-white p-8 rounded-2xl shadow-xl hidden md:block">
                <div className="text-4xl font-black">
                  <EditableText id="experience_years" defaultText="10+" />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                  <EditableText id="experience_label" defaultText="Năm phát triển" />
                </div>
             </div>
          </div>
        </div>
      </section>
      {/* Rich Content Section */}
      <section className="py-20 px-6 bg-white overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter shrink-0">
              <EditableText id="home_rich_content_title" defaultText="Thông tin & Kiến thức chuyên ứng" />
            </h2>
            <div className="w-full h-px bg-slate-100" />
          </div>
          
          <div className="prose prose-slate max-w-none prose-img:rounded-3xl prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-a:text-red-600 font-medium text-slate-600 leading-relaxed">
            <EditableText 
              id="home_content" 
              as="markdown"
              defaultText={config.home_content || "Chào mừng bạn đến với Yohu Việt Nam. Tại đây bạn có thể thêm các nội dung bài viết, hình ảnh và video hướng dẫn chuyên sâu để khách hàng tham khảo."} 
            />
          </div>
        </div>
      </section>

      {/* Benefits Banner */}
      <section className="bg-[#000033] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-12 text-white/90">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-xl">👍</div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest">
                <EditableText id="benefit_1_title" defaultText="Chất lượng" />
              </div>
              <div className="text-[10px] opacity-60">
                <EditableText id="benefit_1_desc" defaultText="Sản phẩm 100% chính hãng" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-xl">🚚</div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest">
                <EditableText id="benefit_2_title" defaultText="Vận chuyển" />
              </div>
              <div className="text-[10px] opacity-60">
                <EditableText id="benefit_2_desc" defaultText="Giao hàng miễn phí toàn quốc" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-xl">💎</div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest">
                <EditableText id="benefit_3_title" defaultText="Bảo trì" />
              </div>
              <div className="text-[10px] opacity-60">
                <EditableText id="benefit_3_desc" defaultText="Chuyên gia hỗ trợ 24/7" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Consulting Request Modal */}
      <AnimatePresence>
         {isConsultModalOpen && (
           <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsConsultModalOpen(false)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
              />

              <motion.div 
                initial={{ scale: 0.95, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden z-10"
              >
                 <div className="bg-[#04091E] text-white p-7 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl" />
                    <div>
                       <span className="text-[9px] bg-red-600 text-white font-black px-2.5 py-0.5 rounded uppercase tracking-wider">YOHU® VIỆT NAM</span>
                       <h3 className="text-lg font-black uppercase tracking-tight mt-1">Đăng ký tư vấn giải pháp</h3>
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsConsultModalOpen(false);
                      }}
                      className="w-8 h-8 rounded-full bg-red-650 hover:bg-red-600 bg-red-600 hover:scale-110 flex items-center justify-center transition-all duration-300 text-white shadow-lg active:scale-95 cursor-pointer"
                    >
                       <X className="w-4 h-4 stroke-[2.5]" />
                    </button>
                 </div>

                 {consultSuccess ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-12 text-center space-y-4 flex flex-col items-center justify-center"
                    >
                       <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 border border-green-200 flex items-center justify-center mb-2">
                          <Check className="w-8 h-8 stroke-[3]" />
                       </div>
                       <h4 className="text-lg font-extrabold text-slate-900 uppercase">Gửi yêu cầu thành công!</h4>
                       <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                          Cảm ơn anh chị <b>{consultForm.name}</b>. Yêu cầu hỗ trợ về dịch vụ <b>{consultForm.service}</b> đã được kết nối trực tiếp đến tổng đài viên YOHU. Chúng tôi sẽ gọi lại ngay lập tức!
                       </p>
                    </motion.div>
                 ) : (
                    <form onSubmit={handleConsultSubmit} className="p-7 space-y-5">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Họ tên của bạn</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Nhập tên đầy đủ (Ví dụ: Nguyễn Văn A)"
                            value={consultForm.name}
                            onChange={(e) => setConsultForm({...consultForm, name: e.target.value})}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-600 focus:bg-white transition-colors"
                          />
                       </div>

                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">SĐT liên hệ</label>
                          <input 
                            type="tel" 
                            required
                            placeholder="Số điện thoại di động"
                            value={consultForm.phone}
                            onChange={(e) => setConsultForm({...consultForm, phone: e.target.value})}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-600 focus:bg-white transition-colors"
                          />
                       </div>

                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nhu cầu giải pháp</label>
                          <select 
                            value={consultForm.service}
                            onChange={(e) => setConsultForm({...consultForm, service: e.target.value})}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-blue-600 bg-white transition-colors"
                          >
                             <option value="Tư vấn Lắp đặt Điều Hòa">Hệ thống Điều Hòa Không Khí</option>
                             <option value="Tư vấn Năng lượng mặt trời Hybrid">Bộ Điện Năng Lượng Mặt Trời Hybrid</option>
                             <option value="Tư vấn Thiết bị vệ sinh YOHU">Thiết Bị Vệ Sinh & Sen Vòi YOHU</option>
                             <option value="Tư vấn thiết kế Thiết bị bếp">Thiết Bị Nhà Bếp Doanh Nghiệp</option>
                          </select>
                       </div>

                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Yêu cầu hay ghi chú</label>
                          <textarea 
                            rows={3}
                            placeholder="Nhập ghi chú yêu cầu kỹ thuật..."
                            value={consultForm.content}
                            onChange={(e) => setConsultForm({...consultForm, content: e.target.value})}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-600 focus:bg-white transition-colors resize-none"
                          />
                       </div>

                       <button 
                         type="submit"
                         className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] tracking-widest uppercase rounded-2xl shadow-xl shadow-blue-600/10 hover:shadow-blue-600/20 active:scale-95 transition-all text-center cursor-pointer"
                       >
                          GỬI YÊU CẦU TƯ VẤN
                       </button>
                    </form>
                 )}
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}
