import { amountToChinese, formatName } from '@/utils/format';

interface Gift {
  record: { id: string };
  data: {
    name: string;
    amount: number;
    abolished?: boolean;
  } | null;
}

interface GiftBookDisplayProps {
  displayGifts: Gift[];
  onGiftClick: (gift: Gift) => void;
}

export default function GiftBookDisplay({
  displayGifts,
  onGiftClick,
}: GiftBookDisplayProps) {
  return (
    <div className="gift-book-columns">
      {Array.from({ length: 12 }).map((_, idx) => {
        const gift = displayGifts[idx];
        const hasData = gift && gift.data && !gift.data.abolished;
        return (
          <div
            key={idx}
            className="gift-book-column"
            data-col-index={idx}
            data-has-data={hasData ? "true" : "false"}
            onClick={() => {
              if (hasData && gift.data) {
                onGiftClick(gift);
              }
            }}
            style={{ cursor: hasData ? "pointer" : "default" }}
          >
            {/* 姓名区域 */}
            <div className="book-cell name-cell column-top">
              {hasData ? (
                <div className="name">
                  {formatName(gift.data!.name)}
                </div>
              ) : (
                <span className="text-gray-300 print-placeholder">
                  +
                </span>
              )}
            </div>

            {/* 金额区域 */}
            <div className="book-cell amount-cell column-bottom">
              {hasData ? (
                <div className="amount-chinese">
                  {amountToChinese(gift.data!.amount)}
                </div>
              ) : (
                <span className="text-gray-300 print-placeholder">
                  +
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
