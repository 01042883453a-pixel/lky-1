import { useMemo } from 'react';
import { ReadingRecord } from '../types';
import RecordCard from './RecordCard';
import {
  getWeekRange,
  getWeekLabel,
  parseLocalDate,
  toLocalDateString,
} from '../utils/dateUtils';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  BookOpen,
  CalendarCheck,
  Quote,
  Image as ImageIcon,
  Camera,
  Star,
} from 'lucide-react';

interface WeeklyViewProps {
  records: ReadingRecord[];
  currentDate: string;
  onDateChange: (date: string) => void;
  onOpenNewRecord: (date?: string) => void;
  onEditRecord: (record: ReadingRecord) => void;
  onDeleteRecord: (id: string) => void;
  onImageClick: (imageUrl: string) => void;
  onSelectRecord?: (record: ReadingRecord) => void;
}

export default function WeeklyView({
  records,
  currentDate,
  onDateChange,
  onOpenNewRecord,
  onEditRecord,
  onDeleteRecord,
  onImageClick,
  onSelectRecord,
}: WeeklyViewProps) {
  const { weekDates } = useMemo(() => {
    return getWeekRange(currentDate);
  }, [currentDate]);

  const weekLabel = useMemo(() => {
    return getWeekLabel(currentDate);
  }, [currentDate]);

  // Records that fall in this week
  const weekRecords = useMemo(() => {
    const set = new Set(weekDates);
    return records.filter((r) => set.has(r.date));
  }, [records, weekDates]);

  // Weekly Stats
  const stats = useMemo(() => {
    const daysWithReading = new Set(weekRecords.map((r) => r.date)).size;
    const totalQuotes = weekRecords.filter((r) => r.quote.trim().length > 0).length;
    const totalImages = weekRecords.reduce((acc, r) => acc + (r.images?.length || 0), 0);
    return {
      bookCount: weekRecords.length,
      readingDays: daysWithReading,
      totalQuotes,
      totalImages,
    };
  }, [weekRecords]);

  // Navigate week
  const handlePrevWeek = () => {
    const d = parseLocalDate(currentDate);
    d.setDate(d.getDate() - 7);
    onDateChange(toLocalDateString(d));
  };

  const handleNextWeek = () => {
    const d = parseLocalDate(currentDate);
    d.setDate(d.getDate() + 7);
    onDateChange(toLocalDateString(d));
  };

  const handleThisWeek = () => {
    onDateChange(toLocalDateString());
  };

  const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
  const todayStr = toLocalDateString();

  return (
    <div className="space-y-6">
      {/* Week Navigator & Metrics */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="btn-weekly-prev"
              onClick={handlePrevWeek}
              className="p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
              title="이전 주"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900">
              {weekLabel}
            </h2>
            <button
              type="button"
              id="btn-weekly-next"
              onClick={handleNextWeek}
              className="p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
              title="다음 주"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            type="button"
            id="btn-weekly-current"
            onClick={handleThisWeek}
            className="text-sm font-semibold px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
          >
            이번 주로 이동
          </button>
        </div>

        {/* Weekly Stats summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-1">
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/70 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 font-medium">기록한 책</p>
              <p className="text-lg font-bold text-stone-900">{stats.bookCount}권</p>
            </div>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/70 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 font-medium">독서 일수</p>
              <p className="text-lg font-bold text-stone-900">{stats.readingDays}일 / 7일</p>
            </div>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/70 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center shrink-0">
              <Quote className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 font-medium">남긴 필사</p>
              <p className="text-lg font-bold text-stone-900">{stats.totalQuotes}개</p>
            </div>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/70 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 font-medium">첨부 사진</p>
              <p className="text-lg font-bold text-stone-900">{stats.totalImages}장</p>
            </div>
          </div>
        </div>

        {/* 7-Day Strip Overview */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-stone-700">주간 독서 현황 (월 ~ 일)</p>
            <span className="text-xs text-stone-500">책 제목을 클릭하면 내용 확인 및 수정이 가능합니다</span>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-7 gap-2">
            {weekDates.map((dateStr, idx) => {
              const dayBooks = records.filter((r) => r.date === dateStr);
              const isToday = dateStr === todayStr;
              const dateObj = parseLocalDate(dateStr);
              const dayNum = dateObj.getDate();

              return (
                <div
                  key={dateStr}
                  className={`flex flex-col justify-between p-2.5 rounded-xl border transition-all min-h-[110px] ${
                    isToday
                      ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-300/60'
                      : dayBooks.length > 0
                      ? 'bg-white border-stone-300 shadow-2xs'
                      : 'bg-stone-50/80 border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full border-b border-stone-100 pb-1 mb-1">
                    <span className="text-xs text-stone-500 font-semibold">
                      {dayNames[idx]}요일
                    </span>
                    <span className={`text-sm font-bold ${isToday ? 'text-amber-800' : 'text-stone-800'}`}>
                      {dayNum}일
                    </span>
                  </div>

                  {/* Book items in this day */}
                  <div className="my-1 flex-1 flex flex-col gap-1.5 w-full">
                    {dayBooks.length > 0 ? (
                      dayBooks.map((book) => (
                        <button
                          key={book.id}
                          type="button"
                          onClick={() => {
                            if (onSelectRecord) {
                              onSelectRecord(book);
                            } else {
                              onEditRecord(book);
                            }
                          }}
                          className="w-full text-left p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200/80 hover:border-amber-400 transition-all group/pill cursor-pointer"
                          title={`클릭하여 '${book.bookTitle}' 내용 보기 및 수정`}
                        >
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                            <span className="truncate text-xs font-bold leading-tight group-hover/pill:text-amber-900">
                              {book.bookTitle}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-stone-600 mt-0.5">
                            <span className="truncate">{book.author}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              {book.images && book.images.length > 0 && (
                                <Camera className="w-3 h-3 text-amber-700" />
                              )}
                              {book.rating && book.rating > 0 && (
                                <span className="flex items-center text-[10px] text-amber-700 font-bold">
                                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                  {book.rating}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-xs text-stone-400">
                        기록 없음
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenNewRecord(dateStr)}
                    className="w-full mt-1 py-1 text-xs text-stone-500 hover:text-amber-900 hover:bg-amber-50/60 rounded border border-dashed border-stone-200 hover:border-amber-300 transition-colors"
                    title={`${dateStr} 독서 기록 추가`}
                  >
                    + 기록 추가
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* List of Records for this week */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-800" />
            <span>이번 주 독서 노트 목록 ({weekRecords.length}권)</span>
          </h3>
          <button
            type="button"
            id="btn-weekly-add-record"
            onClick={() => onOpenNewRecord()}
            className="text-xs sm:text-sm font-semibold text-amber-900 hover:text-amber-950 flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>새 독서 기록 추가</span>
          </button>
        </div>

        {weekRecords.length > 0 ? (
          <div className="grid grid-cols-1 gap-5">
            {weekRecords.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                onEdit={onEditRecord}
                onDelete={onDeleteRecord}
                onImageClick={onImageClick}
                onViewDetail={onSelectRecord}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 border border-stone-200/80 text-center shadow-xs flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mb-3">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-stone-800">
              {weekLabel}에 기록된 독서 노트가 없습니다
            </h3>
            <p className="text-sm text-stone-500 max-w-sm mt-1 mb-5">
              이번 주에 읽은 책의 주요 문장과 느낌을 차곡차곡 기록해 보세요.
            </p>
            <button
              type="button"
              onClick={() => onOpenNewRecord()}
              className="flex items-center gap-2 bg-amber-800 hover:bg-amber-900 active:bg-amber-950 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>독서 기록 추가하기</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
