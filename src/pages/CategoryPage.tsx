import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { PRODUCTS } from "../data/products";
import { SiteConfig, DEFAULT_PRODUCT_CATEGORIES } from "../types";
import { Star, ShoppingCart, Zap, Battery, Sun, Cpu, Droplets, ShowerHead, Layers, CircleDot } from "lucide-react";
import EditableText from "../components/EditableText";
import EditableImage from "../components/EditableImage";
import EditableProductCarousel from "../components/EditableProductCarousel";
import { useCart } from "../lib/CartContext";

export default function CategoryPage({ config }: { config: SiteConfig }) {
  const { categoryId } = useParams<{ categoryId: string }>();
  const location = useLocation();
  const [activeSolarTab, setActiveSolarTab] = useState("hybrid");
  const { addToCart } = useCart();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get("tab");
    if (tabParam) {
      setActiveSolarTab(tabParam);
    } else {
      setActiveSolarTab("hybrid");
    }
  }, [location.search, categoryId]);
  
  // Brand/Category specific data mapping
  const BRAND_DETAILS: Record<string, any> = {
    "daikin": {
      name: "DAIKIN",
      tagline: "🇯🇵 Thương hiệu Nhật Bản – Số 1 Thế Giới về Điều Hòa",
      icon: "DAI KIN",
      color: "bg-blue-600",
      description: "Daikin là thương hiệu Nhật Bản dẫn đầu toàn cầu về điều hòa không khí với hơn 90 năm kinh nghiệm. Nổi tiếng với độ bền vượt trội và khả năng làm lạnh hiệu quả ngay cả trong điều kiện khắc nghiệt.",
      features: [
        "Công nghệ Inverter Swing Compressor độc quyền",
        "Bộ lọc Flash Streamer diệt khuẩn, loại bỏ virus",
        "Vận hành cực êm (19 dB)",
        "Chế độ Coanda Airflow bảo vệ sức khỏe"
      ],
      image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=800"
    },
    "panasonic": {
      name: "PANASONIC",
      tagline: "🇯🇵 Công nghệ Nhật – Lọc sạch không khí tận gốc",
      icon: "PAN AS",
      color: "bg-[#0044a0]",
      description: "Panasonic nổi tiếng với hệ thống lọc không khí nanoe™ X – công nghệ tạo ra các gốc hydroxyl có khả năng ức chế virus, vi khuẩn, mùi hôi và nấm mốc.",
      features: [
        "Công nghệ nanoe™ X lọc sạch 99.99% vi khuẩn",
        "Cảm biến iAuto-X tự nhận diện nhiệt độ cơ thể",
        "Chế độ ECONAVI tiết kiệm điện thêm 30%",
        "Kết nối Wi-Fi thông minh qua app"
      ],
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800"
    },
    "lg": {
      name: "LG",
      tagline: "🇰🇷 Công nghệ Hàn Quốc – Tiết kiệm điện 70%",
      icon: "LG",
      color: "bg-[#a50034]",
      description: "LG tiên phong với Dual Inverter Compressor™ giúp làm lạnh nhanh hơn 40% và tiêu thụ điện ít hơn 70% so với máy thường.",
      features: [
        "Dual Inverter Compressor™ bảo hành 10 năm",
        "Làm lạnh cực nhanh trong 12 phút",
        "Chế độ Monsoon Comfort kiểm soát độ ẩm",
        "ThinQ™ AI tự động học thói quen sử dụng"
      ],
      image: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&q=80&w=800"
    },
    "funiki": {
      name: "FUNIKI",
      tagline: "🇻🇳 Thương hiệu Việt – Bền bỉ cho khí hậu nhiệt đới",
      icon: "FUN IKI",
      color: "bg-[#007a3d]",
      description: "Funiki (Hòa Phát) được thiết kế đặc biệt cho khí hậu nóng ẩm Việt Nam, hoạt động ổn định ngay cả khi nhiệt độ ngoài trời lên tới 52°C.",
      features: [
        "Hoạt động ổn định dải nhiệt 15°C - 52°C",
        "Bộ lọc bụi than hoạt tính khử mùi",
        "Giá thành tiếp cận nhất phân khúc Inverter",
        "Bảo hành chính hãng Hòa Phát toàn quốc"
      ],
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800"
    },
    "casper": {
      name: "CASPER",
      tagline: "🇹🇭 Thương hiệu Thái Lan – Kiểu dáng hiện đại",
      icon: "CAS PER",
      color: "bg-[#2c3e7a]",
      description: "Casper (Thái Lan) đang chiếm lĩnh phân khúc tầm trung với tích hợp Wi-Fi và điều khiển thông minh chuẩn ngay từ bản cơ sở.",
      features: [
        "Wi-Fi tích hợp sẵn điều khiển từ xa",
        "Chế độ Auto Clean tự làm sạch dàn lạnh",
        "Cảm biến Human Detection thông minh",
        "Màn hình LED ẩn thẩm mỹ cao"
      ],
      image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800"
    },
    "gree": {
      name: "GREE",
      tagline: "🇨🇳 Hãng sản xuất lớn nhất thế giới – Công suất mạnh",
      icon: "GREE",
      color: "bg-[#006633]",
      description: "Gree nổi bật ở dòng máy công suất lớn với khả năng làm lạnh phòng diện tích rộng hiệu quả và giá thành cực kỳ cạnh tranh.",
      features: [
        "Máy nén G10 Inverter tự sản xuất",
        "Làm lạnh mạnh cho phòng 40-80m2",
        "Chế độ I-Feel cảm biến nhiệt chính xác",
        "Dàn tản nhiệt mạ vàng Golden Fin"
      ],
      image: "https://images.unsplash.com/photo-1534237710431-e2fc698436d0?auto=format&fit=crop&q=80&w=800"
    },
    "midea": {
      name: "MIDEA",
      tagline: "🌐 Thương hiệu toàn cầu – Giá tốt nhất phân khúc",
      icon: "MID EA",
      color: "bg-[#c0392b]",
      description: "Midea mang đến công nghệ Inverter cao cấp với mức giá cực tốt, vận hành ổn định trong dải nhiệt độ khắc nghiệt.",
      features: [
        "Vận hành dải nhiệt -15°C đến 54°C",
        "Chế độ Follow Me tối ưu sự thoải mái",
        "Bộ lọc Silver Ion kháng khuẩn 24/7",
        "Công nghệ Xtreme Save tiết kiệm điện"
      ],
      image: "https://images.unsplash.com/photo-1564069114553-7215e1ff1890?auto=format&fit=crop&q=80&w=800"
    },
    "dieu-hoa": {
      name: "ĐIỀU HÒA",
      tagline: "❄️ Giải Pháp Làm Lạnh Toàn Diện – Công Nghệ Nhật Bản & Thái Lan",
      icon: "AIR CON",
      color: "bg-blue-700",
      description: "Tổng kho điều hòa chính hãng từ các thương hiệu hàng đầu thế giới. Cam kết giá rẻ nhất thị trường, lắp đặt chuyên nghiệp trong ngày.",
      features: [
        "Tiết kiệm điện Inverter vượt trội",
        "Lọc không khí, diệt khuẩn 99%",
        "Vận hành êm ái, bảo hành chính hãng",
        "Miễn phí công lắp đặt & vật tư (tùy model)"
      ],
      image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=800"
    },
    "thiet-bi-ve-sinh": {
      name: "THIẾT BỊ VỆ SINH",
      tagline: "🚽 Phòng Tắm Sang Trọng – Tiện Nghi Hiện Đại",
      icon: "BATH ROOM",
      color: "bg-cyan-700",
      description: "Yohu Vietnam cung cấp giải pháp thiết bị vệ sinh cao cấp: Bồn cầu thông minh, sen cây, chậu rửa và phụ kiện phòng tắm chuẩn quốc tế.",
      features: [
        "Men sứ Nano kháng khuẩn, chống bám bẩn",
        "Công nghệ xả xoáy Siphon mạnh mẽ",
        "Thiết kế tinh tế, tối ưu không gian",
        "Bảo hành phần sứ lên đến 10 năm"
      ],
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800"
    },
    "thiet-bi-bep": {
      name: "THIẾT BỊ BẾP",
      tagline: "🍳 Bếp Hồng Ngoại – Bếp Từ – Máy Hút Mùi Cao Cấp",
      icon: "KITCH EN",
      color: "bg-orange-600",
      description: "Nâng tầm căn bếp Việt với các thiết bị thông minh, an toàn và tiết kiệm điện năng. Thiết kế sang trọng, dễ dàng vệ sinh.",
      features: [
        "Mặt kính Schott Ceran chịu lực, chịu nhiệt",
        "Công nghệ Inverter tiết kiệm 35% điện",
        "Khóa an toàn trẻ em & Tự ngắt khi quá nhiệt",
        "Hỗ trợ lắp đặt âm tủ thẩm mỹ"
      ],
      image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800"
    },
    "bo-nang-luong-mat-troi": {
      name: "BỘ NĂNG LƯỢNG MẶT TRỜI",
      tagline: "☀️ Năng Lượng Sạch – Tiết Kiệm Điện Thực Tế", // Match reference tagline
      icon: "SOL AR",
      color: "bg-orange-500",
      description: "Giải pháp điện mặt trời toàn diện cho hộ gia đình và doanh nghiệp. Hoàn vốn trong 4–6 năm, tiết kiệm hóa đơn điện 60–100%.",
      stats: [
        { label: "Combo sản phẩm", value: "29+" },
        { label: "Tiết kiệm điện", value: "70%" },
        { label: "Năm bảo hành", value: "10" },
        { label: "Năm hoàn vốn", value: "5–6" }
      ],
      features: [
        "Tiết kiệm 700k - 5 triệu tiền điện mỗi tháng",
        "Bảo hành hệ thống lên đến 10 năm",
        "Tấm pin Mono hiệu suất cao bền bỉ 25 năm",
        "Hỗ trợ kỹ thuật trọn đời từ Yohu Vietnam"
      ],
      sections: [
        {
          id: "hybrid",
          title: "Hệ Thống Điện Mặt Trời Hybrid",
          subtitle: "Vừa dùng điện mặt trời – vừa lưu trữ pin – vừa kết nối lưới điện quốc gia",
          description: "Hệ thống Hybrid là giải pháp thông minh nhất trong điện mặt trời: kết hợp 3 nguồn năng lượng – pin mặt trời, bộ lưu trữ (acquy/lithium) và lưới điện quốc gia.",
          features: [
            "Hoạt động liên tục 24/7 dù trời mưa hay mất điện lưới",
            "Inverter Hybrid tự động chuyển nguồn trong <20ms",
            "Tích hợp màn hình theo dõi sản lượng thực tế",
            "Bảo hành hệ thống 5–10 năm"
          ],
          image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=800"
        },
        {
          id: "grid-tied",
          title: "Hệ Thống Điện Mặt Trời Hòa Lưới",
          subtitle: "Bán điện dư lên lưới – Tiết kiệm hóa đơn điện ngay",
          description: "Hệ thống hòa lưới (Grid-tie) là loại phổ biến và tiết kiệm chi phí đầu tư nhất. Điện mặt trời ưu tiên dùng trước, phần dư bán lại EVN.",
          features: [
            "Chi phí đầu tư thấp nhất – không cần bộ lưu trữ",
            "Tiết kiệm hóa đơn điện ngay từ tháng đầu",
            "Điện dư tự động bán lại EVN",
            "Hoàn vốn nhanh hơn: 3–5 năm"
          ],
          image: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&q=80&w=800"
        },
        {
          id: "storage",
          title: "Thiết Bị Lưu Trữ Điện",
          subtitle: "Pin Lithium LFP – Công nghệ lưu trữ an toàn nhất",
          description: "Pin lưu trữ là trái tim của hệ thống Hybrid. VicSolar phân phối pin LS Battery (Hàn Quốc) an toàn, không phát nổ, tuổi thọ lên đến 15-20 năm.",
          features: [
            "Pin Lithium LFP an toàn tuyệt đối",
            "Tuổi thọ 6.000+ chu kỳ (15-20 năm)",
            "Lắp tường gọn gàng, thẩm mỹ cao",
            "Bảo hành chính hãng 5-10 năm"
          ],
          image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800"
        },
        {
          id: "panels",
          title: "Tấm Pin Năng Lượng Mặt Trời",
          subtitle: "Mono PERC Half-Cell & TOPCon cao cấp",
          description: "VicSolar cung cấp tấm pin Monocrystalline công nghệ Half-Cell và TOPCon tiên tiến nhất hiện nay, hiệu suất vượt trội kể cả khi trời âm u.",
          features: [
            "Công nghệ Mono PERC Half-Cell hiệu suất 21-22%",
            "Bảo hành công suất lên đến 25 năm",
            "Chịu được mọi điều kiện thời tiết khắc nghiệt",
            "Đạt chuẩn chất lượng IEC quốc tế"
          ],
          image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=800"
        }
      ],
      image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=800"
    },
    "tb-ve-sinh": {
      name: "THIẾT BỊ VỆ SINH",
      tagline: "🚽 Giải pháp vệ sinh cao cấp – Thẩm mỹ & Sang trọng",
      icon: "YOHU",
      color: "bg-[#C8102E]",
      description: "Yohu Việt Nam mang đến các dòng sản phẩm thiết bị vệ sinh cao cấp: bồn cầu YOHU, sen vòi và phụ kiện nhà tắm chính hãng, bền bỉ với thời gian.",
      features: [
        "Sản phẩm men sứ Nano kháng khuẩn 100%",
        "Sen vòi chất liệu đồng, inox cao cấp",
        "Phụ kiện linh kiện thay thế dễ dàng",
        "Thiết kế hiện đại, tinh tế chuẩn quốc tế"
      ],
      sections: [
        {
          id: "hybrid",
          title: "Bồn Cầu YOHU",
          subtitle: "1 Khối & Treo Tường",
          description: "Hàng chính hãng 100% · Giá tốt nhất · Giao hàng miễn phí toàn quốc",
          features: ["Men sứ Nano chống bám bẩn", "Xả xoáy siêu sạch", "Nắp đóng êm ái", "Bảo hành men trọn đời"],
          image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800"
        },
        {
          id: "grid-tied",
          title: "Sen Vòi",
          subtitle: "Đồng – Inox – Nhựa & Nhiều chất liệu",
          description: "Bộ sưu tập sen vòi đa dạng đáp ứng mọi nhu cầu từ phân khúc bình dân đến cao cấp, đảm bảo lưu lượng nước ổn định.",
          features: ["Chất liệu đồng mạ Crom/Niken", "Inox 304 không gỉ", "Van điều chỉnh bền bỉ", "Dễ dàng lắp đặt & thay thế"],
          image: "https://images.unsplash.com/photo-1620627812632-2bd169473f7d?auto=format&fit=crop&q=80&w=800"
        },
        {
          id: "storage",
          title: "Sen Cây Các Loại",
          subtitle: "Bình dân – Cao cấp",
          description: "Các dòng sen cây đứng, sen âm tường mang lại cảm giác thư giãn tuyệt vời, tích hợp nhiều chế độ phun nước thông minh.",
          features: ["Củ sen đúc dày dặn", "Bát sen đại phun mưa", "Chống xoắn dây dẫn", "Chỉnh nhiệt độ chính xác"],
          image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800"
        },
        {
          id: "panels",
          title: "Phụ kiện – Linh kiện",
          subtitle: "Tiểu nam – Gương – Giá treo – Xi phông",
          description: "Đầy đủ các phụ kiện và linh kiện thay thế dành cho phòng tắm, giúp hoàn thiện không gian sống tiện nghi.",
          features: ["Linh kiện chuẩn quốc tế", "Phụ kiện chống han gỉ", "Gương phôi Bỉ cao cấp", "Tiểu nam xả cảm ứng"],
          image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800"
        }
      ],
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800"
    }
  };

  const categoryMap: Record<string, string> = {
    "dieu-hoa": "Điều Hòa",
    "bo-nang-luong-mat-troi": "BỘ NĂNG LƯỢNG MẶT TRỜI",
    "tb-ve-sinh": "Thiết bị Vệ sinh",
    "thiet-bi-bep": "Thiết bị Bếp",
    "bon-nuoc": "Bồn Nước"
  };

  const currentBrand = categoryId ? BRAND_DETAILS[categoryId] : null;
  // Label handled in findLabelFromConfig above

  // Dynamic sections based on the sub-category for TB Vệ Sinh
  const getSubSections = () => {
    if (categoryId !== "tb-ve-sinh") return [];
    
    if (activeSolarTab === "hybrid") {
      return [
        { id: "treo-tuong", title: "Bồn Cầu Treo Tường", keywords: ["treo tường"] },
        { id: "1-khoi", title: "Bồn Cầu 1 Khối", keywords: ["1 khối", "020", "013", "169", "180", "110", "156", "v001"] }
      ];
    }
    if (activeSolarTab === "grid-tied") {
       return [
         { id: "voi-lavabo", title: "Vòi Lavabo", keywords: ["vòi lavabo"] },
         { id: "sen-voi-nl", title: "Sen Vòi Nóng Lạnh", keywords: ["nóng lạnh"] }
       ];
    }
    if (activeSolarTab === "storage") {
       return [
         { id: "binh-dan", title: "Sen Cây – Bình Dân", keywords: ["yohu 120", "yohu 122", "yohu 227", "yohu 218", "yohu 460", "yohu 486", "yohu 266"] },
         { id: "cao-cap", title: "Sen Cây – Cao Cấp", keywords: ["yohu t18", "yohu d60", "yohu d80", "82301", "82302", "8284", "8287", "8299", "8204"] }
       ];
    }
    if (activeSolarTab === "panels") {
       return [
         { id: "bon-tieu-treo", title: "Bồn Tiểu Treo", keywords: ["6605", "6604", "6602", "6603", "6622", "6606", "6607", "6608"] },
         { id: "linh-kien-phu-kien", title: "Phụ kiện - Linh kiện", keywords: ["bát sen", "dây cấp", "vòi hồ"] }
       ];
    }
    return [];
  };

  const subSections = getSubSections();
  
  const customProducts = config.custom_products || [];
  const consolidatedProducts = [...PRODUCTS, ...customProducts];

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

  const categories = config.custom_categories || DEFAULT_PRODUCT_CATEGORIES;

  const findLabelFromConfig = (slug: string) => {
    const mainKeys = Object.keys(categories);
    const foundMain = mainKeys.find(k => toSlug(k) === slug);
    if (foundMain) return foundMain;
    
    for (const mKey of mainKeys) {
       const foundSub = categories[mKey].find(s => toSlug(s) === slug);
       if (foundSub) return foundSub;
    }
    return null;
  };

  const findSubCategories = (slug: string) => {
    const mainKeys = Object.keys(categories);
    const foundMain = mainKeys.find(k => toSlug(k) === slug);
    if (foundMain) return categories[foundMain];
    
    for (const mKey of mainKeys) {
       const foundSub = categories[mKey].some(s => toSlug(s) === slug);
       if (foundSub) return categories[mKey];
    }
    return [];
  };

  const subItems = findSubCategories(categoryId || "");

  const activeCategoryLabel = categoryId ? (findLabelFromConfig(categoryId) || categoryMap[categoryId] || categoryId) : "";

  const getProductsByKeywords = (keywords: string[]) => {
    const base = consolidatedProducts.filter(p => {
       const matchCategory = p.category.toLowerCase() === (activeSolarTab === "hybrid" ? "bồn cầu yohu" : 
                             activeSolarTab === "grid-tied" ? "sen vòi" :
                             activeSolarTab === "storage" ? "sen cây các loại" : "phụ kiện – linh kiện").toLowerCase();
       return matchCategory;
    });
    if (keywords.length === 0) return base;
    return base.filter(p => keywords.some(key => p.name.toLowerCase().includes(key)));
  };

  const filteredProducts = consolidatedProducts.filter(p => {
    if (currentBrand) {
      const matchBrand = p.brand?.toLowerCase() === currentBrand.name.toLowerCase();
      const matchCategory = p.category.toLowerCase() === currentBrand.name.toLowerCase();
      return matchBrand || matchCategory;
    }
    return p.category.toLowerCase().includes(activeCategoryLabel.toLowerCase());
  });

  return (
    <div className="bg-[#f7f7fc] min-h-screen pb-20">
      {/* Category Header Banner */}
      {currentBrand ? (
        <section className="bg-white">
           {/* Hero Section based on HTML template */}
           <div className={`py-16 md:py-24 px-6 relative overflow-hidden ${
             categoryId === "tb-ve-sinh" 
               ? "bg-gradient-to-br from-[#0d2b4a] via-[#1a4a7a] to-[#1f5c96]" 
               : "bg-slate-900"
           }`}>
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
              <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                 <div className="flex-1 space-y-6 text-center md:text-left text-white">
                    <div className="space-y-4">
                       <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight drop-shadow-lg">
                          <EditableText 
                            id={`hero_h1_${categoryId}_${activeSolarTab}`} 
                            defaultText={
                              categoryId === "tb-ve-sinh" 
                                ? (activeSolarTab === "hybrid" ? "Bồn Cầu YOHU\n1 Khối & Treo Tường" : 
                                   activeSolarTab === "grid-tied" ? "Sen Vòi YOHU\nĐồng – Inox – Nhựa & Nhiều Chất Liệu" :
                                   activeSolarTab === "storage" ? "Sen Cây Các Loại YOHU\nBình Dân & Cao Cấp" : 
                                   activeSolarTab === "panels" ? "Phụ Kiện & Linh Kiện\nPhòng Tắm YOHU" : 
                                   currentBrand.name)
                                : currentBrand.name
                            } 
                          />
                       </h1>
                       <div className="text-white/80 text-sm md:text-lg font-medium">
                          <EditableText 
                            id={`hero_p_${categoryId}_${activeSolarTab}`}
                            defaultText="Hàng chính hãng 100% · Giá tốt nhất · Giao hàng miễn phí toàn quốc"
                          />
                       </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start pt-4">
                      <div className="px-6 py-3 bg-[#D4A017] text-[#1A1A2E] rounded-full font-black text-xs uppercase tracking-widest shadow-xl">
                        <span>Hotline:</span> <EditableText id="hero_hotline" defaultText="+84.973 480 488" />
                      </div>
                      <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest hidden md:block">
                        Trang chủ / {activeCategoryLabel} / <EditableText id={`breadcrumb_sub_${activeSolarTab}`} defaultText={activeSolarTab === "hybrid" ? "Bồn cầu YOHU" : activeSolarTab === "storage" ? "Sen cây YOHU" : ""} />
                      </div>
                    </div>
                 </div>
                 <div className="hidden md:block w-1/3 aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 ring-1 ring-white/20">
                    <EditableImage 
                       id={`hero_img_${categoryId}_${activeSolarTab}`}
                       defaultSrc={currentBrand.image} 
                       className="w-full h-full object-cover" 
                    />
                 </div>
              </div>
           </div>
           
           {/* Sub-Category Nav */}
           <div className="bg-[#1A1A2E] border-t border-white/5 sticky top-[72px] z-40">
             <div className="max-w-7xl mx-auto flex justify-center px-4 overflow-x-auto no-scrollbar">
                {subItems.length > 0 ? (
                    subItems.map((subLabel) => {
                      const subId = toSlug(subLabel);
                      return (
                        <button
                          key={subId}
                          onClick={() => {
                            window.location.href = `/category/${subId}`;
                          }}
                          className={`flex items-center gap-2 px-6 py-5 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${
                            categoryId === subId 
                              ? "border-[#D4A017] text-[#D4A017] bg-[#D4A017]/5" 
                              : "border-transparent text-slate-400 hover:text-white"
                          }`}
                        >
                          <CircleDot className="w-4 h-4" />
                          {subLabel}
                        </button>
                      );
                    })
                ) : (
                   (categoryId === "bo-nang-luong-mat-troi" 
                     ? [
                         { id: 'hybrid', label: 'Hệ Thống Hybrid', icon: Zap },
                         { id: 'grid-tied', label: 'Hệ Thống Hòa Lưới', icon: Cpu },
                         { id: 'storage', label: 'Thiết Bị Lưu Trữ', icon: Battery },
                         { id: 'panels', label: 'Tấm Pin Năng Lượng', icon: Sun }
                       ]
                     : [
                         { id: 'hybrid', label: 'Bồn Cầu YOHU', icon: CircleDot },
                         { id: 'grid-tied', label: 'Sen Vòi', icon: Droplets },
                         { id: 'storage', label: 'Sen Cây Các Loại', icon: ShowerHead },
                         { id: 'panels', label: 'Phụ Kiện – Linh Kiện', icon: Layers }
                       ]
                   ).map((tab) => {
                     const Icon = tab.icon;
                     return (
                       <button
                         key={tab.id}
                         onClick={() => setActiveSolarTab(tab.id)}
                         className={`flex items-center gap-2 px-6 py-5 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${
                           activeSolarTab === tab.id 
                             ? "border-[#D4A017] text-[#D4A017] bg-[#D4A017]/5" 
                             : "border-transparent text-slate-400 hover:text-white"
                         }`}
                       >
                         <Icon className="w-4 h-4" />
                         {tab.label}
                       </button>
                     );
                   })
                )}
             </div>
           </div>

           {/* Main Content Areas */}
           <div className="max-w-7xl mx-auto px-6 py-12">
              {categoryId === "tb-ve-sinh" ? (
                /* SANITATION STYLE: SECTION TITLES + PRODUCT GRID */
                <div className="space-y-16">
                   {subSections.map((section) => {
                     const sectionProducts = getProductsByKeywords(section.keywords);
                     if (sectionProducts.length === 0) return null;
                     
                     return (
                       <div key={section.id} className="space-y-8">
                         <div className="flex items-center gap-4">
                           <h2 className="text-xl md:text-2xl font-black text-[#1A1A2E] uppercase whitespace-nowrap">
                             <EditableText id={`subcat_title_${section.id}`} defaultText={section.title} />
                           </h2>
                           <div className="flex-grow h-[2px] bg-gradient-to-r from-[#C8102E] to-transparent" />
                         </div>
                         
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {sectionProducts.map((product) => (
                              <div key={product.id} className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(26,26,46,0.09)] hover:shadow-[0_8px_28px_rgba(200,16,46,0.14)] hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                                <div className="relative aspect-square mb-4 bg-[#f0f0f8] rounded-xl overflow-hidden flex items-center justify-center cursor-pointer" onClick={(e) => {
                                  if ((e.target as HTMLElement).closest('button')) return;
                                  addToCart(product);
                                }}>
                                  <EditableProductCarousel 
                                    id={`prod_imgs_${product.id}`}
                                    defaultImages={product.images && product.images.length > 0 ? product.images : [product.image]}
                                    alt={product.name}
                                  />
                                  <span className="absolute top-3 left-3 bg-[#C8102E] text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter z-10 pointer-events-none">
                                    HOT 
                                  </span>
                                </div>
                                <div className="space-y-1 flex-grow flex flex-col">
                                  <h3 className="text-[13.5px] font-bold text-[#1A1A2E] leading-snug line-clamp-2 min-h-[40px]">
                                    <EditableText id={`prod_name_${product.id}`} defaultText={product.name} />
                                  </h3>
                                  <div className="flex gap-0.5 text-[#D4A017] text-[10px] pb-1">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-current" />)}
                                  </div>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-lg font-black text-[#C8102E] tracking-tight">
                                      <EditableText id={`prod_price_${product.id}`} defaultText={product.price} />
                                    </span>
                                    {product.oldPrice && (
                                      <span className="text-[11px] text-slate-400 line-through">
                                        <EditableText id={`prod_oldprice_${product.id}`} defaultText={product.oldPrice} />
                                      </span>
                                    )}
                                  </div>
                                  <button onClick={() => addToCart(product)} className="w-full mt-4 py-2.5 bg-[#C8102E] hover:bg-[#9b0c22] text-white rounded-lg font-black uppercase text-[11px] tracking-widest transition-colors active:scale-95">
                                    Mua ngay
                                  </button>
                                </div>
                              </div>
                            ))}
                         </div>
                       </div>
                     );
                   })}
                   
                   {activeSolarTab === "panels" && (
                     <div className="bg-[#fff8e8] border-[1.5px] border-dashed border-[#D4A017] rounded-xl p-5 md:p-6 text-[#4A4A6A] text-sm leading-relaxed">
                        <EditableText 
                          id="pk_coming_soon" 
                          defaultText="📦 Danh mục đang được bổ sung thêm sản phẩm. Các phụ kiện & linh kiện phòng tắm khác (giá đỡ, thanh treo, hộp giấy, gương, bộ xả chậu...) sẽ được cập nhật sớm. Liên hệ hotline +84.973 480 488 để được tư vấn chi tiết." 
                        />
                     </div>
                   )}
                </div>
              ) : (
                 /* SOLAR STYLE: BENTO BANNERS */
                 <div className="space-y-32 py-10">
                    {currentBrand?.sections && currentBrand.sections
                      .filter((s: any) => categoryId !== "bo-nang-luong-mat-troi" || s.id === activeSolarTab)
                      .map((section: any, idx: number) => (
                        <div key={section.id} className={`flex flex-col ${idx % 2 === 0 && categoryId !== "bo-nang-luong-mat-troi" ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16`}>
                          <div className="flex-1 space-y-6">
                            <div className="space-y-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
                                categoryId === "bo-nang-luong-mat-troi"
                                  ? (section.id === 'hybrid' ? 'bg-orange-500' : 
                                     section.id === 'grid-tied' ? 'bg-blue-600' :
                                     section.id === 'storage' ? 'bg-green-600' : 'bg-slate-800')
                                  : (section.id === 'hybrid' ? 'bg-red-600' : 
                                     section.id === 'grid-tied' ? 'bg-blue-500' :
                                     section.id === 'storage' ? 'bg-teal-600' : 'bg-amber-600')
                              }`}>
                                {categoryId === "bo-nang-luong-mat-troi" ? (
                                  <>
                                    {section.id === 'hybrid' && <Zap className="w-6 h-6" />}
                                    {section.id === 'grid-tied' && <Cpu className="w-6 h-6" />}
                                    {section.id === 'storage' && <Battery className="w-6 h-6" />}
                                    {section.id === 'panels' && <Sun className="w-6 h-6" />}
                                  </>
                                ) : (
                                  <>
                                    {section.id === 'hybrid' && <CircleDot className="w-6 h-6" />}
                                    {section.id === 'grid-tied' && <Droplets className="w-6 h-6" />}
                                    {section.id === 'storage' && <ShowerHead className="w-6 h-6" />}
                                    {section.id === 'panels' && <Layers className="w-6 h-6" />}
                                  </>
                                )}
                              </div>
                              <div className="space-y-2">
                                 <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                                    <EditableText id={`section_title_${categoryId}_${section.id}`} defaultText={section.title} />
                                 </h2>
                             <div className={`${categoryId === "bo-nang-luong-mat-troi" ? "text-blue-600" : "text-red-600"} font-bold text-sm uppercase tracking-widest`}>
                                <EditableText id={`section_subtitle_${categoryId}_${section.id}`} defaultText={section.subtitle} />
                             </div>
                              </div>
                            </div>
                            <div className="text-slate-600 text-lg leading-relaxed max-w-xl">
                               <EditableText id={`section_desc_${categoryId}_${section.id}`} defaultText={section.description} />
                            </div>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                               {section.features.map((feat: string, fi: number) => (
                                 <li key={fi} className="flex items-center gap-3 text-slate-700 text-sm font-bold bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                    <div className={`w-2.5 h-2.5 rounded-full ${categoryId === "bo-nang-luong-mat-troi" ? "bg-blue-600" : "bg-[#C8102E]"} shrink-0`} />
                                    <EditableText id={`section_feat_${categoryId}_${section.id}_${fi}`} defaultText={feat} />
                                 </li>
                               ))}
                            </ul>
                            {categoryId === "bo-nang-luong-mat-troi" && (
                              <div className="pt-8">
                                 <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                                    <h4 className="text-yellow-500 font-black uppercase text-xs tracking-widest mb-2">Ưu đãi lắp đặt</h4>
                                    <p className="text-slate-400 text-sm mb-6">Miễn phí khảo sát & thiết kế hệ thống tối ưu theo mái nhà thực tế.</p>
                                    <a href={`tel:${config.hotline}`} className="inline-flex items-center gap-2 bg-yellow-500 text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white transition-colors">
                                       Liên hệ tư vấn ngay
                                    </a>
                                 </div>
                              </div>
                            )}
                          </div>
                          <div className="w-full md:w-1/2 aspect-video rounded-[3rem] overflow-hidden shadow-2xl relative group border-4 border-white">
                             <EditableImage 
                                id={`section_img_${categoryId}_${section.id}`} 
                                defaultSrc={section.image}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 pointer-events-none" />
                             <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end pointer-events-none">
                                <div className="text-white">
                                   <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Giải pháp thực tế</p>
                                   <p className="text-sm font-bold">Hình ảnh sản phẩm tiêu biểu</p>
                                </div>
                             </div>
                          </div>
                        </div>
                      ))}
                 </div>
              )}
           </div>
        </section>
      ) : (
        <section className="bg-slate-900 py-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          <div className="max-w-7xl mx-auto relative z-10 text-center">
              <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-widest mb-4">
                 {activeCategoryLabel}
              </h1>
              <div className="w-24 h-1.5 bg-red-600 mx-auto rounded-full" />
              <p className="mt-6 text-slate-400 text-sm md:text-base uppercase font-bold tracking-[0.3em]">
                 Chất lượng - Uy tín - Chính hãng
              </p>
          </div>
        </section>
      )}

      {/* Product List for other categories */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100 border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="bg-white p-6 flex flex-col group hover:shadow-2xl transition-all duration-500 relative">
                <div className="relative aspect-square mb-8 overflow-hidden rounded-2xl bg-slate-50/50 p-4">
                  <EditableProductCarousel 
                    id={`prod_imgs_${product.id}`}
                    defaultImages={product.images && product.images.length > 0 ? product.images : [product.image]}
                    alt={product.name}
                  />
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
                  <button onClick={() => addToCart(product)} className="w-full py-4 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase transition-all shadow-xl hover:bg-red-700 active:scale-95 group/btn relative overflow-hidden">
                     <ShoppingCart className="w-4 h-4 relative z-10" /> 
                     <span className="relative z-10 tracking-[0.1em]">Mua ngay</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center flex flex-col items-center gap-4 bg-white">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                    <ShoppingCart className="w-8 h-8" />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest">Hiện chưa có sản phẩm nào trong mục này</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
