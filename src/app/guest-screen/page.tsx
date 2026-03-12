import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { amountToChinese, formatName } from "@/utils/format";
import { getGuestScreenData, GuestScreenData } from "@/lib/storage";
import { PAGINATION } from "@/constants/pagination";
import { STORAGE_KEYS } from "@/lib/storage";

// 副屏轮询间隔（毫秒）
const GUEST_SCREEN_POLLING_INTERVAL = 3000;

// 副屏同步频道名称
const GUEST_SCREEN_SYNC_CHANNEL = "guest_screen_sync";

export default function GuestScreen() {
  const [data, setData] = useState<GuestScreenData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastChecksum = useRef<string>("");
  const lastRawData = useRef<string>("");
  const broadcastRef = useRef<BroadcastChannel | null>(null);
  const isMountedRef = useRef(true);

  // 检查数据是否发生变化（改进的校验和计算）
  const hasDataChanged = useCallback((newData: GuestScreenData): boolean => {
    // 使用 JSON.stringify 进行深度比较，捕获所有变化
    const checksum = JSON.stringify(newData);
    if (checksum !== lastChecksum.current) {
      lastChecksum.current = checksum;
      return true;
    }
    return false;
  }, []);

  // 读取并更新数据（改进的版本，使用工具函数）
  const updateData = useCallback(() => {
    try {
      const syncData = getGuestScreenData();

      if (!syncData) {
        if (isMountedRef.current) {
          setError(null);
          setData(null);
        }
        return;
      }

      // 快速检查原始数据是否变化（避免不必要的解析）
      const rawData = JSON.stringify(syncData);
      if (rawData === lastRawData.current) {
        return; // 数据未变化，跳过更新
      }

      lastRawData.current = rawData;

      // 检查数据内容是否变化
      if (hasDataChanged(syncData)) {
        if (isMountedRef.current) {
          setError(null);
          setData(syncData);
        }
      }
    } catch (error) {
      console.error("读取副屏数据失败:", error);
      if (isMountedRef.current) {
        setError("读取数据失败，请刷新页面");
      }
    }
  }, [hasDataChanged]);

  // 监听数据同步
  useEffect(() => {
    isMountedRef.current = true;

    // 初始加载
    updateData();

    // 使用 BroadcastChannel 进行跨标签页通信（如果浏览器支持）
    if (typeof BroadcastChannel !== "undefined") {
      try {
        broadcastRef.current = new BroadcastChannel(GUEST_SCREEN_SYNC_CHANNEL);
        broadcastRef.current.onmessage = () => {
          if (isMountedRef.current) {
            updateData();
          }
        };
      } catch (e) {
        console.warn("BroadcastChannel 不可用:", e);
      }
    }

    // 只有在没有 BroadcastChannel 时才依赖轮询
    let interval: ReturnType<typeof setInterval> | null = null;
    if (!broadcastRef.current) {
      interval = setInterval(() => {
        if (isMountedRef.current) {
          updateData();
        }
      }, GUEST_SCREEN_POLLING_INTERVAL);
    }

    // storage 事件监听（其他标签页修改数据时触发）
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.GUEST_SCREEN_DATA && isMountedRef.current) {
        updateData();
        // 通知其他 BroadcastChannel 监听器
        if (broadcastRef.current) {
          try {
            broadcastRef.current.postMessage({ type: "update" });
          } catch (e) {
            console.warn("发送 BroadcastChannel 消息失败:", e);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorage);

    // 清理函数
    return () => {
      isMountedRef.current = false;
      if (interval) clearInterval(interval);
      if (broadcastRef.current) {
        broadcastRef.current.close();
        broadcastRef.current = null;
      }
      window.removeEventListener("storage", handleStorage);
    };
  }, [updateData]);

  // 使用 useMemo 缓存主题类名
  const themeClass = useMemo(() => {
    return data?.theme === "theme-festive" ? "theme-festive" : "theme-solemn";
  }, [data?.theme]);

  // 使用 useMemo 缓存显示的礼金列表（最新12条）
  const displayGifts = useMemo(() => {
    if (!data) return [];
    return data.gifts.slice(-PAGINATION.ITEMS_PER_PAGE);
  }, [data]);

  // 错误状态
  if (error) {
    return (
      <div className="guest-screen-empty">
        <h1>副屏展示</h1>
        <p className="text-red-500 font-bold">{error}</p>
      </div>
    );
  }

  // 空数据状态
  if (!data || data.gifts.length === 0) {
    return (
      <div className="guest-screen-empty">
        <h1>副屏展示</h1>
        <p>等待主屏数据同步...</p>
        <p className="text-xs text-gray-400 mt-2">提示：请在主屏录入数据或刷新页面</p>
      </div>
    );
  }

  // 使用 timestamp + name 作为唯一 key
  const getGiftKey = (index: number, gift: GuestScreenData["gifts"][number]) => {
    return `${gift.timestamp}-${gift.name}-${index}`;
  };

  return (
    <div className={`guest-screen-wrapper ${themeClass}`}>
      {/* 顶部标题 - 居中大标题 */}
      <div className="guest-screen-header">
        <h1 className="guest-screen-title">{data.eventName}</h1>
      </div>

      {/* 礼簿内容 - 单行列式展示，参考主页面的礼簿展示区域 */}
      <div className="guest-screen-columns-wrapper">
        <div className="gift-book-columns guest-screen-columns">
          {displayGifts.map((gift, idx) => {
            const isLatest = idx === displayGifts.length - 1;
            return (
              <div
                key={getGiftKey(idx, gift)}
                className={`gift-book-column ${isLatest ? "latest" : ""}`}
                data-index={idx}>
                <div className="book-cell name-cell column-top">
                  <div className="name">{formatName(gift.name)}</div>
                </div>
                <div className="book-cell amount-cell column-bottom">
                  <div className="amount-chinese">
                    {amountToChinese(gift.amount)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
