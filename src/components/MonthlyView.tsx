import { useState, useMemo } from 'react';
import { ReadingRecord } from '../types';
import RecordCard from './RecordCard';
import {
  getMonthCalendarGrid,
  parseLocalDate,
  formatKoreanDate,
} from '../utils/dateUtils';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  BookOpen,
  Calendar as CalendarIcon,
  Star,
  Quote,
  Filter,
} from 'lucide-react';

interface MonthlyViewProps {
  records: ReadingRecord[];
  currentDate: string;
  onDateChange: (date: string) => void;
  onOpenNewRecord: (date?: string) => void;
  onEditRecord: (record: ReadingRecord) => void;
  onDeleteRecord: (id: string) => void;
  onImageClick: (imageUrl: string) => void;
  onSelectRecord?: (record: ReadingRecord) => void;
}

export default function MonthlyView({
  records,
  currentDate,
  onDateChange,
  onOpenNewRecord,
  onEditRecord,
  onDeleteRecord,
  onImageClick,
  onSelectRecord,
}: MonthlyViewProps) {
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  const currentDateObj = useMemo(() => parseLocalDate(currentDate), [currentDate]);
  const currentYear = currentDateObj.getFullYear();
  const currentMonth = currentDateObj.getMonth() + 1; // 1-12

  // Month navigation
  const handlePrevMonth = () => {
    const prev = new Date(currentYear, currentMonth - 2, 1);
    const y = prev.getFullYear();
    const m = String(prev.getMonth() + 1).padStart(2, '0');
    onDateChange(`${y}-${m}-01`);
    setSelectedCalendarDate(null);
  };

  const handleNextMonth = () => {
    const next = new Date(currentYear, currentMonth, 1);
    const y = next.getFullYear();
    const m = String(next.getMonth() + 1).padStart(2, '0');
    onDateChange(`${y}-${m}-01`);
    setSelectedCalendarDate(null);
  };

  const handleThisMonth = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    onDateChange(`${y}-${m}-${d}`);
    setSelectedCalendarDate(null);
  };

  // Records for this entire month (YYYY-MM-*)
  const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  const monthRecords = useMemo(() => {
    return records.filter((r) => r.date.startsWith(monthPrefix));
  }, [records, monthPrefix]);

  // Calendar cells
  const calendarCells = useMemo(() => {
    return getMonthCalendarGrid(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Monthly stats
  const stats = useMemo(() => {
    const uniqueDays = new Set(monthRecords.map((r) => r.date)).size;
    const totalBooks = monthRecords.length;
    const ratedBooks = monthRecords.filter((r) => r.rating && r.rating > 0);
    const avgRating =
      ratedBooks.length > 0
        ? (
            ratedBooks.reduce((acc, r) => acc + (r.rating || 0), 0) /
            ratedBooks.length
          ).toFixed(1)
        : null;
    const totalQuotes = monthRecords.filter((r) => r.quote.trim().length > 0).length;

    return {
      uniqueDays,
      totalBooks,
      avgRating,
      totalQuotes,
    };
  }, [monthRecords]);

  // Records to display below calendar: either filtered by selected calendar date or all month records
  const displayedRecords = useMemo(() => {
    if (selectedCalendarDate) {
      return records.filter((r) => r.date === selectedCalendarDate);
    }
    return monthRecords;
  }, [records, monthRecords, selectedCalendarDate]);

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="space-y-6">
      {/* Month Navigator & Summary Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="btn-monthly-prev"
              onClick={handlePrevMonth}
              className="p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
              title="이전 달"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900">
              {currentYear}년 {currentMonth}월
            </h2>
            <button
              type="button"
              id="btn-monthly-next"
              onClick={handleNextMonth}
              className="p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
              title="다음 달"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {selectedCalendarDate && (
              <button
                type="button"
                onClick={() => setSelectedCalendarDate(null)}
                className="text-xs sm:text-sm font-medium px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors flex items-center gap-1.5"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>선택 날짜 필터 해제</span>
              </button>
            )}
            <button
              type="button"
              id="btn-monthly-current"
              onClick={handleThisMonth}
              className="text-sm font-semibold px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
            >
              이번 달로 이동
            </button>
          </div>
        </div>

        {/* Month Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-1">
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/70 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 font-medium">이번 달 독서</p>
              <p className="text-lg font-bold text-stone-900">{stats.totalBooks}권</p>
            </div>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/70 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 font-medium">독서 일수</p>
              <p className="text-lg font-bold text-stone-900">{stats.uniqueDays}일</p>
            </div>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/70 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 font-medium">평균 별점</p>
              <p className="text-lg font-bold text-stone-900">
                {stats.avgRating ? `${stats.avgRating} / 5` : '-'}
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/70 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center shrink-0">
              <Quote className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 font-medium">기록한 필사</p>
              <p className="text-lg font-bold text-stone-900">{stats.totalQuotes}개</p>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-stone-700">월간 독서 달력</p>
            <span className="text-xs text-stone-500">책 이름을 클릭하면 내용 확인 및 수정이 가능합니다</span>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center mb-1 text-sm font-bold">
            {weekdays.map((day, idx) => (
              <div
                key={day}
                className={`py-2 ${
                  idx === 0 ? 'text-rose-600' : idx === 6 ? 'text-blue-600' : 'text-stone-700'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarCells.map((cell) => {
              const dayBooks = records.filter((r) => r.date === cell.dateStr);
              const isSelected = selectedCalendarDate === cell.dateStr;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => {
                    if (dayBooks.length > 0) {
                      setSelectedCalendarDate(isSelected ? null : cell.dateStr);
                    } else {
                      onOpenNewRecord(cell.dateStr);
                    }
                  }}
                  className={`min-h-[95px] sm:min-h-[115px] p-2 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                    !cell.isCurrentMonth
                      ? 'bg-stone-50/40 border-stone-100 text-stone-300 opacity-50'
                      : isSelected
                      ? 'bg-amber-100/70 border-amber-600 ring-2 ring-amber-500/40'
                      : cell.isToday
                      ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-300'
                      : dayBooks.length > 0
                      ? 'bg-white border-stone-300 shadow-2xs hover:border-amber-400'
                      : 'bg-white border-stone-200/80 hover:bg-stone-50'
                  }`}
                  title={
                    dayBooks.length > 0
                      ? `${cell.dateStr}: ${dayBooks.map((b) => b.bookTitle).join(', ')}`
                      : `${cell.dateStr} 독서 기록 추가하기`
                  }
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-sm font-bold leading-none ${
                        cell.isToday
                          ? 'w-6 h-6 rounded-full bg-amber-800 text-white flex items-center justify-center'
                          : cell.isCurrentMonth
                          ? 'text-stone-800'
                          : 'text-stone-300'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {dayBooks.length > 0 && (
                      <span className="text-xs font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded-md">
                        {dayBooks.length}권
                      </span>
                    )}
                  </div>

                  {/* Books for this day in cell - Clickable for details & edit */}
                  <div className="my-1 flex-1 flex flex-col gap-1 overflow-hidden">
                    {dayBooks.slice(0, 2).map((book) => (
                      <button
                        key={book.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectRecord) {
                            onSelectRecord(book);
                          } else {
                            onEditRecord(book);
                          }
                        }}
                        className="w-full text-left truncate text-xs font-semibold text-stone-900 bg-amber-50 hover:bg-amber-100 hover:text-amber-950 px-1.5 py-1 rounded-md border border-amber-200/80 hover:border-amber-400 flex items-center justify-between gap-1 shadow-2xs transition-colors group/bookbtn"
                        title={`클릭하여 '${book.bookTitle}' 내용 보기 및 수정`}
                      >
                        <span className="truncate flex items-center gap-1 group-hover/bookbtn:text-amber-900">
                          <BookOpen className="w-3 h-3 text-amber-700 shrink-0" />
                          <span className="truncate">{book.bookTitle}</span>
                        </span>
                        {book.images && book.images.length > 0 && (
                          <span className="text-[10px] text-amber-700 font-bold shrink-0">📷</span>
                        )}
                      </button>
                    ))}
                    {dayBooks.length > 2 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCalendarDate(cell.dateStr);
                        }}
                        className="text-left text-xs text-amber-800 font-bold hover:underline"
                      >
                        +{dayBooks.length - 2}권 더보기
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Records List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-800" />
              <span>
                {selectedCalendarDate
                  ? `${formatKoreanDate(selectedCalendarDate)} 독서 노트 (${displayedRecords.length}권)`
                  : `${currentYear}년 ${currentMonth}월 전체 독서 목록 (${displayedRecords.length}권)`}
              </span>
            </h3>
            {selectedCalendarDate && (
              <button
                type="button"
                onClick={() => setSelectedCalendarDate(null)}
                className="text-xs sm:text-sm text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>전체 월간 목록</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => onOpenNewRecord()}
            className="text-xs sm:text-sm font-semibold text-amber-900 hover:text-amber-950 flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>새 독서 기록 추가</span>
          </button>
        </div>

        {displayedRecords.length > 0 ? (
          <div className="grid grid-cols-1 gap-5">
            {displayedRecords.map((record) => (
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
              <CalendarIcon className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-stone-800">
              {currentYear}년 {currentMonth}월에 기록된 독서 노트가 없습니다
            </h3>
            <p className="text-sm text-stone-500 max-w-sm mt-1 mb-5">
              달력의 날짜를 클릭하거나 독서 기록하기 버튼을 눌러 이 달의 첫 번째 책을 기록해 보세요.
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
