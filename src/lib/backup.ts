import { Event, GiftRecord, GiftData } from '@/types';
import { amountToChinese, formatDate } from '@/utils/format';
import * as XLSX from 'xlsx';

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

  /**
   * 导出指定事件为 Excel 文件
   * @param eventName 事件名称
   * @param gifts 解密后的礼金数据列表
   * @param eventInfo 事件详细信息（可选，用于在Excel中显示事件信息）
   */
  static exportExcel(
    eventName: string,
    gifts: GiftData[],
    eventInfo?: Event
  ): void {
    // 过滤掉已作废的记录
    const validGifts = gifts.filter(g => !g.abolished);

    if (validGifts.length === 0) {
      alert('没有可导出的有效礼金记录');
      return;
    }

    // 创建工作簿
    const workbook = XLSX.utils.book_new();

    // ========== 第一页：礼金明细表 ==========

    // 准备表头数据
    const headers = [
      '序号',
      '姓名',
      '金额（元）',
      '金额大写',
      '支付方式',
      '备注',
      '录入时间'
    ];

    // 准备数据行
    const dataRows = validGifts.map((gift, index) => [
      index + 1,
      gift.name,
      gift.amount,
      amountToChinese(gift.amount),
      gift.type,
      gift.remark || '',
      formatDate(gift.timestamp)
    ]);

    // 合并表头和数据
    const sheetData = [headers, ...dataRows];

    // 创建工作表
    const detailSheet = XLSX.utils.aoa_to_sheet(sheetData);

    // 设置列宽
    detailSheet['!cols'] = [
      { wch: 6 },   // 序号
      { wch: 12 },  // 姓名
      { wch: 12 },  // 金额
      { wch: 25 },  // 金额大写
      { wch: 10 },  // 支付方式
      { wch: 20 },  // 备注
      { wch: 12 }   // 时间
    ];

    // 设置单元格样式（表头加粗）
    for (let C = 0; C < headers.length; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!detailSheet[cellAddress]) continue;
      detailSheet[cellAddress].s = {
        font: { bold: true, name: '宋体' },
        alignment: { horizontal: 'center', vertical: 'center' },
        fill: { fgColor: { rgb: 'FFE3E3E3' } }
      };
    }

    // 数据行样式
    for (let R = 1; R < sheetData.length; ++R) {
      for (let C = 0; C < headers.length; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!detailSheet[cellAddress]) continue;
        detailSheet[cellAddress].s = {
          font: { name: '宋体' },
          alignment: { horizontal: 'center', vertical: 'center' }
        };
      }
    }

    // 添加到工作簿
    XLSX.utils.book_append_sheet(workbook, detailSheet, '礼金明细');

    // ========== 第二页：统计汇总 ==========

    // 计算统计数据
    const totalAmount = validGifts.reduce((sum, g) => sum + g.amount, 0);
    const totalPeople = validGifts.length;

    // 按支付方式统计
    const typeStats: Record<string, number> = {};
    const typeCount: Record<string, number> = {};
    validGifts.forEach(g => {
      typeStats[g.type] = (typeStats[g.type] || 0) + g.amount;
      typeCount[g.type] = (typeCount[g.type] || 0) + 1;
    });

    // 准备统计数据
    const statsData = [
      ['==========', '========', '========', '========'],
      ['统计项目', '数值', '说明', ''],
      ['==========', '========', '========', '========'],
      ['总人数', totalPeople, '人', ''],
      ['总金额', totalAmount, '元', amountToChinese(totalAmount)],
      ['', '', '', ''],
      ['支付方式统计', '', '', ''],
      ['----------', '--------', '--------', '--------']
    ];

    // 添加各支付方式统计
    Object.keys(typeStats).forEach(type => {
      statsData.push([
        type,
        typeStats[type],
        `${typeCount[type]}笔`,
        amountToChinese(typeStats[type])
      ]);
    });

    // 事件信息（如果有）
    if (eventInfo) {
      statsData.push(['', '', '', '']);
      statsData.push(['事件信息', '', '', '']);
      statsData.push(['----------', '--------', '--------', '--------']);
      statsData.push(['事件名称', eventInfo.name, '', '']);
      statsData.push(['开始时间', formatDate(eventInfo.startDateTime), '', '']);
      statsData.push(['结束时间', formatDate(eventInfo.endDateTime), '', '']);
      if (eventInfo.recorder) {
        statsData.push(['记账人', eventInfo.recorder, '', '']);
      }
      statsData.push(['导出时间', formatDate(new Date().toISOString()), '', '']);
    }

    const summarySheet = XLSX.utils.aoa_to_sheet(statsData);

    // 设置统计表的列宽
    summarySheet['!cols'] = [
      { wch: 18 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 }
    ];

    // 设置统计表样式
    for (let R = 0; R < statsData.length; ++R) {
      for (let C = 0; C < 4; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!summarySheet[cellAddress]) continue;

        // 表头加粗
        if (R <= 2 || statsData[R][0] === '支付方式统计' || statsData[R][0] === '事件信息') {
          summarySheet[cellAddress].s = {
            font: { bold: true, name: '宋体' },
            alignment: { horizontal: 'center', vertical: 'center' }
          };
        } else {
          summarySheet[cellAddress].s = {
            font: { name: '宋体' },
            alignment: { horizontal: 'center', vertical: 'center' }
          };
        }
      }
    }

    // 添加到工作簿
    XLSX.utils.book_append_sheet(workbook, summarySheet, '统计汇总');

    // ========== 生成文件并下载 ==========

    // 清理文件名中的特殊字符
    const safeName = eventName.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `礼簿_${safeName}_${dateStr}.xlsx`;

    // 生成 Excel 文件（二进制）
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // 创建 Blob 并下载
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
