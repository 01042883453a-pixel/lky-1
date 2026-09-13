/**
 * Date utility functions for Daily, Weekly, and Monthly views
 */

export function toLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatKoreanDate(dateStr: string, includeDayOfWeek: boolean = true): string {
  if (!dateStr) return '';
  const date = parseLocalDate(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dayName = days[date.getDay()];
  
  if (includeDayOfWeek) {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${dayName})`;
  }
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = parseLocalDate(dateStr);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

// Get the Monday-Sunday week range for a given date
export function getWeekRange(dateStr: string): { startDate: string; endDate: string; weekDates: string[] } {
  const current = parseLocalDate(dateStr);
  const day = current.getDay(); // 0 is Sunday, 1 is Monday...
  // Adjust so Monday is 0, Sunday is 6
  const diffToMonday = day === 0 ? -6 : 1 - day;
  
  const monday = new Date(current);
  monday.setDate(current.getDate() + diffToMonday);
  
  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(toLocalDateString(d));
  }
  
  return {
    startDate: weekDates[0],
    endDate: weekDates[6],
    weekDates,
  };
}

export function getWeekLabel(dateStr: string): string {
  const { startDate, endDate } = getWeekRange(dateStr);
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  
  // Calculate which week of the month (approximately based on week containing Monday)
  const firstDayOfMonth = new Date(start.getFullYear(), start.getMonth(), 1);
  const firstDayOfWeek = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;
  const weekNum = Math.ceil((start.getDate() + firstDayOfWeek) / 7);

  return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${weekNum}주차 (${start.getMonth() + 1}.${start.getDate()} ~ ${end.getMonth() + 1}.${end.getDate()})`;
}

// Get all days for a calendar month view, with padding days from previous/next months
export function getMonthCalendarGrid(year: number, month: number): {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}[] {
  const todayStr = toLocalDateString(new Date());
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  
  const totalDaysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Sun
  
  const cells: {
    dateStr: string;
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
  }[] = [];
  
  // Previous month padding
  const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDayNum = prevMonthLastDay - i;
    const prevDate = new Date(year, month - 2, prevDayNum);
    const dateStr = toLocalDateString(prevDate);
    cells.push({
      dateStr,
      dayNumber: prevDayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }
  
  // Current month days
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const currDate = new Date(year, month - 1, d);
    const dateStr = toLocalDateString(currDate);
    cells.push({
      dateStr,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }
  
  // Next month padding to fill up to 35 or 42 grid cells
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const nextDate = new Date(year, month, i);
    const dateStr = toLocalDateString(nextDate);
    cells.push({
      dateStr,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }
  
  return cells;
}
