# 🚀 快速部署指南

## 📦 获取应用

### 方式1: 下载 Release（推荐）
```bash
# 1. 访问 GitHub Releases 页面
# 2. 下载 index.html
# 3. 双击即可使用！
```

### 方式2: 自行构建
```bash
# 1. 克隆仓库
git clone https://github.com/wu529778790/libu.shenzjd.com.git
cd libu.shenzjd.com

# 2. 安装依赖
pnpm install

# 3. 构建
pnpm build

# 4. 打开 dist/index.html
```

## 🎯 使用方式

### 直接打开（✨ 推荐）
- 双击 `index.html`
- 或在浏览器按 `Ctrl+O` 选择文件
- **无需任何服务器！**

### 本地服务器
```bash
npx serve .
# 访问 http://localhost:3000
```

### 部署到服务器
上传 `index.html` 到 Web 服务器即可。

### 部署到 GitHub Pages
```bash
# 将 index.html 推送到 gh-pages 分支
git init && git add index.html && git commit -m "Deploy"
git remote add origin <your-repo>
git push -f origin main:gh-pages
```

## 🔑 默认信息

- **密码**: `123456`
- **测试数据**: 访问 `index.html#/test-data` 生成
- **数据存储**: 浏览器 localStorage

## 📝 页面导航

- 首页: `index.html#/`
- 创建事件: `index.html#/setup`
- 主界面: `index.html#/main`
- 副屏: `index.html#/guest-screen`

## ⚠️ 注意事项

1. **数据安全**: 所有数据在本地加密存储，忘记密码无法找回
2. **浏览器兼容**: 支持现代浏览器（Chrome, Firefox, Edge, Safari）
3. **隐私**: 数据仅存储在本地浏览器，不会上传到服务器

## 🆘 常见问题

**Q: 双击打开后显示空白？**
A: 确保使用现代浏览器，或尝试用浏览器打开（Ctrl+O）

**Q: 如何打开副屏？**
A: 在主界面点击"开启副屏"按钮，或手动访问 `index.html#/guest-screen`

**Q: 数据会丢失吗？**
A: 清除浏览器数据会丢失，建议定期导出备份

**Q: 支持多设备同步吗？**
A: 可以手动导出 localStorage 数据，在另一设备导入

## 💡 小贴士

- ✨ 首次使用建议生成测试数据体验
- 🔒 请牢记设置的密码
- 📄 使用打印功能导出 PDF
- 🖥️ 开启副屏实时展示给来宾查看
