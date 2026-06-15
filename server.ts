import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { google } from "googleapis";
import dotenv from "dotenv";
import multer from "multer";
import crypto from "crypto";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import firebaseConfig from "./firebase-applet-config.json";
import { PRODUCTS } from "./src/data/products";

dotenv.config();

// Initialize Firebase Admin
if (!getApps().length) {
  const activeKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (activeKey) {
    try {
      const credentials = JSON.parse(activeKey.trim());
      initializeApp({
        credential: cert(credentials)
      });
      console.log("✅ Firebase Admin: Initialized with Service Account Key.");
    } catch (e) {
      console.error("❌ Firebase Admin: Service Account Key parse error, falling back:", e);
      initializeApp();
    }
  } else {
    // In AI Studio, initializing with the explicit projectId from config ensures 
    // the identity targets the correct project database.
    initializeApp({
      projectId: firebaseConfig.projectId
    });
    console.log(`ℹ️ Firebase Admin: Initialized with platform credentials for ${firebaseConfig.projectId}.`);
  }
}

// Access the specific named database. 
const db = getFirestore(firebaseConfig.firestoreDatabaseId);

const upload = multer({ 
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  storage: multer.memoryStorage()
});

const DEFAULT_CONFIG = {
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
  bank_account_name: "Phạm Văn Khải",
  bank_account_number: "0339606969",
  bank_name: "Ngân hàng Quân đội - MB Bank",
  gemini_api_key: "",
  gemini_model: "gemini-3.5-flash",
  bot_knowledge: "",
  custom_products: [] as any[],
};

async function readConfig() {
  try {
    const doc = await db.collection("settings").doc("appConfig").get();
    if (doc.exists) {
      return { ...DEFAULT_CONFIG, ...doc.data() };
    }
    return DEFAULT_CONFIG;
  } catch (error) {
    console.error("Firestore readConfig error:", error);
    return DEFAULT_CONFIG;
  }
}

interface SheetCache {
  data: string;
  timestamp: number;
}
const sheetCacheMap = new Map<string, SheetCache>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedSheetContext(sheetId: string): Promise<string> {
  const now = Date.now();
  const cached = sheetCacheMap.get(sheetId);
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    console.log(`⚡ ChatBot: Serving sheet ${sheetId} context from cache.`);
    return cached.data;
  }

  try {
    console.log(`⚡ ChatBot: Fetching sheet ${sheetId} context via Service Account...`);
    const activeKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!activeKey) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is missing or empty.");
    }

    const credentials = JSON.parse(activeKey.trim());
    const jwtClient = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key.replace(/\\n/g, '\n'),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth: jwtClient });
    
    // First, try to list sheets to find if 'San_pham' exists, otherwise use the first sheet
    let targetRange = "San_pham!A:N";
    try {
      const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
      const sheetNames = spreadsheet.data.sheets?.map(s => s.properties?.title).filter(Boolean);
      if (sheetNames && sheetNames.length > 0 && !sheetNames.includes("San_pham")) {
        console.log(`💡 ChatBot: 'San_pham' tab not found in ${sheetId}. Using first tab: '${sheetNames[0]}'`);
        targetRange = `${sheetNames[0]}!A:N`;
      }
    } catch (metaErr) {
      console.warn("⚠️ ChatBot: Could not fetch spreadsheet metadata, defaulting to 'San_pham!A:N'");
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: targetRange,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      sheetCacheMap.set(sheetId, { data: "", timestamp: now });
      return "";
    }

    let output = "";
    for (const row of rows) {
      if (!row || row.length === 0) continue;
      const rowStr = row.map(cell => String(cell || "").replace(/\s+/g, ' ').trim()).join(" | ");
      if (output.length + rowStr.length > 3000) {
        break;
      }
      output += rowStr + "\n";
    }

    const trimmedOutput = output.trim();
    sheetCacheMap.set(sheetId, { data: trimmedOutput, timestamp: now });
    return trimmedOutput;
  } catch (error: any) {
    const errMsg = error.message || String(error);
    if (errMsg.includes("Unable to parse range") || errMsg.includes("not found")) {
      console.warn(`💡 ChatBot: Sheet 'San_pham' range not found for sheet ${sheetId}. Please add a 'San_pham' tab.`);
    } else {
      console.error("❌ ChatBot: Error fetching Google Sheet via Service Account:", errMsg);
    }
    if (cached) {
      console.log(`⚡ ChatBot: Fallback to stale sheet cache due to error.`);
      return cached.data;
    }
    return "";
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Config API
  app.get("/api/config", async (req, res) => {
    const config = await readConfig();
    res.json(config);
  });

  app.post("/api/config", async (req, res) => {
    try {
      await db.collection("settings").doc("appConfig").set(req.body, { merge: true });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Chat API
  app.post("/api/chat", upload.single("image"), async (req, res) => {
    try {
      const { message, apiKey, sheetContext } = req.body;
      const config = await readConfig();
      
      const candidateKeys: string[] = [];

      // 1. Prioritize keys from the live admin settings (Firestore)
      if (config.gemini_api_key && config.gemini_api_key.trim()) {
        const customKeys = config.gemini_api_key.split(",")
          .map((k: string) => k.trim())
          .filter((k: string) => k.length > 0);
        for (const k of customKeys) {
          if (!candidateKeys.includes(k)) {
            candidateKeys.push(k);
          }
        }
      }

      // 2. Fallback to the client sent override
      if (apiKey && apiKey.trim()) {
        const clientKeys = apiKey.split(",")
          .map((k: string) => k.trim())
          .filter((k: string) => k.length > 0);
        for (const k of clientKeys) {
          if (!candidateKeys.includes(k)) {
            candidateKeys.push(k);
          }
        }
      }

      // 3. Fallback to environment variables
      if (process.env.GEMINI_API_KEYS) {
        const envKeys = process.env.GEMINI_API_KEYS.split(",")
          .map(k => k.trim())
          .filter(k => k.length > 0);
        for (const k of envKeys) {
          if (!candidateKeys.includes(k)) {
            candidateKeys.push(k);
          }
        }
      }

      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
        const envKeys = process.env.GEMINI_API_KEY.split(",")
          .map(k => k.trim())
          .filter(k => k.length > 0);
        for (const k of envKeys) {
          if (!candidateKeys.includes(k)) {
            candidateKeys.push(k);
          }
        }
      }

      if (candidateKeys.length === 0) {
        return res.status(400).json({ error: "Vui lòng cấu hình Gemini API Key hoặc dán Key vào ô API để sử dụng Chatbot." });
      }

      console.log(`🤖 ChatBot: Khởi chạy xoay vòng với danh sách ${candidateKeys.length} API Keys.`);

      // Fetch sheet context using Service Account
      let serverSheetContext = "";
      if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        const sheetId = config.sheet_id || "163ZiScOOL2R9YJalt4RiBhPKZvV9yisVosD3lgeu5iQ";
        serverSheetContext = await getCachedSheetContext(sheetId);
      }

      const finalSheetContext = [serverSheetContext, sheetContext].filter(Boolean).join("\n\n");

      // Check for generic greetings to instantly reply with the exact requested welcome message
      const msgLower = (message || "").toLowerCase().trim();
      const nonAccentMsg = msgLower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      const generalKeywords = [
        "chao", "xin chao", "hello", "hi", "helo", "ban oi", "admin oi", "ad oi", "co ai ko", "co ai khong", 
        "bat dau", "start", "huong dan", "tro giup", "help", "yohu", "yohu viet nam"
      ];
      
      const inquiryKeywords = [
        "gioi thieu", "thong tin", "ben minh co gi", "ban gi", "cung cap gi", "co san pham gi", "muon mua"
      ];
      
      const productKeywords = [
        "sen", "cay", "voi", "chau", "rua", "bon", "cau", "solar", "dien", "mat", "troi", "pin", "dieu hoa", 
        "panasonic", "daikin", "casper", "lg", "funiki", "gree", "midea", "nagakawa", "samsung", "sumikura", 
        "sharp", "aqua", "bep", "ga", "gas", "say", "chen", "tu", "inox"
      ];

      const isGeneral = !msgLower || 
        generalKeywords.some(keyword => nonAccentMsg === keyword || (nonAccentMsg.startsWith(keyword) && nonAccentMsg.length <= keyword.length + 3)) ||
        (inquiryKeywords.some(keyword => nonAccentMsg.includes(keyword)) && !productKeywords.some(prodKeyword => nonAccentMsg.includes(prodKeyword)));

      if (isGeneral && !req.file) {
        console.log("⚡ ChatBot: Intercepted general inquiry, replying with welcome template.");
        return res.json({ 
          text: `Xin chào! Tôi là Trợ lý tư vấn Yohu Việt Nam 👋
Tôi có thể giúp bạn:

- Tư vấn chọn sản phẩm phù hợp (điều hòa, bồn nước, năng lượng mặt trời, thiết bị vệ sinh, thiết bị bếp...)
- Tra cứu giá, thông số kỹ thuật
- Hướng dẫn đặt hàng và chính sách bảo hành

Bạn có thể gửi ảnh sản phẩm để tôi tư vấn chính xác hơn. Bạn cần hỗ trợ gì hôm nay?` 
        });
      }

      // Merge dynamic custom products from settings with standard/static PRODUCTS so chatbot is fully aware!
      const customProducts = config.custom_products || [];
      const consolidatedProducts = [...PRODUCTS, ...customProducts];
      const productSummary = consolidatedProducts.map(p => `- ${p.name}: ${p.price} (Category: ${p.category}${p.brand ? `, Brand: ${p.brand}` : ""})`).join("\n");

      const prompt = `Bạn là trợ lý AI thông minh cho Công ty TNHH Yohu Việt Nam.
      Thông tin công ty:
      - Tên: ${config.company_name}
      - Địa chỉ: ${config.address}
      - Hotline: ${config.hotline}
      - Zalo: ${config.zalo}
      - Email: ${config.email_primary}, ${config.email_secondary}
      
      QUY TẮC THƯƠNG HIỆU & HÃNG SẢN PHẨM:
      1. Hãy tập trung giới thiệu và trả lời các thương hiệu/hãng lớn chính hãng.
      2. Đối với TOÀN BỘ Thiết bị vệ sinh (bồn cầu, sen vòi, sen cây, bồn tiểu...), thương hiệu bắt buộc phải là "YOHU" (ví dụ: bồn cầu YOHU, sen cây YOHU).
      3. Đối với bồn nước: thương hiệu bắt buộc là "Hwata" (ví dụ: Bồn nước Hwata - bỏ qua thương hiệu YOHU ra khỏi tất cả các nội dung bồn nước này là: "Bồn nước Hwata", không được viết bồn nước YOHU).
      
      QUY TẮC PHẢN HỒI LỜI CHÀO/CÂU HỎI TRONG CHUNG:
      Nếu người dùng chào hỏi chung chung hoặc khởi động hội thoại, bạn cần phản hồi mẫu lời chào sau:
      "Xin chào! Tôi là Trợ lý tư vấn Yohu Việt Nam 👋
      Tôi có thể giúp bạn:
      - Tư vấn chọn sản phẩm phù hợp (điều hòa, bồn nước, năng lượng mặt trời, thiết bị vệ sinh, thiết bị bếp...)
      - Tra cứu giá, thông số kỹ thuật
      - Hướng dẫn đặt hàng và chính sách bảo hành
      
      Bạn có thể gửi ảnh sản phẩm để tôi tư vấn chính xác hơn. Bạn cần hỗ trợ gì hôm nay?"
      
      Công việc: Hỗ trợ giải đáp về các thiết bị vệ sinh YOHU, bồn nước Hwata, điện mặt trời VicSolar, tủ bếp inox, điều hòa và tư vấn khách hàng.
      
      Kiến thức sản phẩm hiện tại:
      ${productSummary}
      
      Kiến thức bổ trợ (Bảng giá/Catalogue):
      ${config.bot_knowledge || "Chưa có dữ liệu bảng giá bổ sung."}
      
      Dữ liệu từ tài chính Google Sheets:
      ${finalSheetContext || "Không có dữ liệu Sheets bổ sung."}
      
      HƯỚNG DẪN:
      1. Hãy trả lời chuyên nghiệp, thân thiện, súc tích bằng tiếng Việt.
      2. Nếu khách hàng hỏi về giá, hãy ưu tiên thông tin từ "Kiến thức sản phẩm hiện tại" hoặc "Kiến thức bổ trợ".
      3. Nếu khách hàng tải ảnh sản phẩm lên, hãy phân tích ảnh và tư vấn dựa trên kiến thức sản phẩm.
      
      Câu hỏi: ${message || "Người dùng đã tải một hình ảnh. Bạn vui lòng phân tích và tư vấn."}`;

      const contents: any[] = [{
        role: "user",
        parts: [{ text: prompt }]
      }];

      // Add image if present
      if (req.file) {
        contents[0].parts.push({
          inlineData: {
            mimeType: req.file.mimetype,
            data: req.file.buffer.toString("base64")
          }
        });
      }

      let generateResult: any = null;

      // Determine robust candidate models. Prioritize gemini-3.5-flash & gemini-3.1-flash-lite as free state-of-the-art models!
      const chosenModel = config.gemini_model?.trim() || "gemini-3.5-flash";
      const fallbackModels = [
        "gemini-3.5-flash",
        "gemini-3.1-flash-lite",
        "gemini-2.1-flash",
        "gemini-2.5-flash"
      ];

      const modelsToTry = [chosenModel];
      for (const m of fallbackModels) {
        if (!modelsToTry.includes(m)) {
          modelsToTry.push(m);
        }
      }

      // Key Rotation core logic
      for (let i = 0; i < candidateKeys.length; i++) {
        const currentKey = candidateKeys[i];
        let keySucceeded = false;

        for (const currentModel of modelsToTry) {
          try {
            console.log(`🤖 ChatBot: Đang thử model "${currentModel}" với API Key index ${i}...`);
            const ai = new GoogleGenAI({
              apiKey: currentKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                }
              }
            });

            const response = await ai.models.generateContent({
              model: currentModel,
              contents: contents
            });

            generateResult = response;
            keySucceeded = true;
            console.log(`✅ ChatBot: Key index ${i} chạy thành công bằng model "${currentModel}"!`);
            break; // Succeeded! Stop iterating models for this key
          } catch (err: any) {
            console.error(`❌ ChatBot: Gặp lỗi ở Key index ${i} với Model "${currentModel}":`, err.message || err);

            const errMsg = String(err.message || "").toLowerCase();
            const isQuotaOrRateLimit = errMsg.includes("429") || 
                                       errMsg.includes("quota") || 
                                       errMsg.includes("limit") || 
                                       errMsg.includes("exhausted") || 
                                       errMsg.includes("resource") ||
                                       err.status === 429;

            const isKeyDenied = errMsg.includes("denied") || 
                                errMsg.includes("403") || 
                                errMsg.includes("permission") ||
                                errMsg.includes("api_key_invalid") ||
                                err.status === 403;

            if (isQuotaOrRateLimit || isKeyDenied) {
              console.log("➡️ ChatBot: Lỗi quá hạn mức (Quota Limit) hoặc Sai Key. Tự động xoay vòng sang Key tiếp theo...");
              break; // Break the current model loop, proceed to try next API key in outermost loop
            }

            console.log(`➡️ ChatBot: Thử tiếp model dự phòng khác cho cùng API Key...`);
          }
        }

        if (keySucceeded) {
          break; // Key rotation loop is complete since we succeeded.
        }
      }

      if (!generateResult) {
        console.error("❌ ChatBot: Toàn bộ API Keys đều lỗi hoặc quá hạn mức.");
        return res.status(500).json({ error: "Hệ thống chatbot đang bận/quá hạn mức cuộc gọi miễn phí. Vui lòng thử lại sau chút ít hoặc liên hệ Zalo/Hotline hỗ trợ trực tiếp." });
      }

      res.json({ text: generateResult.text });
    } catch (error: any) {
      console.error("General chat error:", error);
      res.status(500).json({ error: "Thành phần cuộc hỏi thoại gặp lỗi kỹ thuật. Vui lòng liên hệ Hotline." });
    }
  });

  // API to receive and append orders to Google Sheets
  app.post("/api/orders", async (req, res) => {
    try {
      const { customer, items } = req.body;

      if (!customer || !customer.name || !customer.phone || !customer.address) {
        return res.status(400).json({ error: "Thông tin khách hàng không đầy đủ" });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Giỏ hàng trống" });
      }

      const activeKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
      if (!activeKey) {
        console.error("GOOGLE_SERVICE_ACCOUNT_KEY is empty or missing in environment variables!");
        return res.status(400).json({ 
          error: "Hiện tại, YHU chưa kết nối được hệ thống ghi đơn. Quý khách vui lòng liên hệ Zalo hoặc số Hotline để chốt đơn ngay lập tức!" 
        });
      }

      const config = await readConfig();
      const spreadsheetId = config.sheet_id || "163ZiScOOL2R9YJalt4RiBhPKZvV9yisVosD3lgeu5iQ";

      // Formulate unique Order Code YH-YYYYMMDD-XXX
      const vnDate = new Date();
      const formatter = new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'Asia/Ho_Chi_Minh'
      });
      const parts = formatter.formatToParts(vnDate);
      const day = parts.find(p => p.type === 'day')?.value || '01';
      const month = parts.find(p => p.type === 'month')?.value || '01';
      const year = parts.find(p => p.type === 'year')?.value || '2026';
      const dateStr = `${year}${month}${day}`;
      const orderCode = `YH-${dateStr}-${Math.floor(100 + Math.random() * 900)}`;

      const timestamp = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

      const parsePrice = (priceStr: string): number => {
        const cleanNum = (priceStr || "").replace(/[^0-9]/g, '');
        return cleanNum ? parseInt(cleanNum, 10) : 0;
      };

      const rowsJson = items.map((item: any) => {
        const quantityVal = parseInt(item.quantity, 10) || 1;
        const priceVal = parsePrice(item.price);
        const totalVal = priceVal * quantityVal;
        const formattedTotal = totalVal.toLocaleString('vi-VN') + 'đ';

        return [
          timestamp,                           // Thời gian
          orderCode,                           // Mã đơn hàng
          customer.name,                       // Tên khách hàng
          customer.businessName || "",         // Đơn vị kinh doanh
          customer.taxId || "",                // Mã số thuế
          customer.phone,                      // SĐT
          customer.address,                    // Địa chỉ
          (item.id || "").toUpperCase(),       // Mã sản phẩm (id viết hoa)
          item.name,                           // Tên sản phẩm
          item.unit || "Cái",                  // Đơn vị tính
          quantityVal,                         // Số lượng
          item.price,                          // Giá bán
          formattedTotal                       // Thành tiền
        ];
      });

      // Prepare Google Jwt Authentication Client
      const credentials = JSON.parse(activeKey.trim());
      const jwtClient = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key.replace(/\\n/g, '\n'),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const sheets = google.sheets({ version: "v4", auth: jwtClient });

      try {
        // Append row to the sheet Don_Hang_Chi_Tiet
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: "Don_Hang_Chi_Tiet!A:M",
          valueInputOption: "USER_ENTERED",
          insertDataOption: "INSERT_ROWS",
          requestBody: {
            values: rowsJson
          }
        });
      } catch (sheetErr: any) {
        const msg = sheetErr.message || String(sheetErr);
        if (msg.includes("not found") || msg.includes("Unable to parse range") || sheetErr.status === 404) {
          console.warn("⚠️ Google Sheets tab missing:", msg);
          return res.status(400).json({ 
            error: "Hệ thống không tìm thấy tab 'Don_Hang_Chi_Tiet' trong bảng tính của Quý khách. Vui lòng tạo tab này trước." 
          });
        }
        console.error("Google Sheets append API failed:", sheetErr);
        throw sheetErr;
      }

      res.json({ success: true, orderCode });
    } catch (error: any) {
      console.error("Order processing error:", error);
      res.status(500).json({ error: `Có lỗi hệ thống khi lưu đơn hàng: ${error.message}` });
    }
  });

  // API to receive and append registrations to Google Sheets
  app.post("/api/register-sheet", async (req, res) => {
    try {
      const { email, phone, domain, display_name, package_name, industry } = req.body;

      const activeKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
      if (!activeKey) {
        console.warn("GOOGLE_SERVICE_ACCOUNT_KEY is missing, skipping sheet registration.");
        return res.json({ success: true, message: "Firestore saved, but Sheet sync skipped." });
      }

      const config = await readConfig();
      const spreadsheetId = config.sheet_id || "163ZiScOOL2R9YJalt4RiBhPKZvV9yisVosD3lgeu5iQ";
      const timestamp = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

      const row = [
        timestamp,
        email,
        phone || "",
        display_name || "",
        domain || "",
        package_name || "1.000.000đ",
        industry || "",
        "CHỜ PHÊ DUYỆT" // Trạng thái ban đầu
      ];

      const credentials = JSON.parse(activeKey.trim());
      const jwtClient = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key.replace(/\\n/g, '\n'),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const sheets = google.sheets({ version: "v4", auth: jwtClient });

      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: "Khach_Hang!A:H",
          valueInputOption: "USER_ENTERED",
          insertDataOption: "INSERT_ROWS",
          requestBody: {
            values: [row]
          }
        });
      } catch (sheetErr: any) {
        console.warn("Sheet sync error (Khach_Hang tab might be missing):", sheetErr.message);
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Registration sheet sync error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Sheets Proxy API for Admin/Voice Reporting
  app.post("/api/sheets/fetch", async (req, res) => {
    const { sheetId, range, accessToken } = req.body;

    try {
      let sheetsClient;

      // Determine initial client
      if (accessToken && accessToken !== "null" && accessToken !== "undefined" && accessToken !== "service_account") {
        try {
          const auth = new google.auth.OAuth2();
          auth.setCredentials({ access_token: accessToken });
          sheetsClient = google.sheets({ version: "v4", auth });
          
          // Test the token
          await sheetsClient.spreadsheets.get({ spreadsheetId: sheetId || "163ZiScOOL2R9YJalt4RiBhPKZvV9yisVosD3lgeu5iQ" });
        } catch (tokenErr) {
          console.warn("⚠️ Provided google_access_token is invalid or expired. Falling back to service account.");
          sheetsClient = null;
        }
      }

      // Fallback to service account if no client or token failed
      if (!sheetsClient) {
        const activeKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
        if (!activeKey) {
          return res.status(401).json({ error: "Access token is invalid and no service account configured." });
        }
        const credentials = JSON.parse(activeKey.trim());
        const jwtClient = new google.auth.JWT({
          email: credentials.client_email,
          key: credentials.private_key.replace(/\\n/g, '\n'),
          scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        });
        await jwtClient.authorize();
        sheetsClient = google.sheets({ version: "v4", auth: jwtClient });
      }
      
      const response = await sheetsClient.spreadsheets.values.get({
        spreadsheetId: sheetId || "163ZiScOOL2R9YJalt4RiBhPKZvV9yisVosD3lgeu5iQ",
        range: range || "Don_Hang_Chi_Tiet!A1:Z500",
      });
      
      res.json({ values: response.data.values });
    } catch (error: any) {
      console.error("Sheets fetch error final:", error.message || error);
      res.status(500).json({ error: error.message || "Failed to fetch Sheet data." });
    }
  });

  // ImageKit authentication endpoint for secure uploads
  app.get("/api/imagekit-auth", (req, res) => {
    try {
      // Use custom private key from query or fallback to env
      const customPrivateKey = req.query.privateKey as string;
      const privateKey = customPrivateKey || process.env.IMAGEKIT_PRIVATE_KEY;
      
      if (!privateKey) {
        return res.status(400).json({ 
          error: "Biến môi trường IMAGEKIT_PRIVATE_KEY chưa được cấu hình và không có key tùy chỉnh!" 
        });
      }
      const token = (req.query.token as string) || crypto.randomUUID();
      const expire = (req.query.expire as string) || String(Math.floor(Date.now() / 1000) + 1800);
      const signature = crypto
        .createHmac("sha1", privateKey)
        .update(token + expire)
        .digest("hex");
        
      res.json({ token, expire, signature });
    } catch (error: any) {
      console.error("ImageKit auth error:", error);
      res.status(500).json({ error: `Lỗi sinh chữ ký: ${error.message}` });
    }
  });

  // NEW: Deploy Pipeline API
  app.post("/api/deploy", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Thiếu email tài khoản" });

    try {
      console.log(`🚀 Bắt đầu quy trình triển khai cho: ${email}`);
      
      const githubToken = process.env.GITHUB_TOKEN;
      const vercelToken = process.env.VERCEL_TOKEN;

      if (!githubToken || !vercelToken) {
        return res.status(500).json({ error: "Hệ thống chưa cấu hình Token GitHub/Vercel của Super Admin." });
      }

      // 1. Logic gọi GitHub API tạo Repo mới từ Template
      // 2. Logic gọi Vercel API để Deploy
      
      // Giả lập phản hồi thành công (User sẽ chờ web được build)
      res.json({ 
        success: true, 
        message: "Pipeline started",
        github_repo: `https://github.com/yohu-platform/${email.replace(/@/g, '-')}`,
        vercel_link: `https://${email.split('@')[0]}-preview.vercel.app`
      });

    } catch (err: any) {
      console.error("Deploy error:", err);
      res.status(500).json({ error: "Lỗi kết nối API GitHub/Vercel: " + err.message });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
