import { Event, GiftRecord } from '@/types';

// 导入结果接口
export interface ImportResult {
  events: number;
  gifts: number;
  conflicts: number;
}

// 备份数据格式
interface BackupData {
  version: string;
  timestamp: string;
  events: Event[];
  gifts: Record<string, GiftRecord[]>;
}

/**
 * 备份服务 - 处理数据的导入和导出
 */
export class BackupService {
  /**
   * 导出完整数据为 JSON 文件
   */
  static exportAll(): void {
    const data: BackupData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      events: this.getAllEvents(),
      gifts: this.getAllGifts(),
    };

    // 创建 JSON 字符串
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });

    // 生成文件名（包含日期）
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `礼簿备份_${dateStr}.json`;

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * 导入备份数据
   * @param file 文件对象
   * @returns 导入结果
   */
  static async import(file: File): Promise<ImportResult> {
    // 读取文件内容
    const text = await file.text();

    // 解析 JSON
    let data: BackupData;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('文件格式错误，无法解析 JSON');
    }

    // 验证数据结构
    if (!data.version || !data.timestamp || !data.events || !data.gifts) {
      throw new Error('备份文件格式不正确，缺少必要字段');
    }

    const result: ImportResult = {
      events: 0,
      gifts: 0,
      conflicts: 0,
    };

    // 合并事件数据
    const existingEvents = this.getAllEvents();
    const existingEventIds = new Set(existingEvents.map(e => e.id));

    data.events.forEach((event: Event) => {
      if (!existingEventIds.has(event.id)) {
        existingEvents.push(event);
        result.events++;
      } else {
        result.conflicts++;
      }
    });

    // 保存事件到 localStorage
    localStorage.setItem('giftlist_events', JSON.stringify(existingEvents));

    // 合并礼物数据
    for (const eventId in data.gifts) {
      const incomingGifts = data.gifts[eventId];
      const existingGifts = this.getGiftsByEventId(eventId);
      const existingGiftIds = new Set(existingGifts.map(g => g.id));

      incomingGifts.forEach((gift: GiftRecord) => {
        if (!existingGiftIds.has(gift.id)) {
          existingGifts.push(gift);
          result.gifts++;
        } else {
          result.conflicts++;
        }
      });

      // 保存礼物到 localStorage
      if (existingGifts.length > 0) {
        localStorage.setItem(`giftlist_gifts_${eventId}`, JSON.stringify(existingGifts));
      }
    }

    return result;
  }

  /**
   * 导出指定事件的数据
   */
  static exportEvent(eventId: string, eventName: string): void {
    const event = this.getEventById(eventId);
    if (!event) {
      throw new Error('事件不存在');
    }

    const gifts = this.getGiftsByEventId(eventId);

    const data = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      events: [event],
      gifts: { [eventId]: gifts },
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });

    // 清理文件名中的特殊字符
    const safeName = eventName.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `礼簿_${safeName}_${dateStr}.json`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * 获取所有事件
   */
  private static getAllEvents(): Event[] {
    const stored = localStorage.getItem('giftlist_events');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * 根据 ID 获取事件
   */
  private static getEventById(id: string): Event | null {
    const events = this.getAllEvents();
    return events.find(e => e.id === id) || null;
  }

  /**
   * 获取所有礼物数据
   */
  private static getAllGifts(): Record<string, GiftRecord[]> {
    const gifts: Record<string, GiftRecord[]> = {};
    const events = this.getAllEvents();

    events.forEach((event: Event) => {
      const data = this.getGiftsByEventId(event.id);
      if (data.length > 0) {
        gifts[event.id] = data;
      }
    });

    return gifts;
  }

  /**
   * 根据事件 ID 获取礼物数据
   */
  private static getGiftsByEventId(eventId: string): GiftRecord[] {
    const stored = localStorage.getItem(`giftlist_gifts_${eventId}`);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * 检查是否有备份数据
   */
  static hasData(): boolean {
    const events = localStorage.getItem('giftlist_events');
    if (!events) return false;

    const eventList: Event[] = JSON.parse(events);
    if (eventList.length === 0) return false;

    // 检查是否有礼物数据
    for (const event of eventList) {
      const gifts = localStorage.getItem(`giftlist_gifts_${event.id}`);
      if (gifts && JSON.parse(gifts).length > 0) {
        return true;
      }
    }

    return false;
  }

  /**
   * 获取数据统计信息
   */
  static getStats(): { events: number; gifts: number; lastModified: string | null } {
    const events = this.getAllEvents();
    let totalGifts = 0;
    let lastModified: string | null = null;

    events.forEach((event: Event) => {
      const gifts = this.getGiftsByEventId(event.id);
      totalGifts += gifts.length;

      // 找出最后修改时间
      gifts.forEach((gift: GiftRecord) => {
        if (!lastModified || gift.id > lastModified) {
          // 这里用 id 作为近似时间戳
          lastModified = gift.id;
        }
      });
    });

    return {
      events: events.length,
      gifts: totalGifts,
      lastModified,
    };
  }
}
