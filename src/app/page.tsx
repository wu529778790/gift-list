import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { CryptoService } from '@/lib/crypto';
import { BackupService } from '@/lib/backup';
import PageLayout from '@/components/layout/PageLayout';
import FormLayout from '@/components/layout/FormLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import EventSelector from '@/components/business/EventSelector';
import { formatDate, formatDateTime } from '@/utils/format';

export default function Home() {
  const navigate = useNavigate();
  const { state, actions } = useAppStore();
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [showSessionChoice, setShowSessionChoice] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [currentSessionEvent, setCurrentSessionEvent] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 初始化时检查会话状态
  useEffect(() => {
    // 等待事件加载完成
    if (state.loading.events) {
      return; // 如果事件还在加载，不执行后续逻辑
    }

    // 检查当前会话
    const session = sessionStorage.getItem('currentEvent');
    if (session) {
      try {
        const { event: currentEvent } = JSON.parse(session);
        setShowSessionChoice(true);
        setCurrentSessionEvent(currentEvent);
        return;
      } catch (e) {
        console.error('Failed to parse session:', e);
      }
    }

    // 没有会话但有事件 → 显示事件管理界面，并默认选中第一个事件
    if (state.events.length > 0) {
      setShowPasswordInput(true);
      setSelectedEvent(state.events[0]); // 默认选中第一个事件
    } else {
      navigate('/setup', { replace: true });
    }
  }, [state.events, state.loading.events, navigate]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !password) return;

    setLoading(true);
    setError('');

    try {
      // 验证密码
      const hash = CryptoService.hash(password);
      if (hash !== selectedEvent.passwordHash) {
        setError('密码错误！');
        setLoading(false);
        return;
      }

      // 保存会话
      actions.saveSession(selectedEvent, password);

      // 进入主界面
      navigate('/main', { replace: true });
    } catch (err) {
      console.error(err);
      setError('登录失败: ' + err);
    } finally {
      setLoading(false);
    }
  };

  // 处理继续使用当前会话
  const handleContinueSession = () => {
    navigate('/main');
  };

  // 处理切换到其他事件
  const handleSwitchFromSession = () => {
    actions.clearSession();
    setShowSessionChoice(false);
    if (state.events.length > 0) {
      setSelectedEvent(state.events[0]);
      setShowPasswordInput(true);
    }
  };

  // 处理切换到特定事件
  const handleSwitchToSpecificEvent = (targetEvent: any) => {
    setSelectedEvent(targetEvent);
    setShowPasswordInput(true);
    setShowSessionChoice(false);
  };

  // 处理创建新事件
  const handleCreateNewEvent = () => {
    navigate('/setup');
  };

  // 会话选择界面
  if (showSessionChoice) {
    return (
      <PageLayout title="电子礼簿系统" subtitle="检测到当前会话">
        <FormLayout>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="font-bold text-blue-900 mb-1 text-sm">
              当前事件：
            </div>
            <div className="text-sm text-blue-800 font-semibold">
              {currentSessionEvent?.name}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {currentSessionEvent &&
                `${formatDate(
                  currentSessionEvent.startDateTime
                )} ~ ${formatDate(currentSessionEvent.endDateTime)}`}
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="primary"
              className="w-full p-3 rounded-lg font-bold"
              onClick={handleContinueSession}
            >
              继续使用当前事件
            </Button>

            <Button
              variant="secondary"
              className="w-full p-3 rounded-lg font-bold"
              onClick={handleSwitchFromSession}
            >
              切换到其他事件（需重新输入密码）
            </Button>

            {state.events.length > 1 && (
              <div className="pt-3 border-t themed-border">
                <p className="text-sm text-gray-600 mb-2">
                  快速切换（需重新输入密码）：
                </p>
                <div className="space-y-2">
                  {state.events.map(
                    (ev: any) =>
                      ev.id !== currentSessionEvent?.id && (
                        <Button
                          key={ev.id}
                          variant="secondary"
                          className="w-full text-left px-3 py-2 text-sm !bg-gray-100 !text-gray-800 !border-transparent hover:!bg-gray-200"
                          onClick={() => handleSwitchToSpecificEvent(ev)}
                        >
                          {ev.name}
                        </Button>
                      )
                  )}
                </div>
              </div>
            )}

            <div className="pt-3 border-t themed-border space-y-2">
              <Button
                variant="secondary"
                className="w-full p-2 rounded text-sm"
                onClick={handleCreateNewEvent}
              >
                ✨ 创建新事件
              </Button>
              <Button
                variant="danger"
                className="w-full p-2 rounded text-sm"
                onClick={() => {
                  actions.clearSession();
                  navigate('/', { replace: true });
                }}
              >
                🔄 返回首页重新选择
              </Button>
            </div>
          </div>
        </FormLayout>
      </PageLayout>
    );
  }

  // 密码输入界面
  if (showPasswordInput) {
    return (
      <PageLayout
        title="电子礼簿系统"
        subtitle={selectedEvent ? "请输入密码继续" : "请选择事件并输入密码"}
      >
        <FormLayout>
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
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => navigate('/main')}
                    >
                      立即备份
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 事件列表（当没有默认选择时） */}
          {!selectedEvent && state.events.length > 0 && (
            <EventSelector
              events={state.events}
              onSelect={(event) => {
                setSelectedEvent(event);
                setError('');
              }}
              onCreateNew={handleCreateNewEvent}
              title="选择活动"
              subtitle="请选择要管理的活动"
            />
          )}

          {/* 选中事件后的信息 */}
          {selectedEvent && (
            <div className="mb-4 p-3 themed-ring rounded-lg text-sm">
              <div className="font-bold text-gray-700">
                {selectedEvent.name}
              </div>
              <div className="text-gray-600 mt-1">
                {`${formatDateTime(
                  selectedEvent.startDateTime
                )} ~ ${formatDateTime(selectedEvent.endDateTime)}`}
              </div>
              <Button
                variant="secondary"
                className="mt-2 text-xs !p-1 !h-auto"
                onClick={() => {
                  setSelectedEvent(null);
                  setError('');
                }}
              >
                ← 重新选择事件
              </Button>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Input
                label="管理密码"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder={selectedEvent ? "默认可能是 123456" : "请输入密码"}
                error={error}
                autoFocus
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full p-3 rounded-lg font-bold"
              disabled={loading}
            >
              {loading ? "登录中..." : "登录"}
            </Button>

            <div className="pt-4 border-t themed-border space-y-2">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1 text-sm p-2 rounded"
                  onClick={handleCreateNewEvent}
                >
                  ✨ 创建新事件
                </Button>
                <Button
                  variant="danger"
                  className="flex-1 text-sm p-2 rounded"
                  onClick={() => {
                    if (
                      confirm(
                        "确定要删除所有事件吗？礼金记录会保留但无法访问。"
                      )
                    ) {
                      localStorage.removeItem('giftlist_events');
                      // 重新加载页面以更新事件列表
                      window.location.reload();
                    }
                  }}
                >
                  🗑️ 清除事件
                </Button>
              </div>
            </div>
          </form>
        </FormLayout>
      </PageLayout>
    );
  }

  // 加载状态
  return (
    <PageLayout title="电子礼簿系统" subtitle="正在初始化...">
      <div className="text-center fade-in-slow">
        <div className="mt-8 text-sm text-gray-500">
          <p>正在检查存储状态...</p>
        </div>
      </div>
    </PageLayout>
  );
}