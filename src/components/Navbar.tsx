import React, { useRef } from 'react';
import { ViewMode } from '../types';
import {
  Plus,
  Search,
  Calendar,
  CalendarDays,
  CalendarRange,
  Download,
  Upload,
  BookMarked,
} from 'lucide-react';

interface NavbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenNewRecordModal: () => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => Promise<void>;
  totalCount: number;
}

export default function Navbar({
  viewMode,
  onViewModeChange,
  onOpenNewRecordModal,
  searchQuery,
  onSearchQueryChange,
  onExportData,
  onImportData,
  totalCount,
}: NavbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        if (text) {
          try {
            await onImportData(text);
          } catch {
            alert('데이터 가져오기에 실패했습니다. 올바른 JSON 파일인지 확인하세요.');
          }
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-2xs">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-amber-900 text-amber-100 flex items-center justify-center shadow-xs">
              <BookMarked className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-stone-900">
                  독서 기록장
                </h1>
                <span className="text-xs font-bold bg-amber-100/70 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {totalCount}권 기록
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                일자별 필사와 감상을 기록하는 나만의 독서 서재
              </p>
            </div>
          </div>

          {/* View Mode Navigation Tabs */}
          <nav className="flex items-center bg-stone-100/90 p-1.5 rounded-2xl border border-stone-200/80 shadow-2xs">
            <button
              type="button"
              id="tab-view-daily"
              onClick={() => onViewModeChange('daily')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                viewMode === 'daily'
                  ? 'bg-white text-amber-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Calendar className="w-4 h-4 text-amber-800" />
              <span>일자별</span>
            </button>
            <button
              type="button"
              id="tab-view-weekly"
              onClick={() => onViewModeChange('weekly')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                viewMode === 'weekly'
                  ? 'bg-white text-amber-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <CalendarRange className="w-4 h-4 text-amber-800" />
              <span>주간별</span>
            </button>
            <button
              type="button"
              id="tab-view-monthly"
              onClick={() => onViewModeChange('monthly')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                viewMode === 'monthly'
                  ? 'bg-white text-amber-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <CalendarDays className="w-4 h-4 text-amber-800" />
              <span>월별</span>
            </button>
          </nav>

          {/* Action Tools: Search, Backup, Add */}
          <div className="flex items-center gap-2.5">
            {/* Search Box */}
            <div className="relative hidden md:block w-48 lg:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="책 제목, 저자, 필사 검색..."
                className="w-full pl-10 pr-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 placeholder:text-stone-400"
              />
            </div>

            {/* Export / Import Data */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                id="btn-export-data"
                onClick={onExportData}
                title="데이터 백업 (JSON 다운로드)"
                className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                type="button"
                id="btn-import-data"
                onClick={() => fileInputRef.current?.click()}
                title="데이터 가져오기 (JSON 복원)"
                className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json,application/json"
                className="hidden"
              />
            </div>

            {/* Add Record Button */}
            <button
              type="button"
              id="btn-open-new-record"
              onClick={onOpenNewRecordModal}
              className="flex items-center gap-2 bg-amber-800 hover:bg-amber-900 active:bg-amber-950 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-xs hover:shadow-sm transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">독서 기록하기</span>
              <span className="xs:hidden">기록</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="책 제목, 저자, 필사 내용 검색..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 placeholder:text-stone-400"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
