import { Event } from '@/types';
import { BackupService } from '@/lib/backup';
import EventSelector from '@/components/business/EventSelector';
import Button from '@/components/ui/Button';

interface EventSelectionProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
  onCreateNew: () => void;
  onImport: () => void;
}

export default function EventSelection({
  events,
  onSelectEvent,
  onCreateNew,
  onImport,
}: EventSelectionProps) {
  return (
    <>
      {/* 备份提醒 */}
      {BackupService.hasData() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600">⚠️</span>
            <div>
              <p className="font-semibold text-yellow-800 text-sm">重要提醒</p>
              <p className="text-xs text-yellow-700 mt-1">
                所有数据存储在浏览器中。请定期导出备份，防止数据丢失！
              </p>
            </div>
          </div>
        </div>
      )}

      <EventSelector
        events={events}
        onSelect={onSelectEvent}
        onCreateNew={onCreateNew}
        title="选择活动"
        subtitle="请选择要管理的活动"
      />

      <div className="pt-4 border-t themed-border space-y-2">
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1 text-sm p-2 rounded"
            onClick={onCreateNew}
          >
            ✨ 创建新事件
          </Button>
          <Button
            variant="secondary"
            className="flex-1 text-sm p-2 rounded"
            onClick={onImport}
          >
            📥 导入数据
          </Button>
        </div>
        <Button
          variant="danger"
          className="w-full text-sm p-2 rounded"
          onClick={() => {
            if (confirm("确定要删除所有事件吗？礼金记录会保留但无法访问。")) {
              localStorage.removeItem('giftlist_events');
              window.location.reload();
            }
          }}
        >
          🗑️ 清除事件
        </Button>
      </div>
    </>
  );
}
