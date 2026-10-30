export const LEVELS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
export const QUESTIONS = 10; // số câu mỗi level
export const PASS = 7; // số câu đúng ngay lần đầu để qua level
export const POINTS = 10; // điểm cho mỗi câu đúng ngay lần đầu

export const MODES = {
  add: { name: 'Phép cộng', short: 'Cộng', sym: '➕', cls: 'm-add' },
  sub: { name: 'Phép trừ', short: 'Trừ', sym: '➖', cls: 'm-sub' },
  mix: { name: 'Cộng trừ', short: 'Cộng trừ', sym: '➕➖', cls: 'm-mix' },
};

export const PRAISE = ['Giỏi quá!', 'Đúng rồi!', 'Tuyệt vời!', 'Siêu quá!', 'Hay lắm!', 'Xuất sắc!'];

export function starsFor(correct) {
  if (correct >= 10) return 3;
  if (correct >= 8) return 2;
  if (correct >= PASS) return 1;
  return 0;
}
