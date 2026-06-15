import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Settings, 
  FileText, 
  Image as ImageIcon, 
  Mic, 
  Save, 
  LogOut, 
  ChevronRight, 
  Database,
  Key,
  Globe,
  Loader2,
  Trash2,
  Sparkles,
  Cpu,
  Eye,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { SiteConfig } from "../types";
import { logout, googleSignIn } from "../lib/firebase";
import { useAdmin, UserRole } from "../lib/AdminContext";

export default function AdminDashboard({ config, setConfig }: { 
  config: SiteConfig, 
  setConfig: (c: SiteConfig) => void 
}) {
  const { isEditMode, setIsEditMode, customData, user, role, userConfig, isLoading, pendingStatus } = useAdmin();
  const [activeTab, setActiveTab] = useState("general");
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedPackageIntention, setSelectedPackageIntention] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [isSavingTenant, setIsSavingTenant] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [googleToken, setGoogleToken] = useState<string | null>(sessionStorage.getItem("google_access_token"));
  const [isListening, setIsListening] = useState(false);
  const [voiceResult, setVoiceResult] = useState<string | null>(null);
  const [sheetData, setSheetData] = useState<any[][] | null>(null);

  const [uploadedAssets, setUploadedAssets] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newSubAccount, setNewSubAccount] = useState("");
  const [subAccounts, setSubAccounts] = useState<any[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (role === UserRole.SUPER_ADMIN && activeTab === "tenants") {
      fetchSubAccounts();
    }
  }, [activeTab, role]);

  const handleGoogleSignIn = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result?.accessToken) {
        setGoogleToken(result.accessToken);
        sessionStorage.setItem("google_access_token", result.accessToken);
      }
    } catch (err: any) {
      if (err.code !== 'auth/cancelled-popup-request') {
        alert("Lỗi đăng nhập: " + err.message);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fetchSubAccounts = async () => {
    try {
      const { collection, getDocs } = await import("firebase/firestore");
      const { db } = await import("../lib/firebase");
      const querySnapshot = await getDocs(collection(db, "authorized_emails"));
      const accounts: any[] = [];
      querySnapshot.forEach((doc) => {
        accounts.push({ id: doc.id, ...doc.data() });
      });
      setSubAccounts(accounts);
    } catch (err) {
      console.error("Failed to fetch sub-accounts", err);
    }
  };

  const handleAddSubAccount = async () => {
    if (!newSubAccount.includes("@")) return alert("Email không hợp lệ");
    try {
      const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
      const { db } = await import("../lib/firebase");
      await setDoc(doc(db, "authorized_emails", newSubAccount.trim().toLowerCase()), {
        addedBy: user?.email,
        createdAt: serverTimestamp(),
        isActive: true
      });
      alert("Đã cấp quyền truy cập cho: " + newSubAccount);
      setNewSubAccount("");
      fetchSubAccounts();
    } catch (err) {
      alert("Lỗi khi thêm tài khoản");
    }
  };

  const handleDeleteSubAccount = async (email: string) => {
    if (!confirm(`Xóa quyền truy cập của ${email}?`)) return;
    try {
      const { doc, deleteDoc } = await import("firebase/firestore");
      const { db } = await import("../lib/firebase");
      await deleteDoc(doc(db, "authorized_emails", email));
      fetchSubAccounts();
    } catch (err) {
      alert("Lỗi khi xóa tài khoản");
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      const resp = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email })
      });
      const data = await resp.json();
      if (resp.ok) alert("Hệ thống đang triển khai web độc lập. Vui lòng chờ 2-3 phút.");
      else alert("Lỗi triển khai: " + data.error);
    } catch (e) {
      alert("Lỗi kết nối server");
    } finally {
      setIsDeploying(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const resp = await fetch("/api/assets");
      if (resp.ok) {
        const data = await resp.json();
        setUploadedAssets(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch assets:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "assets") {
      fetchAssets();
    }
  }, [activeTab]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const resp = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      let data: any;
      try {
        data = await resp.json();
      } catch (jsonErr) {
        throw new Error("Phản hồi hệ thống không hợp lệ (không phải dạng JSON).");
      }

      if (resp.ok && data.success) {
        alert("Đã tải tệp lên thành công!");
        fetchAssets();
      } else {
        alert("Lỗi tải tệp: " + (data.error || "Không xác định"));
      }
    } catch (err: any) {
      console.error(err);
      alert("Lỗi tải tệp lên: " + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
      }
    }
  };

  const handleFileDelete = async (filename: string) => {
    if (!confirm(`Bạn có chắc muốn xóa tệp "${filename}" không?`)) return;

    try {
      const resp = await fetch(`/api/assets/${filename}`, {
        method: "DELETE",
      });

      let data: any;
      try {
        data = await resp.json();
      } catch (jsonErr) {
        throw new Error("Phản hồi hệ thống không hợp lệ.");
      }

      if (resp.ok && data.success) {
        fetchAssets();
      } else {
        alert("Lỗi khi xóa tệp: " + (data.error || "Không xác định"));
      }
    } catch (err: any) {
      console.error(err);
      alert("Lỗi khi xóa tệp: " + err.message);
    }
  };

  const handleLogout = () => {
    setIsEditMode(false);
    logout();
    window.location.href = "/";
  };

  const [regData, setRegData] = useState({
    phone: "",
    industry: "",
    tabs: "",
    language: "vi-VN",
    layout: "classic",
    package: selectedPackageIntention || "1tr",
    domain: "",
    domainExtension: ".vn",
    additionalLanguages: [] as string[],
    note: ""
  });

  // Pre-fill package if intention exists
  useEffect(() => {
    if (selectedPackageIntention) {
      setRegData(prev => ({ ...prev, package: selectedPackageIntention }));
    }
  }, [selectedPackageIntention]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
      const { db } = await import("../lib/firebase");
      await setDoc(doc(db, "authorized_emails", user?.email || ""), {
        ...regData,
        email: user?.email,
        displayName: user?.displayName,
        requestDate: serverTimestamp(),
        isActive: false, 
        status: "pending",
        imagekitPrivateKey: "",
        imagekitPublicKey: "",
        imagekitUrlEndpoint: "",
        siteUrl: "",
        paymentStatus: "unpaid",
        paymentStartDate: null,
        paymentNote: "",
      }, { merge: true });

      // Record in Google Sheets
      try {
        await fetch("/api/register-sheet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
             email: user?.email,
             phone: regData.phone,
             domain: `${regData.domain}${regData.domainExtension}`,
             display_name: user?.displayName,
             package_name: regData.package,
             industry: regData.industry
          })
        });
      } catch (sheetErr) {
        console.warn("Sheet sync failed:", sheetErr);
      }

      setRegSuccess(true);
    } catch (err) {
      alert("Lỗi khi đăng ký");
    }
  };

  const handleToggleSubAccount = async (email: string, currentStatus: boolean) => {
    try {
      const { doc, updateDoc } = await import("firebase/firestore");
      const { db } = await import("../lib/firebase");
      await updateDoc(doc(db, "authorized_emails", email), {
        isActive: !currentStatus,
        status: !currentStatus ? "active" : "disabled"
      });
      fetchSubAccounts();
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not signed in at all, show Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background purely decorative */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px]" />
           <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[120px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl text-center space-y-10 relative z-10"
        >
          <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-blue-200 relative">
             <Key className="text-white w-12 h-12" />
             <div className="absolute -top-2 -right-2 bg-amber-400 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white">
                <Sparkles className="w-4 h-4 text-white" />
             </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Admin Portal</h2>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.2em]">Hệ thống quản trị YOHU Multi-tenant CMS</p>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={handleGoogleSignIn}
              disabled={isLoggingIn}
              className="w-full py-5 bg-white border-2 border-slate-100 rounded-3xl font-black flex items-center justify-center gap-4 hover:bg-slate-50 hover:border-blue-200 transition-all group shadow-sm disabled:opacity-50"
            >
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> : <img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="Google" />}
              <span className="text-slate-800 text-lg tracking-tight">{isLoggingIn ? "Đang xử lý..." : "Đăng nhập tài khoản"}</span>
            </button>

            <button 
              onClick={() => setShowPricingModal(true)}
              className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 group active:scale-95"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="text-lg tracking-tight">Đăng ký trải nghiệm Admin</span>
            </button>
          </div>

          <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
            <p className="text-[11px] text-blue-600 font-black uppercase tracking-[0.15em] leading-relaxed">
              SỬ DỤNG GMAIL ĐỂ ĐĂNG KÝ QUYỀN CHỈ SỬA WEB YOHU.<br/>
              TÀI KHOẢN PHỤ BỊ GIỚI HẠN CHỈ ĐƯỢC SỬA TEXT & ẢNH.
            </p>
          </div>
        </motion.div>

        {/* Pricing Modal */}
        {showPricingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowPricingModal(false)}
                className="absolute top-6 right-6 p-2 bg-slate-100 rounded-xl hover:bg-slate-200 text-slate-500"
              >
                <ChevronRight className="rotate-180 w-6 h-6" />
              </button>

              <div className="text-center space-y-2">
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Lựa chọn gói dịch vụ</h3>
                <p className="text-slate-500 text-sm">Chọn gói phù hợp để bắt đầu hành trình số hóa doanh nghiệp của bạn</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    name: "Gói 1tr",
                    title: "Web Cơ Bản",
                    price: "1.000.000đ",
                    sub: "Trọn bộ - Không phát sinh",
                    features: [
                      "Tên miền tùy chỉnh (.vn, .com, .net...)",
                      "Free 1 tháng đầu hỗ trợ đăng ký",
                      "Hosting lưu trữ trọn đời",
                      "Phần mềm trực sửa giao diện (Text/Ảnh)",
                      "Giao diện cơ bản, chuyên nghiệp"
                    ]
                  },
                  {
                    name: "Gói 1.5tr",
                    title: "Web + AI Chat",
                    price: "1.500.000đ",
                    sub: "Trọn bộ - Không phát sinh",
                    popular: true,
                    features: [
                      "Tất cả tính năng Gói 1tr",
                      "Chatbot AI tự động trả lời 24/7",
                      "Tùy chỉnh tri thức cho Bot AI",
                    ]
                  },
                  {
                    name: "Gói 3.5tr",
                    title: "Web + Quản lý bán hàng",
                    price: "3.500.000đ",
                    sub: "Trọn bộ - Không phát sinh",
                    features: [
                      "Tất cả tính năng Gói 1.5tr",
                      "Phần mềm quản lý bán hàng tích hợp",
                      "Đồng bộ đơn hàng Sheets thực tế"
                    ]
                  },
                  {
                    name: "Gói 5tr",
                    title: "Enterprise",
                    price: "5.000.000đ",
                    sub: "Dự kiến - Trọn bộ",
                    building: true,
                    features: [
                      "Tất cả tính năng Gói 3.5tr",
                      "Tích hợp Chữ ký số",
                      "Phần mềm Báo cáo tài chính (1 click)"
                    ]
                  }
                ].map((pkg, i) => (
                  <button 
                    key={i} 
                    disabled={pkg.building || isLoggingIn}
                    onClick={() => {
                      setSelectedPackageIntention(pkg.name);
                      handleGoogleSignIn();
                    }}
                    className={`text-left p-6 rounded-[2rem] border-2 flex flex-col space-y-4 relative transition-all active:scale-[0.98] group/card ${pkg.popular ? "border-blue-600 bg-blue-50/30 ring-4 ring-blue-500/10" : "border-slate-100 bg-slate-50/50 hover:border-blue-200"} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {pkg.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase rounded-full">Phổ biến nhất</span>}
                    {pkg.building && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-400 text-white text-[10px] font-black uppercase rounded-full">Đang xây dựng</span>}
                    
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{pkg.name}</p>
                      <h4 className="text-lg font-black text-slate-800 leading-tight group-hover/card:text-blue-600 transition-colors">{pkg.title}</h4>
                      <div className="flex items-baseline gap-1">
                        <p className="text-xl font-black text-slate-900">{pkg.price}</p>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{pkg.sub}</p>
                    </div>

                    <div className="flex-grow space-y-2">
                       {pkg.features.map((f, fi) => (
                         <p key={fi} className="text-[11px] text-slate-500 flex items-start gap-2">
                           <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                           {f}
                         </p>
                       ))}
                    </div>

                    <div className="pt-4 border-t border-slate-100/50 w-full">
                       <span className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-center block transition-all ${pkg.popular ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 group-hover/card:bg-blue-50 group-hover/card:text-blue-600 border border-slate-100 group-hover/card:border-blue-100'}`}>
                         Chọn đăng ký
                       </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
                <button 
                  onClick={handleGoogleSignIn}
                  disabled={isLoggingIn}
                  className="px-10 py-5 bg-blue-600 text-white rounded-3xl font-black text-xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95 flex items-center gap-4 disabled:opacity-50"
                >
                  {isLoggingIn ? <Loader2 className="w-6 h-6 animate-spin" /> : <img src="https://www.google.com/favicon.ico" className="w-6 h-6 grayscale brightness-200" alt="Google" />}
                  {isLoggingIn ? "Đang xử lý..." : "Tiếp tục đăng ký với Google"}
                </button>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Xem các gói và chọn sau khi đăng nhập</p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // If signed in but NOT authorized - Show Registration Form
  if (role === UserRole.UNAUTHORIZED) {
    if (regSuccess || pendingStatus === 'pending') {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-2xl text-center space-y-8"
          >
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-50/50">
               <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">ĐANG CHỜ PHÊ DUYỆT</h2>
              <p className="text-slate-600 text-sm leading-relaxed px-4">
                Yêu cầu của bạn đang được hệ thống xử lý. Sau khi Admin phê duyệt, bạn sẽ có quyền truy cập vào bảng quản trị để trực tiếp sửa Text và Ảnh trên Website của mình.
              </p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-8 space-y-6 text-left border border-slate-100 shadow-inner">
               <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thông tin đăng ký của bạn</span>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase">Pending Approval</span>
               </div>
               
               <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Tài khoản</p>
                    <p className="text-xs font-black text-slate-700 truncate">{user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Số điện thoại</p>
                    <p className="text-xs font-black text-slate-700">{userConfig?.phone || regData.phone}</p>
                  </div>
                  <div className="space-y-1 text-left">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Gói dịch vụ</p>
                    <p className="text-xs font-black text-blue-600">Gói {userConfig?.package || regData.package}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Tên miền mong muốn</p>
                    <p className="text-xs font-black text-slate-700">{userConfig?.domain || regData.domain}{userConfig?.domainExtension || regData.domainExtension}</p>
                  </div>
                  <div className="col-span-2 space-y-1 border-t border-slate-100 pt-4">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Nhu cầu & Ngành hàng</p>
                    <p className="text-xs font-medium text-slate-600 italic">"{userConfig?.industry || regData.industry}"</p>
                  </div>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
               <a href="tel:0973480488" className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-black transition-all">
                  Gọi Hotline: 0973 480 488
               </a>
               <a href="https://zalo.me/0339606969" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all">
                  Chat Zalo Admin
               </a>
            </div>

            <button onClick={handleLogout} className="text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] pt-4">
              Đăng xuất và quay lại
            </button>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl space-y-10"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Đăng ký thành viên</h2>
              <p className="text-slate-500 text-sm font-medium">Bắt đầu chuyên nghiệp hóa Website kinh doanh của bạn</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900">{user.displayName}</p>
                <p className="text-[10px] text-slate-400">{user.email}</p>
              </div>
              <button onClick={handleLogout} className="p-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-2xl transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email (Tự động nhận diện)</label>
               <input 
                 disabled
                 className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 font-bold"
                 value={user.email || ""}
               />
             </div>
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Số điện thoại <span className="text-red-500">*</span></label>
               <input 
                 required
                 placeholder="VD: 03396xxxxx"
                 className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 outline-none transition-all font-bold"
                 value={regData.phone}
                 onChange={e => setRegData({...regData, phone: e.target.value})}
               />
             </div>
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Ngành hàng / Mô tả Website <span className="text-red-500">*</span></label>
               <input 
                 required
                 placeholder="VD: Bán đồ điện lạnh, quán cà phê, shop thời trang..."
                 className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 outline-none transition-all font-bold"
                 value={regData.industry}
                 onChange={e => setRegData({...regData, industry: e.target.value})}
               />
             </div>
             
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Tên miền mong muốn</label>
               <div className="flex items-center gap-0">
                  <input 
                    placeholder="VD: cuahangabc"
                    className="flex-grow px-6 py-4 bg-white border border-slate-200 rounded-l-2xl border-r-0 focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 outline-none transition-all font-mono"
                    value={regData.domain}
                    onChange={e => setRegData({...regData, domain: e.target.value})}
                  />
                  <select 
                    className="px-4 py-4 bg-slate-50 border border-slate-200 rounded-r-2xl outline-none font-bold text-blue-600 border-l border-slate-200"
                    value={regData.domainExtension}
                    onChange={e => setRegData({...regData, domainExtension: e.target.value})}
                  >
                    <option>.vn</option>
                    <option>.com</option>
                    <option>.net</option>
                    <option>.org</option>
                    <option>.info</option>
                    <option>Khác</option>
                  </select>
               </div>
             </div>

             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Gói dịch vụ lựa chọn</label>
               <select 
                 className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-slate-900"
                 value={regData.package}
                 onChange={e => setRegData({...regData, package: e.target.value})}
               >
                 <option value="1tr">Gói 1.000.000đ — "Web Cơ Bản"</option>
                 <option value="1.5tr">Gói 1.500.000đ — "Web + AI Chat"</option>
                 <option value="3.5tr">Gói 3.500.000đ — "Web + Quản lý bán hàng"</option>
                 <option value="5tr">Gói 5.000.000đ — "Enterprise" (Đang xây dựng)</option>
               </select>
             </div>

             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Danh sách Tab muốn hiển thị</label>
               <input 
                 placeholder="VD: Trang chủ, Sản phẩm, Bảng giá, Liên hệ"
                 className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 outline-none transition-all font-medium"
                 value={regData.tabs}
                 onChange={e => setRegData({...regData, tabs: e.target.value})}
               />
             </div>

             <div className="space-y-4">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Ngôn ngữ Website</label>
               <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setRegData({...regData, language: 'vi-VN'})}
                    className={`px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all ${regData.language === 'vi-VN' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-500 bg-slate-50'}`}
                  >
                    🚀 Tiếng Việt (Gốc)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRegData({...regData, language: 'multi'})}
                    className={`px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all ${regData.language === 'multi' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-500 bg-slate-50'}`}
                  >
                    🌍 Đa ngôn ngữ
                  </button>
               </div>
             </div>

             {regData.language === 'multi' && (
               <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngôn ngữ bổ sung</p>
                  <div className="flex flex-wrap gap-2">
                    {['Tiếng Anh', 'Tiếng Hàn', 'Tiếng Trung', 'Tiếng Nhật'].map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          const current = regData.additionalLanguages;
                          const next = current.includes(lang) ? current.filter(l => l !== lang) : [...current, lang];
                          setRegData({...regData, additionalLanguages: next});
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${regData.additionalLanguages.includes(lang) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200'}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
               </div>
             )}

             <div className="space-y-2 col-span-1 md:col-span-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Phong cách Giao diện</label>
               <div className="grid grid-cols-3 gap-4">
                 {[
                   { id: 'classic', label: 'Cơ bản', desc: 'Thanh lịch' },
                   { id: 'modern', label: 'Hiện đại', desc: 'Cao cấp' },
                   { id: 'brutalist', label: 'Chuyên nghiệp', desc: 'Mạnh mẽ' }
                 ].map(l => (
                   <button
                    key={l.id}
                    type="button"
                    onClick={() => setRegData({...regData, layout: l.id})}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${regData.layout === l.id ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-100' : 'border-slate-100 bg-slate-50'}`}
                   >
                     <p className={`font-black uppercase tracking-wider text-[11px] ${regData.layout === l.id ? 'text-blue-600' : 'text-slate-400'}`}>{l.label}</p>
                     <p className="text-[10px] text-slate-500 font-medium">{l.desc}</p>
                   </button>
                 ))}
               </div>
             </div>

             <div className="space-y-2 col-span-1 md:col-span-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Ghi chú / Yêu cầu đặc biệt</label>
               <textarea 
                 rows={3}
                 placeholder="Màu sắc chủ đạo, logo hiện có, phong cách mong muốn..."
                 className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 outline-none transition-all font-medium"
                 value={regData.note}
                 onChange={e => setRegData({...regData, note: e.target.value})}
               />
             </div>
             
             <button 
               type="submit"
               className="col-span-1 md:col-span-2 py-6 bg-slate-900 text-white rounded-3xl font-black text-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 shadow-blue-200 group"
             >
               <Sparkles className="w-7 h-7 group-hover:rotate-12 transition-transform" />
               XÁC NHẬN ĐĂNG KÝ
             </button>
          </form>

          <p className="text-center text-xs text-slate-400 font-medium">Bằng cách nhấn xác nhận, bạn đồng ý với các điều khoản dịch vụ của YOHU.</p>
        </motion.div>
      </div>
    );
  }

  const navItems = [
    { id: "general", icon: <Settings className="w-4 h-4" />, label: "Cấu hình chung" },
    { id: "branding", icon: <ImageIcon className="w-4 h-4" />, label: "Logo & Thương hiệu" },
  ];

  if (role === UserRole.SUPER_ADMIN) {
    navItems.push(
      { id: "resources", icon: <Database className="w-4 h-4" />, label: "Google IDs" },
      { id: "ai", icon: <Key className="w-4 h-4" />, label: "AI & API" },
    );
  } else {
    // Sub-accounts see their own API keys
    navItems.push(
      { id: "ai_sub", icon: <Key className="w-4 h-4" />, label: "API Keys & Services" },
    );
  }

  navItems.push(
    { id: "content", icon: <FileText className="w-4 h-4" />, label: "Nội dung bài viết" },
  );

  if (role === UserRole.SUPER_ADMIN) {
    navItems.push(
      { id: "reports", icon: <Mic className="w-4 h-4" />, label: "Báo cáo giọng nói" },
    );
  }

  navItems.push(
    { id: "assets", icon: <ImageIcon className="w-4 h-4" />, label: "Hình ảnh & File" },
  );

  if (role === UserRole.SUPER_ADMIN) {
    navItems.push(
      { id: "tenants", icon: <Settings className="w-4 h-4" />, label: "Quản lý Tài khoản" },
    );
  }


  const handleConnectGoogle = async () => {
    setIsConnectingGoogle(true);
    try {
      const { accessToken } = await googleSignIn();
      if (accessToken) {
        setGoogleToken(accessToken);
        alert("Kết nối Google thành công!");
      }
    } catch (err) {
      console.error(err);
      alert("Kết nối Google thất bại!");
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 1.0;
      
      // Try to find a Vietnamese voice explicitly
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => v.lang.startsWith('vi'));
      if (viVoice) {
        utterance.voice = viVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Speech Synthesis not supported");
    }
  };

  const fetchSheetReport = async (range?: string) => {
    try {
      const resp = await fetch("/api/sheets/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sheetId: config.sheet_id, 
          range: range || "Bao_cao_XNT!A1:H20",
          accessToken: googleToken || "service_account"
        }),
      });
      const data = await resp.json();
      if (data.values && data.values.length > 0) {
        setSheetData(data.values);
        
        let speechSummary = "";
        const isXNT = (range || "").includes("Bao_cao_XNT");
        if (isXNT) {
          speechSummary = `Hệ thống đã tải báo cáo tồn kho bách hóa Yohu. Có tổng cộng ${data.values.length - 1} mặt hàng được ghi nhận.`;
          if (data.values.length > 1) {
            speechSummary += ` Gồm các mặt hàng như: ${data.values.slice(1, 4).map((row: any) => row[0] || row[1]).join(", ")}`;
          }
        } else {
          speechSummary = `Đã hiển thị báo cáo đơn hàng chi tiết. Có tổng cộng ${data.values.length - 1} dòng chi tiết đơn hàng.`;
          if (data.values.length > 1) {
            speechSummary += ` Đơn hàng mới nhất của khách hàng ${data.values[1][2] || "Yohu"}`;
          }
        }
        speakText(speechSummary);
      } else {
        const errorMsg = data.error || "Không tìm thấy dữ liệu báo cáo nào.";
        speakText("Không tải được dữ liệu, vui lòng kiểm tra lại kết nối hoặc cài đặt ID bảng tính.");
        alert(errorMsg);
      }
    } catch (err: any) {
      console.error(err);
      speakText("Có lỗi xảy ra khi truy cập báo cáo.");
      alert("Lỗi khi tải dữ liệu từ Google Sheets: " + err.message);
    }
  };

  const startVoiceCommand = () => {
    if (!('webkitSpeechRecognition' in window)) {
      return alert("Trình duyệt không hỗ trợ nhận diện giọng nói!");
    }
    
    // Unlock speech synthesis on mobile by speaking immediately on touch/click gesture
    speakText("Đang lắng nghe...");
    
    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceResult(transcript);
      processVoiceCommand(transcript);
    };
    recognition.start();
  };

  const processVoiceCommand = (text: string) => {
    const cmd = text.toLowerCase();
    if (cmd.includes("báo cáo") || cmd.includes("tồn kho")) {
      speakText("Hệ thống đang truy xuất báo cáo tồn kho. Vui lòng đợi.");
      fetchSheetReport("Bao_cao_XNT!A1:H20");
    } else if (cmd.includes("đơn hàng") || cmd.includes("doanh thu")) {
      speakText("Hệ thống đang tải danh sách đơn hàng chi tiết. Vui lòng đợi.");
      fetchSheetReport("Don_Hang_Chi_Tiet!A1:N50");
    } else {
      speakText(`Chưa nhận rõ lệnh ${text}. Bạn hãy nói xem báo cáo tồn kho hoặc xem báo cáo đơn hàng.`);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (response.ok) {
        alert("Đã lưu cấu hình thành công!");
      } else {
        throw new Error("Lỗi khi lưu!");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu!");
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="min-h-[90vh] bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-100 p-6 flex flex-col gap-2">
        <div className="mb-8 pl-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Dashboard</h3>
          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900">{user?.displayName || "Admin"}</p>
              <p className="text-[10px] text-slate-400 truncate w-32">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? "bg-blue-50 text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <button 
            onClick={handleConnectGoogle}
            disabled={isConnectingGoogle}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
              googleToken 
                ? "bg-green-50 text-green-700 border-green-100" 
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {isConnectingGoogle ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            {googleToken ? "Đã kết nối Google" : "Kết nối Google"}
          </button>
        </div>

        <div className="mt-3">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-grow p-8 max-w-5xl">
        {/* Page Header Banner for Sub-accounts */}
        {role === UserRole.SUB_ACCOUNT && (
          <div className="mb-8 p-6 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="w-32 h-32" />
             </div>
             <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                   <h2 className="text-2xl font-black tracking-tight">👋 Xin chào {user?.displayName || "Admin"}!</h2>
                   <div className="flex flex-wrap items-center gap-3">
                      <span className="px-3 py-1 bg-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-500 shadow-lg shadow-blue-500/20">
                         Gói: {userConfig?.package || "1tr"}
                      </span>
                      <span className="px-3 py-1 bg-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-700">
                         Domain: {userConfig?.domain || "Chưa có"}{userConfig?.domainExtension || ".vn"}
                      </span>
                   </div>
                </div>

                <div className="flex items-center gap-4">
                   <div className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border ${
                     userConfig?.paymentStatus === 'paid' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : userConfig?.paymentStatus === 'trial'
                      ? 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                      : 'bg-red-500/10 text-red-500 border-red-500/20'
                   }`}>
                      {userConfig?.paymentStatus === 'paid' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Tài khoản hoạt động ✓
                        </>
                      ) : userConfig?.paymentStatus === 'trial' ? (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Đang dùng thử
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          Chưa kích hoạt thanh toán
                        </>
                      )}
                   </div>
                   {userConfig?.paymentStatus !== 'paid' && (
                     <a href="tel:0973480488" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/30">
                        Nâng cấp ngay
                     </a>
                   )}
                </div>
             </div>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              {activeTab === "general" && "Cấu hình công ty"}
              {activeTab === "resources" && "Tài nguyên Google"}
              {activeTab === "ai" && "Trình cấu hình AI"}
              {activeTab === "content" && "Quản lý nội dung bài viết"}
              {activeTab === "reports" && "Trung tâm Báo cáo"}
              {activeTab === "assets" && "Kho tư liệu"}
              {activeTab === "tenants" && "Quản lý Tài khoản & Phân quyền"}
            </h2>
            <div className="flex items-center gap-4">
              {role === UserRole.SUB_ACCOUNT && (
                <button 
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all text-sm"
                >
                  <Globe className="w-4 h-4" />
                  {isDeploying ? "Đang tiến hành..." : "Tạo & Xuất Web"}
                </button>
              )}
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chế độ sửa nhanh PC/Web</span>
                <button 
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${isEditMode ? "bg-green-500" : "bg-slate-300"}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isEditMode ? "translate-x-6" : "translate-x-0"}`} />
                </button>
              </div>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all text-sm"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>

          <div className="p-8">
            {activeTab === "general" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Tên công ty</label>
                  <input className="input-admin" value={config.company_name} onChange={e => setConfig({...config, company_name: e.target.value})} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Địa chỉ</label>
                  <input className="input-admin" value={config.address} onChange={e => setConfig({...config, address: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Hotline</label>
                  <input className="input-admin" value={config.hotline} onChange={e => setConfig({...config, hotline: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Zalo</label>
                  <input className="input-admin" value={config.zalo} onChange={e => setConfig({...config, zalo: e.target.value})} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">URL Ảnh bìa (Hero Image)</label>
                  <input className="input-admin" value={config.hero_image || ""} onChange={e => setConfig({...config, hero_image: e.target.value})} placeholder="https://..." />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">URL File Báo giá (PDF/Link)</label>
                  <input className="input-admin" value={config.price_list_url || ""} onChange={e => setConfig({...config, price_list_url: e.target.value})} placeholder="https://drive.google.com/..." />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">URL File Catalogue (PDF/Link)</label>
                  <input className="input-admin" value={config.catalogue_url || ""} onChange={e => setConfig({...config, catalogue_url: e.target.value})} placeholder="https://drive.google.com/..." />
                </div>

                {/* Banking Information */}
                <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Thông tin tài khoản thanh toán</h4>
                  <p className="text-xs text-slate-400">Hiển thị trong hóa đơn và thông tin thanh toán chuyển khoản của khách hàng.</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Tên ngân hàng</label>
                  <input className="input-admin" value={config.bank_name || ""} onChange={e => setConfig({...config, bank_name: e.target.value})} placeholder="Ngân hàng Quân đội - MB Bank" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Số tài khoản</label>
                  <input className="input-admin" value={config.bank_account_number || ""} onChange={e => setConfig({...config, bank_account_number: e.target.value})} placeholder="0339606969" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Tên người thụ hưởng (Chủ tài khoản)</label>
                  <input className="input-admin" value={config.bank_account_name || ""} onChange={e => setConfig({...config, bank_account_name: e.target.value})} placeholder="Phạm Văn Khải" />
                </div>
              </div>
            )}

            {activeTab === "branding" && (
              <div className="space-y-8">
                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4 items-center">
                   <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                      <ImageIcon className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="font-bold text-blue-900">Quản lý nhận diện thương hiệu</h3>
                      <p className="text-xs text-blue-600/70">Thay đổi logo và các yếu tố hình ảnh chính của website</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Logo Đầu trang (Navbar)</label>
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl aspect-video flex items-center justify-center overflow-hidden">
                         <img src={(customData as any).site_logo || "https://firebasestorage.googleapis.com/v0/b/ai-studio-assets.appspot.com/o/yohu_logo_placeholder.png?alt=media"} className="max-h-full object-contain" alt="Preview Logo" />
                      </div>
                      <p className="text-[10px] text-slate-400 italic">Mẹo: Bạn có thể bật "Chế độ sửa nhanh" ở trên và click trực tiếp vào logo ở đầu trang để thay đổi.</p>
                   </div>

                   <div className="space-y-4">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Logo Chân trang (Footer)</label>
                      <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl aspect-video flex items-center justify-center overflow-hidden">
                         <img src={(customData as any).footer_logo || "https://firebasestorage.googleapis.com/v0/b/ai-studio-assets.appspot.com/o/yohu_logo_placeholder.png?alt=media"} className="max-h-full object-contain" alt="Preview Logo Footer" />
                      </div>
                   </div>
                </div>

                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 space-y-4">
                   <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                     <Settings className="w-4 h-4" />
                     Hướng dẫn thay đổi Logo
                   </h4>
                   <ol className="text-xs text-amber-800 space-y-2 list-decimal pl-4">
                     <li>Bật nút <b>"Chế độ sửa nhanh PC/Web"</b> ở góc trên bên phải màn hình.</li>
                     <li>Di chuyển về trang chủ hoặc bất kỳ trang nào có logo bạn muốn đổi.</li>
                     <li>Nhấp chuột trái vào hình ảnh logo đó.</li>
                     <li>Dán link ảnh logo mới của bạn vào ô hiện ra và nhấn <b>OK</b>.</li>
                   </ol>
                </div>
              </div>
            )}

            {activeTab === "resources" && (
              <div className="grid grid-cols-1 gap-6">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 text-amber-700 text-xs shadow-sm">
                  <Database className="w-5 h-5 flex-shrink-0" />
                  <p>Các ID này dùng để liên kết dữ liệu từ Google Sheets và Drive. Vui lòng kiểm tra kỹ trước khi thay đổi.</p>
                </div>
                {[
                  { label: "ID Google Sheet chính", key: "sheet_id" },
                  { label: "ID Google Form đơn hàng", key: "form_id" },
                  { label: "ID Folder chính GG Sheet", key: "folder_main_id" },
                  { label: "ID Báo cáo KQKD", key: "kqkd_report_id" },
                  { label: "ID Báo cáo XNT Năm 2025", key: "xnt_report_id" },
                  { label: "ID Hóa đơn bán hàng PDF", key: "invoice_pdf_id" },
                  { label: "ID các file mẫu", key: "sample_files_id" },
                ].map((item) => (
                  <div key={item.key} className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">{item.label}</label>
                    <input 
                      className="input-admin font-mono text-xs" 
                      value={(config as any)[item.key] || ""} 
                      onChange={e => setConfig({...config, [item.key]: e.target.value})} 
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === "ai" && (
              <div className="space-y-6">
                <div className="p-6 bg-slate-900 rounded-2xl text-white space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold">Gemini API Key hoặc Danh sách API Key</h3>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Xoay vòng tự động khi hết quota</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Dán khóa API của bạn vào đây. Hệ thống hỗ trợ dán <b>nhiều API key phân tách bằng dấu phẩy</b> (ví dụ: <code className="bg-slate-800 text-yellow-400 px-1 py-0.5 rounded font-mono text-[11px]">key1,key2,key3</code>). Khi một key hết hạn mức (quota exceeded), hệ thống sẽ tự động thử các key tiếp theo trong danh sách.
                  </p>
                  <input 
                    type="password" 
                    className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none font-mono tracking-widest text-slate-200" 
                    value={config.gemini_api_key || ""} 
                    onChange={e => setConfig({...config, gemini_api_key: e.target.value})}
                    placeholder="Dán một khóa hoặc nhiều khóa phân cách bằng dấu phẩy..."
                  />
                  <p className="text-[10px] text-slate-400 italic">
                    * Lưu ý: Admin có thể thiết lập thêm biến môi trường <code className="bg-slate-800 text-slate-300 px-1 py-0.5 rounded font-mono">GEMINI_API_KEYS</code> để làm nguồn dự phòng hệ thống.
                  </p>
                </div>

                {/* Model AI Selector */}
                <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/10 to-orange-500/10 flex items-center justify-center text-amber-600 border border-amber-100">
                      <Cpu className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Lựa chọn Mô hình AI (Model)</h3>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-mono">Chọn mô hình miễn phí hoặc trả phí</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Tùy theo loại tài khoản API của bạn, chọn mô hình AI thích hợp để chatbot hoạt động mượt mà nhất.
                  </p>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Mô hình hoạt động</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800 font-bold"
                      value={config.gemini_model || "gemini-2.5-flash"}
                      onChange={e => setConfig({...config, gemini_model: e.target.value})}
                    >
                      <optgroup label="Mô hình MIỄN PHÍ - Đề xuất và khuyên dùng">
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash (Đề xuất cao nhất, cực nhanh, thông minh)</option>
                        <option value="gemini-3.5-flash">Gemini 3.5 Flash (Yêu cầu API key hiện đại hơn, miễn phí)</option>
                        <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Siêu nhẹ, tốc độ tối ưu)</option>
                        <option value="gemini-1.5-flash-latest">Gemini 1.5 Flash (Bản cũ kế thừa)</option>
                      </optgroup>
                      <optgroup label="Mô hình NÂNG CAO - Yêu cầu API Key trả phí (Paid Tier)">
                        <option value="gemini-2.5-pro">Gemini 2.5 Pro (Lý luận siêu đỉnh, lập luận phức tạp)</option>
                        <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview (Mô hình Pro thế hệ mới)</option>
                        <option value="gemini-1.5-pro-latest">Gemini 1.5 Pro (Kế thừa của dòng cao cấp)</option>
                      </optgroup>
                    </select>
                  </div>
                  
                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100 flex gap-3 text-[11px] text-amber-800">
                    <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Mẹo hay tránh lỗi 429 (Hết lượt gọi miễn phí):</p>
                      <p className="mt-1 leading-relaxed">
                        Bạn có thể tạo và sử dụng 2 - 3 API key miễn phí từ Google AI Studio, dán hết vào ô bên trên dạng danh sách, ngăn cách nhau bằng dấu phẩy. Chatbot sẽ tự động chuyển sang key tiếp theo khi một trong số các key bị chạm giới hạn cuộc gọi!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 border border-purple-100">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Kiến thức của Bot AI</h3>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Bot Knowledge Base</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                    Dán nội dung bảng giá, catalogue hoặc bất kỳ thông tin nào bạn muốn Bot ghi nhớ và trả lời khách hàng.
                  </p>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20 outline-none transition-all min-h-[300px] font-sans leading-relaxed text-slate-700" 
                    value={config.bot_knowledge || ""} 
                    onChange={e => setConfig({...config, bot_knowledge: e.target.value})}
                    placeholder="Ví dụ: Bảng giá bồn nước Yohu 2025: Bồn nhựa 1000L - 2.500.000đ, Bồn Inox 1000L - 4.500.000đ..."
                  />
                </div>
              </div>
            )}

            {activeTab === "content" && (
              <div className="space-y-8">
                <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] text-white shadow-xl shadow-blue-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <FileText className="w-32 h-32 rotate-12" />
                    </div>
                    <div className="relative z-10 space-y-2">
                        <h3 className="text-2xl font-black uppercase tracking-tight">Quản lý nội dung bài viết</h3>
                        <p className="text-blue-100/80 text-sm max-w-md uppercase tracking-widest text-[10px] font-bold">Cập nhật nội dung Blog, Tin tức & Hướng dẫn kỹ thuật</p>
                    </div>
                </div>

                {/* Professional Markdown Guide - Matched to Image */}
                <div className="p-8 bg-slate-900 rounded-[2rem] text-white shadow-2xl relative border border-slate-800">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                    <h4 className="text-xl font-black tracking-tight">Hướng dẫn viết bài (Markdown)</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm text-slate-300">
                    <div className="space-y-3">
                      <p className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg">
                        <span className="font-bold text-white">Tiêu đề:</span> 
                        <span className="font-mono text-xs opacity-70"># Tiêu đề 1, ## Tiêu đề 2</span>
                      </p>
                      <p className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg">
                        <span className="font-bold text-white">Video:</span> 
                        <span className="font-mono text-xs opacity-70">[Chèn Link Video] - Dán trực tiếp</span>
                      </p>
                      <p className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg">
                        <span className="font-bold text-white">Ảnh:</span> 
                        <span className="font-mono text-xs opacity-70">![Mô tả](Link ảnh)</span>
                      </p>
                    </div>
                    <div className="space-y-3">
                      <p className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg">
                        <span className="font-bold text-white">In đậm:</span> 
                        <span className="font-mono text-xs opacity-70">**Nội dung cần đậm**</span>
                      </p>
                      <p className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg">
                        <span className="font-bold text-white">Danh sách:</span> 
                        <span className="font-mono text-xs opacity-70">- Mục 1, - Mục 2</span>
                      </p>
                      <p className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg">
                        <span className="font-bold text-white">Link:</span> 
                        <span className="font-mono text-xs opacity-70">[Tên](Địa chỉ link)</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Link Ảnh nền bài viết</label>
                      <div className="flex gap-2">
                        <input className="input-admin flex-grow" value={config.article_image_url || ""} onChange={e => setConfig({...config, article_image_url: e.target.value})} placeholder="https://..." />
                        <button className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200"><ImageIcon className="w-5 h-5 text-slate-600" /></button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Link Youtube Video</label>
                      <input className="input-admin" value={config.article_video_url || ""} onChange={e => setConfig({...config, article_video_url: e.target.value})} placeholder="https://youtube.com/watch?v=..." />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Nội dung bài viết chi tiết</label>
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-bold">Auto-save Enabled</span>
                    </div>
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-6 text-sm focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20 outline-none transition-all min-h-[400px] font-sans leading-relaxed text-slate-700" 
                      value={config.home_content || ""} 
                      onChange={e => setConfig({...config, home_content: e.target.value})}
                      placeholder="Sử dụng Markdown để viết bài chuyên nghiệp..."
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reports" && (
              <div className="space-y-8">
                <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 border-2 border-dashed border-slate-100 rounded-3xl">
                  <motion.div 
                    animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-colors ${isListening ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
                  >
                    <Mic className="w-10 h-10" />
                  </motion.div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900">{isListening ? "Đang lắng nghe..." : "Báo cáo giọng nói"}</h3>
                    <p className="text-slate-500 text-sm max-w-sm">Hé, bạn có thể nói: "Xem báo cáo tồn kho" hoặc "Xem báo cáo đơn hàng".</p>
                  </div>
                  <button 
                    disabled={isListening}
                    onClick={startVoiceCommand}
                    className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                    Nhấn để nói
                  </button>
                  {voiceResult && (
                    <div className="bg-slate-50 px-4 py-2 rounded-lg text-xs font-medium text-slate-500">
                      Đã nhận: "{voiceResult}"
                    </div>
                  )}
                </div>

                {sheetData && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Dữ liệu từ Google Sheet</h4>
                      <button onClick={() => setSheetData(null)} className="text-xs text-slate-400 hover:text-red-500 underline">Xóa</button>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50">
                          <tr>
                            {sheetData[0].map((cell, i) => (
                              <th key={i} className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">{cell}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sheetData.slice(1).map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                              {row.map((cell, j) => (
                                <td key={j} className="px-4 py-3 text-xs text-slate-600 border-b border-slate-50">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === "assets" && (
                <div className="space-y-8">
                    {/* Hidden Native File Input */}
                    <input 
                      type="file" 
                      id="dashboard-file-upload-input"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept="image/*,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label 
                          htmlFor="dashboard-file-upload-input"
                          className="group p-8 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer text-center w-full bg-white block"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-colors mx-auto">
                              {isUploading ? <Loader2 className="w-8 h-8 animate-spin text-blue-500" /> : <ImageIcon className="w-8 h-8" />}
                            </div>
                            <div>
                              <span className="block text-xs font-black text-slate-400 group-hover:text-blue-600 uppercase tracking-widest mb-1">
                                {isUploading ? "Đang tải tệp..." : "Tải ảnh sản phẩm / logo"}
                              </span>
                              <p className="text-[10px] text-slate-400">JPG, PNG, WEBP tối đa 5MB</p>
                            </div>
                        </label>
                        <label 
                          htmlFor="dashboard-file-upload-input"
                          className="group p-8 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer text-center w-full bg-white block"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-colors mx-auto">
                              {isUploading ? <Loader2 className="w-8 h-8 animate-spin text-blue-500" /> : <FileText className="w-8 h-8" />}
                            </div>
                            <div>
                              <span className="block text-xs font-black text-slate-400 group-hover:text-blue-600 uppercase tracking-widest mb-1">
                                {isUploading ? "Đang tải tệp..." : "Tải báo giá / Catalogue PDF"}
                              </span>
                              <p className="text-[10px] text-slate-400">File tài liệu PDF hoặc Excel</p>
                            </div>
                        </label>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Thư viện đã tải ({uploadedAssets.length})</h4>
                        <button onClick={fetchAssets} className="text-xs text-blue-600 hover:underline">Làm mới danh sách</button>
                      </div>

                      {uploadedAssets.length === 0 ? (
                        <div className="p-12 text-center rounded-3xl border border-slate-100 bg-slate-50/50 text-slate-400 text-sm">
                          Chưa có tài liệu hay hình ảnh nào được tải lên.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {uploadedAssets.map((asset, i) => {
                            const isImage = asset.type === "image";
                            return (
                              <div key={i} className="group relative rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all">
                                <div className="aspect-square w-full flex items-center justify-center overflow-hidden border-b border-slate-100 relative bg-slate-100">
                                  {isImage ? (
                                    <img src={asset.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                                      <FileText className="w-12 h-12 text-blue-500" />
                                      <span className="text-[10px] font-black uppercase text-blue-600 font-mono tracking-widest bg-blue-50 px-2 py-0.5 rounded">PDF / DOC</span>
                                    </div>
                                  )}
                                  
                                  {/* Overlay hover actions */}
                                  <div className="absolute inset-0 bg-slate-950/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button 
                                      onClick={() => {
                                        navigator.clipboard.writeText(window.location.origin + asset.url);
                                        alert("Đã sao chép đường dẫn tệp vào bộ nhớ tạm!");
                                      }}
                                      className="p-2 bg-white text-slate-800 rounded-lg shadow hover:bg-slate-50 transition-colors text-xs font-bold"
                                      title="Sao chép đường dẫn"
                                    >
                                      Sao chép Link
                                    </button>
                                    <button 
                                      onClick={() => handleFileDelete(asset.name)}
                                      className="p-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-colors"
                                      title="Xóa tệp"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                <div className="p-3 bg-white flex flex-col justify-between flex-grow">
                                  <p className="text-xs font-bold text-slate-700 truncate" title={asset.name}>
                                    {asset.name.substring(asset.name.indexOf('-') + 1) || asset.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                                    {(asset.size / (1024 * 1024)).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                </div>
            )}

            {activeTab === "ai_sub" && (
              <div className="space-y-6">
                <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Key className="w-32 h-32" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Cấu hình Website & API</h3>
                    <p className="text-slate-400 text-sm max-w-md">Cung cấp thông tin để liên kết Website thực tế với tài khoản của bạn.</p>
                  </div>
                  
                  <div className="space-y-6 pt-4">
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Link Website liên kết</label>
                         <Globe className="w-4 h-4 text-blue-400" />
                       </div>
                       <input 
                         className="w-full bg-slate-800 border-slate-700 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none text-blue-100 font-bold" 
                         value={config.company_name ? `https://${config.company_name.toLowerCase().replace(/\s+/g, '-')}.yohu.vn` : ""}
                         readOnly
                         placeholder="Tự động tạo khi được phê duyệt..."
                       />
                       <p className="text-[10px] text-slate-500 italic pl-1">Đây là địa chỉ truy cập Website của bạn sau khi Admin phê duyệt.</p>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">ImageKit Private Key (Dùng cho upload ảnh)</label>
                         <img src="https://imagekit.io/static/img/new-logo.svg" className="h-4 brightness-0 invert" alt="ImageKit" />
                       </div>
                       <input 
                         type="password"
                         className="w-full bg-slate-800 border-slate-700 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none font-mono tracking-widest text-blue-400" 
                         value={config.gemini_api_key || ""} 
                         onChange={e => setConfig({...config, gemini_api_key: e.target.value})}
                         placeholder="private_L7hv2..."
                       />
                    </div>

                    <div className="p-6 bg-blue-600/10 rounded-3xl border border-blue-500/20 space-y-4">
                       <h4 className="text-sm font-bold flex items-center gap-2 text-blue-400">
                         <Sparkles className="w-4 h-4" />
                         Hướng dẫn liên kết thực
                       </h4>
                       <p className="text-[11px] text-slate-400 leading-relaxed">
                         Dán <b>Private Key</b> từ tài khoản ImageKit của bạn vào ô trên để tự động hóa việc lưu trữ ảnh. Website của bạn sẽ được lưu trữ độc lập trên tài khoản này, đảm bảo bạn toàn quyền sở hữu dữ liệu hình ảnh.
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "tenants" && (
              <div className="space-y-8">
                <div className="bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100/50 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-blue-900 uppercase tracking-tighter">Cấu hình & Cấp quyền nhanh</h3>
                    <p className="text-xs text-blue-700/70 font-medium">Nhập email để cấp quyền trực tiếp cho Website phụ mà không cần user đăng ký trước.</p>
                  </div>
                  <div className="flex gap-4">
                    <input 
                      placeholder="Nhập email nhân viên / chi nhánh..."
                      className="flex-grow px-8 py-5 bg-white border border-blue-100 rounded-3xl focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-bold text-slate-800 shadow-sm"
                      value={newSubAccount}
                      onChange={e => setNewSubAccount(e.target.value)}
                    />
                    <button 
                      onClick={handleAddSubAccount}
                      className="px-10 py-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200"
                    >
                      Cấp quyền
                    </button>
                  </div>
                </div>

                <div className="pt-6">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1 mb-6">Danh sách tài khoản & Yêu cầu đăng ký</h4>
                  <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/80 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] border-b border-slate-100">
                          <th className="px-8 py-6">Tài khoản / Email</th>
                          <th className="px-8 py-6">Liên hệ / Domain</th>
                          <th className="px-8 py-6">Gói / Thanh toán</th>
                          <th className="px-8 py-6 text-center">Trạng thái</th>
                          <th className="px-8 py-6 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {/* SUPER_ADMIN Row */}
                        <tr className="bg-slate-50/30">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black shadow-lg shadow-red-200">YA</div>
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-900 tracking-tight">yohu.vn@gmail.com</span>
                                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">HỆ THỐNG CHÍNH</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-[10px] text-slate-300 font-bold uppercase tracking-widest italic font-mono">- Root Admin -</td>
                          <td className="px-8 py-6 text-slate-300">-</td>
                          <td className="px-8 py-6 text-center">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">System Live</span>
                          </td>
                          <td className="px-8 py-6 text-right text-slate-200">-</td>
                        </tr>

                        {subAccounts.filter(acc => acc.id !== "yohu.vn@gmail.com").map(acc => (
                           <tr key={acc.id} className="group/row hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-sm uppercase group-hover/row:bg-blue-600 group-hover/row:text-white transition-all">
                                  {acc.id[0]}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-slate-800">{acc.id}</span>
                                  <span className="text-[11px] font-medium text-slate-500 tracking-tight">{acc.displayName || "N/A"}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex flex-col gap-1">
                                 <span className="text-[11px] font-black text-slate-700">{acc.phone || "CHƯA CÓ SĐT"}</span>
                                 <span className="text-[10px] text-blue-600 font-bold font-mono py-0.5 px-2 bg-blue-50 rounded-md w-fit border border-blue-100">
                                   {acc.domain || "no-domain"}{acc.domainExtension || ".vn"}
                                 </span>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col gap-2">
                                <span className="text-[10px] bg-slate-900 text-slate-300 px-2.5 py-1 rounded-md w-fit font-black uppercase tracking-wider shadow-sm border border-slate-700">Gói {acc.package || "1tr"}</span>
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border w-fit shadow-sm ${
                                  acc.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                  acc.paymentStatus === 'trial' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                  'bg-red-50 text-red-600 border-red-200'
                                }`}>
                                  {acc.paymentStatus === 'paid' ? 'Đã thanh toán' : acc.paymentStatus === 'trial' ? 'Dùng thử' : 'Chưa thanh toán'}
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${acc.isActive !== false ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-amber-100 text-amber-600 border-amber-200 shadow-lg shadow-amber-200/20'}`}>
                                {acc.isActive !== false ? 'ĐÃ PHÊ DUYỆT' : 'CHỜ DUYỆT'}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2 translate-x-2">
                                <button 
                                  onClick={() => setSelectedTenant(acc)}
                                  className="p-3.5 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-600 hover:shadow-xl hover:shadow-blue-200 rounded-2xl transition-all"
                                  title="Chi tiết cấu hình"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => handleToggleSubAccount(acc.id, acc.isActive !== false)}
                                  className={`p-3.5 rounded-2xl transition-all border ${acc.isActive !== false ? 'text-orange-500 bg-orange-50 border-orange-100 hover:bg-orange-100' : 'text-emerald-500 bg-emerald-50 border-emerald-100 hover:bg-emerald-100 shadow-xl shadow-emerald-100 ring-4 ring-emerald-50'}`}
                                  title={acc.isActive !== false ? "Khóa tài khoản" : "PHÊ DUYỆT CẤP QUYỀN"}
                                >
                                  {acc.isActive !== false ? <LogOut className="w-5 h-5 rotate-180" /> : <Sparkles className="w-5 h-5" />}
                                </button>
                                <button 
                                  onClick={() => handleDeleteSubAccount(acc.id)}
                                  className="text-red-500 p-3.5 hover:bg-red-50 rounded-2xl border border-transparent hover:border-red-100 transition-all opacity-40 hover:opacity-100"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tenant Detail Drawer */}
                {selectedTenant && (
                  <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedTenant(null)} />
                    <motion.div 
                      initial={{ x: "100%" }}
                      animate={{ x: 0 }}
                      className="bg-white w-full max-w-xl h-full shadow-2xl p-10 flex flex-col relative z-50"
                    >
                       <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
                          <div className="space-y-1">
                            <h3 className="text-2xl font-black text-slate-900 uppercase">Chi tiết Tài khoản</h3>
                            <p className="text-slate-400 text-sm font-medium">{selectedTenant.id}</p>
                          </div>
                          <button onClick={() => setSelectedTenant(null)} className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl transition-all">
                             <ChevronRight className="w-6 h-6" />
                          </button>
                       </div>

                       <div className="flex-grow overflow-y-auto pr-4 space-y-10 custom-scrollbar">
                          {/* Profile Section */}
                          <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                             <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngành nghề</p>
                                <p className="text-sm font-bold text-slate-800">{selectedTenant.industry || "Chưa cập nhật"}</p>
                             </div>
                             <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Số điện thoại</p>
                                <p className="text-sm font-bold text-slate-800">{selectedTenant.phone || "Chưa cập nhật"}</p>
                             </div>
                             <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gói đăng ký</p>
                                <p className="text-sm font-bold text-slate-800">Gói {selectedTenant.package || "1tr"}</p>
                             </div>
                             <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đăng ký ngày</p>
                                <p className="text-[11px] font-medium text-slate-500">
                                   {selectedTenant.requestDate?.toDate().toLocaleString('vi-VN') || "N/A"}
                                </p>
                             </div>
                          </div>

                          {/* Technical Config Form */}
                          <div className="space-y-6">
                             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1 mb-4">Cấu hình kỹ thuật (Dành cho Admin)</h4>
                             
                             <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">URL Website được cấp (Site URL)</label>
                                <input 
                                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 outline-none font-bold text-blue-600"
                                  placeholder="VD: cuahangabc.yohu.vn"
                                  value={selectedTenant.siteUrl || ""}
                                  onChange={e => setSelectedTenant({...selectedTenant, siteUrl: e.target.value})}
                                />
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">ImageKit Private Key</label>
                                  <input 
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 outline-none font-mono text-xs"
                                    value={selectedTenant.imagekitPrivateKey || ""}
                                    onChange={e => setSelectedTenant({...selectedTenant, imagekitPrivateKey: e.target.value})}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">ImageKit Public Key</label>
                                  <input 
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 outline-none font-mono text-xs"
                                    value={selectedTenant.imagekitPublicKey || ""}
                                    onChange={e => setSelectedTenant({...selectedTenant, imagekitPublicKey: e.target.value})}
                                  />
                                </div>
                             </div>

                             <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">ImageKit URL Endpoint</label>
                                <input 
                                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 outline-none font-mono text-xs"
                                  value={selectedTenant.imagekitUrlEndpoint || ""}
                                  onChange={e => setSelectedTenant({...selectedTenant, imagekitUrlEndpoint: e.target.value})}
                                />
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">Trạng thái thanh toán</label>
                                  <select 
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                                    value={selectedTenant.paymentStatus || "unpaid"}
                                    onChange={e => setSelectedTenant({...selectedTenant, paymentStatus: e.target.value})}
                                  >
                                    <option value="unpaid">Chưa thanh toán</option>
                                    <option value="trial">Dùng thử</option>
                                    <option value="paid">Đã thanh toán</option>
                                  </select>
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">Hạn thanh toán (Năm 1)</label>
                                  <input 
                                    type="date"
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                                    value={selectedTenant.paymentStartDate || ""}
                                    onChange={e => setSelectedTenant({...selectedTenant, paymentStartDate: e.target.value})}
                                  />
                               </div>
                             </div>

                             <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">Ghi chú quản trị</label>
                                <textarea 
                                  rows={2}
                                  className="w-full px-6 py-4 bg-slate-100 border border-slate-200 rounded-2xl outline-none font-medium text-slate-600 italic"
                                  value={selectedTenant.paymentNote || ""}
                                  onChange={e => setSelectedTenant({...selectedTenant, paymentNote: e.target.value})}
                                />
                             </div>
                          </div>
                       </div>

                       <div className="pt-8 border-t border-slate-100">
                          <button 
                            disabled={isSavingTenant}
                            onClick={async () => {
                              setIsSavingTenant(true);
                              try {
                                const { doc, updateDoc } = await import("firebase/firestore");
                                const { db } = await import("../lib/firebase");
                                const { id, ...saveData } = selectedTenant;
                                await updateDoc(doc(db, "authorized_emails", id), saveData);
                                alert("Đã lưu cấu hình tài khoản thành công!");
                                setSelectedTenant(null);
                                fetchSubAccounts();
                              } catch (e) {
                                alert("Lỗi khi lưu cấu hình!");
                              } finally {
                                setIsSavingTenant(false);
                              }
                            }}
                            className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-lg hover:bg-blue-600 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3"
                          >
                            {isSavingTenant ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                            Lưu cấu hình hệ thống
                          </button>
                       </div>
                    </motion.div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .input-admin {
          width: 100%;
          padding: 0.875rem 1rem;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          font-size: 0.875rem;
          color: #1e293b;
          outline: none;
          transition: all 0.2s;
        }
        .input-admin:focus {
          background-color: white;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05);
        }
      `}</style>
    </div>
  );
}
