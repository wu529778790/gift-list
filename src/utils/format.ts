import { GiftType } from '@/types';

// 日期格式化工具
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// 日期时间格式化工具
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// 金额转中文大写（使用lib/utils.ts的实现，更准确）
export const amountToChinese = (n: number): string => {
  if (typeof n !== 'number') return '';
  if (n === 0) return '零元整';

  let unit = '京亿万仟佰拾兆万仟佰拾亿仟佰拾万仟佰拾元角分';
  let str = '';
  let s = n.toString();

  if (s.indexOf('.') > -1) s = (n * 100).toFixed(0);
  else s += '00';

  if (s.length > unit.length) return '金额过大';
  unit = unit.substr(unit.length - s.length);

  for (let i = 0; i < s.length; i++) {
    const digit = parseInt(s.charAt(i), 10);
    str += '零壹贰叁肆伍陆柒捌玖'.charAt(digit) + unit.charAt(i);
  }

  return str
    .replace(/零(仟|佰|拾|角)/g, '零')
    .replace(/(零)+/g, '零')
    .replace(/零(兆|万|亿|元)/g, '$1')
    .replace(/(兆|亿)万/g, '$1')
    .replace(/(京|兆)亿/g, '$1')
    .replace(/(京)兆/g, '$1')
    .replace(/(亿)万/g, '$1')
    .replace(/(京|兆|亿|仟|佰|拾)(万?)(.)/g, '$1$2$3')
    .replace(/零元/g, '元')
    .replace(/零分/g, '')
    .replace(/零角/g, '零')
    .replace(/元$/g, '元整')
    .replace(/角$/g, '角整');
};

// 生成唯一ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 格式化货币
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(amount || 0);
};

// 验证金额
export const isValidAmount = (amount: number): boolean => {
  return !isNaN(amount) && amount > 0 && amount <= 999999;
};

// 验证姓名长度
export const isValidName = (name: string): boolean => {
  const trimmedName = name.trim();
  return trimmedName.length >= 1 && trimmedName.length <= 20;
};

// 验证礼金类型
export const isValidGiftType = (type: string): type is GiftType => {
  return ['现金', '微信', '支付宝', '其他'].includes(type);
};

// 验证金额（字符串格式）
export const validateAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

// 验证姓名
export const validateName = (name: string): boolean => {
  return name.trim().length >= 1 && name.trim().length <= 20;
};

// 格式化姓名（两个字中间加空格）
export const formatName = (name: string): string => {
  return name.length === 2 ? `${name[0]}　${name[1]}` : name;
};

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>): void => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>): void => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 深拷贝函数
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as any;

  const clonedObj: any = {};
  Object.keys(obj).forEach(key => {
    clonedObj[key] = deepClone((obj as any)[key]);
  });

  return clonedObj;
};

// 获取当前日期时间
export const getCurrentDateTime = (): { date: string; time: string } => {
  const now = new Date();
  const pad = (num: number) => num.toString().padStart(2, '0');
  return {
    date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    time: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
  };
};