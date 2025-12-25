import { useEffect, useState, useRef, useMemo } from "react";
import { Utils } from "@/lib/utils";

declare global {
  interface Window {
    // Add global window properties if needed
  }
}

interface GiftData {
  name: string;
  amount: number;
  type: "现金" | "微信" | "支付宝" | "其他";
  remark?: string;
  timestamp: string;
  abolished?: boolean;
}

interface SyncData {
  eventName: string;
  theme: string;
  gifts: GiftData[];
}

// 翻页配置
const PAGE_CONFIG = {
  RECORDS_PER_PAGE: 6, // 每页记录数（单行多列，像真实礼簿）
  STAY_DURATION: 10000, // 新数据停留时间（10秒）
  FLIP_SPEED: 600, // 翻页动画速度（毫秒）
  AUTO_INTERVAL: 5000, // 自动翻页间隔（5秒，从第一页翻到最新页后循环）
};

export default function GuestScreen() {
  const [data, setData] = useState<SyncData | null>(null);
  const [currentPage, setCurrentPage] = useState(0); // 当前页码
  const [isFlipping, setIsFlipping] = useState(false); // 翻页动画状态

  const prevGiftCountRef = useRef(0);
  const lastNewDataTimeRef = useRef(0); // 记录最新数据时间
  const stayTimerRef = useRef<number | null>(null); // 10秒停留定时器
  const autoFlipTimerRef = useRef<number | null>(null); // 自动翻页定时器
  const totalPagesRef = useRef(0); // 总页数

  // 监听数据同步
  useEffect(() => {
    const handleStorageChange = () => {
      const syncData = localStorage.getItem("guest_screen_data");
      if (syncData) {
        try {
          const parsed = JSON.parse(syncData) as SyncData;
          setData(parsed);
        } catch (e) {
          console.error("解析同步数据失败:", e);
        }
      }
    };

    handleStorageChange();
    const interval = setInterval(handleStorageChange, 2000);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // 分页数据计算
  const pagedData = useMemo(() => {
    if (!data || data.gifts.length === 0) return [];

    const pages: GiftData[][] = [];
    const gifts = data.gifts;

    for (let i = 0; i < gifts.length; i += PAGE_CONFIG.RECORDS_PER_PAGE) {
      pages.push(gifts.slice(i, i + PAGE_CONFIG.RECORDS_PER_PAGE));
    }

    totalPagesRef.current = pages.length;
    return pages;
  }, [data]);

  // 数据更新处理 + 翻页逻辑
  useEffect(() => {
    if (!data || pagedData.length === 0) return;

    const hasNewData = data.gifts.length > prevGiftCountRef.current;
    const currentTime = Date.now();

    // 清除之前的定时器
    clearAllTimers();

    if (hasNewData) {
      // ✅ 有新数据：翻到最新页
      lastNewDataTimeRef.current = currentTime;
      const latestPage = pagedData.length - 1;

      // 只有当不是首次加载时才翻页（prevGiftCountRef.current > 0）
      if (prevGiftCountRef.current > 0) {
        flipToPage(latestPage);
      } else {
        // 首次加载，直接设置到最新页，不翻页动画
        setCurrentPage(latestPage);
      }

      // 启动10秒停留计时器
      stayTimerRef.current = setTimeout(() => {
        // 10秒后开始自动翻页循环
        startAutoFlipCycle();
      }, PAGE_CONFIG.STAY_DURATION);
    } else if (data.gifts.length > 0 && pagedData.length > 1) {
      // ✅ 无新数据但有多页：检查是否需要开始自动循环
      const timeSinceLastNewData = Date.now() - lastNewDataTimeRef.current;

      if (timeSinceLastNewData > PAGE_CONFIG.STAY_DURATION) {
        // 已经超过停留时间，开始自动循环
        startAutoFlipCycle();
      } else {
        // 还在停留时间内，设置剩余时间的计时器
        const remainingTime = PAGE_CONFIG.STAY_DURATION - timeSinceLastNewData;
        stayTimerRef.current = setTimeout(() => {
          startAutoFlipCycle();
        }, remainingTime);
      }
    }

    prevGiftCountRef.current = data.gifts.length;

    // 清理函数
    return () => {
      clearAllTimers();
    };
  }, [data, pagedData]);

  // 清除所有定时器
  const clearAllTimers = () => {
    if (stayTimerRef.current !== null) {
      window.clearTimeout(stayTimerRef.current);
      stayTimerRef.current = null;
    }
    if (autoFlipTimerRef.current !== null) {
      window.clearTimeout(autoFlipTimerRef.current);
      autoFlipTimerRef.current = null;
    }
  };

  // 翻页到指定页码
  const flipToPage = (targetPage: number) => {
    if (targetPage === currentPage) return;

    setIsFlipping(true);

    // 翻页动画
    window.setTimeout(() => {
      setCurrentPage(targetPage);
      setIsFlipping(false);
    }, PAGE_CONFIG.FLIP_SPEED);
  };

  // 开始自动翻页循环
  const startAutoFlipCycle = () => {
    if (pagedData.length <= 1) return; // 只有一页时不循环

    const cycleStep = () => {
      // 计算下一页（循环）
      const nextPage = (currentPage + 1) % pagedData.length;

      // 翻到下一页
      flipToPage(nextPage);

      // 设置下一次翻页
      autoFlipTimerRef.current = window.setTimeout(
        cycleStep,
        PAGE_CONFIG.STAY_DURATION
      );
    };

    // 延迟一段时间后开始循环，让用户看清当前页
    autoFlipTimerRef.current = window.setTimeout(
      cycleStep,
      PAGE_CONFIG.AUTO_INTERVAL
    );
  };

  if (!data || pagedData.length === 0) {
    return (
      <div className="guest-screen-empty">
        <h1>副屏展示</h1>
        <p>等待主屏数据同步...</p>
      </div>
    );
  }

  // 格式化姓名（两个字中间加空格）
  const formatName = (name: string) => {
    return name.length === 2 ? `${name[0]}　${name[1]}` : name;
  };

  const themeClass =
    data.theme === "theme-festive" ? "theme-festive" : "theme-solemn";
  const totalPages = pagedData.length;
  const currentPageData = pagedData[currentPage] || [];

  return (
    <div className={`guest-screen-wrapper ${themeClass}`}>
      {/* 顶部标题 - 固定在上方 */}
      <div className="guest-screen-header">
        <h1 className="guest-screen-title">{data.eventName}</h1>
      </div>

      {/* 礼簿内容 - 直接使用翻页动画 */}
      <div className={`gift-book-columns ${isFlipping ? "flipping" : ""}`}>
        {currentPageData.map((gift, idx) => {
          const isLatest =
            currentPage === totalPages - 1 &&
            idx === currentPageData.length - 1;
          return (
            <div
              key={idx}
              className={`gift-book-column ${isLatest ? "latest" : ""}`}
              data-index={idx}>
              <div className="book-cell name-cell column-top">
                <div className="name">{formatName(gift.name)}</div>
              </div>
              <div className="book-cell amount-cell column-bottom">
                <div className="amount-chinese">
                  {Utils.amountToChinese(gift.amount)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
