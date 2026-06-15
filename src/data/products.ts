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

export const PRODUCTS: Product[] = [
  // Bồn nước Hwata
  {
    id: "tank-v310",
    name: "Bồn nước Hwata Đứng 310L",
    category: "BỒN NƯỚC HWATA",
    price: "1.866.000đ",
    oldPrice: "2.193.000đ",
    discount: "327.000đ",
    image: "https://images.unsplash.com/photo-1585637257375-92265004ec9a?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "tank-v1000",
    name: "Bồn nước Hwata Đứng 1000L",
    category: "BỒN NƯỚC HWATA",
    price: "3.244.000đ",
    oldPrice: "3.956.000đ",
    discount: "712.000đ",
    image: "https://images.unsplash.com/photo-1585637257375-92265004ec9a?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "solar-6kw-hybrid",
    name: "Hệ thống điện năng lượng mặt trời 6KW Hybrid VIC03",
    category: "BỘ NĂNG LƯỢNG MẶT TRỜI",
    price: "32.500.000đ",
    image: "https://images.unsplash.com/photo-1542332213-94582aa20379?auto=format&fit=crop&q=80&w=400",
    rating: 5,
    discount: "Bán chạy nhất"
  },
  {
    id: "solar-6kw-grid-tied",
    name: "Combo tự lắp điện mặt trời 6KW hòa lưới bám tải",
    category: "BỘ NĂNG LƯỢNG MẶT TRỜI",
    price: "37.000.000đ",
    image: "https://images.unsplash.com/photo-1509391366360-feaffa648b7b?auto=format&fit=crop&q=80&w=400",
    rating: 5,
    discount: "Mua nhiều nhất"
  },
  {
    id: "solar-4kw-combo",
    name: "Combo điện mặt trời 4kw (Giảm 700-1.3 triệu/tháng)",
    category: "BỘ NĂNG LƯỢNG MẶT TRỜI",
    price: "28.500.000đ",
    image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "solar-10kwp-grid-tied",
    name: "Gói điện mặt trời hòa lưới 10Kwp (Tiền điện 3.5tr/tháng)",
    category: "BỘ NĂNG LƯỢNG MẶT TRỜI",
    price: "65.000.000đ",
    image: "https://images.unsplash.com/photo-1542332213-94582aa20379?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "solar-10kwp-3phase",
    name: "Hệ thống điện mặt trời hòa lưới 3 pha 10Kwp",
    category: "BỘ NĂNG LƯỢNG MẶT TRỜI",
    price: "49.900.000đ",
    image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "solar-6kw-15kwh-vic04",
    name: "Combo tự lắp điện mặt trời 6KW lưu trữ 15kwh VIC04",
    category: "BỘ NĂNG LƯỢNG MẶT TRỜI",
    price: "51.800.000đ",
    image: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&q=80&w=400",
    rating: 5,
    discount: "Bán chạy nhất"
  },
  {
    id: "solar-6kw-vic01",
    name: "Bộ năng lượng mặt trời 6KW hộ gia đình VIC01",
    category: "BỘ NĂNG LƯỢNG MẶT TRỜI",
    price: "52.000.000đ",
    image: "https://images.unsplash.com/photo-1542332213-31f873489e71?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "solar-6kw-vic02",
    name: "Bộ năng lượng mặt trời 6KW hộ gia đình VIC02",
    category: "BỘ NĂNG LƯỢNG MẶT TRỜI",
    price: "52.000.000đ",
    image: "https://images.unsplash.com/photo-1542332213-31f873489e71?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "solar-6kw-vic5",
    name: "Combo điện mặt trời tự lắp lưu trữ 6kw VIC5",
    category: "BỘ NĂNG LƯỢNG MẶT TRỜI",
    price: "58.500.000đ",
    image: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "solar-15kwp-grid-tied",
    name: "Gói điện mặt trời hòa lưới 15 KWP (Giảm 4-5tr/tháng)",
    category: "BỘ NĂNG LƯỢNG MẶT TRỜI",
    price: "69.000.000đ",
    image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "solar-15kwp-3phase",
    name: "Hệ thống điện mặt trời hòa lưới 3 pha 15kwp",
    category: "BỘ NĂNG LƯỢNG MẶT TRỜI",
    price: "70.300.000đ",
    image: "https://images.unsplash.com/photo-1509391366360-feaffa648b7b?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "solar-8kw-15kwh-vic07",
    name: "Bộ năng lượng mặt trời 8KW lưu trữ 15kwh VIC07",
    category: "BỘ NĂNG LƯỢNG MẶT TRỜI",
    price: "78.500.000đ",
    image: "https://images.unsplash.com/photo-1592833159057-65c562b1a10c?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "solar-vic22-hybrid",
    name: "Combo điện mặt trời tự lắp VIC22 Hybrid 6KWP",
    category: "BỘ NĂNG LƯỢNG MẶT TRỜI",
    price: "83.200.000đ",
    oldPrice: "90.000.000đ",
    image: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&q=80&w=400",
    rating: 5,
    discount: "Mua nhiều nhất"
  },
  {
    id: "solar-20kwp-3phase",
    name: "Hệ thống điện mặt trời hòa lưới 20kwp 3 PHA",
    category: "BỘ NĂNG LƯỢNG MẶT TRỜI",
    price: "86.700.000đ",
    image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  // THIẾT BỊ LƯU TRỮ
  {
    id: "storage-ls-10kwh",
    name: "Pin lưu trữ Lithium LFP 10kWh – LS Battery Hàn Quốc",
    category: "BỘ NĂNG LƯỢNG MẶT TRỜI",
    price: "Liên hệ báo giá",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
    rating: 5,
    discount: "Phổ biến"
  },
  {
    id: "storage-ls-15kwh",
    name: "Bộ lưu trữ điện mặt trời Lithium 15kWh cao cấp",
    category: "BỘ NĂNG LƯỢNG MẶT TRỜI",
    price: "Liên hệ báo giá",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
    rating: 5,
    discount: "Bán chạy"
  },
  // TẤM PIN NĂNG LƯỢNG
  {
    id: "panel-mono-450w",
    name: "Tấm pin năng lượng mặt trời 450Wp Mono PERC Half-Cell",
    category: "BỘ NĂNG LƯỢNG MẶT TRỜI",
    price: "2.550.000đ",
    image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "panel-topcon-550w",
    name: "Tấm pin TOPCon 550Wp – Công nghệ mới hiệu suất cực cao",
    category: "BỘ NĂNG LƯỢNG MẶT TRỜI",
    price: "3.200.000đ",
    image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=400",
    rating: 5,
    discount: "Công nghệ mới"
  },
  {
    id: "solar-6kw-vic06",
    name: "Combo điện mặt trời Hybrid 6KWP - VIC06",
    category: "BỘ NĂNG LƯỢNG MẶT TRỜI",
    price: "59.000.000đ",
    image: "https://images.unsplash.com/photo-1509391366360-feaffa648b7b?auto=format&fit=crop&q=80&w=400",
    rating: 5,
    discount: "Bán chạy nhất"
  },
  {
    id: "solar-6kw-vic05",
    name: "Combo điện mặt trời Hybrid 6KWP - VIC05",
    category: "BỘ NĂNG LƯỢNG MẶT TRỜI",
    price: "67.000.000đ",
    image: "https://images.unsplash.com/photo-1542332213-94582aa20379?auto=format&fit=crop&q=80&w=400",
    rating: 5,
    discount: "Gợi ý tốt nhất"
  },
  {
    id: "solar-5kw-cost",
    name: "Chi phí lắp điện mặt trời 5kw (Hóa đơn 1.5-2 triệu)",
    category: "BỘ NĂNG LƯỢNG MẶT TRỜI",
    price: "71.500.000đ",
    image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&q=80&w=400",
    rating: 5,
    discount: "Gợi ý tốt nhất"
  },
  {
    id: "solar-hybrid-4kw-single",
    name: "Combo Hybrid 4KW LƯU TRỮ - I PHA",
    category: "BỘ NĂNG LƯỢNG MẶT TRỜI",
    price: "47.500.000đ",
    image: "https://images.unsplash.com/photo-1542332213-94582aa20379?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "solar-grid-10kwp-single",
    name: "Combo Hòa Lưới 10KWP - I PHA",
    category: "BỘ NĂNG LƯỢNG MẶT TRỜI",
    price: "49.900.000đ",
    image: "https://images.unsplash.com/photo-1509391366360-feaffa648b7b?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-panasonic-9000-n9",
    name: "Điều hòa Panasonic 1 chiều 9000BTU N9AKH-8 [2025]",
    category: "Điều Hòa",
    brand: "Panasonic",
    price: "7.550.000đ",
    oldPrice: "9.040.000đ",
    discount: "1.490.000đ",
    image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-panasonic-12000-n12",
    name: "Điều hòa Panasonic 1 chiều 12000BTU N12AKH-8 [2025]",
    category: "Điều Hòa",
    brand: "Panasonic",
    price: "9.300.000đ",
    oldPrice: "11.070.000đ",
    discount: "1.770.000đ",
    image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-panasonic-18000-n18",
    name: "Điều hòa Panasonic 18000 BTU 1 chiều N18AKH-8 [2025]",
    category: "Điều Hòa",
    brand: "Panasonic",
    price: "14.350.000đ",
    oldPrice: "17.080.000đ",
    discount: "2.730.000đ",
    image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-panasonic-24000-n24",
    name: "Điều Hòa Panasonic 1 chiều 24000BTU N24AKH-8 [2025]",
    category: "Điều Hòa",
    brand: "Panasonic",
    price: "22.100.000đ",
    oldPrice: "26.400.000đ",
    discount: "4.300.000đ",
    image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-daikin-9000-ftf25",
    name: "Điều hòa Daikin 9000 BTU FTF25XAV1V",
    category: "Điều Hòa",
    brand: "Daikin",
    price: "7.000.000đ",
    oldPrice: "8.330.000đ",
    discount: "1.330.000đ",
    image: "https://images.unsplash.com/photo-1631541490204-749430fd36be?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-daikin-12000-ftf35",
    name: "Điều hòa Daikin 12000 BTU FTF35XAV1V",
    category: "Điều Hòa",
    brand: "Daikin",
    price: "8.900.000đ",
    oldPrice: "10.590.000đ",
    discount: "1.690.000đ",
    image: "https://images.unsplash.com/photo-1631541490204-749430fd36be?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-daikin-18000-ftf50",
    name: "Điều hòa Daikin 18000 BTU FTF50XAV1V",
    category: "Điều Hòa",
    brand: "Daikin",
    price: "15.200.000đ",
    oldPrice: "18.000.000đ",
    discount: "2.800.000đ",
    image: "https://images.unsplash.com/photo-1631541490204-749430fd36be?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-daikin-24000-ftf60",
    name: "Điều hòa Daikin 24000 BTU FTF60XAV1V",
    category: "Điều Hòa",
    brand: "Daikin",
    price: "21.500.000đ",
    oldPrice: "25.000.000đ",
    discount: "3.500.000đ",
    image: "https://images.unsplash.com/photo-1631541490204-749430fd36be?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-casper-9000-sc09",
    name: "Điều hòa Casper 9000 BTU 1 chiều SC-09FB36M [2026]",
    category: "Điều Hòa",
    brand: "Casper",
    price: "4.200.000đ",
    oldPrice: "5.000.000đ",
    discount: "800.000đ",
    image: "https://images.unsplash.com/photo-1590422964972-eabd7432fb77?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-casper-12000-sc12",
    name: "Điều hòa Casper 12000 BTU 1 chiều SC-12FS33 [2026]",
    category: "Điều Hòa",
    brand: "Casper",
    price: "5.850.000đ",
    oldPrice: "7.000.000đ",
    discount: "1.150.000đ",
    image: "https://images.unsplash.com/photo-1590422964972-eabd7432fb77?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-casper-18000-sc18",
    name: "Điều hòa Casper 18000 BTU 1 chiều SC-18FS33 [2026]",
    category: "Điều Hòa",
    brand: "Casper",
    price: "9.350.000đ",
    oldPrice: "11.500.000đ",
    discount: "2.150.000đ",
    image: "https://images.unsplash.com/photo-1590422964972-eabd7432fb77?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-casper-24000-sc24",
    name: "Điều hòa Casper 24000 BTU 1 chiều SC-24FS33 [2026]",
    category: "Điều Hòa",
    brand: "Casper",
    price: "13.500.000đ",
    oldPrice: "16.300.000đ",
    discount: "2.800.000đ",
    image: "https://images.unsplash.com/photo-1590422964972-eabd7432fb77?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-lg-9000-ifc09",
    name: "Điều hòa LG 1 chiều inverter 9.000BTU IFC09M1",
    category: "Điều Hòa",
    brand: "LG",
    price: "5.500.000đ",
    oldPrice: "6.550.000đ",
    discount: "1.050.000đ",
    image: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-lg-12000-ifc12",
    name: "Điều hòa LG 1 chiều inverter 12.000BTU IFC12M1",
    category: "Điều Hòa",
    brand: "LG",
    price: "7.800.000đ",
    oldPrice: "9.300.000đ",
    discount: "1.500.000đ",
    image: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-lg-18000-ifc18",
    name: "Điều hòa LG 1 chiều inverter 18.000BTU IFC18M1",
    category: "Điều Hòa",
    brand: "LG",
    price: "13.500.000đ",
    oldPrice: "16.000.000đ",
    discount: "2.500.000đ",
    image: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-lg-24000-ifc24",
    name: "Điều hòa LG 1 chiều inverter 24.000BTU IFC24M1",
    category: "Điều Hòa",
    brand: "LG",
    price: "18.200.000đ",
    oldPrice: "21.550.000đ",
    discount: "3.350.000đ",
    image: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-funiki-9000-hsc09",
    name: "Điều hòa Funiki 9000 BTU HSC09TMU [2025]",
    category: "Điều Hòa",
    brand: "Funiki",
    price: "4.300.000đ",
    oldPrice: "5.120.000đ",
    discount: "820.000đ",
    image: "https://images.unsplash.com/photo-1590422964972-eabd7432fb77?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-funiki-12000-hsc12",
    name: "Điều hòa Funiki 12000 BTU HSC12TMU [2025]",
    category: "Điều Hòa",
    brand: "Funiki",
    price: "5.950.000đ",
    oldPrice: "7.200.000đ",
    discount: "1.250.000đ",
    image: "https://images.unsplash.com/photo-1590422964972-eabd7432fb77?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-funiki-18000-hsc18",
    name: "Điều hòa Funiki 18000 BTU HSC18TMU [2025]",
    category: "Điều Hòa",
    brand: "Funiki",
    price: "9.800.000đ",
    oldPrice: "11.800.000đ",
    discount: "2.000.000đ",
    image: "https://images.unsplash.com/photo-1590422964972-eabd7432fb77?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-funiki-24000-hsc24",
    name: "Điều hòa Funiki 24000 BTU HSC24TMU [2025]",
    category: "Điều Hòa",
    brand: "Funiki",
    price: "13.900.000đ",
    oldPrice: "17.000.000đ",
    discount: "3.100.000đ",
    image: "https://images.unsplash.com/photo-1590422964972-eabd7432fb77?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-gree-9000-bd9",
    name: "Điều hòa Gree 9000 BTU 1 chiều BD9CN Kim cương",
    category: "Điều Hòa",
    brand: "Gree",
    price: "6.400.000đ",
    oldPrice: "7.620.000đ",
    discount: "1.220.000đ",
    image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-gree-12000-bd12",
    name: "Điều hòa Gree 12000 BTU 1 chiều BD12CN Kim cương",
    category: "Điều Hòa",
    brand: "Gree",
    price: "8.200.000đ",
    oldPrice: "9.705.000đ",
    discount: "1.505.000đ",
    image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-gree-18000-bd18",
    name: "Điều hòa Gree 18000 BTU 1 chiều BD18CN Kim cương",
    category: "Điều Hòa",
    brand: "Gree",
    price: "14.100.000đ",
    oldPrice: "16.500.000đ",
    discount: "2.400.000đ",
    image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-gree-24000-bd24",
    name: "Điều hòa Gree 24000 BTU 1 chiều BD24CN Kim cương",
    category: "Điều Hòa",
    brand: "Gree",
    price: "18.900.000đ",
    oldPrice: "22.000.000đ",
    discount: "3.100.000đ",
    image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-midea-9000-msfq09",
    name: "Điều hòa Midea 9000BTU 1 chiều MSFQ-09CRN8",
    category: "Điều Hòa",
    brand: "Midea",
    price: "4.300.000đ",
    oldPrice: "5.120.000đ",
    discount: "820.000đ",
    image: "https://images.unsplash.com/photo-1590422964972-eabd7432fb77?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-midea-12000-msfq12",
    name: "Điều hòa Midea 12000BTU 1 chiều MSFQ-12CRN8",
    category: "Điều Hòa",
    brand: "Midea",
    price: "5.900.000đ",
    oldPrice: "7.100.000đ",
    discount: "1.200.000đ",
    image: "https://images.unsplash.com/photo-1590422964972-eabd7432fb77?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-midea-18000-msfq18",
    name: "Điều hòa Midea 18000BTU 1 chiều MSFQ-18CRN8",
    category: "Điều Hòa",
    brand: "Midea",
    price: "9.400.000đ",
    oldPrice: "11.500.000đ",
    discount: "2.100.000đ",
    image: "https://images.unsplash.com/photo-1590422964972-eabd7432fb77?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-midea-24000-msfq24",
    name: "Điều hòa Midea 24000BTU 1 chiều MSFQ-24CRN8",
    category: "Điều Hòa",
    brand: "Midea",
    price: "13.200.000đ",
    oldPrice: "16.000.000đ",
    discount: "2.800.000đ",
    image: "https://images.unsplash.com/photo-1590422964972-eabd7432fb77?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-nagakawa-9000-ns-c09",
    name: "Điều hòa Nagakawa 9000BTU 1 chiều NS-C09R2T30",
    category: "Điều Hòa",
    brand: "Nagakawa",
    price: "4.300.000đ",
    oldPrice: "5.120.000đ",
    discount: "820.000đ",
    image: "https://images.unsplash.com/photo-1590422964972-eabd7432fb77?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-samsung-9000-ar09",
    name: "Điều hòa Samsung 9000BTU inverter AR09TYHQASINSV",
    category: "Điều Hòa",
    brand: "Samsung",
    price: "5.500.000đ",
    oldPrice: "6.550.000đ",
    discount: "1.050.000đ",
    image: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-sumikura-9000-aps",
    name: "Điều hòa Sumikura 1 chiều 9.000BTU APS/APO-092",
    category: "Điều Hòa",
    brand: "Sumikura",
    price: "4.180.000đ",
    oldPrice: "4.850.000đ",
    discount: "670.000đ",
    image: "https://images.unsplash.com/photo-1590422964972-eabd7432fb77?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-sharp-9000-ahx10",
    name: "Điều hòa Sharp inverter 9000 BTU 1 chiều AH-X10CEWC",
    category: "Điều Hòa",
    brand: "Sharp",
    price: "6.250.000đ",
    oldPrice: "7.560.000đ",
    discount: "1.310.000đ",
    image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "ac-aqua-9000-aqar10",
    name: "Điều hòa AQUA 9000BTU 1 chiều AQA-R10PC",
    category: "Điều Hòa",
    brand: "Aqua",
    price: "4.700.000đ",
    oldPrice: "5.850.000đ",
    discount: "1.150.000đ",
    image: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  // THIẾT BỊ VỆ SINH - BỒN CẦU YOHU
  {
    id: "wc-yohu-3008",
    name: "Bồn cầu treo tường YOHU 3008",
    category: "Bồn Cầu YOHU",
    price: "8.155.200đ",
    oldPrice: "10.194.000đ",
    discount: "2.038.800đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-3008",
    rating: 5
  },
  {
    id: "wc-yohu-3015",
    name: "Bồn cầu YOHU 1 khối 3015",
    category: "Bồn Cầu YOHU",
    price: "4.596.800đ",
    oldPrice: "5.746.000đ",
    discount: "1.149.200đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-3015",
    rating: 5
  },
  {
    id: "wc-yohu-121",
    name: "Bồn cầu YOHU 1 khối 121",
    category: "Bồn Cầu YOHU",
    price: "3.241.600đ",
    oldPrice: "4.052.000đ",
    discount: "810.400đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-121",
    rating: 5
  },
  {
    id: "wc-yohu-127",
    name: "Bồn cầu YOHU 1 khối 127",
    category: "Bồn Cầu YOHU",
    price: "2.963.200đ",
    oldPrice: "3.704.000đ",
    discount: "740.800đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-127",
    rating: 5
  },
  {
    id: "wc-yohu-020",
    name: "Bồn cầu YOHU 1 khối 020",
    category: "Bồn Cầu YOHU",
    price: "2.889.600đ",
    oldPrice: "3.612.000đ",
    discount: "722.400đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-020",
    rating: 5
  },
  {
    id: "wc-yohu-013",
    name: "Bồn cầu YOHU 1 khối 013",
    category: "Bồn Cầu YOHU",
    price: "3.200.000đ",
    oldPrice: "4.000.000đ",
    discount: "800.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-013",
    rating: 5
  },
  {
    id: "wc-yohu-169",
    name: "Bồn cầu YOHU 1 khối 169",
    category: "Bồn Cầu YOHU",
    price: "4.096.000đ",
    oldPrice: "5.120.000đ",
    discount: "1.024.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-169",
    rating: 5
  },
  {
    id: "wc-yohu-180",
    name: "Bồn cầu YOHU 1 khối 180",
    category: "Bồn Cầu YOHU",
    price: "3.840.000đ",
    oldPrice: "4.800.000đ",
    discount: "960.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-180",
    rating: 5
  },
  {
    id: "wc-yohu-110",
    name: "Bồn cầu YOHU 1 khối 110",
    category: "Bồn Cầu YOHU",
    price: "4.000.000đ",
    oldPrice: "5.000.000đ",
    discount: "1.000.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-110",
    rating: 5
  },
  {
    id: "wc-yohu-156",
    name: "Bồn cầu YOHU 1 khối 156",
    category: "Bồn Cầu YOHU",
    price: "3.840.000đ",
    oldPrice: "4.800.000đ",
    discount: "960.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-156",
    rating: 5
  },
  {
    id: "wc-yohu-v001",
    name: "Bồn cầu YOHU 1 khối V001",
    category: "Bồn Cầu YOHU",
    price: "10.521.600đ",
    oldPrice: "13.152.000đ",
    discount: "2.630.400đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-V001",
    rating: 5
  },
  // THIẾT BỊ VỆ SINH - SEN VÒI
  {
    id: "sv-yohu-7002",
    name: "Vòi lavabo nóng lạnh YOHU 7002",
    category: "Sen Vòi",
    price: "963.200đ",
    oldPrice: "1.204.000đ",
    discount: "240.800đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-7002",
    rating: 5
  },
  {
    id: "sv-yohu-2001",
    name: "Vòi lavabo lạnh YOHU 2001",
    category: "Sen Vòi",
    price: "566.400đ",
    oldPrice: "708.000đ",
    discount: "141.600đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-2001",
    rating: 5
  },
  {
    id: "sv-yohu-1803-2",
    name: "Vòi lavabo nóng lạnh YOHU 1803-2",
    category: "Sen Vòi",
    price: "1.476.800đ",
    oldPrice: "1.846.000đ",
    discount: "369.200đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-1803-2",
    rating: 5
  },
  {
    id: "sv-yohu-9304",
    name: "Sen vòi nóng lạnh YOHU 9304",
    category: "Sen Vòi",
    price: "1.980.800đ",
    oldPrice: "2.476.000đ",
    discount: "495.200đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-9304",
    rating: 5
  },
  {
    id: "sv-yohu-9305",
    name: "Sen vòi nóng lạnh YOHU 9305",
    category: "Sen Vòi",
    price: "1.320.000đ",
    oldPrice: "1.650.000đ",
    discount: "330.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-9305",
    rating: 5
  },
  {
    id: "sv-yohu-9031",
    name: "Sen vòi nóng lạnh YOHU 9031",
    category: "Sen Vòi",
    price: "1.208.000đ",
    oldPrice: "1.510.000đ",
    discount: "302.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-9031",
    rating: 5
  },
  {
    id: "sv-yohu-7164",
    name: "Sen vòi nóng lạnh YOHU 7164",
    category: "Sen Vòi",
    price: "2.440.000đ",
    oldPrice: "3.050.000đ",
    discount: "610.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-7164",
    rating: 5
  },
  {
    id: "sv-yohu-7162",
    name: "Sen vòi nóng lạnh YOHU 7162",
    category: "Sen Vòi",
    price: "3.668.000đ",
    oldPrice: "4.585.000đ",
    discount: "917.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-7162",
    rating: 5
  },
  {
    id: "sv-yohu-7161",
    name: "Sen vòi nóng lạnh YOHU 7161",
    category: "Sen Vòi",
    price: "3.040.000đ",
    oldPrice: "3.800.000đ",
    discount: "760.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-7161",
    rating: 5
  },
  {
    id: "sv-yohu-1803-1",
    name: "Sen vòi nóng lạnh YOHU 1803-1",
    category: "Sen Vòi",
    price: "5.008.000đ",
    oldPrice: "6.260.000đ",
    discount: "1.252.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-1803-1",
    rating: 5
  },
  // THIẾT BỊ VỆ SINH - SEN CÂY CÁC LOẠI
  {
    id: "sc-yohu-120",
    name: "Sen cây YOHU 120",
    category: "Sen Cây Các Loại",
    price: "960.000đ",
    oldPrice: "1.200.000đ",
    discount: "240.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-120",
    rating: 5
  },
  {
    id: "sc-yohu-122",
    name: "Sen cây YOHU 122",
    category: "Sen Cây Các Loại",
    price: "1.008.000đ",
    oldPrice: "1.260.000đ",
    discount: "252.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-122",
    rating: 5
  },
  {
    id: "sc-yohu-227",
    name: "Sen cây YOHU 227",
    category: "Sen Cây Các Loại",
    price: "1.120.000đ",
    oldPrice: "1.400.000đ",
    discount: "280.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-227",
    rating: 5
  },
  {
    id: "sc-yohu-218",
    name: "Sen cây YOHU 218",
    category: "Sen Cây Các Loại",
    price: "1.137.600đ",
    oldPrice: "1.422.000đ",
    discount: "284.400đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-218",
    rating: 5
  },
  {
    id: "sc-yohu-460",
    name: "Sen cây YOHU 460",
    category: "Sen Cây Các Loại",
    price: "1.360.000đ",
    oldPrice: "1.700.000đ",
    discount: "340.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-460",
    rating: 5
  },
  {
    id: "sc-yohu-486",
    name: "Sen cây YOHU 486",
    category: "Sen Cây Các Loại",
    price: "1.360.000đ",
    oldPrice: "1.700.000đ",
    discount: "340.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-486",
    rating: 5
  },
  {
    id: "sc-yohu-266",
    name: "Sen cây YOHU 266",
    category: "Sen Cây Các Loại",
    price: "1.400.000đ",
    oldPrice: "1.750.000đ",
    discount: "350.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-266",
    rating: 5
  },
  {
    id: "sc-yohu-t18",
    name: "Sen cây YOHU T18",
    category: "Sen Cây Các Loại",
    price: "2.800.000đ",
    oldPrice: "3.500.000đ",
    discount: "700.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-T18",
    rating: 5
  },
  {
    id: "sc-yohu-d60",
    name: "Sen cây YOHU D60",
    category: "Sen Cây Các Loại",
    price: "2.332.800đ",
    oldPrice: "2.916.000đ",
    discount: "583.200đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-D60",
    rating: 5
  },
  {
    id: "sc-yohu-d80",
    name: "Sen cây YOHU D80",
    category: "Sen Cây Các Loại",
    price: "2.915.200đ",
    oldPrice: "3.644.000đ",
    discount: "728.800đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-D80",
    rating: 5
  },
  {
    id: "sc-yohu-82301-60",
    name: "Sen cây YOHU 82301-60",
    category: "Sen Cây Các Loại",
    price: "5.649.600đ",
    oldPrice: "7.062.000đ",
    discount: "1.412.400đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-82301-60",
    rating: 5
  },
  {
    id: "sc-yohu-82301-80",
    name: "Sen cây YOHU 82301-80",
    category: "Sen Cây Các Loại",
    price: "5.987.200đ",
    oldPrice: "7.484.000đ",
    discount: "1.496.800đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-82301-80",
    rating: 5
  },
  {
    id: "sc-yohu-82302-80",
    name: "Sen cây YOHU 82302-80",
    category: "Sen Cây Các Loại",
    price: "6.548.800đ",
    oldPrice: "8.186.000đ",
    discount: "1.637.200đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-82302-80",
    rating: 5
  },
  {
    id: "sc-yohu-8284-80",
    name: "Sen cây YOHU 8284-80",
    category: "Sen Cây Các Loại",
    price: "7.315.200đ",
    oldPrice: "9.144.000đ",
    discount: "1.828.800đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-8284-80",
    rating: 5
  },
  {
    id: "sc-yohu-8287-60",
    name: "Sen cây YOHU 8287-60",
    category: "Sen Cây Các Loại",
    price: "7.876.800đ",
    oldPrice: "9.846.000đ",
    discount: "1.969.200đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-8287-60",
    rating: 5
  },
  {
    id: "sc-yohu-8287-80",
    name: "Sen cây YOHU 8287-80",
    category: "Sen Cây Các Loại",
    price: "8.777.600đ",
    oldPrice: "10.972.000đ",
    discount: "2.194.400đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-8287-80",
    rating: 5
  },
  {
    id: "sc-yohu-8299-80",
    name: "Sen cây YOHU 8299-80",
    category: "Sen Cây Các Loại",
    price: "8.761.600đ",
    oldPrice: "10.952.000đ",
    discount: "2.190.400đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-8299-80",
    rating: 5
  },
  {
    id: "sc-yohu-8204-80",
    name: "Sen cây YOHU 8204-80",
    category: "Sen Cây Các Loại",
    price: "9.678.400đ",
    oldPrice: "12.098.000đ",
    discount: "2.419.600đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-8204-80",
    rating: 5
  },
  // THIẾT BỊ VỆ SINH - PHỤ KIỆN - LINH KIỆN
  {
    id: "pk-yohu-6605",
    name: "Bồn tiểu treo YOHU 6605",
    category: "Phụ Kiện – Linh Kiện",
    price: "1.520.000đ",
    oldPrice: "1.900.000đ",
    discount: "380.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-6605",
    rating: 5
  },
  {
    id: "pk-yohu-6604",
    name: "Bồn tiểu treo YOHU 6604",
    category: "Phụ Kiện – Linh Kiện",
    price: "2.880.000đ",
    oldPrice: "3.600.000đ",
    discount: "720.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-6604",
    rating: 5
  },
  {
    id: "pk-yohu-6602",
    name: "Bồn tiểu treo YOHU 6602",
    category: "Phụ Kiện – Linh Kiện",
    price: "3.049.600đ",
    oldPrice: "3.812.000đ",
    discount: "762.400đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-6602",
    rating: 5
  },
  {
    id: "pk-yohu-6603",
    name: "Bồn tiểu treo YOHU 6603",
    category: "Phụ Kiện – Linh Kiện",
    price: "3.920.000đ",
    oldPrice: "4.900.000đ",
    discount: "980.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-6603",
    rating: 5
  },
  {
    id: "pk-yohu-6622",
    name: "Bồn tiểu treo YOHU 6622",
    category: "Phụ Kiện – Linh Kiện",
    price: "8.129.600đ",
    oldPrice: "10.162.000đ",
    discount: "2.032.400đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-6622",
    rating: 5
  },
  {
    id: "pk-yohu-6606",
    name: "Bồn tiểu treo YOHU 6606",
    category: "Phụ Kiện – Linh Kiện",
    price: "2.400.000đ",
    oldPrice: "3.000.000đ",
    discount: "600.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-6606",
    rating: 5
  },
  {
    id: "pk-yohu-6607",
    name: "Bồn tiểu treo YOHU 6607",
    category: "Phụ Kiện – Linh Kiện",
    price: "1.800.000đ",
    oldPrice: "2.250.000đ",
    discount: "450.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-6607",
    rating: 5
  },
  {
    id: "pk-yohu-6608",
    name: "Bồn tiểu treo YOHU 6608",
    category: "Phụ Kiện – Linh Kiện",
    price: "3.200.000đ",
    oldPrice: "4.000.000đ",
    discount: "800.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-6608",
    rating: 5
  },
  {
    id: "pk-yohu-bat-sen",
    name: "Bộ bát sen phòng tắm cao cấp YOHU",
    category: "Phụ Kiện – Linh Kiện",
    price: "320.000đ",
    oldPrice: "400.000đ",
    discount: "80.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-BAT-SEN",
    rating: 5
  },
  {
    id: "pk-yohu-day-cap",
    name: "Dây cấp đầu nhựa ren đồng chống gỉ sét YOHU",
    category: "Phụ Kiện – Linh Kiện",
    price: "85.000đ",
    oldPrice: "110.000đ",
    discount: "25.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-DAY-CAP",
    rating: 5
  },
  {
    id: "pk-yohu-voi-ho",
    name: "Vòi hồ nhựa ABS cỡ đại YOHU",
    category: "Phụ Kiện – Linh Kiện",
    price: "145.000đ",
    oldPrice: "185.000đ",
    discount: "40.000đ",
    image: "https://via.placeholder.com/400x300?text=YOHU-VOI-HO-ABS",
    rating: 5
  },
  // Thiết bị bếp
  {
    id: "kitchen-hwgs04",
    name: "Tủ bếp cửa gỗ sồi HWGS 04",
    category: "THIẾT BỊ BẾP",
    price: "8.914.000đ",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "kitchen-hwarc13",
    name: "Tủ bếp inox 304 cửa Acrylic HWARC 13",
    category: "THIẾT BỊ BẾP",
    price: "8.022.000đ",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "kitchen-hwgs06",
    name: "Tủ bếp Hwata gỗ sồi HWGS 06",
    category: "THIẾT BỊ BẾP",
    price: "8.914.000đ",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "kitchen-hwgs03",
    name: "Tủ bếp inox 304 cửa gỗ sồi Hwata HWGS 03",
    category: "THIẾT BỊ BẾP",
    price: "8.914.000đ",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "kitchen-hwqb",
    name: "Trụ quầy bar Hwata HWQB",
    category: "THIẾT BỊ BẾP",
    price: "3.038.400đ",
    oldPrice: "3.798.000đ",
    discount: "759.600đ",
    image: "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "kitchen-hwarg01",
    name: "Rây bình gas Hwata HWARG01",
    category: "THIẾT BỊ BẾP",
    price: "960.000đ",
    oldPrice: "1.200.000đ",
    discount: "240.000đ",
    image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "kitchen-hwmx12",
    name: "Mâm xoay 1/2 HWMX1/2",
    category: "THIẾT BỊ BẾP",
    price: "2.788.800đ",
    oldPrice: "3.486.000đ",
    discount: "697.200đ",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "kitchen-hwk01",
    name: "Kệ kéo âm 2 tầng HWK01",
    category: "THIẾT BỊ BẾP",
    price: "3.670.400đ",
    oldPrice: "4.588.000đ",
    discount: "917.600đ",
    image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "kitchen-hwkcx02",
    name: "Kệ úp chén dĩa 2 tầng HWKCX02",
    category: "THIẾT BỊ BẾP",
    price: "982.400đ",
    oldPrice: "1.228.000đ",
    discount: "245.600đ",
    image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "kitchen-hwkc2",
    name: "Kệ treo úp chén dĩa 2 tầng HWKC2",
    category: "THIẾT BỊ BẾP",
    price: "1.784.800đ",
    oldPrice: "2.231.000đ",
    discount: "446.200đ",
    image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "kitchen-hwkc1",
    name: "Kệ treo úp chén dĩa 1 tầng HWKC1",
    category: "THIẾT BỊ BẾP",
    price: "1.169.600đ",
    oldPrice: "1.462.000đ",
    discount: "292.400đ",
    image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "kitchen-hwcn02",
    name: "Rổ úp nồi chén bát HWCN02",
    category: "THIẾT BỊ BẾP",
    price: "1.457.600đ",
    oldPrice: "1.822.000đ",
    discount: "364.400đ",
    image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "kitchen-hwcn01",
    name: "Rổ úp nồi chén bát HWCN01",
    category: "THIẾT BỊ BẾP",
    price: "1.230.400đ",
    oldPrice: "1.538.000đ",
    discount: "307.600đ",
    image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "kitchen-hwgd",
    name: "Vĩ gài dao HWGD",
    category: "THIẾT BỊ BẾP",
    price: "284.000đ",
    oldPrice: "355.000đ",
    discount: "71.000đ",
    image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "kitchen-hwktd01",
    name: "Kệ treo muỗng đũa HWKTD 01",
    category: "THIẾT BỊ BẾP",
    price: "904.800đ",
    oldPrice: "1.131.000đ",
    discount: "226.200đ",
    image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "kitchen-hwktd02",
    name: "Kệ treo dao đũa HWKTD 02",
    category: "THIẾT BỊ BẾP",
    price: "904.800đ",
    oldPrice: "1.131.000đ",
    discount: "226.200đ",
    image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "kitchen-hwtg01c",
    name: "Thùng gạo HWTG 01C",
    category: "THIẾT BỊ BẾP",
    price: "2.624.000đ",
    oldPrice: "3.280.000đ",
    discount: "656.000đ",
    image: "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "kitchen-htsc001",
    name: "Máy sấy chén HT-SC001",
    category: "THIẾT BỊ BẾP",
    price: "12.640.000đ",
    oldPrice: "15.800.000đ",
    discount: "3.160.000đ",
    image: "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "kitchen-htd3547",
    name: "Bếp điện – Điện từ HT-D3547",
    category: "THIẾT BỊ BẾP",
    price: "5.600.000đ",
    oldPrice: "7.000.000đ",
    discount: "1.400.000đ",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=400",
    rating: 5
  },
  {
    id: "kitchen-htga001",
    name: "Bếp gas HT-GA001",
    category: "THIẾT BỊ BẾP",
    price: "5.040.000đ",
    oldPrice: "6.300.000đ",
    discount: "1.260.000đ",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=400",
    rating: 5
  }
];
