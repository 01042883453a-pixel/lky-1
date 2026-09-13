import React, { useState, useEffect, useRef } from 'react';
import { ReadingRecord } from '../types';
import { toLocalDateString } from '../utils/dateUtils';
import {
  X,
  Upload,
  ClipboardPaste,
  Image as ImageIcon,
  Trash2,
  BookOpen,
  Calendar,
  User,
  Star,
  Quote,
  Smile,
  AlertCircle,
  Tag,
  Bookmark,
  Camera,
  Check,
  Maximize2,
} from 'lucide-react';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: ReadingRecord) => Promise<void>;
  initialRecord?: ReadingRecord | null;
  defaultDate?: string;
  onPreviewImage?: (imageUrl: string) => void;
}

export default function RecordModal({
  isOpen,
  onClose,
  onSave,
  initialRecord,
  defaultDate,
  onPreviewImage,
}: RecordModalProps) {
  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [date, setDate] = useState(defaultDate || toLocalDateString());
  const [pageRange, setPageRange] = useState('');
  const [category, setCategory] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [quote, setQuote] = useState('');
  const [reflection, setReflection] = useState('');

  // Images separated by section for direct contextual attachment
  const [quoteImages, setQuoteImages] = useState<string[]>([]);
  const [reflectionImages, setReflectionImages] = useState<string[]>([]);
  const [generalImages, setGeneralImages] = useState<string[]>([]);

  const [pasteNotice, setPasteNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Drag over states for visual feedback
  const [isQuoteDragOver, setIsQuoteDragOver] = useState(false);
  const [isReflectionDragOver, setIsReflectionDragOver] = useState(false);

  // File input refs
  const quoteFileInputRef = useRef<HTMLInputElement>(null);
  const reflectionFileInputRef = useRef<HTMLInputElement>(null);
  const generalFileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Sync state with initialRecord or defaults
  useEffect(() => {
    if (initialRecord) {
      setBookTitle(initialRecord.bookTitle);
      setAuthor(initialRecord.author);
      setDate(initialRecord.date);
      setPageRange(initialRecord.pageRange || '');
      setCategory(initialRecord.category || '');
      setRating(initialRecord.rating || 5);
      setQuote(initialRecord.quote);
      setReflection(initialRecord.reflection);

      const qImgs = initialRecord.quoteImages || [];
      const rImgs = initialRecord.reflectionImages || [];
      setQuoteImages(qImgs);
      setReflectionImages(rImgs);

      // Remaining images from record.images that aren't in quote/reflection
      const allImgs = initialRecord.images || [];
      const otherImgs = allImgs.filter(
        (img) => !qImgs.includes(img) && !rImgs.includes(img)
      );
      setGeneralImages(otherImgs);
    } else {
      setBookTitle('');
      setAuthor('');
      setDate(defaultDate || toLocalDateString());
      setPageRange('');
      setCategory('');
      setRating(5);
      setQuote('');
      setReflection('');
      setQuoteImages([]);
      setReflectionImages([]);
      setGeneralImages([]);
    }
    setErrorMessage('');
    setPasteNotice(null);
  }, [initialRecord, defaultDate, isOpen]);

  // Helper to read image file into base64 Data URL
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Not an image file'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) resolve(dataUrl);
        else reject(new Error('Failed to read file'));
      };
      reader.onerror = () => reject(new Error('File reading error'));
      reader.readAsDataURL(file);
    });
  };

  // Extract images from ClipboardEvent
  const extractImagesFromClipboard = (e: React.ClipboardEvent | ClipboardEvent): File[] => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return [];
    const imageFiles: File[] = [];

    const items = clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }
    return imageFiles;
  };

  // Show temporary toast notification inside modal
  const triggerPasteNotice = (msg: string) => {
    setPasteNotice(msg);
    setTimeout(() => {
      setPasteNotice((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // 1. Paste handler for "주요 내용 필사" textarea
  const handleQuotePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const imageFiles = extractImagesFromClipboard(e);
    if (imageFiles.length > 0) {
      e.preventDefault(); // Don't insert binary/filename text into textarea
      try {
        const newUrls = await Promise.all(imageFiles.map(readFileAsDataUrl));
        setQuoteImages((prev) => [...prev, ...newUrls]);
        triggerPasteNotice(`📌 '주요 내용 필사'에 사진 ${newUrls.length}장이 붙여넣어졌습니다!`);
      } catch (err) {
        console.error(err);
      }
    }
    // If text was pasted, default browser behavior naturally inserts it into the textarea!
  };

  // 2. Paste handler for "읽고 난 느낌 & 감상" textarea
  const handleReflectionPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const imageFiles = extractImagesFromClipboard(e);
    if (imageFiles.length > 0) {
      e.preventDefault(); // Don't insert binary/filename text into textarea
      try {
        const newUrls = await Promise.all(imageFiles.map(readFileAsDataUrl));
        setReflectionImages((prev) => [...prev, ...newUrls]);
        triggerPasteNotice(`💬 '읽고 난 느낌 & 감상'에 사진 ${newUrls.length}장이 붙여넣어졌습니다!`);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // 3. Global Modal Paste handler (when focus is not on quote or reflection textarea)
  useEffect(() => {
    if (!isOpen) return;

    const handleWindowPaste = async (e: ClipboardEvent) => {
      const activeEl = document.activeElement;
      const isQuoteActive = activeEl?.id === 'textarea-quote';
      const isReflectionActive = activeEl?.id === 'textarea-reflection';

      // If active in one of the specific textareas, its own onPaste handler takes care of it
      if (isQuoteActive || isReflectionActive) {
        return;
      }

      const imageFiles = extractImagesFromClipboard(e);
      if (imageFiles.length > 0) {
        e.preventDefault();
        try {
          const newUrls = await Promise.all(imageFiles.map(readFileAsDataUrl));
          setGeneralImages((prev) => [...prev, ...newUrls]);
          triggerPasteNotice(`📷 첨부 사진에 ${newUrls.length}장이 추가되었습니다!`);
        } catch (err) {
          console.error(err);
        }
      }
    };

    window.addEventListener('paste', handleWindowPaste);
    return () => {
      window.removeEventListener('paste', handleWindowPaste);
    };
  }, [isOpen]);

  // Handle file picker selection for each section
  const handleQuoteFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const imageFiles = (Array.from(files) as File[]).filter((f) => f.type.startsWith('image/'));
    const urls = await Promise.all(imageFiles.map(readFileAsDataUrl));
    setQuoteImages((prev) => [...prev, ...urls]);
    triggerPasteNotice(`📌 필사 사진 ${urls.length}장이 추가되었습니다.`);
  };

  const handleReflectionFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const imageFiles = (Array.from(files) as File[]).filter((f) => f.type.startsWith('image/'));
    const urls = await Promise.all(imageFiles.map(readFileAsDataUrl));
    setReflectionImages((prev) => [...prev, ...urls]);
    triggerPasteNotice(`💬 감상 사진 ${urls.length}장이 추가되었습니다.`);
  };

  const handleGeneralFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const imageFiles = (Array.from(files) as File[]).filter((f) => f.type.startsWith('image/'));
    const urls = await Promise.all(imageFiles.map(readFileAsDataUrl));
    setGeneralImages((prev) => [...prev, ...urls]);
    triggerPasteNotice(`📷 사진 ${urls.length}장이 추가되었습니다.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim()) {
      setErrorMessage('책 제목을 입력해 주세요.');
      return;
    }
    if (!author.trim()) {
      setErrorMessage('저자를 입력해 주세요.');
      return;
    }
    if (!date) {
      setErrorMessage('독서 일자를 선택해 주세요.');
      return;
    }
    if (!quote.trim() && !reflection.trim()) {
      setErrorMessage('주요 내용 필사 또는 읽고 난 느낌 중 하나 이상을 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = Date.now();
      // Combine all images into images array for seamless backward-compatibility
      const combinedImages = Array.from(
        new Set([...quoteImages, ...reflectionImages, ...generalImages])
      );

      const recordToSave: ReadingRecord = {
        id: initialRecord ? initialRecord.id : `record-${now}-${Math.random().toString(36).substring(2, 7)}`,
        bookTitle: bookTitle.trim(),
        author: author.trim(),
        date,
        quote: quote.trim(),
        reflection: reflection.trim(),
        images: combinedImages,
        quoteImages: quoteImages.length > 0 ? quoteImages : undefined,
        reflectionImages: reflectionImages.length > 0 ? reflectionImages : undefined,
        pageRange: pageRange.trim() || undefined,
        category: category.trim() || undefined,
        rating,
        createdAt: initialRecord ? initialRecord.createdAt : now,
        updatedAt: now,
      };

      await onSave(recordToSave);
      onClose();
    } catch (err) {
      setErrorMessage('저장 중 오류가 발생했습니다. 다시 시도해 주세요.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const categories = ['소설 / 문학', '인문 / 철학', '에세이 / 시', '경제 / 경영', '사회 / 역사', '과학 / IT', '자기계발', '예술 / 문화'];

  return (
    <div
      id="record-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="record-modal"
        ref={modalRef}
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold shadow-2xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                {initialRecord ? '독서 기록 수정하기' : '새로운 독서 기록 남기기'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500">
                필사 및 감상란에 사진을 <kbd className="font-mono bg-stone-200/80 px-1.5 py-0.5 rounded text-stone-800 text-xs font-semibold">Ctrl+V</kbd> 로 바로 붙여넣을 수 있습니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-record-modal"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Paste Notification Banner */}
          {pasteNotice && (
            <div className="flex items-center gap-2.5 p-3.5 bg-amber-50 border border-amber-300 text-amber-950 rounded-xl text-sm font-bold shadow-xs transition-all animate-pulse">
              <ClipboardPaste className="w-4 h-4 shrink-0 text-amber-700" />
              <span>{pasteNotice}</span>
            </div>
          )}

          {/* Basic Book Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Book Title */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-stone-800 mb-1.5">
                <BookOpen className="w-4 h-4 text-amber-700" />
                책 제목 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="input-book-title"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="예: 데미안, 어린 왕자, 총 균 쇠"
                required
                className="w-full px-4 py-2.5 text-base bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 placeholder:text-stone-400"
              />
            </div>

            {/* Author */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-stone-800 mb-1.5">
                <User className="w-4 h-4 text-amber-700" />
                저자 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="input-book-author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="예: 헤르만 헤세, 앙투안 드 생텍쥐페리"
                required
                className="w-full px-4 py-2.5 text-base bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 placeholder:text-stone-400"
              />
            </div>

            {/* Reading Date */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-stone-800 mb-1.5">
                <Calendar className="w-4 h-4 text-amber-700" />
                독서 일자 <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                id="input-reading-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-base bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            {/* Page Range */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-stone-800 mb-1.5">
                <Bookmark className="w-4 h-4 text-amber-700" />
                읽은 쪽수 / 범위 (선택)
              </label>
              <input
                type="text"
                id="input-page-range"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                placeholder="예: p. 45 - 120, 완독"
                className="w-full px-4 py-2.5 text-base bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 placeholder:text-stone-400"
              />
            </div>

            {/* Category */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-stone-800 mb-1.5">
                <Tag className="w-4 h-4 text-amber-700" />
                분야 / 장르 (선택)
              </label>
              <input
                type="text"
                id="input-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="예: 소설, 인문, 에세이"
                className="w-full px-4 py-2.5 text-base bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 placeholder:text-stone-400"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      category === cat
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-stone-800 mb-1.5">
                <Star className="w-4 h-4 text-amber-700" />
                나의 별점
              </label>
              <div className="flex items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    id={`btn-rating-star-${star}`}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-115 transition-transform"
                    title={`${star}점`}
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300 hover:text-amber-200'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm text-stone-600 ml-2 font-bold">
                  {rating}점 / 5점
                </span>
              </div>
            </div>
          </div>

          {/* 1. 주요 내용 필사 (Key Quote) + 이미지 붙여넣기 및 사진 관리 */}
          <div
            className={`rounded-2xl border transition-all p-4.5 sm:p-5 ${
              isQuoteDragOver
                ? 'bg-amber-100/50 border-amber-500 ring-2 ring-amber-400/30'
                : 'bg-amber-50/40 border-amber-200/80'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsQuoteDragOver(true);
            }}
            onDragLeave={() => setIsQuoteDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsQuoteDragOver(false);
              if (e.dataTransfer.files) {
                handleQuoteFiles(e.dataTransfer.files);
              }
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <label className="flex items-center gap-2 text-sm sm:text-base font-bold text-amber-950">
                <Quote className="w-4 h-4 text-amber-800" />
                <span>주요 내용 필사 (기억하고 싶은 문장)</span>
              </label>

              {/* Action Toolbar for Quote: Paste hint & Upload button */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300/60 hidden sm:inline-flex items-center gap-1">
                  <ClipboardPaste className="w-3.5 h-3.5 text-amber-700" />
                  <span>필사창 클릭 후 Ctrl+V로 사진 붙여넣기</span>
                </span>
                <button
                  type="button"
                  onClick={() => quoteFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-white hover:bg-amber-100/80 border border-amber-300 px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
                  title="필사 관련 사진 첨부"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-800" />
                  <span>필사 사진 추가</span>
                </button>
                <input
                  type="file"
                  ref={quoteFileInputRef}
                  onChange={(e) => {
                    handleQuoteFiles(e.target.files);
                    e.target.value = '';
                  }}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
              </div>
            </div>

            {/* Textarea with onPaste support for images */}
            <textarea
              id="textarea-quote"
              rows={4}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              onPaste={handleQuotePaste}
              placeholder="책 속 감명 깊은 문장이나 구절을 입력하세요. 복사한 사진이 있다면 여기에서 [Ctrl+V]를 누르면 사진도 함께 첨부됩니다."
              className="w-full p-3.5 text-base sm:text-lg bg-white/90 border border-amber-300/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-700 placeholder:text-stone-400 leading-relaxed font-serif"
              style={{ fontFamily: "'Nanum Myeongjo', serif" }}
            />

            {/* Quote attached images preview */}
            {quoteImages.length > 0 && (
              <div className="mt-3 pt-3 border-t border-amber-200/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-800" />
                    <span>필사에 첨부된 사진 ({quoteImages.length}장)</span>
                  </span>
                  <span className="text-xs text-amber-800">
                    책 속 페이지 스캔본이나 필사 노트 사진
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {quoteImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-[4/3] rounded-xl overflow-hidden border border-amber-300 bg-stone-100 group shadow-xs"
                    >
                      <img
                        src={img}
                        alt={`필사 사진 ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => setQuoteImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/75 hover:bg-rose-600 text-white rounded-lg transition-colors shadow-xs"
                        title="사진 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {/* Zoom button */}
                      {onPreviewImage && (
                        <button
                          type="button"
                          onClick={() => onPreviewImage(img)}
                          className="absolute bottom-1.5 right-1.5 p-1 bg-black/75 hover:bg-amber-700 text-white rounded-lg transition-colors shadow-xs"
                          title="크게 보기"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <span className="absolute bottom-1.5 left-1.5 text-2xs bg-black/70 text-white px-1.5 py-0.5 rounded font-medium">
                        필사 #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. 읽고 난 느낌 & 감상 (Reflection) + 이미지 붙여넣기 및 사진 관리 */}
          <div
            className={`rounded-2xl border transition-all p-4.5 sm:p-5 ${
              isReflectionDragOver
                ? 'bg-stone-100 border-amber-600 ring-2 ring-amber-400/30'
                : 'bg-stone-50/70 border-stone-200'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsReflectionDragOver(true);
            }}
            onDragLeave={() => setIsReflectionDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsReflectionDragOver(false);
              if (e.dataTransfer.files) {
                handleReflectionFiles(e.dataTransfer.files);
              }
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <label className="flex items-center gap-2 text-sm sm:text-base font-bold text-stone-900">
                <Smile className="w-4 h-4 text-amber-700" />
                <span>읽고 난 느낌 & 감상</span>
              </label>

              {/* Action Toolbar for Reflection: Paste hint & Upload button */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-700 bg-stone-200/80 px-2.5 py-1 rounded-lg border border-stone-300/60 hidden sm:inline-flex items-center gap-1">
                  <ClipboardPaste className="w-3.5 h-3.5 text-stone-600" />
                  <span>감상창 클릭 후 Ctrl+V로 사진 붙여넣기</span>
                </span>
                <button
                  type="button"
                  onClick={() => reflectionFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-800 bg-white hover:bg-stone-100 border border-stone-300 px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
                  title="감상 관련 사진 첨부"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-800" />
                  <span>감상 사진 추가</span>
                </button>
                <input
                  type="file"
                  ref={reflectionFileInputRef}
                  onChange={(e) => {
                    handleReflectionFiles(e.target.files);
                    e.target.value = '';
                  }}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
              </div>
            </div>

            {/* Textarea with onPaste support for images */}
            <textarea
              id="textarea-reflection"
              rows={4}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              onPaste={handleReflectionPaste}
              placeholder="이 책을 읽으며 느낀 생각, 영감, 깨달음을 자유롭게 적어보세요. 복사한 사진이나 마인드맵 이미지가 있다면 [Ctrl+V]로 바로 붙여넣을 수 있습니다."
              className="w-full p-3.5 text-base sm:text-lg bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 placeholder:text-stone-400 leading-relaxed"
            />

            {/* Reflection attached images preview */}
            {reflectionImages.length > 0 && (
              <div className="mt-3 pt-3 border-t border-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-bold text-stone-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-800" />
                    <span>감상란에 첨부된 사진 ({reflectionImages.length}장)</span>
                  </span>
                  <span className="text-xs text-stone-500">
                    독서 감상 관련 메모, 도표나 감상 사진
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {reflectionImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-[4/3] rounded-xl overflow-hidden border border-stone-200 bg-stone-100 group shadow-xs"
                    >
                      <img
                        src={img}
                        alt={`감상 사진 ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => setReflectionImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/75 hover:bg-rose-600 text-white rounded-lg transition-colors shadow-xs"
                        title="사진 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {/* Zoom button */}
                      {onPreviewImage && (
                        <button
                          type="button"
                          onClick={() => onPreviewImage(img)}
                          className="absolute bottom-1.5 right-1.5 p-1 bg-black/75 hover:bg-amber-700 text-white rounded-lg transition-colors shadow-xs"
                          title="크게 보기"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <span className="absolute bottom-1.5 left-1.5 text-2xs bg-black/70 text-white px-1.5 py-0.5 rounded font-medium">
                        감상 #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. 책 표지 및 기타 일반 첨부 사진 영역 */}
          <div className="pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-sm font-bold text-stone-800">
                <ImageIcon className="w-4 h-4 text-amber-700" />
                <span>책 표지 및 추가 사진 첨부 (선택)</span>
              </label>
              <button
                type="button"
                onClick={() => generalFileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-amber-950 bg-stone-100 hover:bg-amber-50 border border-stone-200 px-3 py-1 rounded-lg transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>사진 파일 선택</span>
              </button>
              <input
                type="file"
                ref={generalFileInputRef}
                onChange={(e) => {
                  handleGeneralFiles(e.target.files);
                  e.target.value = '';
                }}
                accept="image/*"
                multiple
                className="hidden"
              />
            </div>

            {/* General image previews or drop invitation */}
            {generalImages.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {generalImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-100 group shadow-xs"
                  >
                    <img
                      src={img}
                      alt={`추가 사진 ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setGeneralImages((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1.5 right-1.5 p-1.5 bg-black/75 hover:bg-rose-600 text-white rounded-lg transition-colors shadow-xs"
                      title="사진 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {onPreviewImage && (
                      <button
                        type="button"
                        onClick={() => onPreviewImage(img)}
                        className="absolute bottom-1.5 right-1.5 p-1.5 bg-black/75 hover:bg-amber-700 text-white rounded-lg transition-colors shadow-xs"
                        title="크게 보기"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    )}
                    <span className="absolute bottom-1.5 left-1.5 text-xs bg-black/70 text-white px-2 py-0.5 rounded-md font-semibold">
                      사진 {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => generalFileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-200 hover:border-amber-400 rounded-xl p-4 bg-stone-50/50 hover:bg-amber-50/30 transition-colors cursor-pointer text-center"
              >
                <p className="text-xs sm:text-sm text-stone-500">
                  책 표지나 기타 관련 사진이 있다면 이곳을 클릭하여 선택하거나 언제든 <kbd className="font-mono bg-stone-200 px-1 py-0.5 rounded text-stone-700">Ctrl+V</kbd> 로 붙여넣으세요.
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 shrink-0">
            <button
              type="button"
              id="btn-cancel-modal"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              id="btn-submit-record"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-bold text-white bg-amber-800 hover:bg-amber-900 active:bg-amber-950 rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? '저장 중...' : initialRecord ? '수정 완료' : '독서 기록 저장'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
