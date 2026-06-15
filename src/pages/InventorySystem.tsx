import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, 
  Settings, 
  FileSpreadsheet, 
  Bot, 
  BarChart3, 
  CheckCircle2, 
  Play, 
  Phone, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  X,
  Volume2,
  Folder,
  ClipboardList,
  Cloud,
  Database,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  FolderOpen,
  Video,
  Youtube,
  Download,
  BookOpen
} from "lucide-react";
import { SiteConfig, DEFAULT_PRODUCT_CATEGORIES } from "../types";
import { useAdmin } from "../lib/AdminContext";

// Helper to sum a column in a 2D sheet array based on headers
function sumSheetColumn(rows: any[][], colKeywords: string[]): number | null {
  if (!rows || rows.length < 2) return null;
  const headers = rows[0].map((h: any) => String(h || "").toLowerCase().trim());
  let targetColIdx = -1;
  for (const keyword of colKeywords) {
    targetColIdx = headers.findIndex((h: string) => h.includes(keyword));
    if (targetColIdx !== -1) break;
  }
  if (targetColIdx === -1) {
    targetColIdx = headers.findIndex((h: string) => h === "thành tiền" || h === "giá trị" || h === "tổng" || h === "tổng tiền" || h === "số tiền");
  }
  if (targetColIdx === -1) return null;
  
  let sum = 0;
  for (let i = 1; i < rows.length; i++) {
    const valStr = String(rows[i][targetColIdx] || "").replace(/[^0-9.-]/g, "");
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      sum += val;
    }
  }
  return sum;
}

// Helper to look up a stock cell in a 2D sheet array
function findStockValue(rows: any[][], itemKeywords: string[], colKeywords: string[]): number | null {
  if (!rows || rows.length < 2) return null;
  const headers = rows[0].map((h: any) => String(h || "").toLowerCase().trim());
  let valColIdx = -1;
  for (const keyword of colKeywords) {
    valColIdx = headers.findIndex((h: string) => h.includes(keyword));
    if (valColIdx !== -1) break;
  }
  if (valColIdx === -1) {
    valColIdx = headers.findIndex((h: string) => h.includes("tồn") || h.includes("cuối") || h.includes("sl") || h.includes("kho") || h.includes("kết quả"));
  }
  if (valColIdx === -1) valColIdx = 2; // fallback
  
  for (let i = 1; i < rows.length; i++) {
    const rowStr = rows[i].map((c: any) => String(c || "").toLowerCase()).join(" | ");
    const matchesAll = itemKeywords.every((k: string) => rowStr.includes(k));
    if (matchesAll) {
      const valStr = String(rows[i][valColIdx] || "").replace(/[^0-9.-]/g, "");
      const val = parseFloat(valStr);
      if (!isNaN(val)) return val;
    }
  }
  return null;
}

interface YohuProduct {
  code: string;
  name: string;
  unit: string;
  stockIn: number;
  sold: number;
  stockOut: number;
  priceSell: number;
  valSell: number;
  valStock: number;
  profit: number;
}

// Function to parse the detailed products on yohu sheet
function parseYohuProducts(values: any[][]): YohuProduct[] {
  if (!values || values.length < 6) return [];
  // Find where the headers are located
  const headerRowIdx = values.findIndex(row => 
    row.some((cell: any) => String(cell || "").toLowerCase().includes("mã hàng") || String(cell || "").toLowerCase().includes("ma hang"))
  );
  if (headerRowIdx === -1) return [];

  const headers = values[headerRowIdx].map((h: any) => String(h || "").toLowerCase().trim());
  const codeIdx = headers.findIndex((h: string) => h.includes("mã") || h.includes("ma"));
  const nameIdx = headers.findIndex((h: string) => h.includes("tên") || h.includes("ten"));
  const unitIdx = headers.findIndex((h: string) => h.includes("vị") || h.includes("vi"));
  const stockInIdx = headers.findIndex((h: string) => h.includes("đầu kỳ") || h.includes("dau ky"));
  const soldIdx = headers.findIndex((h: string) => h.includes("xuất bán") || h.includes("xuat ban"));
  const stockOutIdx = headers.findIndex((h: string) => h.includes("tồn cuối") || h.includes("ton cuoi") || h.includes("thực tồn"));
  const priceSellIdx = headers.findIndex((h: string) => h === "giá bán" || h === "gia ban" || h.includes("giá bán"));
  const valSellIdx = headers.findIndex((h: string) => h.includes("giá trị bán") || h.includes("gia tri ban") || h.includes("thành tiền bán"));
  const valStockIdx = headers.findIndex((h: string) => h.includes("tồn cuối trị giá") || h.includes("trị giá tồn"));
  const profitIdx = headers.findIndex((h: string) => h.includes("lãi/lỗ") || h.includes("lợi nhuận") || h.includes("lai/lo") || h.includes("ước tính"));

  const products: YohuProduct[] = [];
  
  for (let i = headerRowIdx + 1; i < values.length; i++) {
    const row = values[i];
    if (!row || row.length === 0) continue;
    
    // Skip row if it does not have a code or is total row
    const firstCell = String(row[0] || "").toLowerCase().trim();
    if (firstCell.includes("tổng") || firstCell === "tong" || !row[nameIdx]) continue;

    const parseNum = (val: any) => {
      const clean = String(val || "").replace(/[^0-9.-]/g, "");
      const res = parseFloat(clean);
      return isNaN(res) ? 0 : res;
    };

    products.push({
      code: String(row[codeIdx] || "").trim(),
      name: String(row[nameIdx] || "").trim(),
      unit: String(row[unitIdx] || "Cái").trim(),
      stockIn: parseNum(row[stockInIdx]),
      sold: parseNum(row[soldIdx]),
      stockOut: parseNum(row[stockOutIdx]),
      priceSell: parseNum(row[priceSellIdx]),
      valSell: parseNum(row[valSellIdx]),
      valStock: parseNum(row[valStockIdx]),
      profit: parseNum(row[profitIdx]),
    });
  }
  return products;
}

export interface VoiceCommandRow {
  command: string;      // Câu lệnh giọng nói
  type: string;         // Loại báo cáo
  revenue: string;      // Doanh thu
  profit: string;       // Lợi nhuận
  voiceReport: string;  // Báo cáo giọng nói
}

export const DEFAULT_VOICE_COMMANDS: VoiceCommandRow[] = [
  {
    command: "Báo Cáo Kết quả kinh doanh ngày hôm nay",
    type: "Kết quả Kinh doanh ngày",
    revenue: "0",
    profit: "0",
    voiceReport: "Doanh thu ngày hôm nay là 0 đồng, lợi nhuận là 0 đồng"
  },
  {
    command: "Báo Cáo Kết quả kinh doanh tháng này",
    type: "Kết quả Kinh doanh tháng",
    revenue: "0",
    profit: "0",
    voiceReport: "Doanh thu tháng này là 0 đồng, lợi nhuận là 0 đồng"
  },
  {
    command: "Báo Cáo Kết quả kinh doanh quý này",
    type: "Kết quả Kinh doanh quý",
    revenue: "0",
    profit: "0",
    voiceReport: "Doanh thu quý này là 0 đồng, lợi nhuận là 0 đồng"
  },
  {
    command: "Báo Cáo Kết quả kinh doanh năm nay",
    type: "Kết quả Kinh doanh năm",
    revenue: "0",
    profit: "0",
    voiceReport: "Doanh thu năm nay là 0 đồng, lợi nhuận là 0 đồng"
  },
  {
    command: "So với doanh thu hôm qua thì thế nào?",
    type: "So sánh doanh thu ngày",
    revenue: "0",
    profit: "",
    voiceReport: "Tăng 0 đồng so với ngày hôm trước, tỷ lệ tăng 0.00%"
  },
  {
    command: "So với doanh thu tháng trước thì thế nào?",
    type: "So sánh doanh thu tháng",
    revenue: "0",
    profit: "",
    voiceReport: "Tăng 0 đồng so với tháng trước, tỷ lệ tăng 0.00%"
  },
  {
    command: "So với doanh thu quý trước thì thế nào?",
    type: "So sánh doanh thu quý",
    revenue: "0",
    profit: "",
    voiceReport: "Tăng 0 đồng so với quý trước, tỷ lệ tăng 0.00%"
  },
  {
    command: "So với doanh thu năm trước thì thế nào?",
    type: "So sánh doanh thu năm",
    revenue: "-174.738.495",
    profit: "",
    voiceReport: "Giảm 174.738.495 đồng so với năm trước, tỷ lệ giảm 100.00%"
  },
  {
    command: "Báo cáo chi phí hôm nay",
    type: "Chi phí ngày",
    revenue: "0",
    profit: "",
    voiceReport: "Chi phí hôm nay: Không có chi phí hôm nay"
  },
  {
    command: "Báo cáo chi phí tháng này",
    type: "Chi phí tháng",
    revenue: "0",
    profit: "",
    voiceReport: "Chi phí tháng này: Không có chi phí trong tháng"
  },
  {
    command: "Báo cáo chi phí quý này",
    type: "Chi phí quý",
    revenue: "0",
    profit: "",
    voiceReport: "Chi phí quý này: Không có chi phí trong quý"
  },
  {
    command: "Báo cáo chi phí năm nay",
    type: "Chi phí năm",
    revenue: "0",
    profit: "",
    voiceReport: "Chi phí năm nay: Không có chi phí trong năm"
  },
  {
    command: "Hàng hoá hôm nay có nhập thêm gì không?",
    type: "Nhập hàng ngày",
    revenue: "Không có hàng nhập hôm nay",
    profit: "",
    voiceReport: "Không có hàng nhập hôm nay"
  },
  {
    command: "Báo cáo hàng hoá đã nhập trong tháng",
    type: "Nhập hàng tháng",
    revenue: "Không có hàng nhập trong tháng",
    profit: "",
    voiceReport: "Không có hàng nhập trong tháng"
  },
  {
    command: "Báo cáo hàng hoá nhập trong quý",
    type: "Nhập hàng quý",
    revenue: "Không có hàng nhập trong quý",
    profit: "",
    voiceReport: "Không có hàng nhập trong quý"
  },
  {
    command: "Báo cáo hàng hoá đã nhập trong năm",
    type: "Nhập hàng năm",
    revenue: "Không có hàng nhập trong năm",
    profit: "",
    voiceReport: "Không có hàng nhập trong năm"
  },
  {
    command: "Báo cáo các sản phẩm bán chạy (liệt kê tối đa 5 sản phẩm bán chạy theo mã)",
    type: "Sản phẩm bán chạy",
    revenue: "22, 30 cái; 39, 10 cái; 46, 20 cái; 05AB, 1 cái; 05AB1, 1 cái;",
    profit: "",
    voiceReport: "Liệt kê top năm sản phẩm bán chạy: Bồn vệ sinh 1 khối bằng sứ 66x36x73cm, mã 22, 30 cái; Bồn vệ sinh 1 khối bằng sứ 69x38x78cm, mã 39, 10 cái; Bồn vệ sinh 1 khối bằng sứ 72x39x65cm, mã 46, 20 cái; Bạt HDPE 0.5mm, mã 05AB, 1 cái; Bạt HDPE 0.75mm, mã 05AB1, 1 cái;"
  },
  {
    command: "Báo cáo các sản phẩm bán chậm (liệt kê tối đa 5 sản phẩm bán chậm theo mã)",
    type: "Sản phẩm bán chậm",
    revenue: "206A, 0 cái; 213, 0 cái; 225-VV, 0 cái; 338, 0 cái; 9004, 0 cái;",
    profit: "",
    voiceReport: "Liệt kê top năm sản phẩm bán chậm: Chậu rửa mặt hình tròn cỡ lớn bằng sứ 465x150mm, mã 206A, 0 cái; Chậu rửa mặt hình chữ nhật bằng sứ 480x370x135mm, mã 213, 0 cái; Chậu rửa bằng sứ treo tường chân lửng kích thước 465x335x310mm, mã 225-VV, 0 cái; Chậu rửa mặt chữ nhật treo tường bằng sứ kích thước 500x420x410mm, mã 338, 0 cái; vòi hoa sen tay, mã 9004, 0 cái;"
  },
  {
    command: "Báo cáo các sản phẩm cần nhập bổ sung (liệt kê tồn kho dưới 50 sản phẩm theo mã)",
    type: "Sản phẩm cần nhập",
    revenue: "22, 20 cái; 39, 24 cái; 46, 46 cái; 190, 40 cái; 206A, 29 cái;",
    profit: "",
    voiceReport: "Liệt kê sản phẩm cần nhập bổ sung: Bồn vệ sinh 1 khối bằng sứ 66x36x73cm, mã 22, 20 cái; Bồn vệ sinh 1 khối bằng sứ 69x38x78cm, mã 39, 24 cái; Bồn vệ sinh 1 khối bằng sứ 72x39x65cm, mã 46, 46 cái; Sen cây tắm nóng lạnh mạ chrome, mã 190, 40 cái; Chậu rửa mặt hình tròn cỡ lớn bằng sứ 465x150mm, mã 206A, 29 cái;"
  }
];

function parseVoiceCommands(values: any[][]): VoiceCommandRow[] {
  if (!values || values.length < 2) return [];
  
  // Find the header row
  const headerRowIdx = values.findIndex(row => 
    row.some((cell: any) => {
      const cellStr = String(cell || "").toLowerCase();
      return cellStr.includes("câu lệnh") || cellStr.includes("giao lenh") || cellStr.includes("loại báo cáo") || cellStr.includes("báo cáo giọng nói") || cellStr.includes("giong noi");
    })
  );
  
  const actualHeaderIdx = headerRowIdx !== -1 ? headerRowIdx : 0;
  const headers = values[actualHeaderIdx].map((h: any) => String(h || "").toLowerCase().trim());
  
  const commandIdx = headers.findIndex((h: string) => h.includes("câu lệnh") || h.includes("cau lenh"));
  const typeIdx = headers.findIndex((h: string) => h.includes("loại") || h.includes("loai"));
  const revenueIdx = headers.findIndex((h: string) => h.includes("doanh thu") || h.includes("doanh so"));
  const profitIdx = headers.findIndex((h: string) => h.includes("lợi nhuận") || h.includes("loi nhuan"));
  const voiceReportIdx = headers.findIndex((h: string) => h.includes("giọng nói") || h.includes("giong noi") || h.includes("báo cáo"));

  // Sane column fallbacks
  const finalCommandIdx = commandIdx !== -1 ? commandIdx : 0;
  const finalTypeIdx = typeIdx !== -1 ? typeIdx : 1;
  const finalRevenueIdx = revenueIdx !== -1 ? revenueIdx : 2;
  const finalProfitIdx = profitIdx !== -1 ? profitIdx : 3;
  const finalVoiceReportIdx = voiceReportIdx !== -1 ? voiceReportIdx : 4;

  const commands: VoiceCommandRow[] = [];
  const startIdx = actualHeaderIdx + 1;
  
  for (let i = startIdx; i < values.length; i++) {
    const row = values[i];
    if (!row || row.length === 0) continue;
    
    const cmdText = String(row[finalCommandIdx] || "").trim();
    if (!cmdText) continue;
    
    // Choose voice report: prefer Column F (index 5) as requested ("âm thanh trả lời phát ra theo ô F từ dòng 2"), otherwise Column E (index 4)
    const valE = row.length > 4 && row[4] !== undefined && row[4] !== null ? String(row[4]).trim() : "";
    const valF = row.length > 5 && row[5] !== undefined && row[5] !== null ? String(row[5]).trim() : "";
    const finalReport = valF || valE || String(row[finalVoiceReportIdx] || "").trim();

    commands.push({
      command: cmdText,
      type: String(row[finalTypeIdx] || "").trim(),
      revenue: String(row[finalRevenueIdx] || "").trim(),
      profit: String(row[finalProfitIdx] || "").trim(),
      voiceReport: finalReport,
    });
  }
  
  return commands;
}

const fetchVoiceCommandsFromSheet = async (token: string, sheetId: string): Promise<VoiceCommandRow[]> => {
  const possibleRanges = [
    "'Giọng nói báo cáo admin'!A1:G100",
    "'Giọng nói báo cáo admim'!A1:G100",
    "'giọng nói báo cáo admin'!A1:G100",
    "Giong_noi_bao_cao!A1:G100",
    "Giong_noi!A1:G100",
    "Bao_cao_giong_noi!A1:G100",
    "Sheet2!A1:G100"
  ];
  
  for (const range of possibleRanges) {
    try {
      console.log(`Trying to fetch voice commands range: ${range}`);
      const resp = await fetch("/api/sheets/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sheetId, 
          range, 
          accessToken: token 
        }),
      });
      
      if (resp.ok) {
        const data = await resp.json();
        if (data.values && data.values.length > 1) {
          const parsed = parseVoiceCommands(data.values);
          if (parsed.length > 0) {
            console.log(`Successfully fetched and parsed voice commands from: ${range}`);
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch range ${range}:`, err);
    }
  }
  
  throw new Error("Could not find Voice Command tab on Google Sheets. Falling back to built-in dataset.");
};

// Normalize spreadsheet sums to human readable millions representation if they are large VND values
const normalizeValueToMillions = (val: number) => {
  if (val > 100000) {
    return Number((val / 1000000).toFixed(2)); // 160,738,500 -> 160.74
  }
  return val;
};

export default function InventorySystem({ config }: { config: SiteConfig }) {
  const { isAuthenticated } = useAdmin();
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockMessage, setLockMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceResult, setVoiceResult] = useState<string | null>(null);

  // States for Package Registration
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedPlanName, setSelectedPlanName] = useState("");
  const [selectedPlanPrice, setSelectedPlanPrice] = useState("");
  const [selectedPlanColor, setSelectedPlanColor] = useState("");
  const [selectedPlanFeatures, setSelectedPlanFeatures] = useState<string[]>([]);
  const [planForm, setPlanForm] = useState({ name: "", phone: "", notes: "" });
  const [planSuccess, setPlanSuccess] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleRegisterPlan = (planName: string, planPrice: string, planColor: string, features: string[]) => {
    setSelectedPlanName(planName);
    setSelectedPlanPrice(planPrice);
    setSelectedPlanColor(planColor);
    setSelectedPlanFeatures(features);
    setPlanForm({ name: "", phone: "", notes: "" });
    setPlanSuccess(false);
    setIsPlanModalOpen(true);
  };

  const handlePlanFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name || !planForm.phone) {
      alert("Vui lòng nhập đầy đủ Họ và Tên cùng Số điện thoại!");
      return;
    }
    setPlanSuccess(true);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Cảm ơn anh chị ${planForm.name}. Bạn đã đăng ký thành công gói ${selectedPlanName}. Đội ngũ chăm sóc khách hàng YOHU sẽ liên hệ qua số điện thoại ${planForm.phone} để hỗ trợ kích hoạt dịch vụ cho bạn trong ít phút.`;
      const utterText = new SpeechSynthesisUtterance(text);
      utterText.lang = 'vi-VN';
      window.speechSynthesis.speak(utterText);
    }
    setTimeout(() => {
      setIsPlanModalOpen(false);
      setPlanSuccess(false);
    }, 5000);
  };
  
  // States of Global Variable Configurations & Custom Products
  const [systemConfig, setSystemConfig] = useState<SiteConfig>({
    company_name: config.company_name || "",
    address: config.address || "",
    hotline: config.hotline || "",
    zalo: config.zalo || "",
    email_primary: config.email_primary || "",
    email_secondary: config.email_secondary || "",
    facebook: config.facebook || "",
    fanpage: config.fanpage || "",
    sheet_id: config.sheet_id || "",
    form_id: config.form_id || "",
    folder_main_id: config.folder_main_id || "",
    kqkd_report_id: config.kqkd_report_id || "",
    xnt_report_id: config.xnt_report_id || "",
    invoice_pdf_id: config.invoice_pdf_id || "",
    sample_files_id: config.sample_files_id || "",
    gemini_api_key: config.gemini_api_key || "",
    gemini_model: config.gemini_model || "gemini-3.5-flash",
    bot_knowledge: config.bot_knowledge || "",
    bank_account_name: config.bank_account_name || "",
    bank_account_number: config.bank_account_number || "",
    bank_name: config.bank_name || "",
  });

  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState("Tất cả");
  
  // Subcategory management state
  const [newSub, setNewSub] = useState("");
  const [targetCat, setTargetCat] = useState("ĐIỀU HÒA");

  const categories = systemConfig.custom_categories || DEFAULT_PRODUCT_CATEGORIES;
  const mainCategories = Object.keys(categories);
  
  const handleAddSubcategory = async () => {
    if(!newSub.trim()) return;
    const updatedCategories = { ...categories };
    if (!updatedCategories[targetCat]) updatedCategories[targetCat] = [];
    updatedCategories[targetCat].push(newSub);
    
    // Update config locally and in Firestore
    const updatedConfig = { ...systemConfig, custom_categories: updatedCategories };
    setIsSavingConfig(true);
    try {
      const resp = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedConfig)
      });
      if (resp.ok) {
        setSystemConfig(updatedConfig);
        setNewSub("");
        alert("Đã thêm mục con mới!");
        window.location.reload();
      }
    } finally {
      setIsSavingConfig(false);
    }
  };
  
  const [newProductForm, setNewProductForm] = useState({
    name: "",
    price: "",
    category: mainCategories[0],
    subCategory: "",
    brand: "YOHU",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400",
    oldPrice: "",
    discount: ""
  });

  useEffect(() => {
    const fetchLiveConfig = async () => {
      try {
        const resp = await fetch("/api/config");
        if (resp.ok) {
          const data = await resp.json();
          setSystemConfig(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Lỗi lấy cấu hình trực tiếp từ REST-API:", err);
      }
    };
    fetchLiveConfig();
  }, [config]);

  const handleSaveSystemConfig = async () => {
    setIsSavingConfig(true);
    try {
      const resp = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(systemConfig)
      });
      if (resp.ok) {
        alert("Cấu hình hệ thống đã được lưu trữ & đồng bộ thành công!");
        window.location.reload();
      } else {
        throw new Error("Không thể lưu cấu hình.");
      }
    } catch (err: any) {
      alert("Lỗi khi lưu cấu hình: " + (err.message || err));
    } finally {
      setIsSavingConfig(false);
    }
  };

  const customProducts = (systemConfig as any).custom_products || [];

  const handleAddCustomProduct = async () => {
    if (!newProductForm.name || !newProductForm.price) {
      alert("Vui lòng nhập đầy đủ tên sản phẩm và giá bán!");
      return;
    }

    let formattedPrice = newProductForm.price.trim();
    if (!formattedPrice.endsWith("đ")) {
      formattedPrice += "đ";
    }

    const newProd = {
      id: "custom-" + Date.now(),
      name: newProductForm.name,
      category: newProductForm.category,
      subCategory: newProductForm.subCategory,
      brand: newProductForm.brand || "YOHU",
      price: formattedPrice,
      oldPrice: newProductForm.oldPrice ? (newProductForm.oldPrice.endsWith("đ") ? newProductForm.oldPrice : newProductForm.oldPrice + "đ") : undefined,
      discount: newProductForm.discount || undefined,
      image: newProductForm.image || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400",
      rating: 5
    };

    const updatedCustomProducts = [...customProducts, newProd];
    const updatedConfig = { ...systemConfig, custom_products: updatedCustomProducts };
    
    setIsSavingConfig(true);
    try {
      const resp = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedConfig)
      });
      if (resp.ok) {
        setSystemConfig(updatedConfig);
        alert(`Đã thêm sản phẩm "${newProd.name}" thành công!`);
        setNewProductForm({
          name: "",
          price: "",
          category: mainCategories[0],
          subCategory: "",
          brand: "YOHU",
          image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400",
          oldPrice: "",
          discount: ""
        });
        setShowAddProductForm(false);
        window.location.reload();
      } else {
        throw new Error("Không thể ghi cấu hình.");
      }
    } catch (err: any) {
      alert("Lỗi thêm sản phẩm: " + err.message);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleDeleteCustomProduct = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm tự thêm "${name}" không?`)) return;

    const updatedCustomProducts = customProducts.filter((p: any) => p.id !== id);
    const updatedConfig = { ...systemConfig, custom_products: updatedCustomProducts };

    setIsSavingConfig(true);
    try {
      const resp = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedConfig)
      });
      if (resp.ok) {
        setSystemConfig(updatedConfig);
        alert("Đã xóa sản phẩm thành công!");
        window.location.reload();
      } else {
        throw new Error("Lỗi lưu thay đổi.");
      }
    } catch (err: any) {
      alert("Lỗi khi xóa sản phẩm: " + err.message);
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Real or fallback YOHU dashboard metrics
  const [metrics, setMetrics] = useState({
    revenue: 160.74, // in Million VND
    profit: 24.98,  // in Million VND
    cases: 714,     // transactions Count / units sold
  });

  // Real or fallback stock levels for YOHU products
  const [stock, setStock] = useState<YohuProduct[]>([
    { code: "wc-yohu-3015", name: "Bồn cầu YOHU 1 khối 3015", unit: "Cái", stockIn: 200, sold: 155, stockOut: 45, priceSell: 4596800, valSell: 712504000, valStock: 206856000, profit: 110450000 },
    { code: "wc-yohu-3008", name: "Bồn cầu treo tường YOHU 3008", unit: "Cái", stockIn: 100, sold: 85, stockOut: 15, priceSell: 8155200, valSell: 693192000, valStock: 122328000, profit: 107310000 },
    { code: "sv-yohu-7002", name: "Vòi lavabo nóng lạnh YOHU 7002", unit: "Cái", stockIn: 150, sold: 65, stockOut: 85, priceSell: 963200, valSell: 62608000, valStock: 81872000, profit: 9700000 },
    { code: "sc-yohu-120", name: "Sen cây YOHU 120", unit: "Cái", stockIn: 80, sold: 48, stockOut: 32, priceSell: 960000, valSell: 46080000, valStock: 30720000, profit: 7140000 },
    { code: "pk-yohu-6605", name: "Bồn tiểu treo YOHU 6605", unit: "Cái", stockIn: 50, sold: 32, stockOut: 18, priceSell: 1520000, valSell: 48640000, valStock: 27360000, profit: 7530000 },
    { code: "tank-v1000", name: "Bồn nước Hwata Đứng 1000L", unit: "Cái", stockIn: 30, sold: 18, stockOut: 12, priceSell: 3244000, valSell: 58392000, valStock: 38928000, profit: 9060000 }
  ]);

  const [productsList, setProductsList] = useState<YohuProduct[]>([]);
  const [voiceCommands, setVoiceCommands] = useState<VoiceCommandRow[]>(DEFAULT_VOICE_COMMANDS);
  const [consoleOutput, setConsoleOutput] = useState<string>("Sẵn sàng nhận lệnh báo cáo giọng nói...");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>("Dữ liệu kết nối Google Drive & Sheets sẵn sàng.");
  const [showCommandsInfo, setShowCommandsInfo] = useState(true);

  // States to drive automatic center-screen voice report popup modal
  const [activeReport, setActiveReport] = useState<VoiceCommandRow | null>(null);
  const [reportPopupCountdown, setReportPopupCountdown] = useState<number>(0);

  // Auto-close countdown for central report popup (15-20s duration, using 18s by default)
  useEffect(() => {
    let intervalId: any;
    if (activeReport && reportPopupCountdown > 0) {
      intervalId = setInterval(() => {
        setReportPopupCountdown(prev => {
          if (prev <= 1) {
            setActiveReport(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeReport, reportPopupCountdown]);

  // Spoken commands helper
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
    }
  };

  // Fetch Google Sheets to load real data
  const handleSyncData = async (isManual = false) => {
    if (isManual && !isAuthenticated) {
      setLockMessage("Đồng bộ dữ liệu từ Google Sheets là tác vụ quản trị bảo mật của YOHU. Vui lòng đăng nhập Admin để thực hiện.");
      setShowLockModal(true);
      return;
    }
    setIsSyncing(true);
    setConsoleOutput("[KẾT NỐI] Đang đồng bộ hóa dữ liệu trực tiếp từ các Google Sheets của bạn... 🔄");
    setSyncStatus("Đang nạp dữ liệu mây từ hệ thống Google... ⏳");
    
    try {
      const token = sessionStorage.getItem("google_access_token") || "service_account";
      
      // 1. Fetch dynamic products details sheet (San_pham tab in sheet_id)
      let parsedProducts: YohuProduct[] = [];
      try {
        const resp = await fetch("/api/sheets/fetch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            sheetId: config.sheet_id || "163ZiScOOL2R9YJalt4RiBhPKZvV9yisVosD3lgeu5iQ", 
            range: "San_pham!A1:N150", 
            accessToken: token 
          }),
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.values && data.values.length > 1) {
            parsedProducts = parseYohuProducts(data.values);
            if (parsedProducts.length > 0) {
              setProductsList(parsedProducts);
              
              // Calculate real total revenue, profit, cases from live products
              let totalRevenueVal = 0;
              let totalProfitVal = 0;
              let totalSoldQty = 0;

              parsedProducts.forEach(p => {
                totalRevenueVal += p.valSell;
                totalProfitVal += p.profit;
                if (p.sold > 0) {
                  totalSoldQty += p.sold;
                }
              });

              if (totalRevenueVal > 0) {
                const normalizedRev = normalizeValueToMillions(totalRevenueVal);
                const normalizedProfit = totalProfitVal !== null ? normalizeValueToMillions(totalProfitVal) : Number((normalizedRev * 0.155).toFixed(2));
                setMetrics({
                  revenue: normalizedRev,
                  profit: normalizedProfit,
                  cases: totalSoldQty || 714
                });
              }

              // Update stock levels from sheet
              if (parsedProducts && parsedProducts.length > 0) {
                setStock(parsedProducts.slice(0, 6));
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to parse yohu products sheets:", err);
      }

      // 2. Fetch Voice Commands tab from Google sheet
      try {
        const fetchedCommands = await fetchVoiceCommandsFromSheet(token, config.sheet_id || "163ZiScOOL2R9YJalt4RiBhPKZvV9yisVosD3lgeu5iQ");
        if (fetchedCommands && fetchedCommands.length > 0) {
          setVoiceCommands(fetchedCommands);
          console.log("Successfully loaded live voice commands sheet data.");
        }
      } catch (voiceErr) {
        console.warn("Failed to retrieve live voice commands sheet, using default list:", voiceErr);
      }

      setSyncStatus("Dữ liệu liên kết Google Sheets đã được cập nhật thành công! ✅");
      setConsoleOutput("[HỆ THỐNG] Đồng bộ hoàn thành. Sẵn sàng nhận lệnh báo cáo giọng nói... ✅");
      speakText("Hệ thống đã đồng bộ hóa dữ liệu từ Google Sheets thành công.");
    } catch (err) {
      console.error("General spreadsheet synchronization failure:", err);
      setSyncStatus("Không thể kết nối máy chủ Google Sheets. Sắp xếp chạy chế độ mô phỏng.");
      setConsoleOutput("[CẢNH BÁO] Chưa thể đồng bộ hóa thực tế. Đang hiển thị số liệu bảo mật lưu trữ.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Run initial sync on load
  useEffect(() => {
    handleSyncData();
  }, [config.sheet_id, config.kqkd_report_id, config.xnt_report_id, config.invoice_pdf_id]);

  // Command simulation / execution engine
  const handleCommand = async (prompt: string) => {
    if (!isAuthenticated) {
      setLockMessage("Thao tác ra lệnh báo cáo giọng nói chỉ dành riêng cho Ban quản lý (Admin) của YOHU.");
      setShowLockModal(true);
      return;
    }
    setVoiceResult(prompt);
    
    // Speak loading intro
    speakText(`Đang xử lý câu lệnh: ${prompt}. Vui lòng chờ...`);
    
    // Monospace status output
    setConsoleOutput(`[LỆNH CHẠY] Nhận lệnh: "${prompt}"\n[KẾT NỐI] Đang tra cứu cơ sở dữ liệu Google Sheets...\n[XỬ LÝ] Đang tổng hợp số liệu tính toán...\n`);
    
    setTimeout(() => {
      const cleanText = (str: string) => {
        return str
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[.,?/#!$%^&*;:{}=\-_`~()]/g, "")
          .replace(/\s+/g, ' ')
          .trim();
      };

      const lowerPrompt = prompt.toLowerCase().trim();
      const cleanedPrompt = cleanText(prompt);

      let matchedRow: VoiceCommandRow | null = null;
      let highestSimilarity = 0;

      // 1. Direct and substring matching from the sheets / default list
      for (const row of voiceCommands) {
        const rowCommandClean = cleanText(row.command);
        const rowTypeClean = cleanText(row.type);

        // Exact equal
        if (rowCommandClean === cleanedPrompt || rowTypeClean === cleanedPrompt) {
          matchedRow = row;
          break;
        }

        // Substring inclusions
        if (rowCommandClean.includes(cleanedPrompt) || cleanedPrompt.includes(rowCommandClean)) {
          const score = Math.min(rowCommandClean.length, cleanedPrompt.length);
          if (score > highestSimilarity) {
            highestSimilarity = score;
            matchedRow = row;
          }
        }
      }

      // 2. Extra semantic mappings for simple triggers
      if (!matchedRow) {
        if (lowerPrompt.includes("doanh thu hôm nay") || lowerPrompt.includes("kinh doanh ngày")) {
          matchedRow = voiceCommands.find(c => c.command.includes("ngày hôm nay")) || null;
        } else if (lowerPrompt.includes("kiểm kho") || lowerPrompt.includes("bồn nước") || lowerPrompt.includes("sản phẩm") || lowerPrompt.includes("bổ sung")) {
          matchedRow = voiceCommands.find(c => c.command.includes("bổ sung")) || null;
        } else if (lowerPrompt.includes("hóa đơn") || lowerPrompt.includes("bốc xếp") || lowerPrompt.includes("chi phí")) {
          matchedRow = voiceCommands.find(c => c.command.includes("chi phí hôm nay") || c.command.toLowerCase().includes("chi phí")) || null;
        } else if (lowerPrompt.includes("tài chính") || lowerPrompt.includes("lũy kế") || lowerPrompt.includes("doanh thu năm")) {
          matchedRow = voiceCommands.find(c => c.command.includes("năm nay")) || null;
        }
      }

      if (matchedRow) {
        const report = `[LỆNH CHẠY] NHẬN DIỆN CÂU LỆNH: "${prompt}"\n` +
          `--------------------------------------------------\n` +
          `📋 LOẠI BÁO CÁO: ${matchedRow.type}\n` +
          `💵 DOANH THU GHI NHẬN: ${matchedRow.revenue || "0đ"}\n` +
          `📊 LỢI NHUẬN GHI NHẬN: ${matchedRow.profit || "0đ"}\n` +
          `--------------------------------------------------\n` +
          `🎤 [TRỢ LÝ PHÁT PHÁT BIỂU]:\n` +
          `"${matchedRow.voiceReport}"\n\n` +
          `👉 Thống kê đồng bộ đám mây trực tiếp từ Google Sheet.`;
        
        setConsoleOutput(report);
        speakText(matchedRow.voiceReport);

        // Show central report modal for 18 seconds
        setActiveReport(matchedRow);
        setReportPopupCountdown(18);
      } else {
        const report = `[LỆNH CHẠY] NHẬN DIỆN THÀNH CÔNG YOHU AI\n` +
          `--------------------------------------------------\n` +
          `💬 Lệnh thiết lập: "${prompt}"\n` +
          `💵 Doanh thu tham chiếu: ${metrics.revenue}Tr đ\n` +
          `📊 Lợi nhuận định lưu: ${metrics.profit}Tr đ\n` +
          `--------------------------------------------------\n` +
          `👉 Không tìm thấy bản ghi trùng khớp trong tab 'Giọng nói báo cáo admin'. Vui lòng chọn một câu lệnh mẫu có sẵn dưới đây để kiểm tra.`;
        setConsoleOutput(report);
        
        const spokenMsg = `Hệ thống YOHU nhận dạng câu lệnh thành công. Kết quả kinh doanh đạt ${metrics.revenue} triệu đồng.`;
        speakText(spokenMsg);

        // Render beautiful feedback popup anyway for user experience
        const customReportRow: VoiceCommandRow = {
          command: prompt,
          type: "Phân tích YOHU AI",
          revenue: `${metrics.revenue} Tr`,
          profit: `${metrics.profit} Tr`,
          voiceReport: spokenMsg
        };
        setActiveReport(customReportRow);
        setReportPopupCountdown(18);
      }
    }, 1200);
  };

  // Web Speech API Voice Recognition flow
  const startVoiceCommand = () => {
    if (!isAuthenticated) {
      setLockMessage("Tính năng ghi âm giọng nói qua Mic chỉ dành riêng cho Admin của YOHU.");
      setShowLockModal(true);
      return;
    }
    if (!('webkitSpeechRecognition' in window)) {
      alert("Trình duyệt không hỗ trợ nhận diện giọng nói!");
      return;
    }
    
    speakText("Đang lắng nghe...");
    setConsoleOutput("[HỆ THỐNG] Đang lắng nghe giọng nói từ mic của bạn... 🎤");
    
    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleCommand(transcript);
    };
    recognition.onerror = (e: any) => {
      setConsoleOutput(`[HỆ THỐNG LỖI] Không nhận dạng được giọng nói: ${e.error}`);
      setIsListening(false);
    };
    recognition.start();
  };

  const handleClearLog = () => {
    setConsoleOutput("Sẵn sàng nhận lệnh báo cáo giọng nói...");
    setVoiceResult(null);
    speakText("Đã xóa nhật ký.");
  };

  // Render document/folder lists dynamically mapping config
  const cloudDocs = [
    {
      badge: "DRIVE FOLDER",
      badgeColor: "text-blue-600 bg-blue-50 border-blue-200",
      title: "Thư mục Drive lưu trữ chung YOHU",
      idKey: "folder_main_id",
      idValue: config.folder_main_id || "17OnO27l8eXYTA-E0fkg9PQnkzk4RB82S",
      desc: "Nơi lưu trữ các file lưu trữ nội bộ gồm: Báo cáo KQKD ngày/năm, ảnh gốc catalogue sỉ.",
      getLink: (cfg: SiteConfig) => `https://drive.google.com/drive/folders/${cfg.folder_main_id || "17OnO27l8eXYTA-E0fkg9PQnkzk4RB82S"}`,
      type: "folder"
    },
    {
      badge: "GOOGLE SHEET",
      badgeColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      title: "BC KQKD NĂM YOHU",
      idKey: "sheet_id",
      idValue: config.sheet_id || "163ZiScOOL2R9YJalt4RiBhPKZvV9yisVosD3lgeu5iQ",
      desc: "Phân tích kết quả kinh doanh dài hạn, phân định công nợ, doanh số thiết bị vệ sinh YOHU.",
      getLink: (cfg: SiteConfig) => `https://docs.google.com/spreadsheets/d/${cfg.sheet_id || "163ZiScOOL2R9YJalt4RiBhPKZvV9yisVosD3lgeu5iQ"}`,
      type: "sheet"
    },
    {
      badge: "GOOGLE SHEET",
      badgeColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      title: "BC KQKD NGÀY YOHU",
      idKey: "kqkd_report_id",
      idValue: config.kqkd_report_id || "142_X48JtBR6ItQD-gVOV1utUL419mCeQ0W_Q3z3wQDE",
      desc: "Cập nhật sản lượng bán sỉ lẻ của bồn vệ sinh, sen vòi, màng bạt YOHU trong ngày.",
      getLink: (cfg: SiteConfig) => `https://docs.google.com/spreadsheets/d/${cfg.kqkd_report_id || "142_X48JtBR6ItQD-gVOV1utUL419mCeQ0W_Q3z3wQDE"}`,
      type: "sheet"
    },
    {
      badge: "GOOGLE SHEET",
      badgeColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      title: "Doanh số BC XNT 2025 YOHU",
      idKey: "xnt_report_id",
      idValue: config.xnt_report_id || "1JrIPYBjFKsBY7Z5DdtznPdn1E7Z9ZNN76GisFzgHyfs",
      desc: "Theo dõi số lượng màng bạt HDPE tồn kho, bồn vệ sinh đang xuất xưởng sỉ lẻ.",
      getLink: (cfg: SiteConfig) => `https://docs.google.com/spreadsheets/d/${cfg.xnt_report_id || "1JrIPYBjFKsBY7Z5DdtznPdn1E7Z9ZNN76GisFzgHyfs"}`,
      type: "sheet"
    },
    {
      badge: "GOOGLE SHEET",
      badgeColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      title: "HOÁ ĐƠN BÁN HÀNG YOHU 2025",
      idKey: "invoice_pdf_id",
      idValue: config.invoice_pdf_id || "14jQmHoH0JeUrMvsujcWj6Bf8YXMNtvXn0CwdHaV4r3k",
      desc: "Báo biểu ghi chép chi phí bốc dỡ và vận tải hàng hóa thiết bị vệ sinh bến bãi sỉ toàn quốc.",
      getLink: (cfg: SiteConfig) => `https://docs.google.com/spreadsheets/d/${cfg.invoice_pdf_id || "14jQmHoH0JeUrMvsujcWj6Bf8YXMNtvXn0CwdHaV4r3k"}`,
      type: "sheet"
    },
    {
      badge: "FORM KHAI BÁO",
      badgeColor: "text-purple-700 bg-purple-50 border-purple-200",
      title: "Google Form Nhận KQKD YOHU",
      idKey: "form_id",
      idValue: config.form_id || "1NhJWil7DYbCmYnvx_3IZrL-vW-I7Q8Q523w1soVU9Io",
      desc: "Khai chép biểu mẫu trực tuyến cho nhân viên đẩy doanh thu ngày và quản trị.",
      getLink: (cfg: SiteConfig) => `https://docs.google.com/forms/d/${cfg.form_id || "1NhJWil7DYbCmYnvx_3IZrL-vW-I7Q8Q523w1soVU9Io"}/viewform`,
      type: "form"
    },
    {
      badge: "DRIVE FOLDER",
      badgeColor: "text-amber-700 bg-amber-50 border-amber-200",
      title: "Thư mục File Mẫu YOHU",
      idKey: "sample_files_id",
      idValue: config.sample_files_id || "1PfP4YOOe1yo5RhUyk28emwIthwe0HagH",
      desc: "Các biểu mẫu danh sách đại lý phân phối và cam kết chiết khấu khu vực.",
      getLink: (cfg: SiteConfig) => `https://drive.google.com/drive/folders/${cfg.sample_files_id || "1PfP4YOOe1yo5Rh"}`,
      type: "folder"
    }
  ];

  const handleDocClick = (e: React.MouseEvent, doc: any) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setLockMessage(`Tài liệu "${doc.title}" thuộc dữ liệu nội bộ bảo mật của YOHU. Chỉ Quản trị viên mới được cấp đặc quyền truy cập.`);
      setShowLockModal(true);
    } else {
      window.open(doc.getLink(config), "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div id="admin_portal_view" className="bg-slate-50/50 font-sans min-h-screen overflow-x-hidden pb-12">
      
      {/* SECTION 1: CỔNG QUẢN TRỊ NỘI BỘ YOHU VIỆT NAM */}
      <section className="pt-8 px-6 max-w-7xl mx-auto">
        <div id="main_header_card" className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-5">
            <div className="p-4 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 flex-shrink-0">
              <Database className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                CỔNG QUẢN TRỊ NỘI BỘ YOHU VIỆT NAM
              </h1>
              <p className="text-slate-500 text-xs md:text-sm mt-1.5 leading-relaxed max-w-3xl">
                Hệ thống điện tử hỗ trợ tra cứu rảnh tay thiết bị vệ sinh, bồn cầu, sen vòi, thiết bị bếp, màng bạt HDPE và vải địa kỹ thuật YOHU. Hoàn thiện các liên kết Google Drive, Google Sheets lưu trữ kết quả kinh doanh ngày/năm, và Google Forms khai báo hệ thống.
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => handleSyncData(true)}
            disabled={isSyncing}
            className="px-6 py-3.5 bg-[#008060] hover:bg-[#006a4e] active:scale-95 text-white text-[11px] font-bold tracking-wider uppercase rounded-xl shadow-lg transition-all flex items-center gap-2 select-none flex-shrink-0 disabled:opacity-70 disabled:pointer-events-none"
          >
            {isSyncing ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Cloud className="w-4 h-4 text-white" />
            )}
            ĐỒNG BỘ LÊN CLOUD
          </button>
        </div>
      </section>

      {/* SECTION 2: KHO TÀI LIỆU CLOUD GOOGLE DRIVE CHÍNH THỨC */}
      <section className="pt-10 px-6 max-w-7xl mx-auto">
        <div className="mb-6 space-y-1">
          <h2 className="text-indigo-950 font-black tracking-wider text-base uppercase flex items-center gap-2">
            | KHO TÀI LIỆU CLOUD GOOGLE DRIVE CHÍNH THỨC
          </h2>
          <p className="text-slate-500 text-xs">
            Bấm trực tiếp vào tài liệu sau để truy cập dữ liệu đám mây tương ứng.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cloudDocs.map((doc, idx) => (
            <motion.div
              key={idx}
              onClick={(e) => handleDocClick(e, doc)}
              whileHover={{ y: -3, scale: 1.01 }}
              className="bg-white border border-slate-100 hover:border-slate-300 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-6 cursor-pointer group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className={`px-2.5 py-0.5 rounded-full border text-[8px] font-extrabold uppercase tracking-widest ${doc.badgeColor}`}>
                    {doc.badge}
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-slate-900 font-extrabold text-[14px] tracking-tight leading-snug">
                    {doc.title}
                  </h3>
                  <div className="font-mono text-[9px] text-zinc-400 flex items-center gap-1 font-medium select-all">
                    ID: <span className="truncate max-w-[120px]">{doc.idValue}</span>
                  </div>
                </div>

                <p className="text-slate-500 text-[11px] leading-relaxed">
                  {doc.desc}
                </p>
              </div>

              <div className="border-t border-slate-100/80 pt-4 flex items-center gap-2.5">
                {doc.type === "sheet" && (
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                )}
                {doc.type === "folder" && (
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                )}
                {doc.type === "form" && (
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                )}
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-slate-600">
                  Truy cập liên kết
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 3 & 4: VOICE ASSISTANT AND MANAGEMENT CHART SPLIT */}
      <section className="pt-10 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* VOICE REPORT ASSISTANT YOHU AI */}
        <div className="lg:col-span-8 bg-[#0a1128] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6 text-white min-h-[480px]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-[11px] font-black uppercase tracking-widest leading-none">
              <Mic className="w-3.5 h-3.5" /> VOICE REPORT ASSISTANT YOHU AI
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Mô phỏng công nghệ Web Speech Recognition. Hãy đọc hoặc click các kịch bản sẵn dưới đây để xem sự cập nhật dữ liệu đồ thị tài chính thời gian thực và nghe máy chủ tự động phát giọng đọc bằng Tiếng Việt.
            </p>
          </div>

          {/* Hologram / Terminal monitor */}
          <div className="flex-1 min-h-[160px] bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 font-mono text-[11.5px] text-emerald-400/90 leading-relaxed overflow-y-auto max-h-[220px] scrollbar-thin scrollbar-thumb-slate-800">
            <div className="flex items-center gap-1.5 mb-2 border-b border-slate-900 pb-1.5 justify-between">
              <div className="flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[9px] font-bold tracking-widest text-emerald-500 select-none">TERMINAL LIVE MONITOR</span>
              </div>
              <span className="text-[8px] text-slate-500 select-none uppercase">Yohu Việt Nam v2.0</span>
            </div>
            <div className="whitespace-pre-wrap font-mono">
              {consoleOutput}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={startVoiceCommand}
                className={`px-5 py-3.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg ${isListening ? "bg-red-600 hover:bg-red-500 shadow-red-900/30 text-white" : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/40 text-white"}`}
              >
                <Mic className="w-4 h-4 animate-pulse" />
                {isListening ? "Đang thu âm..." : "BẮT ĐẦU NGHE GIỌNG NÓI VIA MIC"}
              </button>
              <button
                type="button"
                onClick={handleClearLog}
                className="px-5 py-3.5 bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5"
              >
                Xóa tất cả log
              </button>
            </div>
            {voiceResult && (
              <div className="text-[10px] font-semibold text-slate-400 bg-slate-900/90 border border-slate-800/80 px-3 py-1.5 rounded-lg select-all">
                Đọc thấy: <span className="text-indigo-400">"{voiceResult}"</span>
              </div>
            )}
          </div>

          {/* Sample preset commands catalog */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest select-none">
                DANH SÁCH KHAI BÁO CÂU LỆNH BÁO CÁO ADMIN (ẤN ĐỂ PHÁT NGAY)
              </div>
              <button
                type="button"
                onClick={() => setShowCommandsInfo(!showCommandsInfo)}
                className="text-indigo-400 hover:text-indigo-300 text-[10px] font-bold hover:underline"
              >
                {showCommandsInfo ? "Ẩn danh sách" : "Xem tất cả câu lệnh"}
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[190px] overflow-y-auto pr-1">
              {(showCommandsInfo ? voiceCommands : voiceCommands.slice(0, 6)).map((item, idx) => (
                <button 
                  key={idx}
                  type="button"
                  onClick={() => handleCommand(item.command)}
                  className="p-3 bg-slate-900/45 hover:bg-slate-900/90 hover:border-indigo-500 border border-slate-800/65 rounded-xl text-left text-[11px] font-semibold hover:text-indigo-400 text-slate-200 transition-all flex items-start gap-2 group"
                >
                  <Volume2 className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform mt-0.5 flex-shrink-0" />
                  <span className="leading-snug break-words">{item.command}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MANAGEMENT CHART & ACTIVE STOCK LEVELS */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Chart block */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
            <div className="space-y-0.5">
              <span className="text-[9.5px] font-black tracking-widest text-[#9c27b0] uppercase">
                YOHU VIỆT NAM REAL-TIME MANAGEMENT CHART (WEB SVG)
              </span>
              <h3 className="text-[17px] font-black text-slate-950 tracking-tight leading-none pt-0.5">
                Doanh Thu & Biến động tài chính (Triệu đ)
              </h3>
            </div>

            {/* Simulated Clean HTML/CSS/SVG Graphic */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 min-h-[160px] flex items-end justify-around gap-2 pt-8 relative">
              
              {/* Dynamic Y-Axis Helper coordinates */}
              <div className="absolute top-2 left-2 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Live Feed update</span>
              </div>

              {/* Bar 1: Doanh thu */}
              <div className="flex flex-col items-center gap-2.5 w-1/3 group relative">
                <div className="w-full flex justify-center text-slate-900 font-extrabold text-[12px] leading-none mb-1">
                  {metrics.revenue}Tr
                </div>
                <div className="w-10 bg-[#008060] rounded-t-lg transition-all duration-700 hover:brightness-110 shadow-sm" style={{ height: "100px" }} />
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Doanh thu</span>
              </div>

              {/* Bar 2: Lợi nhuận */}
              <div className="flex flex-col items-center gap-2.5 w-1/3 group relative">
                <div className="w-full flex justify-center text-slate-900 font-extrabold text-[12px] leading-none mb-1">
                  {metrics.profit}Tr
                </div>
                <div className="w-10 bg-[#00e676] rounded-t-lg transition-all duration-700 hover:brightness-110 shadow-sm" style={{ height: `${Math.min(100, Math.max(15, Math.round((metrics.profit / metrics.revenue) * 100)))}px` }} />
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Lợi nhuận</span>
              </div>

              {/* Bar 3: Sự vụ đơn */}
              <div className="flex flex-col items-center gap-2.5 w-1/3 group relative animate-pulse-slow">
                <div className="w-full flex justify-center text-slate-900 font-extrabold text-[12px] leading-none mb-1">
                  {metrics.cases} vụ
                </div>
                <div className="w-10 bg-[#ff9100] rounded-t-lg transition-all duration-700 hover:brightness-110 shadow-sm" style={{ height: `${Math.min(100, Math.max(10, metrics.cases * 1.5))}px` }} />
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center line-clamp-1">Sự vụ đơn</span>
              </div>

            </div>
          </div>

          {/* Table Block */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-black text-indigo-950 uppercase tracking-widest pl-0.5">
              BẢNG TỒN KHO THIẾT BỊ VỆ SINH & BỒN NƯỚC YOHU:
            </h3>

            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 divide-y divide-slate-100">
              {stock.map((item, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-4 py-2.5 text-[11.5px]">
                  <div className="flex items-center gap-2 font-semibold text-slate-700 min-w-0">
                    <span className="h-2 w-2 rounded-full bg-[#008060] shrink-0" />
                    <span className="truncate">{item.name}:</span>
                  </div>
                  <div className="font-extrabold text-slate-900 text-right shrink-0">
                    {item.stockOut.toLocaleString()} {item.unit || "Cái"}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </section>

      {/* SECTION 5: FEATURES & OTHER ORIGINAL BLOCKS (AI-PRO 2.0 FEATURES) */}
      <section className="py-16 px-6 mt-12 bg-slate-900 text-white max-w-7xl mx-auto rounded-[3rem]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center px-6">
          <div className="order-2 lg:order-1 flex flex-col items-center justify-center p-12 bg-white/5 border border-white/10 rounded-[3.5rem] backdrop-blur-xl relative overflow-hidden">
             <motion.button
                onClick={startVoiceCommand}
                animate={isListening ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
                className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl z-10 transition-all hover:scale-105 active:scale-95 hover:ring-8 hover:ring-blue-500/20 ${isListening ? "bg-red-500 ring-red-500/30" : "bg-blue-600 ring-blue-600/20"}`}
             >
                <Mic className="w-14 h-14 text-white" />
             </motion.button>
             
             <div className="mt-8 text-center z-10 w-full">
                <h2 className="text-2xl font-black uppercase tracking-widest mb-2 text-white">TRẢI NGHIỆM GIỌNG NỐI</h2>
                <p className="text-slate-400 text-sm mb-6">Bấm vào Mic và nói câu lệnh để bắt đầu</p>
                <button 
                  type="button"
                  onClick={() => setShowCommandsInfo(!showCommandsInfo)}
                  className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-widest underline mb-6 inline-block font-sans"
                >
                  {showCommandsInfo ? "ẨN DANH SÁCH LỆNH" : "HIỆN DANH SÁCH LỆNH"}
                </button>
             </div>

             <AnimatePresence>
               {showCommandsInfo && (
                 <motion.div 
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: "auto" }}
                   exit={{ opacity: 0, height: 0 }}
                   className="w-full mt-2 space-y-3 overflow-hidden text-left max-h-[320px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800"
                 >
                   {voiceCommands.map((item, i) => (
                     <button
                       key={i}
                       type="button"
                       onClick={() => handleCommand(item.command)}
                       className="w-full px-4 py-3 bg-slate-900/40 hover:bg-slate-950/80 hover:border-blue-500 border border-slate-800/80 rounded-2xl text-[12px] font-semibold text-slate-200 flex items-center gap-4 transition-all"
                     >
                        <div className="w-6 h-6 rounded-full bg-red-600 flex flex-shrink-0 items-center justify-center text-[11px] font-black text-white">{i+1}</div>
                        <span className="flex-1 text-slate-100 pr-2 truncate text-left">{item.command}</span>
                     </button>
                   ))}
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          <div className="space-y-8 order-1 lg:order-2">
            <h2 className="text-3xl font-black italic tracking-tight">Tính năng AI-PRO 2.0</h2>
            <p className="text-slate-400 text-lg leading-relaxed">Không còn phải nhập liệu thủ công rườm rà. Tính năng hỗ trợ giọng nói giúp người lớn tuổi hoặc nhân viên tại kho dễ dàng ghi nhận đơn hàng, nhập kho và truy xuất báo cáo ngay lập tức.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: <Volume2 className="w-5 h-5" />, title: "Voice-to-Sheet", desc: "Tự động chuyển câu nói thành dữ liệu bảng tính." },
                { icon: <ShieldCheck className="w-5 h-5" />, title: "Bảo mật cao", desc: "Dữ liệu lưu trữ an toàn trên Google của chính bạn." },
                { icon: <Bot className="w-5 h-5" />, title: "AI Assistant", desc: "Hỏi đáp thông minh về số liệu kinh doanh." },
                { icon: <FileSpreadsheet className="w-5 h-5" />, title: "Excel Native", desc: "Không phụ thuộc vào phần mềm thứ ba." }
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="text-blue-500">{item.icon}</div>
                  <h4 className="font-bold text-sm uppercase tracking-wider">{item.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: QUẢN LÝ SẢN PHẨM TỰ THÊM */}
      {isAuthenticated && (
        <section className="py-10 px-6 max-w-7xl mx-auto">
            <div className="bg-slate-950/60 border border-slate-800 p-8 rounded-[2.5rem] text-left space-y-6">
              <div className="flex flex-col gap-6 border-b border-white/5 pb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-black uppercase tracking-wide flex flex-col">
                      <span className="text-white text-2xl tracking-normal">DANH SÁCH SẢN PHẨM TỰ THÊM</span>
                      <span className="text-yellow-500 text-sm tracking-[0.4em] font-black mt-2 pt-2 border-t border-yellow-500/30">(ADMIN PRODUCTS EDITOR)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Quản trị viên có thể trực tiếp tạo thêm sản phẩm mới. Các sản phẩm này sẽ được đồng bộ ngay lên danh sách bán hàng & chatbot.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddProductForm(!showAddProductForm)}
                    className={`px-5 py-2.5 font-black text-xs uppercase tracking-wider rounded-xl transition-colors shrink-0 ${showAddProductForm ? "bg-slate-700 text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white"}`}
                  >
                    {showAddProductForm ? "Đóng Form" : "+ Thêm sản phẩm mới"}
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
                  {["Tất cả", ...mainCategories].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => { setActiveAdminTab(tab); /* need to reset subcategory filter too */ }}
                      className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-colors whitespace-nowrap ${
                        activeAdminTab === tab ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                
                {/* Category Manager UI */}
                <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl flex gap-4 mt-4">
                  <select
                    className="bg-slate-950 text-white p-2 rounded-lg text-sm border border-slate-700"
                    onChange={(e) => setTargetCat(e.target.value)}
                  >
                    {mainCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input
                    className="bg-slate-950 text-white p-2 rounded-lg flex-1 text-sm border border-slate-700"
                    placeholder="Thêm tên mục con..."
                    value={newSub}
                    onChange={(e) => setNewSub(e.target.value)}
                  />
                  <button
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold"
                    onClick={handleAddSubcategory}
                  >
                    Thêm
                  </button>
                </div>

                {/* Subcategory List Manager */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-slate-800 rounded-xl">
                  {mainCategories.map(cat => (
                    <div key={cat} className="space-y-2">
                      <h4 className="text-white font-bold text-xs">{cat}</h4>
                      {categories[cat].map(sub => (
                        <div key={sub} className="flex items-center justify-between bg-slate-950 p-2 rounded-lg">
                          <span className="text-white text-xs">{sub}</span>
                          <button onClick={async () => {
                             const updatedCategories = { ...categories };
                             updatedCategories[cat] = updatedCategories[cat].filter(s => s !== sub);
                             const updatedConfig = { ...systemConfig, custom_categories: updatedCategories };
                             setIsSavingConfig(true);
                             try {
                               const resp = await fetch("/api/config", {
                                 method: "POST",
                                 headers: { "Content-Type": "application/json" },
                                 body: JSON.stringify(updatedConfig)
                               });
                               if (resp.ok) { alert("Đã xóa!"); window.location.reload(); }
                             } finally { setIsSavingConfig(false); }
                          }} className="text-red-500 hover:text-red-300">X</button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Product Form */}
              {showAddProductForm && (
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 shadow-2xl">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-200 uppercase tracking-wider block">Tên sản phẩm *:</label>
                    <input
                      type="text"
                      value={newProductForm.name}
                      onChange={(e) => setNewProductForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="VD: Bồn cầu YOHU Cao Cấp 1109"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-200 uppercase tracking-wider block">Giá bán *:</label>
                    <input
                      type="text"
                      value={newProductForm.price}
                      onChange={(e) => setNewProductForm(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="VD: 3.500.000đ"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-200 uppercase tracking-wider block">Danh mục nhóm sản phẩm *:</label>
                    <select
                      value={newProductForm.category}
                      onChange={(e) => setNewProductForm(prev => ({ ...prev, category: e.target.value, subCategory: "" }))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      {mainCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-200 uppercase tracking-wider block">Mục con:</label>
                    <select
                      value={newProductForm.subCategory}
                      onChange={(e) => setNewProductForm(prev => ({ ...prev, subCategory: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="">Chọn mục con (tùy chọn)...</option>
                      {categories[newProductForm.category]?.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-200 uppercase tracking-wider block">Hình Ảnh:</label>
                    <input
                      type="text"
                      value={newProductForm.image}
                      onChange={(e) => setNewProductForm(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-200 uppercase tracking-wider block">Giá cũ :</label>
                    <input
                      type="text"
                      value={newProductForm.oldPrice}
                      onChange={(e) => setNewProductForm(prev => ({ ...prev, oldPrice: e.target.value }))}
                      placeholder="e.g. 4.200.000đ"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-200 uppercase tracking-wider block">Tab Nhãn :</label>
                    <input
                      type="text"
                      value={newProductForm.discount}
                      onChange={(e) => setNewProductForm(prev => ({ ...prev, discount: e.target.value }))}
                      placeholder="VD: Giảm 20% hoặc Hot"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3 pt-6 border-t border-slate-800 flex gap-4">
                    <button
                      type="button"
                      onClick={handleAddCustomProduct}
                      disabled={isSavingConfig}
                      className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-900/20"
                    >
                      Lưu và Thêm sản phẩm
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddProductForm(false)}
                      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm uppercase tracking-wider rounded-xl transition-all"
                    >
                      Bỏ qua
                    </button>
                  </div>
                </div>
              )}

              {/* Products List Table */}
              <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/40">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-300 font-bold uppercase tracking-wider">
                      <th className="p-4">Ảnh</th>
                      <th className="p-4">Tên Sản Phẩm</th>
                      <th className="p-4">Nhóm Danh Mục</th>
                      <th className="p-4">Mục Con</th>
                      <th className="p-4">Hãng</th>
                      <th className="p-4">Giá Bán</th>
                      <th className="p-4">Khuyến Mãi</th>
                      <th className="p-4 text-center">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customProducts.filter((p: any) => activeAdminTab === "Tất cả" || p.category === activeAdminTab).length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500 font-semibold italic text-xs">
                          Chưa có sản phẩm nào trong danh mục này. Hãy nhấn "+ Thêm sản phẩm mới" để tạo.
                        </td>
                      </tr>
                    ) : (
                      customProducts.filter((p: any) => activeAdminTab === "Tất cả" || p.category === activeAdminTab).map((p: any) => (
                        <tr key={p.id} className="border-b border-slate-800/40 hover:bg-slate-900/40 transition-colors">
                          <td className="p-4 whitespace-nowrap">
                            <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-md border border-slate-800 bg-slate-900" />
                          </td>
                          <td className="p-4 font-bold text-slate-200">{p.name}</td>
                          <td className="p-4 text-slate-300 font-semibold">{p.category}</td>
                          <td className="p-4 text-slate-400 font-semibold">{p.subCategory || "-"}</td>
                          <td className="p-4 text-slate-400 font-semibold">{p.brand}</td>
                          <td className="p-4 font-black text-emerald-400">{p.price}</td>
                          <td className="p-4">
                            {p.discount ? (
                              <span className="px-2.5 py-1 bg-red-950/80 text-red-400 font-black rounded-lg text-[10px] uppercase border border-red-900/40">{p.discount}</span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                          <td className="p-4 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomProduct(p.id, p.name)}
                              className="px-3.5 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 hover:text-red-300 font-black tracking-wide rounded-lg uppercase transition-colors"
                            >
                              Xóa bỏ
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
        </section>
      )}

      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-widest">Bảng giá dịch vụ</h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm">Lựa chọn gói giải pháp phù hợp với quy mô kinh doanh của bạn. Thanh toán một lần cho sự ổn định lâu dài.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-[2.5rem] border border-slate-200 bg-white/80 space-y-8 hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
            <div className="space-y-2">
              <h3 className="font-black text-slate-900 uppercase tracking-widest">Gói Lite</h3>
              <p className="text-3xl font-black text-blue-600">Miễn phí</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase">Hộ kinh doanh nhỏ</p>
            </div>
            <ul className="space-y-4">
              {["Quản lý đơn hàng cơ bản", "Xuất PDF hóa đơn", "Báo cáo kinh doanh cơ bản"].map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> {feat}
                </li>
              ))}
            </ul>
            <button 
              type="button" 
              onClick={() => handleRegisterPlan("Gói Lite", "Miễn phí", "text-blue-600", ["Quản lý đơn hàng cơ bản", "Xuất PDF hóa đơn", "Báo cáo kinh doanh cơ bản"])}
              className="w-full py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-[0.98] cursor-pointer block"
            >
              Bắt đầu ngay
            </button>
          </div>

          <div className="p-8 rounded-[2.5rem] border-4 border-[#008060] bg-white space-y-8 shadow-2xl hover:scale-[1.02] transition-all duration-300 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#008060] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
              Phổ biến nhất
            </div>
            <div className="space-y-2">
              <h3 className="font-black text-slate-900 uppercase tracking-widest">Gói Standard</h3>
              <p className="text-3xl font-black text-[#008060]">99.000đ<span className="text-sm font-bold text-slate-400">/tháng</span></p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase">Thanh toán theo tháng</p>
            </div>
            <ul className="space-y-4">
              {["Đầy đủ tính năng Pro 2.0", "Nhập liệu giọng nói", "Kết nối Fchat cơ bản", "Hỗ trợ 24/7"].map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-xs text-slate-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#008060]" /> {feat}
                </li>
              ))}
            </ul>
            <button 
              type="button" 
              onClick={() => handleRegisterPlan("Gói Standard", "99.000đ / tháng", "text-[#008060]", ["Đầy đủ tính năng Pro 2.0", "Nhập liệu giọng nói", "Kết nối Fchat cơ bản", "Hỗ trợ 24/7"])}
              className="w-full py-4 bg-[#008060] hover:bg-[#007050] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer block"
            >
              Đăng ký ngay
            </button>
          </div>

          <div className="p-8 rounded-[2.5rem] border border-slate-200 bg-[#000033] text-white space-y-8 hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
            <div className="space-y-2">
              <h3 className="font-black uppercase tracking-widest opacity-80">Gói Pro</h3>
              <p className="text-3xl font-black text-red-500">999.000đ</p>
              <p className="text-[10px] opacity-40 font-bold uppercase">Thanh toán vĩnh viễn</p>
            </div>
            <ul className="space-y-4">
              {["Tất cả tính năng Standard", "Phân tích kinh doanh AI", "Cảnh báo kho & nợ tự động", "Tùy chỉnh form & PDF"].map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-red-500" /> {feat}
                </li>
              ))}
            </ul>
            <button 
              type="button" 
              onClick={() => handleRegisterPlan("Gói Pro", "999.000đ", "text-red-500", ["Tất cả tính năng Standard", "Phân tích kinh doanh AI", "Cảnh báo kho & nợ tự động", "Tùy chỉnh form & PDF"])}
              className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-[0.98] cursor-pointer block"
            >
              Mua ngay
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 7: CALL TO ACTION (HOTLINE CONTACT) */}
      <section className="py-20 px-6 bg-slate-100/60 border-t border-slate-200/50 rounded-[3rem] max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-8">
           <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase">
             Bạn đã sẵn sàng để <span className="text-red-600">chuyển đổi số?</span>
           </h2>
           <p className="text-slate-500 leading-relaxed font-semibold text-sm">
             Đừng để công việc kinh doanh trở nên gánh nặng chỉ vì sổ sách. Hãy trải nghiệm YOHU PRO 2.0 ngay hôm nay và cảm nhận sự khác biệt.
           </p>
           <div className="pt-4">
             <a href="tel:+84973480488" className="inline-flex items-center gap-4 px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl shadow-2xl shadow-blue-200 hover:scale-105 transition-all text-base tracking-widest uppercase">
                <Phone className="w-5 h-5 text-white" /> Hotline: 0973 480 488
             </a>
           </div>
        </div>
      </section>

      {/* LOCK INFORMATION MODAL */}
      <AnimatePresence>
        {showLockModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLockModal(false)}
              className="absolute inset-0 bg-[#000033]/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white border border-slate-100 rounded-[2.5rem] p-8 max-w-md w-full relative z-[160] shadow-2xl flex flex-col items-center text-center gap-6"
            >
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-100 flex-shrink-0 animate-bounce">
                <ShieldCheck className="w-8 h-8 text-red-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Tài liệu nội bộ bảo mật</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {lockMessage || "Đây là tài nguyên nội bộ của YOHU. Vui lòng đăng nhập với tài khoản Quản trị (Admin) để thực hiện thao tác này."}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row w-full gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLockModal(false)}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Đóng lại
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLockModal(false);
                    window.location.href = "/admin";
                  }}
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-100 transition-all"
                >
                  Đăng nhập Admin
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VOICE REPORT RESULT MODAL */}
      <AnimatePresence>
        {activeReport && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveReport(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white border border-slate-100 rounded-[2.5rem] p-8 max-w-lg w-full relative z-[160] shadow-2xl flex flex-col gap-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 flex-shrink-0">
                    <Mic className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest leading-none">Báo cáo YOHU AI</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Kết quả khớp lệnh tự động</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveReport(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-left">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Câu lệnh đã nhận diện:</span>
                  <p className="text-slate-900 font-medium text-sm mt-1">"{activeReport.command}"</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-2xl">
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">Doanh thu ghi nhận:</span>
                    <p className="text-emerald-800 font-black text-lg mt-1">{activeReport.revenue || "0đ"}</p>
                  </div>
                  <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-2xl">
                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">Lợi nhuận ghi nhận:</span>
                    <p className="text-blue-800 font-black text-lg mt-1">{activeReport.profit || "0đ"}</p>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-2.5 shadow-inner">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-[10px] uppercase tracking-widest">
                    <Volume2 className="w-4 h-4 text-indigo-400 animate-bounce" />
                    <span>Trợ lý đang phát đọc:</span>
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed font-semibold">"{activeReport.voiceReport}"</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                  <span>Tự động đóng sau {reportPopupCountdown}s</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveReport(null)}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-black text-xs uppercase tracking-widest rounded-xl transition-all"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PACKAGE REGISTRATION PLAN MODAL */}
      <AnimatePresence>
        {isPlanModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPlanModalOpen(false)}
              className="absolute inset-0 bg-[#000033]/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white border border-slate-100 rounded-[2.5rem] w-full max-w-lg relative z-[160] shadow-2xl flex flex-col overflow-hidden text-slate-900"
            >
              {/* Header */}
              <div className="bg-[#000033] text-white p-7 flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl" />
                <div className="space-y-1">
                  <span className="text-[9px] bg-red-600 text-white font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                    YOHU® SERVICE
                  </span>
                  <h3 className="text-lg font-black uppercase tracking-tight">ĐĂNG KÝ DỊCH VỤ</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 hover:scale-110 flex items-center justify-center transition-all duration-300 text-white shadow-lg active:scale-95 cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {planSuccess ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-12 text-center space-y-4 flex flex-col items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 border border-green-200 flex items-center justify-center mb-2 animate-bounce">
                    <CheckCircle2 className="w-8 h-8 stroke-[3]" />
                  </div>
                  <h4 className="text-lg font-extrabold text-slate-900 uppercase">Đăng ký thành công!</h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                    Cảm ơn anh chị <b>{planForm.name}</b>. Yêu cầu kích hoạt dịch vụ <b>{selectedPlanName} ({selectedPlanPrice})</b> đã được tiếp nhận và xử lý tự động. Chuyên viên chăm sóc khách hàng YOHU sẽ liên hệ sớm nhất qua số điện thoại <b>{planForm.phone}</b> để bàn giao hệ thống!
                  </p>
                  <div className="pt-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest animate-pulse">
                    Đang tự động đóng...
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handlePlanFormSubmit} className="p-8 space-y-6 text-left">
                  {/* Selected service summary */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gói đã chọn:</p>
                      <h4 className="text-base font-black text-slate-900 uppercase tracking-tight mt-0.5">{selectedPlanName}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Đơn giá:</p>
                      <p className={`text-lg font-black ${selectedPlanColor}`}>{selectedPlanPrice}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Họ và tên của bạn <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={planForm.name}
                        onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 transition-all focus:outline-none"
                        placeholder="Ví dụ: Nguyễn Văn A"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Số điện thoại liên hệ <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        required
                        value={planForm.phone}
                        onChange={(e) => setPlanForm({ ...planForm, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 transition-all focus:outline-none"
                        placeholder="Ví dụ: 0973480488"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Ghi chú yêu cầu thêm (nếu có)</label>
                      <textarea
                        value={planForm.notes}
                        onChange={(e) => setPlanForm({ ...planForm, notes: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 h-20 transition-all focus:outline-none resize-none"
                        placeholder="Nhập ghi chú hoặc thời gian thuận tiện để gọi lại cho bạn..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsPlanModalOpen(false)}
                      className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-blue-100 active:scale-95 transition-all cursor-pointer text-center"
                    >
                      TIẾP TỤC ĐĂNG KÝ
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
