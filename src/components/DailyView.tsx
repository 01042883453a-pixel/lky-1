import { useMemo } from 'react';
import { ReadingRecord } from '../types';
import RecordCard from './RecordCard';
import {
  formatKoreanDate,
  toLocalDateString,
  parseLocalDate,
} from '../utils/dateUtils';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  BookOpen,
  History,
} from 'lucide-react';

interface DailyViewProps {
  records: ReadingRecord[];
  currentDate: string;
  onDateChange: (date: string) => void;
  onOpenNewRecord: (date?: string) => void;
  onEditRecord: (record: ReadingRecord) => void;
  onDeleteRecord: (id: string) => void;
  onImageClick: (imageUrl: string) => void;
  onSelectRecord?: (record: ReadingRecord) => void;
}

export default function DailyView({
  records,
  currentDate,
  onDateChange,
  onOpenNewRecord,
  onEditRecord,
  onDeleteRecord,
  onImageClick,
  onSelectRecord,
}: DailyViewProps) {
  // Filter records for the currently selected day
  const dayRecords = useMemo(() => {
    return records.filter((r) => r.date === currentDate);
  }, [records, currentDate]);

  // Distinct dates that have at least one record, sorted descending
  const recordedDates = useMemo(() => {
    const dates = Array.from(new Set(records.map((r) => r.date)));
    return dates.sort((a, b) => b.localeCompare(a));
  }, [records]);

  // Stepping days
  const handlePrevDay = () => {
    const d = parseLocalDate(currentDate);
    d.setDate(d.getDate() - 1);
    onDateChange(toLocalDateString(d));
  };

  const handleNextDay = () => {
    const d = parseLocalDate(currentDate);
    d.setDate(d.getDate() + 1);
    onDateChange(toLocalDateString(d));
  };

  const handleToday = () => {
    onDateChange(toLocalDateString());
  };

  const isToday = currentDate === toLocalDateString();

  return (
    <div className="space-y-6">
      {/* Date Navigation Bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Day Stepper */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="btn-daily-prev"
              onClick={handlePrevDay}
              className="p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
              title="이전 날짜"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <span className="text-lg sm:text-xl font-bold text-stone-900">
                {formatKoreanDate(currentDate)}
              </span>
              {isToday && (
                <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full border border-amber-300/60">
                  오늘
                </span>
              )}
            </div>

            <button
              type="button"
              id="btn-daily-next"
              onClick={handleNextDay}
              className="p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
              title="다음 날짜"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Date Picker & Today button */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {!isToday && (
              <button
                type="button"
                id="btn-daily-today"
                onClick={handleToday}
                className="text-sm font-semibold px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
              >
                오늘로 이동
              </button>
            )}

            <div className="relative flex items-center">
              <input
                type="date"
                id="input-daily-jump"
                value={currentDate}
                onChange={(e) => e.target.value && onDateChange(e.target.value)}
                className="text-sm font-medium bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>
          </div>
        </div>

        {/* Recorded Dates Pill Strip */}
        {recordedDates.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-stone-100">
            <div className="flex items-center gap-2 mb-2 text-xs sm:text-sm font-semibold text-stone-600">
              <History className="w-4 h-4 text-amber-800" />
              <span>독서 기록이 있는 날짜:</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {recordedDates.slice(0, 15).map((date) => {
                const count = records.filter((r) => r.date === date).length;
                const isSelected = date === currentDate;
                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => onDateChange(date)}
                    className={`shrink-0 text-xs sm:text-sm px-3 py-1.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-amber-900 text-white border-amber-900 font-bold shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50 hover:border-amber-400'
                    }`}
                  >
                    {date.substring(5)} ({count}권)
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {dayRecords.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-800" />
              <span>이 날의 독서 기록 ({dayRecords.length}권)</span>
            </h3>
            <button
              type="button"
              onClick={() => onOpenNewRecord(currentDate)}
              className="text-xs sm:text-sm font-semibold text-amber-900 hover:text-amber-950 flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>이 날짜에 책 추가</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {dayRecords.map((record) => (
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
        </div>
      ) : (
        /* Empty State for Selected Date */
        <div className="bg-white rounded-2xl p-10 border border-stone-200/80 text-center shadow-xs flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mb-3">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-stone-800">
            {formatKoreanDate(currentDate)} 독서 기록이 없습니다
          </h3>
          <p className="text-sm text-stone-500 max-w-sm mt-1 mb-5">
            오늘 읽은 책의 인상 깊은 문장 필사와 느낌을 기록해 보세요. 책 표지나 필사 사진도 바로 붙여넣을 수 있습니다.
          </p>
          <button
            type="button"
            id="btn-empty-add-record"
            onClick={() => onOpenNewRecord(currentDate)}
            className="flex items-center gap-2 bg-amber-800 hover:bg-amber-900 active:bg-amber-950 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>이 날짜로 독서 기록 남기기</span>
          </button>
        </div>
      )}
    </div>
  );
}
