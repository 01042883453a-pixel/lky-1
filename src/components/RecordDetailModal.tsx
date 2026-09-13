import React, { useState } from 'react';
import { ReadingRecord } from '../types';
import { formatKoreanDate } from '../utils/dateUtils';
import {
  X,
  Edit3,
  Trash2,
  Copy,
  Check,
  Quote,
  BookOpen,
  Calendar,
  Tag,
  Bookmark,
  Star,
  ExternalLink,
} from 'lucide-react';

interface RecordDetailModalProps {
  record: ReadingRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (record: ReadingRecord) => void;
  onDelete: (id: string) => void;
  onImageClick: (imageUrl: string) => void;
}

export default function RecordDetailModal({
  record,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onImageClick,
}: RecordDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !record) return null;

  const handleCopyQuote = async () => {
    if (!record.quote) return;
    try {
      const textToCopy = `"${record.quote}"\n— ${record.bookTitle} (${record.author})`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDelete = () => {
    if (window.confirm(`'${record.bookTitle}' 독서 기록을 삭제하시겠습니까?`)) {
      onDelete(record.id);
      onClose();
    }
  };

  return (
    <div
      id="record-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="record-detail-modal"
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title & Action Buttons */}
        <div className="p-5 sm:p-6 bg-stone-50/90 border-b border-stone-200/80">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap text-sm text-stone-600 mb-2">
                <span className="inline-flex items-center gap-1.5 font-semibold text-amber-950 bg-amber-100/80 px-2.5 py-1 rounded-md border border-amber-300/60">
                  <Calendar className="w-4 h-4 text-amber-800" />
                  {formatKoreanDate(record.date)}
                </span>
                {record.category && (
                  <span className="inline-flex items-center gap-1.5 font-medium text-stone-700 bg-stone-200/80 px-2.5 py-1 rounded-md">
                    <Tag className="w-3.5 h-3.5 text-stone-500" />
                    {record.category}
                  </span>
                )}
                {record.pageRange && (
                  <span className="inline-flex items-center gap-1.5 font-medium text-stone-700 bg-stone-200/80 px-2.5 py-1 rounded-md">
                    <Bookmark className="w-3.5 h-3.5 text-stone-500" />
                    {record.pageRange}
                  </span>
                )}
              </div>

              {/* Book Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug tracking-tight flex items-start gap-2.5">
                <BookOpen className="w-6 h-6 text-amber-800 shrink-0 mt-0.5" />
                <span>{record.bookTitle}</span>
              </h2>

              {/* Author & Star Rating */}
              <div className="flex items-center gap-4 flex-wrap mt-2">
                <p className="text-base text-stone-700 font-medium">
                  저자: <span className="font-semibold text-stone-900">{record.author}</span>
                </p>

                {record.rating && record.rating > 0 && (
                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                    <span className="text-xs font-bold text-amber-900 mr-1">평점</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= record.rating!
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-amber-800 ml-1">
                      {record.rating}.0
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick close button */}
            <button
              type="button"
              id="btn-close-detail-modal"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-xl transition-colors shrink-0"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1">
          {/* 주요 내용 필사 + 필사 사진 */}
          {record.quote || (record.quoteImages && record.quoteImages.length > 0) ? (
            <div className="relative rounded-xl bg-amber-50/70 border border-amber-200/80 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="text-base font-bold text-amber-950 flex items-center gap-2">
                  <Quote className="w-5 h-5 text-amber-800" />
                  <span>주요 내용 필사</span>
                  {record.quoteImages && record.quoteImages.length > 0 && (
                    <span className="text-xs bg-amber-200/80 text-amber-900 font-semibold px-2 py-0.5 rounded-md">
                      사진 {record.quoteImages.length}장
                    </span>
                  )}
                </span>
                {record.quote && (
                  <button
                    type="button"
                    id="btn-detail-copy-quote"
                    onClick={handleCopyQuote}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-amber-900 hover:text-amber-950 bg-white px-3 py-1.5 rounded-lg border border-amber-300 shadow-2xs hover:bg-amber-50 transition-all"
                    title="필사 내용 복사"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">복사 완료!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>필사 내용 복사</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {record.quote && (
                <blockquote
                  className="text-stone-900 text-base sm:text-lg leading-relaxed whitespace-pre-wrap pl-3 sm:pl-4 border-l-4 border-amber-500 font-serif"
                  style={{ fontFamily: "'Nanum Myeongjo', serif" }}
                >
                  {record.quote}
                </blockquote>
              )}

              {/* 필사 관련 사진들 */}
              {record.quoteImages && record.quoteImages.length > 0 && (
                <div className="pt-2 border-t border-amber-200/60">
                  <span className="text-xs font-bold text-amber-900 mb-2 block">
                    필사 관련 첨부 사진
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {record.quoteImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-amber-300 bg-stone-100 cursor-pointer shadow-xs hover:border-amber-600 transition-all"
                        onClick={() => onImageClick(img)}
                        title="필사 사진 클릭하여 크게 보기"
                      >
                        <img
                          src={img}
                          alt={`필사 사진 ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2.5 py-1.5 rounded-md font-semibold flex items-center gap-1.5">
                            <ExternalLink className="w-3.5 h-3.5" />
                            확대 보기
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-500 text-sm italic">
              작성된 필사 내용이 없습니다.
            </div>
          )}

          {/* 읽고 난 느낌 (Reflection) + 감상 사진 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-stone-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-stone-600" />
                <span>읽고 난 느낌 & 감상</span>
              </span>
              {record.reflectionImages && record.reflectionImages.length > 0 && (
                <span className="text-xs bg-stone-200 text-stone-700 font-medium px-2 py-0.5 rounded-md">
                  사진 {record.reflectionImages.length}장
                </span>
              )}
            </div>

            {record.reflection ? (
              <div className="bg-stone-50/80 border border-stone-200 rounded-xl p-5 sm:p-6 space-y-4">
                <p className="text-base sm:text-lg text-stone-800 leading-relaxed whitespace-pre-wrap">
                  {record.reflection}
                </p>

                {/* 감상 관련 사진들 */}
                {record.reflectionImages && record.reflectionImages.length > 0 && (
                  <div className="pt-3 border-t border-stone-200">
                    <span className="text-xs font-bold text-stone-700 mb-2 block">
                      감상 관련 첨부 사진
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {record.reflectionImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-stone-200 bg-stone-100 cursor-pointer shadow-xs hover:border-amber-500 transition-all"
                          onClick={() => onImageClick(img)}
                          title="감상 사진 클릭하여 크게 보기"
                        >
                          <img
                            src={img}
                            alt={`감상 사진 ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2.5 py-1.5 rounded-md font-semibold flex items-center gap-1.5">
                              <ExternalLink className="w-3.5 h-3.5" />
                              확대 보기
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : record.reflectionImages && record.reflectionImages.length > 0 ? (
              <div className="bg-stone-50/80 border border-stone-200 rounded-xl p-5">
                <span className="text-xs font-bold text-stone-700 mb-2 block">
                  감상 관련 첨부 사진
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {record.reflectionImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-stone-200 bg-stone-100 cursor-pointer shadow-xs hover:border-amber-500 transition-all"
                      onClick={() => onImageClick(img)}
                      title="감상 사진 클릭하여 크게 보기"
                    >
                      <img
                        src={img}
                        alt={`감상 사진 ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2.5 py-1.5 rounded-md font-semibold flex items-center gap-1.5">
                          <ExternalLink className="w-3.5 h-3.5" />
                          확대 보기
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-stone-400 italic">
                작성된 감상 내용이 없습니다.
              </p>
            )}
          </div>

          {/* 추가/표지 사진들 */}
          {(() => {
            const qImgs = record.quoteImages || [];
            const rImgs = record.reflectionImages || [];
            const otherImages = (record.images || []).filter(
              (img) => !qImgs.includes(img) && !rImgs.includes(img)
            );

            if (otherImages.length === 0) return null;

            return (
              <div className="space-y-3 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-stone-800">
                    책 표지 및 추가 첨부 사진 ({otherImages.length}장)
                  </span>
                  <span className="text-xs text-stone-500">
                    사진을 클릭하면 크게 확대하여 볼 수 있습니다
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {otherImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-stone-200 bg-stone-100 cursor-pointer shadow-xs hover:border-amber-500 transition-all"
                      onClick={() => onImageClick(img)}
                      title="사진 클릭하여 크게 보기"
                    >
                      <img
                        src={img}
                        alt={`${record.bookTitle} 첨부 사진 ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2.5 py-1.5 rounded-md font-semibold flex items-center gap-1.5">
                          <ExternalLink className="w-3.5 h-3.5" />
                          확대 보기
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Modal Footer with Edit & Delete actions */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200/80 flex items-center justify-between gap-3">
          <button
            type="button"
            id="btn-detail-delete"
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>기록 삭제</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-detail-close-bottom"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-200 rounded-xl transition-colors"
            >
              닫기
            </button>
            <button
              type="button"
              id="btn-detail-edit"
              onClick={() => {
                onClose();
                onEdit(record);
              }}
              className="flex items-center gap-2 bg-amber-800 hover:bg-amber-900 active:bg-amber-950 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-xs hover:shadow-sm transition-all"
            >
              <Edit3 className="w-4 h-4" />
              <span>내용 수정하기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
