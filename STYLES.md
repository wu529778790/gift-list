# 🎨 样式优化说明

## 已完成的样式改进

### 1. 全局样式 (`src/app/globals.css`)

#### 新增主题系统
- **喜庆红主题 (theme-festive)**: 红色系配色，适合喜事
  - 主色: `#c00` (深红)
  - 背景: `#fff2f2` (浅红)
  - 按钮: `#dc2626` (亮红)

- **肃穆灰主题 (theme-solemn)**: 灰色系配色，适合白事
  - 主色: `#374151` (深灰)
  - 背景: `#f3f4f6` (浅灰)
  - 按钮: `#4b5563` (中灰)

#### 新增组件样式
- `.themed-button-primary`: 主要按钮，带悬停动画
- `.themed-button-secondary`: 次要按钮，边框样式
- `.themed-ring`: 输入框焦点环颜色
- `.themed-header`: 标题颜色
- `.themed-text`: 重要文本颜色
- `.themed-border`: 边框颜色
- `.themed-bg-light`: 浅色背景

#### 礼簿框架样式
- `.gift-book-frame`: 礼簿外框（4px边框 + 红色/灰色主题）
- `.gift-book-grid`: 3行7列网格布局
- `.gift-book-row`: 单行网格
- `.book-cell`: 单个单元格（竖排文字）
- `.name-cell`: 姓名单元格（楷体，25px）
- `.type-cell`: 类型单元格（红色/灰色，22px）
- `.amount-cell`: 金额单元格（中文大写 + 数字）

#### 动画
- `.fade-in`: 淡入动画（0.3s）

---

### 2. 页面样式更新

#### 首页 (`src/app/page.tsx`)
- 简洁居中布局
- 使用 `themed-header` 样式
- 添加淡入动画

#### 创建页面 (`src/app/setup/page.tsx`)
- 卡片式布局，居中显示
- 折叠式"更多设置"区域
- 统一的 `themed-ring` 输入框样式
- 主要按钮使用 `themed-button-primary`

#### 主界面 (`src/app/main/page.tsx`)
- **左侧**: 录入表单
  - 表单输入使用 `themed-ring`
  - 按钮使用主题样式
  - 统计信息使用 `themed-text`

- **右侧**: 礼簿展示
  - 使用 `gift-book-frame` 框架
  - 3行 × 12列 网格布局
  - 单元格竖排文字（模拟传统礼簿）
  - 姓名：楷体，竖排，居中
  - 类型：红色/灰色，竖排
  - 金额：中文大写 + 小写数字
  - 支持分页导航

- **主题切换**: 根据事件主题自动应用 `theme-festive` 或 `theme-solemn`

#### 副屏 (`src/app/guest-screen/page.tsx`)
- 全屏展示设计
- 使用 `gift-book-frame` 框架
- 最新记录高亮（黄色背景 + 脉冲动画）
- 支持全屏按钮
- 实时同步显示

#### 测试页面 (`src/app/test-redirect/page.tsx`)
- 卡片式布局
- 网格按钮排列
- 实时状态显示
- 日志区域

---

### 3. 与 copy 文件夹的对比

#### 相似之处
✅ 主题系统（红/灰配色）
✅ 礼簿框架（4px边框 + 浅色背景）
✅ 竖排文字布局
✅ 单元格网格（12列）
✅ 按钮样式（主按钮 + 次要按钮）
✅ 输入框焦点环
✅ 喜事/白事主题切换

#### 改进之处
✨ 更现代的 Tailwind CSS 实现
✨ 响应式设计（移动端适配）
✨ 平滑的过渡动画
✨ 更好的打印支持
✨ 统一的 CSS 变量系统

---

### 4. 使用方法

#### 应用主题
```tsx
// 在容器元素上添加主题类
<div className="theme-festive">
  {/* 所有子元素将使用红色主题 */}
</div>

<div className="theme-solemn">
  {/* 所有子元素将使用灰色主题 */}
</div>
```

#### 使用主题组件
```tsx
// 按钮
<button className="themed-button-primary">主要操作</button>
<button className="themed-button-secondary border">次要操作</button>

// 输入框
<input className="themed-ring" />

// 文本
<span className="themed-text">重要金额</span>
<span className="themed-header">标题</span>
```

#### 礼簿展示
```tsx
<div className="gift-book-frame">
  <div className="gift-book-grid">
    <div className="gift-book-row">
      <div className="book-cell name-cell">
        <div className="name">张三</div>
      </div>
      <div className="book-cell type-cell">现金</div>
      <div className="book-cell amount-cell">
        <div className="amount-chinese">壹仟元整</div>
        <div className="amount-number">¥1000</div>
      </div>
    </div>
  </div>
</div>
```

---

### 5. 响应式调整

#### 桌面端 (≥1024px)
- 3列布局：左侧表单，右侧礼簿
- 礼簿完整显示

#### 平板端 (768px-1023px)
- 垂直堆叠布局
- 礼簿字体适当缩小

#### 移动端 (<768px)
- 单列布局
- 礼簿框架内边距减小
- 字体进一步缩小
- 按钮垂直排列

---

### 6. 打印样式

```css
@media print {
  body * { visibility: hidden; }
  .print-area, .print-area * { visibility: visible; }
  .print-area { position: absolute; left: 0; top: 0; width: 100%; }
  .no-print { display: none !important; }
}
```

---

## 下一步建议

如果需要进一步优化，可以考虑：

1. **添加封面设计**：类似 copy 文件夹的封面样式
2. **语音播报**：集成 Web Speech API
3. **更多备注字段**：礼品、关系、电话、住址等
4. **数据统计图表**：使用 Chart.js 展示统计
5. **主题自定义**：允许用户自定义颜色
6. **字体文件**：添加 Source Han Serif CN Heavy 字体

---

## 快速测试

```bash
# 启动开发服务器
npm run dev

# 访问以下页面测试样式
http://localhost:3000           # 首页
http://localhost:3000/setup     # 创建页面
http://localhost:3000/main      # 主界面（需要先创建事项）
http://localhost:3000/guest-screen  # 副屏
http://localhost:3000/test-redirect  # 测试工具
```

---

**样式优化已完成！现在界面更接近 copy 文件夹的视觉效果了。** 🎨
