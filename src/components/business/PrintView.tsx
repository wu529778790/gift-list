import { useEffect } from 'react';
import { Event, GiftData } from '@/types';
import { amountToChinese } from '@/utils/format';

interface PrintViewProps {
  event: Event;
  gifts: GiftData[];
}

export default function PrintView({ event, gifts }: PrintViewProps) {
  // 过滤掉已作废的记录
  const validGifts = gifts.filter(g => !g.abolished);

  // 按时间排序
  const sortedGifts = validGifts.sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // 统计信息
  const totalAmount = sortedGifts.reduce((sum, g) => sum + g.amount, 0);
  const totalGivers = sortedGifts.length;

  // 按支付方式统计
  const typeStats = sortedGifts.reduce((acc, g) => {
    acc[g.type] = (acc[g.type] || 0) + g.amount;
    return acc;
  }, {} as Record<string, number>);

  // 自动打印
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 打印后关闭窗口
  useEffect(() => {
    const handleAfterPrint = () => {
      setTimeout(() => {
        window.close();
      }, 500);
    };

    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  // 格式化日期时间
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  // 格式化金额大写
  const formatChineseAmount = (amount: number) => {
    return amountToChinese(amount);
  };

  // 格式化姓名（两个字中间加空格）
  const formatName = (name: string) => {
    return name.length === 2 ? `${name[0]}　${name[1]}` : name;
  };

  return (
    <div className="print-container">
      {/* 头部信息 */}
      <div className="print-header">
        <h1>{event.name}</h1>
        <div className="info">
          <span>时间: {formatDateTime(event.startDateTime)} ~ {formatDateTime(event.endDateTime)}</span>
          {event.recorder && <span>记账人: {event.recorder}</span>}
        </div>
        <div className="stats">
          <span>总金额: ¥{totalAmount.toFixed(2)}</span>
          <span>总人数: {totalGivers}人</span>
          {Object.entries(typeStats).map(([type, amount]) => (
            <span key={type}>{type}: ¥{amount.toFixed(2)}</span>
          ))}
        </div>
      </div>

      {/* 礼簿内容 - 列式布局，完全参考主页面和副屏 */}
      <div className="print-gift-columns-wrapper">
        <div className="print-gift-columns">
          {sortedGifts.map((gift, idx) => (
            <div key={idx} className="print-gift-column">
              {/* 姓名区域 - 上方 */}
              <div className="book-cell name-cell column-top">
                {formatName(gift.name)}
              </div>
              {/* 金额区域 - 下方 */}
              <div className="book-cell amount-cell column-bottom">
                {formatChineseAmount(gift.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 页脚 */}
      <div className="print-footer">
        打印时间: {new Date().toLocaleString('zh-CN')} | 共 {sortedGifts.length} 条记录
      </div>
    </div>
  );
}