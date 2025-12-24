"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CryptoService } from "@/lib/crypto";
import { Utils } from "@/lib/utils";

interface TestData {
  events: Array<{
    id: string;
    name: string;
    startDateTime: string;
    endDateTime: string;
    passwordHash: string;
    password: string;
    theme: "festive" | "solemn";
    recorder: string;
  }>;
  gifts: Record<
    string,
    Array<{
      name: string;
      amount: number;
      type: "现金" | "微信" | "支付宝" | "其他";
      remark?: string;
    }>
  >;
}

export default function TestDataPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // 测试数据模板
  const testData: TestData = {
    events: [
      {
        id: "event_wedding",
        name: "张三 & 李四 婚礼",
        startDateTime: "2025-01-15T18:00:00",
        endDateTime: "2025-01-15T22:00:00",
        passwordHash: "",
        password: "123456",
        theme: "festive",
        recorder: "小王",
      },
      {
        id: "event_birthday",
        name: "王大爷 110 大葬礼",
        startDateTime: "2025-02-10T12:00:00",
        endDateTime: "2025-02-10T16:00:00",
        passwordHash: "",
        password: "123456",
        theme: "solemn",
        recorder: "小李",
      },
      {
        id: "event_baby",
        name: "陈小宝 满月宴",
        startDateTime: "2025-03-20T11:30:00",
        endDateTime: "2025-03-20T14:30:00",
        passwordHash: "",
        password: "123456",
        theme: "festive",
        recorder: "小张",
      },
    ],
    gifts: {
      event_wedding: [
        { name: "张大伯", amount: 2000, type: "现金", remark: "新婚快乐" },
        { name: "李阿姨", amount: 1888, type: "微信", remark: "百年好合" },
        { name: "王叔叔", amount: 1688, type: "现金" },
        { name: "陈奶奶", amount: 1000, type: "现金", remark: "早生贵子" },
        { name: "刘爷爷", amount: 2000, type: "支付宝" },
        { name: "赵阿姨", amount: 888, type: "微信" },
        { name: "孙叔叔", amount: 1200, type: "现金" },
        { name: "周阿姨", amount: 1000, type: "现金" },
        { name: "吴叔叔", amount: 1500, type: "微信" },
        { name: "郑阿姨", amount: 999, type: "支付宝" },
        { name: "钱叔叔", amount: 1800, type: "现金" },
        { name: "冯阿姨", amount: 1000, type: "现金" },
        { name: "陈叔叔", amount: 2000, type: "微信" },
        { name: "楚阿姨", amount: 888, type: "现金" },
        { name: "魏叔叔", amount: 1688, type: "支付宝" },
      ],
      event_birthday: [
        {
          name: "大儿子",
          amount: 5000,
          type: "现金",
          remark: "祝父亲健康长寿",
        },
        { name: "二儿子", amount: 5000, type: "微信" },
        { name: "女儿", amount: 5000, type: "现金" },
        {
          name: "孙子",
          amount: 2000,
          type: "支付宝",
          remark: "祝爷爷生日快乐",
        },
        { name: "孙女", amount: 2000, type: "现金" },
        { name: "外孙", amount: 1888, type: "微信" },
        { name: "侄子", amount: 1000, type: "现金" },
        { name: "侄女", amount: 1000, type: "现金" },
        { name: "老战友", amount: 2000, type: "现金" },
        { name: "老邻居", amount: 888, type: "微信" },
      ],
      event_baby: [
        { name: "外公", amount: 10000, type: "现金", remark: "祝小宝健康成长" },
        { name: "外婆", amount: 10000, type: "现金" },
        { name: "爷爷", amount: 8888, type: "微信" },
        { name: "奶奶", amount: 8888, type: "现金" },
        { name: "大伯", amount: 5000, type: "支付宝" },
        { name: "大姨", amount: 5000, type: "现金" },
        { name: "舅舅", amount: 6000, type: "微信" },
        { name: "姑姑", amount: 6000, type: "现金" },
        { name: "表哥", amount: 2000, type: "现金" },
        { name: "表姐", amount: 2000, type: "微信" },
        { name: "邻居王阿姨", amount: 1000, type: "现金" },
        { name: "同事李姐", amount: 888, type: "支付宝" },
      ],
    },
  };

  // 生成测试数据
  const generateTestData = async () => {
    setLoading(true);
    setStatus("正在生成测试数据...");

    try {
      // 1. 生成密码哈希
      const eventsWithHash = testData.events.map((event) => ({
        ...event,
        passwordHash: CryptoService.hash(event.password),
      }));

      // 2. 保存事件到 localStorage
      localStorage.setItem("giftlist_events", JSON.stringify(eventsWithHash));

      // 3. 为每个事件生成加密的礼金数据
      for (const event of eventsWithHash) {
        const gifts = testData.gifts[event.id] || [];
        const encryptedGifts = gifts.map((gift) => {
          const encrypted = CryptoService.encrypt(
            {
              name: gift.name,
              amount: gift.amount,
              type: gift.type,
              remark: gift.remark,
              timestamp: new Date().toISOString(),
              abolished: false,
            },
            event.password
          );
          return {
            id: Utils.generateId(),
            eventId: event.id,
            encryptedData: encrypted,
          };
        });

        localStorage.setItem(
          `giftlist_gifts_${event.id}`,
          JSON.stringify(encryptedGifts)
        );
      }

      setStatus("✅ 测试数据生成成功！");

      // 显示详细信息
      const details = eventsWithHash
        .map((e) => {
          const giftCount = testData.gifts[e.id]?.length || 0;
          const totalAmount =
            testData.gifts[e.id]?.reduce((sum, g) => sum + g.amount, 0) || 0;
          return `• ${e.name} (密码: ${
            e.password
          }) - ${giftCount} 条记录，总金额: ¥${totalAmount.toLocaleString()}`;
        })
        .join("\n");

      alert(
        `测试数据已生成！\n\n${details}\n\n现在你可以：\n1. 访问 http://localhost:3000\n2. 选择任意事件登录\n3. 测试切换事件、退出等功能`
      );

      // 3秒后自动跳转到首页
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error) {
      setStatus("❌ 生成失败: " + error);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 清除所有数据
  const clearAllData = () => {
    if (!confirm("确定要清除所有数据吗？此操作不可恢复！")) return;

    localStorage.removeItem("giftlist_events");

    // 清除所有礼金数据
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("giftlist_gifts_")) {
        localStorage.removeItem(key);
      }
    });

    // 清除会话
    sessionStorage.removeItem("currentEvent");

    setStatus("✅ 所有数据已清除！");
    alert("所有数据已清除！");
  };

  // 查看当前数据
  const viewCurrentData = () => {
    const events = JSON.parse(localStorage.getItem("giftlist_events") || "[]");
    if (events.length === 0) {
      alert("当前没有数据");
      return;
    }

    let info = "当前存储的数据：\n\n";
    events.forEach((event: any) => {
      const gifts = JSON.parse(
        localStorage.getItem(`giftlist_gifts_${event.id}`) || "[]"
      );
      info += `• ${event.name}\n  密码: ${
        event.passwordHash ? "已设置" : "无"
      }\n  礼金记录: ${gifts.length} 条\n\n`;
    });

    alert(info);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-2xl card p-8">
        <h1 className="text-3xl font-bold mb-2 text-center themed-header">
          测试数据生成器
        </h1>
        <p className="text-gray-600 text-center mb-6">
          快速生成测试数据，验证功能
        </p>

        {/* 数据预览 */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold mb-2">将要生成的测试数据：</h3>
          <ul className="text-sm space-y-2">
            {testData.events.map((event) => (
              <li key={event.id} className="border-b pb-2 last:border-0">
                <div className="font-semibold">{event.name}</div>
                <div className="text-gray-600 text-xs">
                  密码: {event.password} | 主题:{" "}
                  {event.theme === "festive" ? "喜庆" : "庄重"} | 礼金:{" "}
                  {testData.gifts[event.id]?.length || 0} 条
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          <button
            onClick={generateTestData}
            disabled={loading}
            className="w-full themed-button-primary p-4 rounded-lg font-bold hover-lift disabled:opacity-50">
            {loading ? "生成中..." : "🚀 生成测试数据"}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={viewCurrentData}
              className="w-full themed-button-secondary p-3 rounded-lg hover-lift">
              📋 查看当前数据
            </button>

            <button
              onClick={clearAllData}
              className="w-full themed-button-danger p-3 rounded-lg">
              🗑️ 清除所有数据
            </button>
          </div>

          <button
            onClick={() => router.push("/")}
            className="w-full themed-button-danger p-2 rounded-lg">
            返回首页
          </button>
        </div>

        {/* 状态显示 */}
        {status && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            {status}
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-6 pt-6 border-t text-sm text-gray-600">
          <h4 className="font-bold mb-2">使用说明：</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li>点击"生成测试数据"按钮</li>
            <li>等待生成完成（约1-2秒）</li>
            <li>自动跳转到首页</li>
            <li>选择任意事件登录测试</li>
            <li>密码在数据预览中查看</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
