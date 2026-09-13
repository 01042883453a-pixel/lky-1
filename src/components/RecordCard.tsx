import React, { useState } from 'react';
import { ReadingRecord } from '../types';
import { formatKoreanDate } from '../utils/dateUtils';
import {
  Star,
  Edit3,
  Trash2,
  Copy,
  Check,
  Quote,
  BookOpen,
  Calendar,
  Tag,
  Bookmark,
  ExternalLink,
} from 'lucide-react';

interface RecordCardProps {
  key?: React.Key;
  record: ReadingRecord;
  onEdit: (record: ReadingRecord) => void;
  onDelete: (id: string) => void;
  onImageClick: (imageUrl: string) => void;
  onViewDetail?: (record: ReadingRecord) => void;
}

export default function RecordCard({
  record,
  onEdit,
  onDelete,
  onImageClick,
  onViewDetail,
}: RecordCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyQuote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const textToCopy = `"${record.quote}"\n— ${record.bookTitle} (${record.author})`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCardClick = () => {
    if (onViewDetail) {
      onViewDetail(record);
    } else {
      onEdit(record);
    }
  };

  return (
    <article
      id={`record-card-${record.id}`}
      onClick={handleCardClick}
      className="bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer group"
    >
      {/* Card Header */}
      <div className="p-5 sm:p-6 pb-4 border-b border-stone-100 bg-stone-50/60 group-hover:bg-amber-50/30 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap text-sm text-stone-600 mb-2">
              <span className="inline-flex items-center gap-1.5 font-semibold text-amber-950 bg-amber-100/70 px-2.5 py-0.5 rounded-md border border-amber-300/50">
                <Calendar className="w-4 h-4 text-amber-800" />
                {formatKoreanDate(record.date)}
              </span>
              {record.category && (
                <span className="inline-flex items-center gap-1.5 font-medium text-stone-700 bg-stone-200/70 px-2.5 py-0.5 rounded-md">
                  <Tag className="w-3.5 h-3.5 text-stone-500" />
                  {record.category}
                </span>
              )}
              {record.pageRange && (
                <span className="inline-flex items-center gap-1.5 font-medium text-stone-700 bg-stone-200/70 px-2.5 py-0.5 rounded-md">
                  <Bookmark className="w-3.5 h-3.5 text-stone-500" />
                  {record.pageRange}
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug tracking-tight flex items-center gap-2 group-hover:text-amber-950">
              <BookOpen className="w-5 h-5 text-amber-800 shrink-0" />
              <span className="truncate">{record.bookTitle}</span>
            </h3>
            <p className="text-base text-stone-700 font-medium mt-1">
              저자: <span className="font-semibold text-stone-900">{record.author}</span>
            </p>
          </div>

          {/* Rating and Actions */}
          <div className="flex flex-col items-end gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            {record.rating && record.rating > 0 && (
              <div className="flex items-center gap-0.5" title={`평점 ${record.rating}점`}>
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
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id={`btn-view-${record.id}`}
                onClick={() => (onViewDetail ? onViewDetail(record) : onEdit(record))}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-stone-700 bg-white hover:bg-amber-50 hover:text-amber-950 border border-stone-200 hover:border-amber-300 rounded-lg transition-colors shadow-2xs"
                title="상세 내용 보기 및 수정"
              >
                <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                <span>상세보기</span>
              </button>

              <button
                type="button"
                id={`btn-edit-${record.id}`}
                onClick={() => onEdit(record)}
                className="p-1.5 text-stone-600 hover:text-amber-900 hover:bg-amber-100/70 rounded-lg transition-colors"
                title="기록 수정"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                id={`btn-delete-${record.id}`}
                onClick={() => {
                  if (window.confirm(`'${record.bookTitle}' 독서 기록을 삭제하시겠습니까?`)) {
                    onDelete(record.id);
                  }
                }}
                className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="기록 삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-6 space-y-4 flex-1">
        {/* 주요 내용 필사 (Key Quote) + 필사 사진 */}
        {(record.quote || (record.quoteImages && record.quoteImages.length > 0)) && (
          <div className="relative rounded-xl bg-amber-50/60 border border-amber-200/60 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                <Quote className="w-4 h-4 text-amber-800" />
                <span>주요 내용 필사</span>
                {record.quoteImages && record.quoteImages.length > 0 && (
                  <span className="text-xs bg-amber-200/80 text-amber-950 font-semibold px-2 py-0.5 rounded-md">
                    사진 {record.quoteImages.length}장
                  </span>
                )}
              </span>
              {record.quote && (
                <button
                  type="button"
                  onClick={handleCopyQuote}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 hover:text-amber-950 transition-colors bg-white px-2.5 py-1 rounded-md border border-amber-300/80 shadow-2xs"
                  title="필사 내용 복사"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">복사완료</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>필사 복사</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {record.quote && (
              <blockquote
                className="text-stone-900 text-base sm:text-lg leading-relaxed whitespace-pre-wrap pl-3 border-l-3 border-amber-400 font-serif"
                style={{ fontFamily: "'Nanum Myeongjo', serif" }}
              >
                {record.quote}
              </blockquote>
            )}

            {/* 필사에 첨부된 사진들 */}
            {record.quoteImages && record.quoteImages.length > 0 && (
              <div className="pt-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5" onClick={(e) => e.stopPropagation()}>
                {record.quoteImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="group/img relative aspect-[4/3] rounded-lg overflow-hidden border border-amber-300/80 bg-stone-100 cursor-pointer shadow-2xs hover:border-amber-600 transition-all"
                    onClick={() => onImageClick(img)}
                    title="필사 사진 크게 보기"
                  >
                    <img
                      src={img}
                      alt={`필사 사진 ${idx + 1}`}
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/25 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-0.5 rounded font-semibold">
                        확대
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 읽고 난 느낌 (Reflection) + 감상 사진 */}
        {(record.reflection || (record.reflectionImages && record.reflectionImages.length > 0)) && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-stone-700 uppercase tracking-wider">
                읽고 난 느낌 & 감상
              </span>
              {record.reflectionImages && record.reflectionImages.length > 0 && (
                <span className="text-xs bg-stone-200 text-stone-700 font-medium px-2 py-0.5 rounded-md">
                  사진 {record.reflectionImages.length}장
                </span>
              )}
            </div>

            {record.reflection && (
              <p className="text-base text-stone-800 leading-relaxed whitespace-pre-wrap">
                {record.reflection}
              </p>
            )}

            {/* 감상에 첨부된 사진들 */}
            {record.reflectionImages && record.reflectionImages.length > 0 && (
              <div className="pt-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5" onClick={(e) => e.stopPropagation()}>
                {record.reflectionImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="group/img relative aspect-[4/3] rounded-lg overflow-hidden border border-stone-200 bg-stone-100 cursor-pointer shadow-2xs hover:border-amber-500 transition-all"
                    onClick={() => onImageClick(img)}
                    title="감상 사진 크게 보기"
                  >
                    <img
                      src={img}
                      alt={`감상 사진 ${idx + 1}`}
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/25 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-0.5 rounded font-semibold">
                        확대
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 기타 추가/표지 사진들 (quoteImages나 reflectionImages에 포함되지 않은 사진들) */}
        {(() => {
          const qImgs = record.quoteImages || [];
          const rImgs = record.reflectionImages || [];
          const otherImages = (record.images || []).filter(
            (img) => !qImgs.includes(img) && !rImgs.includes(img)
          );

          if (otherImages.length === 0) return null;

          return (
            <div className="pt-2 border-t border-stone-100" onClick={(e) => e.stopPropagation()}>
              <span className="text-xs sm:text-sm font-bold text-stone-700 mb-2 block">
                책 표지 및 추가 사진 ({otherImages.length}장)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {otherImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="group/img relative aspect-[4/3] rounded-lg overflow-hidden border border-stone-200 bg-stone-100 cursor-pointer shadow-2xs hover:border-amber-500 transition-all"
                    onClick={() => onImageClick(img)}
                    title="사진 클릭하여 크게 보기"
                  >
                    <img
                      src={img}
                      alt={`${record.bookTitle} 추가 사진 ${idx + 1}`}
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/25 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-0.5 rounded font-semibold">
                        확대
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </article>
  );
}
