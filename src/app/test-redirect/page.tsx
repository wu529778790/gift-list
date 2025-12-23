'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestRedirect() {
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    addLog('页面加载');

    const interval = setInterval(() => {
      addLog('检查中...');
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const checkStorage = () => {
    const events = JSON.parse(localStorage.getItem('giftlist_events') || '[]');
    const session = sessionStorage.getItem('currentEvent');
    const redirect = sessionStorage.getItem('has_redirected');

    addLog(`Events: ${events.length}`);
    addLog(`Session: ${session ? '存在' : '不存在'}`);
    addLog(`Redirect标记: ${redirect || '无'}`);
  };

  const clearAll = () => {
    localStorage.clear();
    sessionStorage.clear();
    addLog('已清除所有存储');
  };

  const goHome = () => {
    addLog('跳转到首页...');
    router.push('/');
  };

  const goMain = () => {
    addLog('跳转到主界面...');
    router.push('/main');
  };

  // 安全地获取存储状态（避免 SSR 问题）
  const getStorageState = () => {
    if (typeof window === 'undefined') {
      return { events: 0, session: false, redirect: '无' };
    }
    return {
      events: JSON.parse(localStorage.getItem('giftlist_events') || '[]').length,
      session: !!sessionStorage.getItem('currentEvent'),
      redirect: sessionStorage.getItem('has_redirected') || '无',
    };
  };

  const storageState = getStorageState();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 fade-in">
        <h1 className="text-2xl font-bold mb-6 themed-header">路由跳转测试工具</h1>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={checkStorage} className="themed-button-primary p-3 rounded-lg font-bold">
            检查存储状态
          </button>
          <button onClick={clearAll} className="themed-button-secondary border p-3 rounded-lg">
            清除所有数据
          </button>
          <button onClick={goHome} className="themed-button-primary p-3 rounded-lg font-bold">
            跳转首页
          </button>
          <button onClick={goMain} className="themed-button-secondary border p-3 rounded-lg">
            跳转主界面
          </button>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-auto themed-border border">
          <div className="font-bold mb-2 themed-header">运行日志：</div>
          {logs.length === 0 ? (
            <div className="text-gray-400 text-center py-4">暂无日志，请点击上方按钮测试</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="border-b border-gray-300 py-1 font-mono text-sm">
                {log}
              </div>
            ))
          )}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg themed-border border">
          <h3 className="font-bold mb-2">使用说明：</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>点击"清除所有数据"重置状态</li>
            <li>点击"跳转首页"测试跳转逻辑</li>
            <li>观察日志和实际跳转行为</li>
            <li>手动访问 /test-redirect 也应正常</li>
            <li>检查 sessionStorage 和 localStorage 状态</li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg themed-border border">
          <h3 className="font-bold mb-2 text-blue-800">当前状态：</h3>
          <div className="text-sm font-mono space-y-1">
            <div>Events: {storageState.events}</div>
            <div>Session: {storageState.session ? '存在' : '不存在'}</div>
            <div>Redirect标记: {storageState.redirect}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
