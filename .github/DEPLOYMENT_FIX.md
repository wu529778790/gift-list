# GitHub Pages 部署修复指南

## 当前问题

你的 Next.js 16 应用使用了 App Router 和客户端导航，这与 GitHub Pages 的纯静态导出有兼容性问题：

1. **`next export` 已被移除** - Next.js 13+ 使用 `output: 'export'` 配置
2. **`useRouter` from `next/navigation`** - 需要服务器端支持
3. **客户端路由** - GitHub Pages 只支持静态文件

## 解决方案

### 方案 1: 修复后的配置（推荐用于纯静态）

我已经更新了配置文件，但你需要检查应用是否能正常工作：

1. **更新 `next.config.ts`**:
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',  // 静态导出模式
  images: {
    unoptimized: true,  // 禁用图片优化
  },
  // 如果使用 base path（如 /repo-name），取消注释下面这行
  // basePath: '/your-repo-name',
};

export default nextConfig;
```

2. **更新 `src/app/layout.tsx`**:
```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '电子礼簿系统',
  description: '纯本地、零后端、安全的礼金管理系统',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 添加 base 标签以支持 GitHub Pages */}
        <base href={process.env.NEXT_PUBLIC_BASE_PATH || '/'} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

3. **更新页面中的路由**:
将 `useRouter` 替换为原生的 `window.location` 或 `a` 标签：
```typescript
// 替换前
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/setup');

// 替换后
window.location.href = '/setup';
// 或使用 <a href="/setup"> 标签
```

### 方案 2: 使用 Vite + React（完全静态）

如果 Next.js 静态导出有问题，可以迁移到 Vite：

```bash
# 安装 Vite
npm create vite@latest libu-vite -- --template react-ts

# 迁移步骤
1. 复制 src/ 目录
2. 复制 public/ 目录（如果有）
3. 复制样式文件
4. 修改路由为原生浏览器路由
```

### 方案 3: 使用其他托管服务（推荐）

GitHub Pages 不适合需要客户端路由的应用，考虑：

- **Vercel** - 原生支持 Next.js（推荐）
- **Netlify** - 支持 Next.js
- **Cloudflare Pages** - 支持 Next.js

## 快速测试

在本地测试静态导出：

```bash
# 1. 设置环境变量
export NEXT_PUBLIC_IS_EXPORT=true

# 2. 构建
pnpm next build

# 3. 检查输出
ls -la out/
cat out/index.html
```

## 如果仍然失败

1. 查看 GitHub Actions 日志
2. 检查 `.next` 目录内容
3. 考虑简化应用（移除客户端路由）
4. 或使用 Vercel 托管（5分钟搞定）

## 推荐方案

对于你的应用（需要 localStorage、客户端状态），**最佳方案是**：

1. **短期**: 使用 Vercel 免费托管
2. **长期**: 迁移到 Vite + React，完全静态化

需要我帮你创建 Vite 版本吗？
