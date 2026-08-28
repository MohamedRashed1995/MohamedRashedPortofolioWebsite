import React, { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, RotateCcw, Check, AlertCircle, Sparkles, Eye } from 'lucide-react';
import { useProfileImage } from '@/context/ProfileImageContext';
import { useLanguage } from '@/context/LanguageContext';

export const AdminImageManager: React.FC = () => {
  const { profileImage, hasCustomImage, setCustomImage, resetToDefault } = useProfileImage();
  const { isRTL } = useLanguage();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resize and compress image using HTML5 Canvas to prevent storage overflow
  const optimizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1000; // max width/height in px for optimal crispness and fast load
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Invalid image file'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage(isRTL ? 'يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP)' : 'Please select a valid image file (JPG, PNG, WEBP)');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const optimizedDataUrl = await optimizeImage(file);
      setPreviewUrl(optimizedDataUrl);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error processing image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyImage = async () => {
    if (!previewUrl) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await setCustomImage(previewUrl);
      setSuccessMessage(isRTL ? 'تم تحديث صورتك الشخصية بنجاح عبر جميع صفحات الموقع!' : 'Profile image successfully updated across the entire site!');
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    resetToDefault();
    setPreviewUrl(null);
    setSelectedFile(null);
    setSuccessMessage(isRTL ? 'تمت استعادة الصورة الافتراضية بنجاح.' : 'Default original photo restored.');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card p-6 bg-theme-card border border-theme-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-accent">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRTL ? 'إدارة الوسائط الفورية' : 'Live Media Management'}</span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-theme-text mt-2">
            {isRTL ? 'تحديث وتغيير الصورة الشخصية' : 'Manage Profile & Site Images'}
          </h2>
          <p className="text-xs text-theme-muted mt-1 max-w-2xl leading-relaxed">
            {isRTL
              ? 'يمكنك هنا رفع وتحديث صورتك الشخصية من جهازك مباشرة، وسيتم تطبيقها وحفظها فوراً في الموقع على جميع الصفحات (Hero Section، About، Navbar).'
              : 'Upload and update your portrait photo directly from your device. Changes are instantly applied and preserved across all pages.'}
          </p>
        </div>

        {hasCustomImage && (
          <button
            type="button"
            onClick={handleReset}
            className="btn-ghost text-xs text-amber-400 hover:text-amber-300 border-amber-500/30"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isRTL ? 'استعادة الصورة الافتراضية' : 'Reset to Default Photo'}</span>
          </button>
        )}
      </div>

      {/* Upload Zone & Preview Grid */}
      <div className="grid md:grid-cols-12 gap-6">
        
        {/* Upload Box */}
        <div className="md:col-span-7 space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`card p-8 border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center min-h-[260px] ${
              isDragging
                ? 'border-theme-accent bg-theme-accent-light/30 shadow-lg'
                : 'border-theme-border hover:border-theme-accent/50 bg-theme-bg-sec/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp, image/jpg"
              onChange={handleInputChange}
              className="hidden"
            />

            <div className="w-14 h-14 rounded-2xl bg-theme-accent-light border border-theme-border flex items-center justify-center mb-4 text-theme-accent">
              <UploadCloud className="w-7 h-7" />
            </div>

            <h3 className="text-base font-semibold text-theme-text">
              {isRTL ? 'اسحب الصورة هنا أو اضغط للاختيار' : 'Drag & drop image here or click to browse'}
            </h3>
            <p className="text-xs text-theme-muted mt-1.5">
              {isRTL ? 'يدعم صيغ JPG, PNG, WEBP (حتى 10 ميجابايت)' : 'Supports JPG, PNG, WEBP (up to 10MB)'}
            </p>

            {selectedFile && (
              <div className="mt-4 px-3 py-1.5 rounded-lg bg-theme-accent-light border border-theme-accent/30 text-xs font-mono text-theme-accent">
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {previewUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 pt-2"
            >
              <button
                type="button"
                onClick={handleApplyImage}
                disabled={isProcessing}
                className="btn-primary flex-1 shadow-lg"
              >
                <Check className="w-4 h-4" />
                <span>{isRTL ? 'حفظ وتطبيق الصورة في الموقع' : 'Save & Apply Image'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  setSelectedFile(null);
                }}
                className="btn-ghost"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
            </motion.div>
          )}

          {/* Feedback alerts */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2"
            >
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </motion.div>
          )}

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </div>

        {/* Live Comparison Previews */}
        <div className="md:col-span-5 space-y-4">
          <div className="card p-5 bg-theme-card border border-theme-border">
            <h4 className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-theme-accent" />
              <span>{isRTL ? 'معاينة فورية (Live Theme Preview)' : 'Live Theme Preview'}</span>
            </h4>

            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-theme-bg-sec/70 border border-theme-border">
              
              {/* Circular Avatar with Glowing Ring */}
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-tr from-theme-accent via-theme-accent/40 to-transparent rounded-full blur-lg opacity-60" />
                
                <div className="relative p-1.5 rounded-full bg-theme-card border border-theme-accent/40 shadow-xl">
                  <div className="w-36 h-36 rounded-full overflow-hidden ring-4 ring-theme-accent/20 border-2 border-theme-accent">
                    <img
                      src={previewUrl || profileImage}
                      alt="Mohamed Rashed"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>
              </div>

              <div className="text-center mt-4">
                <p className="text-sm font-bold text-theme-text">Mohamed Rashed Abdelazim</p>
                <p className="text-xs text-theme-accent font-medium mt-0.5">Full-Stack .NET Developer</p>
                
                <span className="inline-block mt-3 px-2.5 py-1 rounded-full text-[11px] font-mono bg-theme-accent-light text-theme-accent border border-theme-accent/30">
                  {previewUrl
                    ? (isRTL ? 'معاينة الصورة الجديدة (لم يتم الحفظ بعد)' : 'Previewing New Image')
                    : (hasCustomImage ? (isRTL ? 'صورة مخصصة نشطة' : 'Custom Image Active') : (isRTL ? 'الصورة الافتراضية' : 'Default Image Active'))
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
