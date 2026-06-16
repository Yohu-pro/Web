import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function initFirebase() {
  if (!getApps().length) {
    initializeApp({
      projectId: "gen-lang-client-0466013290",
    });
  }
  return getFirestore("ai-studio-879b6d96-172d-42d2-8081-c896c1489128");
}

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
  bank_account_name: "Phạm Văn Khải",
  bank_account_number: "0339606969",
  bank_name: "Ngân hàng Quân đội - MB Bank",
  gemini_api_key: "",
  gemini_model: "gemini-2.5-flash",
  bot_knowledge: "",
  custom_products: [],
};

export default async function handler(req, res) {
  const db = initFirebase();
  const docRef = db.collection("settings").doc("appConfig");

  if (req.method === "GET") {
    try {
      const doc = await docRef.get();
      if (doc.exists) {
        res.json({ ...DEFAULT_CONFIG, ...doc.data() });
      } else {
        res.json(DEFAULT_CONFIG);
      }
    } catch (error) {
      console.error("Firestore readConfig error:", error);
      res.json(DEFAULT_CONFIG);
    }
  } else if (req.method === "POST") {
    try {
      const current = (await docRef.get()).data() || {};
      const updated = { ...DEFAULT_CONFIG, ...current, ...req.body };
      await docRef.set(updated, { merge: true });
      res.json({ success: true });
    } catch (error) {
      console.error("Firestore writeConfig error:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
