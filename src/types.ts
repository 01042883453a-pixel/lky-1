export interface ReadingRecord {
  id: string;
  bookTitle: string;
  author: string;
  date: string; // YYYY-MM-DD
  quote: string; // 주요 내용 필사
  reflection: string; // 읽고 난 느낌
  images: string[]; // base64 or image data URLs (all/common images)
  quoteImages?: string[]; // 필사란에 첨부/붙여넣은 사진들
  reflectionImages?: string[]; // 읽고 난 느낌&감상란에 첨부/붙여넣은 사진들
  category?: string; // 분야 (문학, 비문학, 에세이, 경제경영, 자기계발 등)
  rating?: number; // 1 to 5
  pageRange?: string; // e.g. "p. 45 - 120"
  createdAt: number;
  updatedAt: number;
}

export type ViewMode = 'daily' | 'weekly' | 'monthly';

export type LayoutWidth = 'standard' | 'wide' | 'full';
export type FontSizeScale = 'normal' | 'large' | 'xlarge';

export interface DateFilter {
  year: number;
  month: number; // 1 to 12
  day?: number;
}
