import React, { useState, useEffect } from 'react';
import { useAdmin, UserRole } from '../lib/AdminContext';
import { Image as ImageIcon, Plus, Trash2, ChevronLeft, ChevronRight, Upload, Loader2, X, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EditableProductCarouselProps {
  id: string;
  defaultImages: string[];
  alt: string;
}

export default function EditableProductCarousel({ id, defaultImages, alt }: EditableProductCarouselProps) {
  const { isEditMode, customData, updateCustomData, role, user } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'imagekit' | 'local'>('imagekit');

  // Logic to handle both the new plural ID and legacy singular ID
  const legacyId = id.replace('prod_imgs_', 'prod_img_');
  
  const customImagesValue = customData[id];
  const hasCustomImages = customImagesValue !== undefined && customImagesValue !== null;
  
  const customImages = Array.isArray(customImagesValue) 
    ? customImagesValue.filter(url => typeof url === 'string' && url.trim() !== "") 
    : [];

  const legacyImage = customData[legacyId] as string;
  
  const images = hasCustomImages
    ? customImages 
    : (legacyImage && typeof legacyImage === 'string' && legacyImage.trim() !== "" 
        ? [legacyImage] 
        : (defaultImages || []).filter(url => typeof url === 'string' && url.trim() !== "")
      );

  useEffect(() => {
    if (isEditing || images.length <= 1) {
      setCurrentIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); 
    return () => clearInterval(timer);
  }, [images.length, isEditing]);

  const handleAddImage = () => {
    if (images.length >= 5) {
      alert("Tối đa chỉ cho phép 5 ảnh cho mỗi sản phẩm.");
      return;
    }
    const newUrl = prompt("Nhập link ảnh mới:");
    if (newUrl) {
      const updated = [...images, newUrl];
      updateCustomData(id, updated);
    }
  };

  const handleRemoveImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Attempting direct removal first to troubleshoot if window.confirm is the issue
    const updated = images.filter((_, i) => i !== index);
    updateCustomData(id, updated);
    
    if (currentIndex >= updated.length) {
      setCurrentIndex(Math.max(0, updated.length - 1));
    }
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 5) {
      alert("Đã đạt giới hạn 5 ảnh.");
      return;
    }

    setIsUploading(true);

    if (uploadMethod === 'imagekit') {
      const authXhr = new XMLHttpRequest();
      authXhr.open("GET", "/api/imagekit-auth", true);
      authXhr.onload = () => {
        if (authXhr.status === 200) {
          const authData = JSON.parse(authXhr.responseText);
          const uploadXhr = new XMLHttpRequest();
          uploadXhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload", true);
          
          const formData = new FormData();
          formData.append("file", file);
          formData.append("publicKey", "public_VN0NYANO7kSzNY4JgXuziWUuTW4=");
          formData.append("signature", authData.signature);
          formData.append("expire", String(authData.expire));
          formData.append("token", authData.token);
          formData.append("fileName", file.name);
          formData.append("useUniqueFileName", "true");
          
          let uploadFolder = "/product-images/";
          if (role === UserRole.SUB_ACCOUNT && user?.email) {
            uploadFolder = `/root/users/${user.email}/`;
          }
          formData.append("folder", uploadFolder);

          uploadXhr.onload = () => {
            if (uploadXhr.status === 200) {
              const result = JSON.parse(uploadXhr.responseText);
              const updated = [...images, result.url];
              
              updateCustomData(id, updated);
              // The AdminContext functional update now handles the race condition safely
              if (legacyImage) {
                updateCustomData(legacyId, "");
              }
            } else {
              alert("ImageKit upload error: " + uploadXhr.responseText);
            }
            setIsUploading(false);
          };
          uploadXhr.onerror = () => {
            alert("ImageKit upload failed.");
            setIsUploading(false);
          };
          uploadXhr.send(formData);
        } else {
          alert("Could not get ImageKit auth.");
          setIsUploading(false);
        }
      };
      authXhr.send();
    } else {
      const formData = new FormData();
      formData.append("file", file);

      fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.url) {
            const updated = [...images, data.url];
            updateCustomData(id, updated);
          } else {
            alert("Lỗi tải lên: " + (data.error || "Không xác định"));
          }
        })
        .catch(err => alert("Lỗi: " + err.message))
        .finally(() => setIsUploading(false));
    }
  };

  return (
    <div className={`relative group w-full h-full overflow-hidden bg-slate-50 flex items-center justify-center ${isEditMode ? 'ring-2 ring-blue-500/20' : ''}`}>
      {images.length > 0 ? (
        <div className="relative w-full h-full flex items-center justify-center">
            <AnimatePresence mode="wait">
            <motion.img
                key={currentIndex}
                src={images[currentIndex]}
                alt={`${alt} ${currentIndex + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full object-contain"
            />
            </AnimatePresence>

            {images.length > 1 && (
            <>
                <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <ChevronRight className="w-4 h-4" />
                </button>
            </>
            )}
        </div>
      ) : (
        <div className="text-slate-300 flex flex-col items-center">
            <ImageIcon className="w-10 h-10 mb-2 opacity-20" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Chưa có ảnh</span>
        </div>
      )}

      {isEditMode && (
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center">
          <button 
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
          >
            <Settings className="w-3 h-3" /> Quản lý 5 ảnh
          </button>
        </div>
      )}

      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <div className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex flex-col">
                      <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                          <ImageIcon className="w-5 h-5 text-blue-600" />
                          Quản lý ảnh sản phẩm ({images.length}/5)
                      </h3>
                      <div className="flex mt-2 bg-slate-200 p-0.5 rounded-lg w-fit">
                        <button 
                          onClick={() => setUploadMethod('imagekit')}
                          className={`px-3 py-1 text-[9px] font-black uppercase rounded-md transition-all ${uploadMethod === 'imagekit' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                        >
                          ImageKit
                        </button>
                        <button 
                          onClick={() => setUploadMethod('local')}
                          className={`px-3 py-1 text-[9px] font-black uppercase rounded-md transition-all ${uploadMethod === 'local' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
                        >
                          Server
                        </button>
                      </div>
                    </div>
                    <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {images.map((img, idx) => (
                            <div key={`${img}-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group/item">
                                <img src={img} className="w-full h-full object-cover pointer-events-none" alt={`Preview ${idx}`} />
                                <button 
                                    type="button"
                                    onClick={(e) => handleRemoveImage(idx, e)}
                                    className="absolute top-2 right-2 p-2.5 bg-red-600 text-white rounded-xl shadow-lg transition-all z-30 hover:bg-red-700 hover:scale-110 active:scale-95 flex items-center justify-center border border-white/20"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-white text-[10px] font-bold rounded-md z-10 pointer-events-none">
                                    Ảnh {idx + 1}
                                </div>
                            </div>
                        ))}
                        
                        {images.length < 5 && (
                          <div className="space-y-2">
                             <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all">
                                {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-blue-500" /> : <Upload className="w-6 h-6 text-slate-300" />}
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Tải tệp lên</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                            </label>
                            <button 
                                onClick={handleAddImage}
                                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-3 h-3" /> Dán link
                            </button>
                          </div>
                        )}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-blue-700 leading-relaxed">
                        <p className="font-bold mb-1">💡 Mẹo quản lý:</p>
                        <p>Ảnh đầu tiên sẽ được dùng làm ảnh đại diện chính. Bạn có thể tải lên trực tiếp hoặc dán địa chỉ URL của ảnh từ internet.</p>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button 
                        onClick={() => setIsEditing(false)}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                    >
                        Hoàn tất
                    </button>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
