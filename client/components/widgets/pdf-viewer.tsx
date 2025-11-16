"use client";

import { useState, useEffect } from "react";
import {
  Download,
  FileText,
  Loader2,
  AlertTriangle,
  Maximize2,
  ExternalLink,
  X,
  Minimize2,
  Printer,
} from "lucide-react";

export default function PdfViewer({ url }: { url: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isFullscreen]);

  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `lesson-document-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      window.open(url, "_blank");
    }
  };

  const handlePrint = () => {
    window.open(url, "_blank");
  };

  return (
    <>
      {/* Normal View */}
      <div
        className={`bg-white dark:bg-slate-900 rounded-3xl border-2 border-gray-200 dark:border-slate-700 overflow-hidden transition-all duration-300  ${
          isMinimized ? "h-auto" : ""
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#295638] via-[#2d5f3e] to-[#3a7049] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-0.5">
                  مرفقات الدرس
                </h3>
                <p className="text-sm text-white/90 font-medium">
                  ملف PDF للمعاينة والتحميل
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2.5 rounded-xl hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/10"
              title={isMinimized ? "توسيع" : "تصغير"}
            >
              {isMinimized ? (
                <Maximize2 className="w-5 h-5 text-white" />
              ) : (
                <Minimize2 className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Quick Action Toolbar */}
            <div className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-3">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button
                  onClick={handleDownload}
                  disabled={isError}
                  className="inline-flex items-center gap-2 bg-[#295638] hover:bg-[#1f4229] text-white font-bold py-2.5 px-5 rounded-xl transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 bg-[#0047AB] hover:bg-[#0047AB]/90 text-white font-bold py-2.5 px-5 rounded-xl transition-all duration-200 text-sm shadow-md hover:shadow-lg"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة</span>
                </button>

                <button
                  onClick={() => setIsFullscreen(true)}
                  className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-bold py-2.5 px-5 rounded-xl transition-all duration-200 text-sm shadow-md hover:shadow-lg"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>ملء الشاشة</span>
                </button>

                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-bold py-2.5 px-5 rounded-xl transition-all duration-200 text-sm shadow-md hover:shadow-lg"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>فتح في نافذة جديدة</span>
                </a>
              </div>
            </div>

            {/* PDF Viewer - Native Browser View */}
            <div className="relative bg-gray-900" style={{ height: "800px" }}>
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-white dark:bg-slate-900">
                  <Loader2 className="w-12 h-12 text-[#295638] animate-spin" />
                  <p className="text-base text-gray-700 dark:text-gray-300 font-semibold">
                    جاري تحميل المستند...
                  </p>
                </div>
              )}

              {isError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10 bg-white dark:bg-slate-900">
                  <div className="bg-red-50 dark:bg-red-900/30 rounded-2xl p-6 mb-6 border-2 border-red-200 dark:border-red-800">
                    <AlertTriangle className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto" />
                  </div>
                  <h4 className="text-2xl font-bold text-red-900 dark:text-red-300 mb-3">
                    فشل تحميل الملف
                  </h4>
                  <p className="text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md leading-relaxed">
                    عذراً، لم نتمكن من عرض ملف PDF. قد يكون الرابط غير صحيح أو
                    الملف غير متاح.
                  </p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#295638] hover:bg-[#1f4229] text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
                  >
                    <ExternalLink className="w-5 h-5" />
                    محاولة الفتح في نافذة جديدة
                  </a>
                </div>
              )}

              {/* Native PDF viewer - no modifications to display */}
              <iframe
                src={url}
                className="w-full h-full border-0"
                title="PDF Document Viewer"
                onLoad={() => {
                  setIsLoading(false);
                  setIsError(false);
                }}
                onError={() => {
                  setIsLoading(false);
                  setIsError(true);
                }}
              />
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-800/50 border-t border-gray-200 dark:border-slate-700 p-4">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-[#295638] rounded-full"></div>
                  <span>
                    يمكنك استخدام أدوات PDF المدمجة في المتصفح للتحكم الكامل
                  </span>
                </div>
                <span className="text-gray-400 dark:text-gray-600">•</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-[#295638] rounded-full"></div>
                  <span>التكبير والتصغير والتنقل بين الصفحات</span>
                </div>
              </div>
            </div>
          </>
        )}

        {isMinimized && (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              مرفقات الدرس مصغرة - اضغط لتوسيع
            </p>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Fullscreen Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#295638]/95 to-[#3a7049]/95 backdrop-blur-md border-b border-white/10">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-white" />
              <h3 className="text-lg font-bold text-white">مرفقات الدرس</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
              >
                <Download className="w-4 h-4" />
                <span>تحميل</span>
              </button>

              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2.5 rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/20"
                title="إغلاق (ESC)"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Fullscreen PDF Viewer */}
          <div className="flex-1 bg-gray-900">
            <iframe
              src={url}
              className="w-full h-full border-0"
              title="PDF Fullscreen Viewer"
            />
          </div>
        </div>
      )}
    </>
  );
}
