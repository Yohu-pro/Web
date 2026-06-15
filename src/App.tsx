import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/AdminDashboard";
import InventorySystem from "./pages/InventorySystem";
import CategoryPage from "./pages/CategoryPage";
import SupportPage from "./pages/SupportPage";
import GuidePage from "./pages/GuidePage";
import Navbar from "./components/Navbar";
import ChatBot from "./components/ChatBot";
import FloatingActions from "./components/FloatingActions";
import { SiteConfig } from "./types";
import { AdminProvider } from "./lib/AdminContext";
import { CartProvider } from "./lib/CartContext";
import CartDrawer from "./components/CartDrawer";
import EditableImage from "./components/EditableImage";
import EditableText from "./components/EditableText";

const DEFAULT_CONFIG: SiteConfig = {
  company_name: "Công ty TNHH Yohu Việt Nam",
  address: "BT39 Khu Biệt thự Tân Phố Hiến – phường Phố Hiến – tỉnh Hưng Yên",
  hotline: "+84 973 480 488",
  zalo: "+84 339 60 69 69",
  email_primary: "yohu.vn@gmail.com",
  email_secondary: "yohu.com.vn@gmail.com",
  facebook: "https://www.facebook.com/share/18qpLBfAo7/",
  fanpage: "https://www.facebook.com/share/1Dftf3tTeo/",
  sheet_id: "163ZiScOOL2R9YJalt4RiBhPKZvV9yisVosD3lgeu5iQ",
  form_id: "1NhJWil7DYbCmYnvx_3IZrL-vW-I7Q8Q523w1soVU9Io",
  folder_main_id: "17OnO27l8eXYTA-E0fkg9PQnkzk4RB82S",
  kqkd_report_id: "142_X48JtBR6ItQD-gVOV1utUL419mCeQ0W_Q3z3wQDE",
  xnt_report_id: "1JrIPYBjFKsBY7Z5DdtznPdn1E7Z9ZNN76GisFzgHyfs",
  invoice_pdf_id: "14jQmHoH0JeUrMvsujcWj6Bf8YXMNtvXn0CwdHaV4r3k",
  sample_files_id: "1PfP4YOOe1yo5RhUyk28emwIthwe0HagH",
  catalogue_url: "https://drive.google.com/file/d/16pXjde58KCV14_pgvW3W8Z1i_9UYJMzX/view?usp=sharing",
};

export default function App() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch("/api/config");
        if (response.ok) {
          const data = await response.json();
          setSiteConfig({ ...DEFAULT_CONFIG, ...data });
        }
      } catch (err) {
        console.error("Failed to fetch config:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  if (loading) return <div className="h-screen w-screen flex items-center justify-center font-sans">Đang tải...</div>;

  return (
    <AdminProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
          <Navbar config={siteConfig} />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage config={siteConfig} />} />
              <Route path="/category/:categoryId" element={<CategoryPage config={siteConfig} />} />
              <Route path="/support" element={<SupportPage config={siteConfig} />} />
              <Route path="/system" element={<InventorySystem config={siteConfig} />} />
              <Route path="/guides" element={<GuidePage config={siteConfig} />} />
              <Route path="/admin" element={<AdminDashboard config={siteConfig} setConfig={setSiteConfig} />} />
            </Routes>
          </main>
          <ChatBot config={siteConfig} />
          <CartDrawer config={siteConfig} />
          <FloatingActions config={siteConfig} />
          <footer className="bg-[#000033] text-white py-20 px-6 border-t border-white/5">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="md:col-span-2 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-auto bg-white/5 p-4 rounded-2xl border border-white/10">
                    <EditableImage 
                      id="footer_logo" 
                      defaultSrc="https://firebasestorage.googleapis.com/v0/b/ai-studio-assets.appspot.com/o/yohu_logo_placeholder.png?alt=media" 
                      alt="Yohu Logo Footer"
                      className="h-full w-auto object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="text-2xl font-black uppercase tracking-[0.2em] text-white">
                      <EditableText id="footer_company_name" defaultText={siteConfig.company_name} />
                    </div>
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Vietnam Industry Leader</span>
                  </div>
                </div>
                <div className="text-slate-400 text-sm leading-relaxed max-w-md">
                  <EditableText id="footer_desc" defaultText="Chuyên cung cấp các giải pháp bồn nước, máy năng lượng mặt trời, thiết bị vệ sinh và thiết bị nhà bếp chính hãng. Cam kết chất lượng và dịch vụ bảo trì tận tâm." />
                </div>
                <div className="pt-4 border-t border-white/5">
                  <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-3">Trụ sở chính</p>
                  <div className="text-slate-300 text-sm leading-relaxed">
                     <EditableText id="footer_addr" defaultText={siteConfig.address} />
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-blue-400">Liên hệ</h3>
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[10px] uppercase tracking-widest">Hotline</span>
                    <a href={`tel:${siteConfig.hotline}`} className="text-slate-200 font-bold hover:text-blue-400 transition-colors">{siteConfig.hotline}</a>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[10px] uppercase tracking-widest">Zalo liên hệ</span>
                    <a href={`https://zalo.me/${siteConfig.zalo.replace(/\s+/g, '')}`} className="text-slate-200 font-bold hover:text-blue-400 transition-colors">{siteConfig.zalo}</a>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[10px] uppercase tracking-widest">Hỗ trợ kỹ thuật</span>
                    <span className="text-slate-200 font-bold">{siteConfig.email_primary}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-blue-400">Kết nối</h3>
                <div className="flex flex-wrap gap-4">
                  <a href={siteConfig.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 transition-all group">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                  </a>
                  <a href={siteConfig.fanpage} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-600 transition-all group">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M22.5 12c0-5.8-4.7-10.5-10.5-10.5S1.5 6.2 1.5 12c0 5.2 3.8 9.6 8.8 10.4v-7.3H7.8V12h2.5V9.6c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.3c-1.2 0-1.6.8-1.6 1.5V12h2.7l-.4 3.1h-2.3V22.4c5-.8 8.8-5.2 8.8-10.4z"/></svg>
                  </a>
                </div>
              </div>
            </div>
            
            <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold">
              <p>&copy; 2025 Yohu Việt Nam. All rights reserved.</p>
              <div className="flex gap-8">
                <a href="#" className="hover:text-white transition-colors">Chính sách bảo hành</a>
                <a href="#" className="hover:text-white transition-colors">Vận chuyển</a>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
      </CartProvider>
    </AdminProvider>
  );
}

