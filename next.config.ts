import type { NextConfig } from 'next';

const isExport = process.env.NEXT_PUBLIC_IS_EXPORT === 'true';

const nextConfig: NextConfig = {
  // 静态导出配置（用于 GitHub Pages）
  output: isExport ? 'export' : undefined,

  // 图片优化配置（静态导出时需要禁用）
  images: isExport ? {
    unoptimized: true,
  } : undefined,

  // 配置输出目录
  distDir: isExport ? 'out' : '.next',

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  }
};

export default nextConfig;
