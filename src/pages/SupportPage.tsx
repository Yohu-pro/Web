import { SiteConfig } from "../types";
import { FileText, Download, Phone, MapPin, Mail, ChevronRight, Settings, Info, Box } from "lucide-react";
import EditableText from "../components/EditableText";
import { useAdmin } from "../lib/AdminContext";
import { useNavigate } from "react-router-dom";

export default function SupportPage({ config }: { config: SiteConfig }) {
  const { customData } = useAdmin();
  const navigate = useNavigate();
  const priceListPdf = customData['price_list_pdf'] || "#";

  const supportSections = [
    {
      id: "company",
      icon: <Info className="w-6 h-6" />,
      title: "Về Doanh nghiệp",
      description: "Lịch sử hình thành, tầm nhìn sứ mệnh và các chứng nhận chất lượng chính hãng của Yohu Việt Nam.",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "pricelist",
      icon: <FileText className="w-6 h-6" />,
      title: "Bảng giá & Catalogue",
      description: "Tổng hợp bảng báo giá bán lẻ, chiết khấu đại lý và catalogue thông số kỹ thuật mới nhất năm 2025.",
      image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "software",
      icon: <Settings className="w-6 h-6" />,
      title: "Phần mềm Quản lý",
      description: "Giới thiệu hệ thống quản lý bán hàng, kho bãi thông minh giúp tối đa hóa hiệu quả kinh doanh cho đối tác.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Hero Header */}
      <section className="bg-[#000033] py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/5 skew-x-12 translate-x-1/4" />
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">
            TRUNG TÂM HỖ TRỢ <span className="text-blue-500">YOHU</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            Chúng tôi luôn đồng hành cùng quý khách hàng và đối tác trong mọi giải pháp.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {supportSections.map((section) => {
             const handleSectionClick = () => {
               if (section.id === "company") {
                 document.getElementById("company-section")?.scrollIntoView({ behavior: "smooth" });
               } else if (section.id === "pricelist") {
                 document.getElementById("download-section")?.scrollIntoView({ behavior: "smooth" });
               } else if (section.id === "software") {
                 navigate("/system");
               }
             };

             return (
               <div key={section.id} className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 group hover:-translate-y-2 transition-all duration-500 border border-slate-100 flex flex-col">
                  <div 
                    onClick={handleSectionClick} 
                    className="aspect-[16/10] overflow-hidden relative cursor-pointer"
                  >
                     <img src={section.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={section.title} />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                     <div className="absolute bottom-6 left-6 text-white bg-blue-600 p-3 rounded-2xl shadow-lg">
                        {section.icon}
                     </div>
                  </div>
                  <div className="p-8 space-y-4 flex-grow">
                     <h3 
                       onClick={handleSectionClick}
                       className="text-xl font-black text-slate-800 uppercase tracking-tight cursor-pointer hover:text-blue-600 transition-colors"
                     >
                       {section.title}
                     </h3>
                     <p className="text-slate-500 text-sm leading-relaxed">{section.description}</p>
                  </div>
                  <div className="p-6 border-t border-slate-50">
                     <button 
                       type="button"
                       onClick={handleSectionClick}
                       className="flex items-center gap-2 text-blue-600 text-[11px] font-black uppercase tracking-widest hover:gap-4 transition-all cursor-pointer"
                     >
                        Xem chi tiết <ChevronRight className="w-4 h-4" />
                     </button>
                  </div>
               </div>
             );
           })}
        </div>
      </section>

      {/* Detailed Info Sections */}
      <section className="max-w-7xl mx-auto px-6 py-24 space-y-32">
        {/* Company Info */}
        <div id="company-section" className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center pt-12 -mt-12">
           <div className="order-2 lg:order-1 space-y-6">
              <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">About Us</div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight uppercase tracking-tighter">Yohu Việt Nam: Người đồng hành tin cậy</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed text-justify">
                <p>Với hơn 10 năm kinh nghiệm trong ngành thiết kế và phân phối thiết bị công nghiệp, Yohu Việt Nam tự hào là đơn vị tiên phong mang đến các giải pháp bồn nước, năng lượng mặt trời và thiết bị vệ sinh chất lượng cao.</p>
                <p>Chúng tôi tập trung vào 3 giá trị cốt lõi: <b>Chất lượng tối ưu - Giá thành hợp lý - Dịch vụ tận tâm</b>. Mỗi sản phẩm được đưa ra thị trường đều trải qua quy trình kiểm tra nghiêm ngặt.</p>
              </div>
              <div className="grid grid-cols-2 gap-8 pt-6">
                 <div>
                    <p className="text-xl font-black text-[#990000]">5000+</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dự án hoàn thành</p>
                 </div>
                 <div>
                    <p className="text-xl font-black text-[#990000]">100%</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Khách hàng hài lòng</p>
                 </div>
              </div>
           </div>
           <div className="order-1 lg:order-2">
              <div className="aspect-square bg-slate-200 rounded-[4rem] overflow-hidden relative shadow-2xl skew-x-3">
                 <img src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" alt="Office" />
              </div>
           </div>
        </div>

        {/* Rich Content Section for Support */}
        <div id="support-rich-content" className="bg-white rounded-[3rem] p-12 md:p-20 shadow-sm border border-slate-100 my-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter shrink-0">
                <EditableText id="support_rich_content_title" defaultText="Chi tiết Hỗ trợ & Hướng dẫn" />
              </h2>
              <div className="w-full h-px bg-slate-100" />
            </div>
            
            <div className="prose prose-slate max-w-none prose-img:rounded-3xl prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-a:text-red-600 font-medium text-slate-600 leading-relaxed">
              <EditableText 
                id="support_content" 
                as="markdown"
                defaultText={config.support_content || "Chào mừng bạn đến với trang hỗ trợ của Yohu Việt Nam. Tại đây bạn có thể thêm các thông tin chi tiết về chính sách, hướng dẫn kỹ thuật hoặc video hỗ trợ khách hàng."} 
              />
            </div>
          </div>
        </div>

        {/* Global Support Card */}
        <div id="download-section" className="bg-slate-900 rounded-[3rem] p-12 md:p-20 relative overflow-hidden pt-16 -mt-8">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                 <h2 className="text-2xl md:text-3xl font-black text-white uppercase leading-tight">Liên hệ trực tiếp bộ phận hỗ trợ</h2>
                 <div className="space-y-6">
                    <div className="flex items-start gap-6">
                       <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-blue-500 border border-white/10 shrink-0">
                          <Phone className="w-7 h-7" />
                       </div>
                       <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Hotline tư vấn</p>
                          <p className="text-2xl font-black text-white">{config.hotline}</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-6">
                       <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-red-500 border border-white/10 shrink-0">
                          <MapPin className="w-7 h-7" />
                       </div>
                       <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Trụ sở chính</p>
                          <p className="text-sm font-medium text-slate-300 leading-relaxed">{config.address}</p>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-10 space-y-6 backdrop-blur-sm">
                 <h4 className="text-white font-black uppercase text-center tracking-widest">Tải xuống Tài liệu 2025</h4>
                 <div className="flex flex-col gap-4">
                    <a href={priceListPdf} target="_blank" rel="noreferrer" className="flex items-center justify-between p-5 bg-white rounded-2xl hover:bg-blue-600 hover:text-white transition-all group">
                       <div className="flex items-center gap-4">
                          <Download className="w-5 h-5 text-blue-600 group-hover:text-white" />
                          <span className="font-bold text-sm">Download Catalogue</span>
                       </div>
                       <ChevronRight className="w-4 h-4 opacity-30" />
                    </a>
                    <a href={priceListPdf} target="_blank" rel="noreferrer" className="flex items-center justify-between p-5 bg-white/10 border border-white/10 rounded-2xl hover:bg-white/20 text-white transition-all group">
                       <div className="flex items-center gap-4">
                          <Box className="w-5 h-5 text-blue-400" />
                          <span className="font-bold text-sm">Hướng dẫn lắp đặt</span>
                       </div>
                       <ChevronRight className="w-4 h-4 opacity-30" />
                    </a>
                 </div>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}
