import { useState } from 'react';
import { BackupService, ImportResult } from '@/lib/backup';
import Button from '@/components/ui/Button';

interface ImportBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (result: ImportResult) => void;
}

export default function ImportBackupModal({ isOpen, onClose, onImportSuccess }: ImportBackupModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json') {
        setError('请选择 JSON 格式的备份文件');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('请先选择备份文件');
      return;
    }

    setImporting(true);
    setError(null);

    try {
      const result = await BackupService.import(selectedFile);
      setResult(result);
      onImportSuccess(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    setResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        {/* 标题 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">📂 导入备份</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* 文件选择区域 */}
        {!result && (
          <div className="space-y-4">
            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              selectedFile ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}>
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
                id="backup-file-input"
              />
              <label
                htmlFor="backup-file-input"
                className="cursor-pointer block"
              >
                {selectedFile ? (
                  <div className="space-y-2">
                    <div className="text-2xl">📄</div>
                    <div className="font-semibold text-gray-800">{selectedFile.name}</div>
                    <div className="text-sm text-gray-500">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </div>
                    <div className="text-xs text-blue-600 mt-2">点击重新选择</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-2xl">📁</div>
                    <div className="font-semibold text-gray-700">点击选择文件</div>
                    <div className="text-sm text-gray-500">或拖拽文件到此处</div>
                    <div className="text-xs text-gray-400 mt-2">支持 .json 格式</div>
                  </div>
                )}
              </label>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                ❌ {error}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleClose}
              >
                取消
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleImport}
                disabled={!selectedFile || importing}
                loading={importing}
              >
                {importing ? '导入中...' : '开始导入'}
              </Button>
            </div>
          </div>
        )}

        {/* 导入结果 */}
        {result && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">✅</span>
                <h4 className="font-bold text-green-800">导入成功！</h4>
              </div>

              <div className="space-y-2 text-sm text-green-700">
                <div className="flex justify-between">
                  <span>新增事件：</span>
                  <span className="font-bold">{result.events} 个</span>
                </div>
                <div className="flex justify-between">
                  <span>新增礼金记录：</span>
                  <span className="font-bold">{result.gifts} 条</span>
                </div>
                {result.conflicts > 0 && (
                  <div className="flex justify-between">
                    <span>跳过重复：</span>
                    <span className="font-bold">{result.conflicts} 条</span>
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={handleClose}
            >
              完成
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
