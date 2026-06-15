import React, { useState, useRef } from 'react';
import { useAdmin } from '../lib/AdminContext';
import { Image as ImageIcon, Check, X, RefreshCw, Upload, Loader2, Settings } from 'lucide-react';

interface EditableImageProps {
  id: string;
  defaultSrc: string;
  className?: string;
  alt?: string;
}

export default function EditableImage({ id, defaultSrc, className = "", alt = "" }: EditableImageProps) {
  const { isEditMode, customData, updateCustomData, userConfig } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [url, setUrl] = useState(customData[id] || defaultSrc);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [uploadMethod, setUploadMethod] = useState<'imagekit' | 'cloudinary' | 'local'>('imagekit');
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState(customData.cloudinary_cloud_name || 'yohu');
  const [isSavingCloudName, setIsSavingCloudName] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const src = customData[id] || defaultSrc;

  // Sync url state when src changes (e.g. on reset or customData update)
  React.useEffect(() => {
    setUrl(src);
    setHasError(false);
  }, [src]);

  // Sync cloud name if it changes in context
  React.useEffect(() => {
    if (customData.cloudinary_cloud_name) {
      setCloudinaryCloudName(customData.cloudinary_cloud_name);
    }
  }, [customData.cloudinary_cloud_name]);

  const handleSaveCloudName = async () => {
    const trimmed = cloudinaryCloudName.trim();
    if (!trimmed) {
      alert("Vui lòng nhập Cloud Name hợp lệ!");
      return;
    }
    setIsSavingCloudName(true);
    try {
      await updateCustomData('cloudinary_cloud_name', trimmed);
      alert("Đã lưu cấu hình Cloud Name thành công!");
      setShowConfig(false);
    } catch (err: any) {
      console.error("Failed to save cloudinary cloud name", err);
      alert("Không thể lưu cấu hình: " + err.message);
    } finally {
      setIsSavingCloudName(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError("Kích thước tệp quá lớn. Tối đa chỉ cho phép 5MB.");
      alert("Kích thước tệp quá lớn. Tối đa chỉ cho phép 5MB.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    if (uploadMethod === 'imagekit') {
      // 1. Fetch authentication parameters from backend
      // We pass the customized private key if the user has one configured
      const authUrl = `/api/imagekit-auth?privateKey=${encodeURIComponent(userConfig?.imagekitPrivateKey || "")}`;
      const authXhr = new XMLHttpRequest();
      authXhr.open("GET", authUrl, true);

      authXhr.onload = () => {
        try {
          if (authXhr.status >= 200 && authXhr.status < 300) {
            const authParams = JSON.parse(authXhr.responseText);

            if (authParams.error) {
              setUploadError(authParams.error);
              setIsUploading(false);
              return;
            }

            // 2. Client-side upload to ImageKit
            const formData = new FormData();
            formData.append("file", file);
            formData.append("fileName", file.name);
            // Use user-specific Public Key if available
            formData.append("publicKey", userConfig?.imagekitPublicKey || "public_VN0NYANO7kSzNY4JgXuziWUuTW4=");
            formData.append("signature", authParams.signature);
            formData.append("expire", String(authParams.expire));
            formData.append("token", authParams.token);
            formData.append("useUniqueFileName", "true");
            formData.append("folder", "/site-images/");

            const uploadXhr = new XMLHttpRequest();
            uploadXhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload", true);

            uploadXhr.upload.onprogress = (progressEvent) => {
              if (progressEvent.lengthComputable) {
                const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                setUploadProgress(progress);
              }
            };

            uploadXhr.onload = async () => {
              try {
                if (uploadXhr.status >= 200 && uploadXhr.status < 300) {
                  const result = JSON.parse(uploadXhr.responseText);
                  if (result.url) {
                    setUrl(result.url);
                    await updateCustomData(id, result.url);
                    setIsEditing(false);
                  } else {
                    setUploadError("Tải lên thành công nhưng không tìm thấy URL của ảnh.");
                  }
                } else {
                  let msg = "Lỗi phản hồi từ ImageKit.";
                  try {
                    const result = JSON.parse(uploadXhr.responseText);
                    msg = result.message || msg;
                  } catch {}
                  setUploadError(msg);
                }
              } catch (err: any) {
                console.error("Parse upload result error:", err);
                setUploadError(`Lỗi xử lý phản hồi ImageKit: ${err.message}`);
              } finally {
                setIsUploading(false);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }
            };

            uploadXhr.onerror = () => {
              setUploadError("Lỗi kết nối khi tải tệp lên ImageKit.");
              setIsUploading(false);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            };

            uploadXhr.send(formData);

          } else {
            let serverError = "Lỗi xác thực máy chủ.";
            try {
              const resJson = JSON.parse(authXhr.responseText);
              serverError = resJson.error || serverError;
            } catch {}
            setUploadError(serverError);
            setIsUploading(false);
          }
        } catch (e: any) {
          console.error("Auth parameter retrieval error:", e);
          setUploadError(`Lỗi lấy khóa xác thực: ${e.message}`);
          setIsUploading(false);
        }
      };

      authXhr.onerror = () => {
        setUploadError("Lỗi kết nối mạng khi lấy khóa xác thực tải lên.");
        setIsUploading(false);
      };

      authXhr.send();
    } else {
      // Classic Cloudinary or Local uploads
      const formData = new FormData();
      let uploadUrl = "/api/upload";

      if (uploadMethod === 'cloudinary') {
        const activeCloudName = cloudinaryCloudName.trim() || customData.cloudinary_cloud_name || "yohu";
        uploadUrl = `https://api.cloudinary.com/v1_1/${activeCloudName}/image/upload`;
        formData.append("file", file);
        formData.append("upload_preset", "yohu_images");
      } else {
        formData.append("file", file);
      }

      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadUrl, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = async () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);

            if (uploadMethod === 'cloudinary') {
              if (response.secure_url) {
                setUrl(response.secure_url);
                await updateCustomData(id, response.secure_url);
                setIsEditing(false);
              } else {
                setUploadError(response.error?.message || "Không tìm thấy secure_url từ Cloudinary.");
              }
            } else {
              // Local API upload
              if (response.success && response.url) {
                setUrl(response.url);
                await updateCustomData(id, response.url);
                setIsEditing(false);
              } else {
                setUploadError(response.error || "Không thể tải lên tệp lên Máy chủ.");
              }
            }
          } else {
            let errorMsg = "Lỗi phản hồi từ máy chủ tải lên.";
            try {
              const errJson = JSON.parse(xhr.responseText);
              if (uploadMethod === 'cloudinary') {
                errorMsg = errJson.error?.message || errorMsg;
              } else {
                errorMsg = errJson.error || errorMsg;
              }
            } catch {}
            setUploadError(errorMsg);
          }
        } catch (err: any) {
          console.error("Upload process error:", err);
          setUploadError(`Lỗi xử lý phản hồi: ${err.message}`);
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      };

      xhr.onerror = () => {
        setUploadError("Lỗi kết nối mạng khi tải tệp lên.");
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };

      xhr.send(formData);
    }
  };

  const handleSave = () => {
    updateCustomData(id, url);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setUrl(src);
    setUploadError(null);
    setUploadProgress(0);
    setIsEditing(false);
  };

  const handleReset = () => {
    updateCustomData(id, null);
    setUrl(defaultSrc);
    setUploadError(null);
    setUploadProgress(0);
    setIsEditing(false);
  };

  return (
    <div className={`relative group w-full h-full flex items-center justify-center bg-slate-50 overflow-hidden ${isEditMode ? 'ring-2 ring-blue-500/20' : ''}`}>
      {hasError ? (
        <div className="flex flex-col items-center justify-center text-slate-300 p-4 text-center">
          <ImageIcon className="w-8 h-8 mb-2 opacity-20" />
          <span className="text-[10px] font-bold uppercase tracking-tighter opacity-50">Ảnh không tải được</span>
        </div>
      ) : (
        <img 
          src={src} 
          alt={alt} 
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className={`${className} transition-opacity duration-300 ${isEditing ? 'opacity-10' : 'opacity-100'}`}
        />
      )}

      {isEditMode && !isEditing && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/10 z-25">
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-full shadow-2xl flex items-center gap-2 font-black text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all"
          >
            <ImageIcon className="w-4 h-4" /> ĐỔI ẢNH
          </button>
        </div>
      )}

      {isEditing && (
        <div 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-1.5 overflow-y-auto w-full h-full"
        >
          <div className="w-full max-w-[240px] flex flex-col justify-center gap-1.5 p-1 text-center" onClick={(e) => e.stopPropagation()}>
            {isUploading ? (
              <div className="flex flex-col items-center justify-center py-2 space-y-1">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                <span className="text-[9px] font-bold text-slate-300">Đang tải: {uploadProgress}%</span>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                  <div 
                    className="bg-blue-500 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Method selector */}
                <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800/80 w-full mb-1">
                  <button
                    type="button"
                    onClick={() => setUploadMethod('imagekit')}
                    className={`flex-1 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider transition-all ${uploadMethod === 'imagekit' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-205'}`}
                  >
                    ImageKit 📸
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('cloudinary')}
                    className={`flex-1 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider transition-all ${uploadMethod === 'cloudinary' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-205'}`}
                  >
                    Cloudinary 🌐
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('local')}
                    className={`flex-1 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider transition-all ${uploadMethod === 'local' ? 'bg-slate-850 text-white' : 'text-slate-400 hover:text-slate-205'}`}
                  >
                    Máy chủ 🖥️
                  </button>
                </div>

                {/* Cloudinary config UI */}
                {uploadMethod === 'cloudinary' && (
                  <div className="flex flex-col gap-1 text-left w-full mb-1">
                    <div className="flex items-center justify-between text-[8px] bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800/40">
                      <span className="text-slate-400 truncate">Cloud: <strong className="text-blue-400 font-mono">{cloudinaryCloudName || "Chưa thiết lập"}</strong></span>
                      <button
                        type="button"
                        onClick={() => setShowConfig(!showConfig)}
                        className="text-blue-400 font-black hover:underline flex items-center gap-0.5 text-[8px]"
                      >
                        <Settings className="w-2 h-2" /> {showConfig ? "Đóng" : "Sửa"}
                      </button>
                    </div>

                    {showConfig && (
                      <div className="flex flex-col gap-1 p-1.5 bg-slate-950/90 rounded border border-blue-900/30">
                        <label className="text-[7px] text-blue-400 font-bold uppercase tracking-wider">Nhập Cloud Name của bạn:</label>
                        <div className="flex gap-1">
                          <input
                            className="flex-1 px-1 py-0.5 bg-slate-900 border border-slate-700 rounded text-white text-[9px] outline-none"
                            value={cloudinaryCloudName}
                            onChange={(e) => setCloudinaryCloudName(e.target.value)}
                            placeholder="Tên Cloud Name..."
                          />
                          <button
                            type="button"
                            onClick={handleSaveCloudName}
                            disabled={isSavingCloudName}
                            className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 rounded text-white text-[8px] font-bold"
                          >
                            Lưu
                          </button>
                        </div>
                        <p className="text-[7px] text-slate-400 leading-normal">Cấu hình này sẽ được lưu dùng chung cho toàn bộ website.</p>
                      </div>
                    )}
                  </div>
                )}

                <input 
                  type="file"
                  id={`file-input-${id}`}
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                
                <div className="w-full text-left flex flex-col gap-0.5">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Hoặc dán link ảnh:</span>
                  <input 
                    className="w-full px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-white text-[9px] outline-none"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Dán link ảnh tại đây..."
                    autoFocus
                  />
                </div>
                
                {uploadError && (
                  <p className="text-red-400 text-[8px] font-medium leading-normal text-center bg-red-950/40 border border-red-900/50 px-1 py-0.5 rounded max-w-full">
                    {uploadError}
                  </p>
                )}
                
                <div className="grid grid-cols-2 gap-1 w-full mt-0.5">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[8px] font-extrabold uppercase tracking-widest flex items-center justify-center gap-0.5 transition-colors cursor-pointer text-center"
                  >
                    <Upload className="w-2.5 h-2.5" /> TẢI TỪ MÁY
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSave();
                    }}
                    className="p-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[8px] font-extrabold uppercase tracking-widest flex items-center justify-center gap-0.5 transition-colors"
                  >
                    <Check className="w-2.5 h-2.5" /> Lưu link
                  </button>
                </div>
                
                <div className="flex gap-1 justify-center border-t border-slate-800/80 pt-1 mt-1">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCancel();
                    }}
                    className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-[8px] font-medium flex items-center gap-0.5"
                  >
                    <X className="w-2.5 h-2.5" /> Hủy
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleReset();
                    }}
                    title="Khôi phục mặc định"
                    className="p-1 px-2 bg-red-950 hover:bg-red-900 border border-red-900/30 text-red-200 rounded text-[8px] font-medium flex items-center gap-0.5"
                  >
                    <RefreshCw className="w-2.5 h-2.5" /> Reset
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
