import { SiteConfig } from "../types";
import { Video, FileSpreadsheet, Settings, Download, Plus, Trash2 } from "lucide-react";
import EditableText from "../components/EditableText";
import { useState, useEffect } from "react";
import { useAdmin } from "../lib/AdminContext";

export default function GuidePage({ config }: { config: SiteConfig }) {
  const { isAuthenticated } = useAdmin();
  const DEFAULT_GUIDES = [
    {
      id: "guide-1",
      title: "HƯỚNG DẪN SỬ DỤNG PHẦN MỀM QUẢN LÝ BÁN HÀNG",
      description: "Chi tiết về quy trình quản lý thông tin đơn hàng, tồn kho, cấu hình đồng bộ trực tiếp lên hệ thống Google Sheets đám mây và sử dụng câu lệnh giọng nói rảnh tay AI-PRO 2.0.",
      youtube_url: "https://www.youtube.com/watch?v=7Vp_tHuyPCo"
    },
    {
      id: "guide-2",
      title: "HƯỚNG DẪN QUẢN TRỊ WEBSITE & CẬP NHẬT SẢN PHẨM",
      description: "Hướng dẫn truy cập Cổng quản trị, chỉnh sửa cấu hình toàn cục (Hotline, Zalo, địa chỉ), thay đổi giá bán, thêm bớt danh mục sản phẩm và đồng bộ cơ sở dữ liệu bán hàng.",
      youtube_url: "https://www.youtube.com/watch?v=z3pEnZ-u6_c"
    }
  ];

  const [localConfig, setLocalConfig] = useState<SiteConfig>(config);
  const [newGuide, setNewGuide] = useState({ title: "", description: "", youtube_url: "" });

  useEffect(() => {
    setLocalConfig({
      ...config,
      video_guides: (config.video_guides && config.video_guides.length > 0) ? config.video_guides : DEFAULT_GUIDES
    });
  }, [config]);

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const id = match && match[2].length === 11 ? match[2] : null;
    return id ? `https://www.youtube.com/embed/${id}?rel=0&vq=hd1080&modestbranding=1` : url;
  };

  const updateConfig = (newConfig: SiteConfig) => {
    setLocalConfig(newConfig);
    fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newConfig)
    });
  };

  const addGuide = () => {
    if (!newGuide.title || !newGuide.youtube_url) return;
    const updatedConfig = { ...localConfig, video_guides: [...(localConfig.video_guides || []), { ...newGuide, id: Date.now().toString() }] };
    updateConfig(updatedConfig);
    setNewGuide({ title: "", description: "", youtube_url: "" });
  };

  const deleteGuide = (id: string) => {
    const updatedConfig = { ...localConfig, video_guides: localConfig.video_guides?.filter(g => g.id !== id) };
    updateConfig(updatedConfig);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-16">
      <section className="py-12 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <span className="text-[10px] bg-red-100 text-red-700 font-extrabold px-3 py-1 rounded-full uppercase tracking-widest bg-opacity-70 shadow-sm">
            Video Hướng Dẫn Trực Quan
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center justify-center gap-2">
            <Video className="w-8 h-8 text-red-600 inline animate-pulse" />
            <EditableText id="guide_page_title" defaultText="HƯỚNG DẪN VẬN HÀNH HỆ THỐNG & QUẢN TRỊ" /> 
          </h2>
        </div>

        {/* Dynamic Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {localConfig.video_guides?.map((guide) => (
            <div key={guide.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 p-6 space-y-6 flex flex-col justify-between group">
              <div className="space-y-4">
                <h3 className="text-lg font-black text-[#04091E] uppercase tracking-tight">{guide.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{guide.description}</p>
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-inner border border-slate-100 bg-slate-950 relative">
                  <iframe className="absolute inset-0 w-full h-full" src={getEmbedUrl(guide.youtube_url)} title={guide.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                </div>
                {isAuthenticated && <button onClick={() => deleteGuide(guide.id)} className="flex items-center gap-2 text-red-600 text-xs font-bold pt-2"><Trash2 className="w-4 h-4"/> Xóa</button>}
              </div>
            </div>
          ))}
        </div>

        {/* Add Guide Form */}
        {isAuthenticated && (
          <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-4">
              <h3 className="font-bold text-lg">Thêm hướng dẫn mới</h3>
              <input className="w-full bg-slate-800 p-3 rounded-lg text-sm" placeholder="Tiêu đề" value={newGuide.title} onChange={e => setNewGuide({...newGuide, title: e.target.value})} />
              <input className="w-full bg-slate-800 p-3 rounded-lg text-sm" placeholder="Mô tả" value={newGuide.description} onChange={e => setNewGuide({...newGuide, description: e.target.value})} />
              <input className="w-full bg-slate-800 p-3 rounded-lg text-sm" placeholder="Link YouTube" value={newGuide.youtube_url} onChange={e => setNewGuide({...newGuide, youtube_url: e.target.value})} />
              <button onClick={addGuide} className="bg-blue-600 px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2"><Plus className="w-4 h-4"/> Thêm mục hướng dẫn</button>
          </div>
        )}
      </section>
      
      {/* Footer Area - Original Tip Box */}
      <section className="px-6 max-w-7xl mx-auto pb-16">
        <div className="bg-slate-100 rounded-[2rem] p-6 text-slate-600 text-xs border border-slate-200 leading-relaxed font-medium flex gap-4 items-start shadow-inner">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-extrabold text-sm shadow-sm">💡</div>
          <p>
            <strong className="text-slate-800 uppercase tracking-wider">Mẹo tải nhanh từ YouTube: </strong> 
            Để tải trực tiếp các tệp tin hướng dẫn MP4 chất lượng cao từ YouTube hoàn toàn miễn phí, quý khách có thể chèn thêm chữ 
            <code className="bg-white border text-red-600 px-1.5 py-0.5 rounded font-bold mx-1 font-mono">pp</code> 
            ngay phía sau chữ <code className="bg-white border text-slate-700 px-1.5 py-0.5 rounded mx-1 font-mono">youtube</code> 
            ở trên thanh địa chỉ trình duyệt.
          </p>
        </div>
      </section>
    </div>
  );
}

