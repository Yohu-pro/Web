export const DEFAULT_PRODUCT_CATEGORIES: CategoryStructure = {
  "ĐIỀU HÒA": ["Daikin", "Panasonic", "LG", "Mitsubishi"],
  "BỘ NĂNG LƯỢNG MẶT TRỜI": ["Hệ thống Hybrid", "Hệ thống Bán điện lướt", "Hệ thống Độc lập"],
  "THIẾT BỊ VỆ SINH": ["Bồn cầu YOHU", "Sen vòi", "Chậu lavabo", "Phụ kiện nhà tắm"],
  "THIẾT BỊ BẾP": ["Bếp từ", "Chậu rửa bát", "Vòi rửa bát"]
};

export interface CategoryStructure {
  [key: string]: string[];
}

export interface SiteConfig {
  company_name: string;
  address: string;
  hotline: string;
  zalo: string;
  email_primary: string;
  email_secondary: string;
  facebook: string;
  fanpage: string;
  sheet_id: string;
  form_id: string;
  folder_main_id: string;
  kqkd_report_id: string;
  xnt_report_id: string;
  invoice_pdf_id: string;
  sample_files_id: string;
  gemini_api_key?: string;
  hero_image?: string;
  price_list_url?: string;
  catalogue_url?: string;
  bot_knowledge?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_name?: string;
  gemini_model?: string;
  custom_products?: any[];
  custom_categories?: CategoryStructure;
  video_guides?: { id: string, title: string, description: string, youtube_url: string }[];
  home_content?: string;
  support_content?: string;
  article_image_url?: string;
  article_video_url?: string;
}

export interface UserConfig {
  imagekitPrivateKey: string;
  imagekitPublicKey: string;
  imagekitUrlEndpoint: string;
  siteUrl: string;
  paymentStatus: 'unpaid' | 'trial' | 'paid';
  package: string;
  domain: string;
  domainExtension?: string;
  layout: string;
  tabs: string;
  language: string;
  phone?: string;
  industry?: string;
  additionalLanguages?: string[];
  note?: string;
  isActive?: boolean;
  status?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand?: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  image: string;
  images?: string[];
  rating: number;
}

export interface ChatMessage {
  role: "user" | "model" | "system";
  content: string;
}

export interface Asset {
  id: string;
  url: string;
  type: "image" | "pdf";
  name: string;
  createdAt: string;
}
