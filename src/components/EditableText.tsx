import React, { useState, useEffect } from 'react';
import { useAdmin } from '../lib/AdminContext';
import { Edit2, Check, X, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface EditableTextProps {
  id: string;
  defaultText: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'p' | 'span' | 'markdown';
}

export default function EditableText({ id, defaultText, className = "", as: Tag = "span" }: EditableTextProps) {
  const { isEditMode, customData, updateCustomData } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(customData[id] || defaultText);

  useEffect(() => {
    if (customData[id]) {
      setText(customData[id]);
    }
  }, [customData, id]);

  const handleSave = () => {
    updateCustomData(id, text);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setText(customData[id] || defaultText);
    setIsEditing(false);
  };

  const renderContent = () => {
    if (Tag === 'markdown') {
      return (
        <div className="markdown-content">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      );
    }
    const ActualTag = Tag as any;
    return <ActualTag className={className}>{text}</ActualTag>;
  };

  if (isEditMode) {
    return (
      <div className={`relative group inline-block w-full ${className}`}>
        {isEditing ? (
          <div className="flex items-start gap-4 w-full bg-slate-50 p-4 rounded-2xl border-2 border-blue-500 shadow-xl z-50">
            <textarea
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 outline-none w-full min-h-[200px] font-sans text-sm leading-relaxed"
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
              placeholder="Nhập nội dung (hỗ trợ Markdown)..."
            />
            <div className="flex flex-col gap-2 shrink-0">
              <button 
                onClick={handleSave}
                className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-lg transition-all"
                title="Lưu lại"
              >
                <Check className="w-5 h-5" />
              </button>
              <button 
                onClick={handleCancel}
                className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-lg transition-all"
                title="Hủy bỏ"
              >
                <X className="w-5 h-5" />
              </button>
              {Tag === 'markdown' && (
                <div className="mt-4 p-2 bg-blue-50 rounded-lg text-[10px] text-blue-600 font-bold uppercase tracking-widest text-center border border-blue-100">
                  Markdown Mode
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 group/inner w-full min-h-[20px]">
            <div className="flex-grow">
              {renderContent()}
            </div>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-2 bg-blue-600 text-white rounded-full opacity-0 group-hover/inner:opacity-100 transition-opacity shrink-0 shadow-xl hover:scale-110 active:scale-95"
              title="Chỉnh sửa nội dung"
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return renderContent();
}
