export const LEVELS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 99];
export const QUESTIONS = 10; // số câu mỗi level
export const PASS = 7; // số câu đúng ngay lần đầu để qua level
export const POINTS = 10; // điểm cho mỗi câu đúng ngay lần đầu
export const MAX_SUBTRAHEND = 10; // phép trừ: số trừ lớn nhất là 10

export const MODES = {
  add: { name: 'Phép cộng', short: 'Cộng', sym: '➕', cls: 'm-add' },
  sub: { name: 'Phép trừ', short: 'Trừ', sym: '➖', cls: 'm-sub' },
  cmp: { name: 'So sánh', short: 'So sánh', sym: '> < =', cls: 'm-cmp' },
};

// Lời khen khi bé trả lời đúng (vừa hiện chữ vừa đọc)
export const PRAISE = [
  'Nhã Đan giỏi quá!',
  'Hoan hô Nhã Đan!',
  'Nhã Đan thông minh quá!',
  'Giỏi ơi là giỏi!',
  'Tuyệt vời ông mặt trời!',
  'Chính xác luôn!',
  'Nhã Đan số một!',
  'Quá đỉnh luôn!',
  'Siêu nhân toán học!',
  'Yeah! Đúng rồi!',
  'Nhã Đan làm hay quá!',
  'Thưởng Nhã Đan một ngôi sao!',
];

// Lời động viên khi bé trả lời sai
export const ENCOURAGE = ['Ối, chưa đúng rồi! Thử lại nha!', 'Gần đúng rồi, thử lại nào!', 'Không sao, Nhã Đan thử lại nhé!'];

export function starsFor(correct) {
  if (correct >= 10) return 3;
  if (correct >= 8) return 2;
  if (correct >= PASS) return 1;
  return 0;
}
