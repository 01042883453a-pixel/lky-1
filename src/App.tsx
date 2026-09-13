import { useState, useEffect, useMemo, useCallback } from 'react';
import { ReadingRecord, ViewMode, LayoutWidth, FontSizeScale } from './types';
import {
  getAllRecords,
  saveRecord,
  deleteRecord,
  exportAllData,
  importData,
} from './services/db';
import { toLocalDateString } from './utils/dateUtils';
import Navbar from './components/Navbar';
import DailyView from './components/DailyView';
import WeeklyView from './components/WeeklyView';
import MonthlyView from './components/MonthlyView';
import RecordModal from './components/RecordModal';
import RecordDetailModal from './components/RecordDetailModal';
import ImageViewerModal from './components/ImageViewerModal';
import RecordCard from './components/RecordCard';
import DisplayControls from './components/DisplayControls';
import { Search, X, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState<ReadingRecord[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [currentDate, setCurrentDate] = useState<string>(toLocalDateString());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Layout ratio & font scale states (persisted in localStorage)
  const [layoutWidth, setLayoutWidth] = useState<LayoutWidth>(() => {
    const saved = localStorage.getItem('reading_log_layout_width');
    return (saved as LayoutWidth) || 'wide';
  });

  const [fontSizeScale, setFontSizeScale] = useState<FontSizeScale>(() => {
    const saved = localStorage.getItem('reading_log_font_scale');
    return (saved as FontSizeScale) || 'large';
  });

  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    const saved = localStorage.getItem('reading_log_zoom_level');
    return saved ? parseInt(saved, 10) : 100;
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<ReadingRecord | null>(null);
  const [activeDateForNewRecord, setActiveDateForNewRecord] = useState<string | undefined>(undefined);
  const [viewingDetailRecord, setViewingDetailRecord] = useState<ReadingRecord | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  // Save layout & font preference changes to localStorage
  const handleLayoutWidthChange = (width: LayoutWidth) => {
    setLayoutWidth(width);
    localStorage.setItem('reading_log_layout_width', width);
    showToast(`화면 비율이 '${width === 'standard' ? '기본 (1024px)' : width === 'wide' ? '넓게 (1280px)' : '전체 화면'}'으로 변경되었습니다.`);
  };

  const handleFontSizeScaleChange = (scale: FontSizeScale) => {
    setFontSizeScale(scale);
    localStorage.setItem('reading_log_font_scale', scale);
    showToast(`글씨 크기가 '${scale === 'normal' ? '보통' : scale === 'large' ? '크게' : '아주 크게'}'로 변경되었습니다.`);
  };

  const handleZoomLevelChange = (zoom: number) => {
    setZoomLevel(zoom);
    localStorage.setItem('reading_log_zoom_level', zoom.toString());
  };

  // Fetch all records from IndexedDB
  const loadRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllRecords();
      setRecords(data);
    } catch (err) {
      console.error('Failed to load records from IndexedDB:', err);
      showToast('기록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Global window paste handler: If user copies an image outside and presses Ctrl+V anywhere
  // while no modal is open, open the new record modal with this image pre-loaded!
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (isModalOpen) return;

      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      const items = clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              if (dataUrl) {
                setEditingRecord(null);
                setActiveDateForNewRecord(currentDate);
                setIsModalOpen(true);
                showToast('클립보드 이미지와 함께 새 독서 기록 창이 열렸습니다.');
              }
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => {
      window.removeEventListener('paste', handleGlobalPaste);
    };
  }, [isModalOpen, currentDate, showToast]);

  // Save (Create / Update) record handler
  const handleSaveRecord = async (recordToSave: ReadingRecord) => {
    await saveRecord(recordToSave);
    await loadRecords();
    if (viewingDetailRecord && viewingDetailRecord.id === recordToSave.id) {
      setViewingDetailRecord(recordToSave);
    }
    showToast('독서 기록이 저장되었습니다.');
  };

  // Delete record handler
  const handleDeleteRecord = async (id: string) => {
    try {
      await deleteRecord(id);
      await loadRecords();
      if (viewingDetailRecord && viewingDetailRecord.id === id) {
        setViewingDetailRecord(null);
      }
      showToast('독서 기록이 삭제되었습니다.');
    } catch (err) {
      console.error(err);
      showToast('삭제 중 오류가 발생했습니다.');
    }
  };

  // Open modal for editing
  const handleEditRecord = (record: ReadingRecord) => {
    setEditingRecord(record);
    setActiveDateForNewRecord(record.date);
    setIsModalOpen(true);
  };

  // Open modal for new record
  const handleOpenNewRecord = (date?: string) => {
    setEditingRecord(null);
    setActiveDateForNewRecord(date || currentDate);
    setIsModalOpen(true);
  };

  // Export JSON backup
  const handleExportData = async () => {
    try {
      const jsonStr = await exportAllData();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reading-log-backup-${toLocalDateString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('백업 파일이 다운로드되었습니다.');
    } catch (err) {
      console.error(err);
      showToast('백업 파일 생성에 실패했습니다.');
    }
  };

  // Import JSON backup
  const handleImportData = async (jsonStr: string) => {
    try {
      const count = await importData(jsonStr);
      await loadRecords();
      showToast(`${count}개의 독서 기록을 성공적으로 복원했습니다.`);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Filtered records when searching
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const q = searchQuery.toLowerCase().trim();
    return records.filter(
      (r) =>
        r.bookTitle.toLowerCase().includes(q) ||
        r.author.toLowerCase().includes(q) ||
        r.quote.toLowerCase().includes(q) ||
        r.reflection.toLowerCase().includes(q) ||
        (r.category && r.category.toLowerCase().includes(q))
    );
  }, [records, searchQuery]);

  // Container width class based on layoutWidth
  const containerWidthClass = useMemo(() => {
    switch (layoutWidth) {
      case 'standard':
        return 'max-w-5xl';
      case 'wide':
        return 'max-w-7xl';
      case 'full':
        return 'max-w-[96%]';
      default:
        return 'max-w-7xl';
    }
  }, [layoutWidth]);

  return (
    <div
      className={`min-h-screen flex flex-col bg-stone-50 text-stone-900 font-scale-${fontSizeScale}`}
      style={zoomLevel !== 100 ? { zoom: `${zoomLevel}%` } : undefined}
    >
      {/* Top Navigation */}
      <Navbar
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          setViewMode(mode);
          setSearchQuery('');
        }}
        onOpenNewRecordModal={() => handleOpenNewRecord()}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onExportData={handleExportData}
        onImportData={handleImportData}
        totalCount={records.length}
      />

      {/* Main Container with adjustable width ratio */}
      <main className={`flex-1 ${containerWidthClass} w-full mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5 transition-all duration-200`}>
        {/* Screen Ratio & Font Size Adjustment Toolbar */}
        <DisplayControls
          layoutWidth={layoutWidth}
          onLayoutWidthChange={handleLayoutWidthChange}
          fontSizeScale={fontSizeScale}
          onFontSizeScaleChange={handleFontSizeScaleChange}
          zoomLevel={zoomLevel}
          onZoomLevelChange={handleZoomLevelChange}
        />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex items-center justify-center py-20 text-stone-500">
            <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-amber-800"></div>
            <span className="ml-3 text-base font-medium">독서 기록을 불러오는 중...</span>
          </div>
        )}

        {/* Search Results Display Mode */}
        {!isLoading && searchQuery.trim() !== '' ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-amber-50/80 border border-amber-300/80 p-4 sm:p-5 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <Search className="w-5 h-5 text-amber-800" />
                <span className="text-base font-bold text-amber-950">
                  '{searchQuery}' 검색 결과 ({filteredRecords.length}건)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="flex items-center gap-1 text-sm font-semibold text-amber-900 hover:text-amber-950 bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-2xs transition-colors"
              >
                <X className="w-4 h-4" />
                <span>검색 닫기</span>
              </button>
            </div>

            {filteredRecords.length > 0 ? (
              <div className="grid grid-cols-1 gap-5">
                {filteredRecords.map((record) => (
                  <RecordCard
                    key={record.id}
                    record={record}
                    onEdit={handleEditRecord}
                    onDelete={handleDeleteRecord}
                    onImageClick={setPreviewImageUrl}
                    onViewDetail={(rec) => setViewingDetailRecord(rec)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
                <AlertCircle className="w-10 h-10 text-stone-400 mx-auto mb-2.5" />
                <p className="text-base font-bold text-stone-700">검색 결과가 없습니다.</p>
                <p className="text-sm text-stone-400 mt-1">다른 검색어를 입력해 보세요.</p>
              </div>
            )}
          </div>
        ) : (
          /* Normal View Modes */
          !isLoading && (
            <>
              {viewMode === 'daily' && (
                <DailyView
                  records={records}
                  currentDate={currentDate}
                  onDateChange={setCurrentDate}
                  onOpenNewRecord={handleOpenNewRecord}
                  onEditRecord={handleEditRecord}
                  onDeleteRecord={handleDeleteRecord}
                  onImageClick={setPreviewImageUrl}
                  onSelectRecord={(rec) => setViewingDetailRecord(rec)}
                />
              )}

              {viewMode === 'weekly' && (
                <WeeklyView
                  records={records}
                  currentDate={currentDate}
                  onDateChange={setCurrentDate}
                  onOpenNewRecord={handleOpenNewRecord}
                  onEditRecord={handleEditRecord}
                  onDeleteRecord={handleDeleteRecord}
                  onImageClick={setPreviewImageUrl}
                  onSelectRecord={(rec) => setViewingDetailRecord(rec)}
                />
              )}

              {viewMode === 'monthly' && (
                <MonthlyView
                  records={records}
                  currentDate={currentDate}
                  onDateChange={setCurrentDate}
                  onOpenNewRecord={handleOpenNewRecord}
                  onEditRecord={handleEditRecord}
                  onDeleteRecord={handleDeleteRecord}
                  onImageClick={setPreviewImageUrl}
                  onSelectRecord={(rec) => setViewingDetailRecord(rec)}
                />
              )}
            </>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-white py-6 mt-8">
        <div className={`${containerWidthClass} mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-stone-500`}>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-800" />
            <span className="font-bold text-stone-700">독서 기록장</span>
            <span>·</span>
            <span>일자별 책, 저자, 필사, 감상 및 사진 기록</span>
          </div>
          <div className="flex items-center gap-3">
            <span>💡 클립보드 이미지 붙여넣기(Ctrl+V) 지원</span>
            <span>·</span>
            <span>브라우저 로컬 안전 저장 (IndexedDB)</span>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-bold animate-fade-in border border-stone-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Record Detail Modal (Full view & edit trigger) */}
      <RecordDetailModal
        record={viewingDetailRecord}
        isOpen={!!viewingDetailRecord}
        onClose={() => setViewingDetailRecord(null)}
        onEdit={(rec) => {
          setViewingDetailRecord(null);
          handleEditRecord(rec);
        }}
        onDelete={handleDeleteRecord}
        onImageClick={setPreviewImageUrl}
      />

      {/* Record Create/Edit Modal */}
      <RecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRecord}
        initialRecord={editingRecord}
        defaultDate={activeDateForNewRecord}
        onPreviewImage={setPreviewImageUrl}
      />

      {/* Image Zoom/Preview Modal */}
      <ImageViewerModal
        imageUrl={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
      />
    </div>
  );
}
