import { ReadingRecord } from '../types';
import { toLocalDateString } from '../utils/dateUtils';

const DB_NAME = 'ReadingLogDB';
const DB_VERSION = 1;
const STORE_NAME = 'reading_records';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Initial sample records to showcase the app
const getSampleRecords = (): ReadingRecord[] => {
  const today = new Date();
  
  const d0 = toLocalDateString(today);
  
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const d1 = toLocalDateString(yesterday);
  
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(today.getDate() - 3);
  const d3 = toLocalDateString(threeDaysAgo);

  const sample1Image = `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#f5f0e6"/>
      <rect x="25" y="25" width="350" height="250" rx="8" fill="#fffdfa" stroke="#e6decb" stroke-width="2"/>
      <line x1="45" y1="50" x2="160" y2="50" stroke="#78350f" stroke-width="3" stroke-linecap="round"/>
      <text x="45" y="90" font-family="serif" font-size="16" fill="#1c1917" font-weight="bold">"새는 알에서 나오려고 투쟁한다."</text>
      <text x="45" y="125" font-family="serif" font-size="14" fill="#44403c">알은 세계이다. 태어나려는 자는</text>
      <text x="45" y="150" font-family="serif" font-size="14" fill="#44403c">하나의 세계를 깨뜨려야 한다.</text>
      <text x="45" y="175" font-family="serif" font-size="14" fill="#44403c">새는 신에게로 날아간다. 그 신의 이름은 아브락사스다.</text>
      <text x="45" y="235" font-family="sans-serif" font-size="12" fill="#78716c">— 헤르만 헤세, 《데미안》 중에서</text>
    </svg>
  `)}`;

  const sample2Image = `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#eef2f6"/>
      <rect x="25" y="25" width="350" height="250" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <circle cx="200" cy="80" r="28" fill="#fef08a" opacity="0.85"/>
      <text x="200" y="145" text-anchor="middle" font-family="serif" font-size="15" fill="#1e293b" font-weight="bold">"가장 중요한 것은 눈에 보이지 않아."</text>
      <text x="200" y="175" text-anchor="middle" font-family="serif" font-size="13" fill="#475569">"마음으로 보아야만 분명하게 볼 수 있어."</text>
      <line x1="140" y1="205" x2="260" y2="205" stroke="#94a3b8" stroke-width="1"/>
      <text x="200" y="235" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#64748b">생텍쥐페리, 《어린 왕자》</text>
    </svg>
  `)}`;

  return [
    {
      id: 'sample-1',
      bookTitle: '데미안',
      author: '헤르만 헤세',
      date: d0,
      pageRange: 'p. 82 - 145',
      category: '고전문학',
      rating: 5,
      quote: '새는 알에서 나오려고 투쟁한다. 알은 세계이다. 태어나려는 자는 하나의 세계를 깨뜨려야 한다. 새는 신에게로 날아간다. 그 신의 이름은 아브락사스다.',
      reflection: '스스로를 가두고 있던 안온한 껍질을 깨고 나오는 것은 필연적으로 고통을 동반하지만, 참된 자아를 발견하기 위한 유일한 통과의례임을 되새기게 된다. 오늘 나의 선택들이 과연 나다운 세계로 날아가기 위한 날갯짓인지 돌아보게 되었다.',
      images: [sample1Image],
      createdAt: Date.now() - 1000 * 60 * 30,
      updatedAt: Date.now() - 1000 * 60 * 30,
    },
    {
      id: 'sample-2',
      bookTitle: '어린 왕자',
      author: '앙투안 드 생텍쥐페리',
      date: d1,
      pageRange: 'p. 60 - 98',
      category: '문학 / 철학',
      rating: 5,
      quote: '네 장미가 그토록 소중하게 된 것은 네가 그 장미를 위해 들인 시간 때문이야. 사막이 아름다운 건 어디엔가 우물을 감추고 있기 때문이지.',
      reflection: '진정한 관계의 가치는 효율이나 조건이 아니라 서로에게 쏟은 온전한 시간과 정성에 있다는 구절이 마음에 깊이 남았다. 바쁜 일상 속에서 주위 사람들에게 얼마나 온전한 정성을 기울이고 있는지 스스로를 성찰하게 되었다.',
      images: [sample2Image],
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
      updatedAt: Date.now() - 1000 * 60 * 60 * 24,
    },
    {
      id: 'sample-3',
      bookTitle: '도둑맞은 집중력',
      author: '요한 하리',
      date: d3,
      pageRange: 'p. 150 - 210',
      category: '인문 / 사회',
      rating: 4,
      quote: '집중력 위기는 개인의 의지 박약이 아니라, 우리 주의력을 끊임없이 분산시키고 낚아채도록 정교하게 설계된 현대 사회의 시스템적 문제다.',
      reflection: '스마트폰과 알림에 정신없이 빼앗기던 시간들을 내 자제력 탓만으로 돌렸었는데, 사회구조적 관점에서 분석한 점이 신선했다. 책을 읽는 순간만큼은 방해 금지 모드를 켜고 깊은 몰입의 기쁨을 지켜내야겠다.',
      images: [],
      createdAt: Date.now() - 1000 * 60 * 60 * 72,
      updatedAt: Date.now() - 1000 * 60 * 60 * 72,
    },
  ];
};

export async function getAllRecords(): Promise<ReadingRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result as ReadingRecord[];
      // If DB is completely empty on first visit, seed with sample records
      if (!results || results.length === 0) {
        const samples = getSampleRecords();
        // Save samples asynchronously
        const writeTx = db.transaction([STORE_NAME], 'readwrite');
        const writeStore = writeTx.objectStore(STORE_NAME);
        samples.forEach((sample) => writeStore.put(sample));
        writeTx.oncomplete = () => resolve(samples);
        writeTx.onerror = () => resolve(samples);
      } else {
        // Sort descending by date, then createdAt
        results.sort((a, b) => {
          if (a.date !== b.date) return b.date.localeCompare(a.date);
          return b.createdAt - a.createdAt;
        });
        resolve(results);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

export async function saveRecord(record: ReadingRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(record);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteRecord(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function exportAllData(): Promise<string> {
  const records = await getAllRecords();
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), records }, null, 2);
}

export async function importData(jsonString: string): Promise<number> {
  const data = JSON.parse(jsonString);
  const records: ReadingRecord[] = Array.isArray(data) ? data : data.records;
  if (!Array.isArray(records)) {
    throw new Error('유효하지 않은 데이터 형식입니다.');
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    let count = 0;

    for (const record of records) {
      if (record.id && record.bookTitle && record.date) {
        store.put(record);
        count++;
      }
    }

    transaction.oncomplete = () => resolve(count);
    transaction.onerror = () => reject(transaction.error);
  });
}
