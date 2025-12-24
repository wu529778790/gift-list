# 🎁 电子礼簿系统

基于 **Next.js 16** 的现代化电子礼簿系统，支持本地存储和 GitHub 云端同步。

![20251224190930](https://gcore.jsdelivr.net/gh/wu529778790/img.shenzjd.com/blog/20251224190930.png)

## 🚀 一键部署

### GitHub Pages (免费)

[![Deploy to GitHub Pages](https://github.com/wu529778790/libu.shenzjd.com/actions/workflows/deploy-to-github-pages.yml/badge.svg)](https://github.com/wu529778790/libu.shenzjd.com/actions/workflows/deploy-to-github-pages.yml)

1. Fork 仓库
2. 启用 GitHub Pages (Settings → Pages)
3. 推送代码，自动部署

### Vercel (推荐)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

点击按钮 → 导入仓库 → 自动部署

## ⚡ 快速体验

首次访问自动创建演示数据：

- 事件: 张三李四婚礼
- 密码: **123456** (已预填)
- 礼金: 6条数据（888, 666, 1000, 520, 1888, 666）

## ✨ 核心特性

| 功能 | 描述 |
|------|------|
| 📦 **双存储** | localStorage (默认) + GitHub 云端 (可选) |
| 🔒 **数据加密** | AES-256 加密 + SHA-256 密码哈希 |
| 🎨 **双主题** | 喜庆红 / 肃穆灰 |
| 📜 **传统格式** | 竖排文字 + 12列网格布局 |
| 📄 **导出** | PDF 打印 / Excel 导出 |
| 🖥️ **双屏联动** | 实时同步展示 |

## 🚀 本地开发

```bash
# 1. 安装依赖
pnpm install

# 2. 启动开发服务器
pnpm run dev

# 3. 访问 http://localhost:3000
```

## 📖 使用流程

1. **创建事项**：填写名称、时间、密码，选择主题
2. **录入礼金**：输入姓名、金额（自动显示中文大写）
3. **查看导出**：打印/PDF 或导出 Excel

## 🎯 技术栈

| 技术 | 版本 |
|------|------|
| Next.js | 16.1.1 |
| React | 19.0.0 |
| TypeScript | 5.x |
| Tailwind CSS | 3.4.0 |
| CryptoJS | 4.2.0 |
| xlsx | 0.18.5 |

## 🔒 数据安全

- **AES-256**：所有数据加密存储
- **SHA-256**：密码单向哈希
- **客户端加密**：数据在浏览器加密后才传输

## 🧪 测试

```bash
pnpm exec jest --no-coverage
```

**结果**：52/52 通过 ✅ | 覆盖率 93.84%

---

**开始使用**：`pnpm run dev` 🎉
