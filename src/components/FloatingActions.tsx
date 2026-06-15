import { motion } from "motion/react";
import { SiteConfig } from "../types";
import { MessageSquare, Phone, Send } from "lucide-react";

export default function FloatingActions({ config }: { config: SiteConfig }) {
  const actions = [
    { 
      id: "zalo", 
      icon: <span className="text-sm font-black">Zalo</span>, 
      color: "bg-[#0068ff]", 
      link: `https://zalo.me/${config.zalo.replace(/\s/g, "").replace("+84", "0")}`,
      label: "Zalo OA"
    },
    { 
      id: "messenger", 
      icon: <MessageSquare className="w-5 h-5" />, 
      color: "bg-[#0084ff]", 
      link: "https://m.me/yohu.vn", 
      label: "Messenger"
    },
    { 
      id: "phone", 
      icon: <Phone className="w-5 h-5" />, 
      color: "bg-green-600", 
      link: `tel:${config.hotline}`,
      label: "Gọi ngay"
    }
  ];

  return (
    <div className="fixed left-6 bottom-24 flex flex-col gap-4 z-[100]">
      {actions.map((action, i) => (
        <motion.a
          key={action.id}
          href={action.link}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.05 }}
          className={`${action.color} text-white w-12 h-12 rounded-full shadow-2xl flex items-center justify-center group relative border-2 border-white/20`}
        >
          {action.icon}
          <div className="absolute left-full ml-3 px-3 py-2 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-black rounded-xl opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 whitespace-nowrap pointer-events-none uppercase tracking-[0.2em] shadow-xl border border-white/10">
            {action.label}
          </div>
        </motion.a>
      ))}
    </div>
  );
}
