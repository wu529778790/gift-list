import { useState, useEffect } from 'react';
import { GiftData, GiftType, GiftWithRecord } from '@/types';
import { amountToChinese } from '@/utils/format';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';

interface GiftDetailModalProps {
  isOpen: boolean;
  gift: GiftWithRecord | null;
  onClose: () => void;
  onEdit: (giftId: string, updatedData: GiftData) => Promise<boolean>;
  onDelete: (giftId: string) => Promise<boolean>;
}

export default function GiftDetailModal({
  isOpen,
  gift,
  onClose,
  onEdit,
  onDelete,
}: GiftDetailModalProps) {
  const { error: showErrorToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    amount: '',
    type: '现金' as GiftType,
    remark: '',
  });
  const [chineseAmount, setChineseAmount] = useState('');

  useEffect(() => {
    if (gift && gift.data && !isEditing) {
      setEditFormData({
        name: gift.data.name,
        amount: gift.data.amount.toString(),
        type: gift.data.type,
        remark: gift.data.remark || '',
      });
      setChineseAmount(amountToChinese(gift.data.amount));
    }
  }, [gift, isEditing]);

  if (!isOpen || !gift || !gift.data) return null;
  const giftData = gift.data;

  const handleAmountChange = (value: string) => {
    setEditFormData({ ...editFormData, amount: value });
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setChineseAmount(amountToChinese(num));
    } else {
      setChineseAmount('');
    }
  };

  const handleSave = async () => {
    const amount = parseFloat(editFormData.amount);
    if (!editFormData.name.trim() || isNaN(amount) || amount <= 0) {
      showErrorToast('请填写正确的姓名和金额');
      return;
    }

    const updatedData = {
      ...giftData,
      name: editFormData.name.trim(),
      amount: amount,
      type: editFormData.type,
      remark: editFormData.remark.trim() || undefined,
    };

    const success = await onEdit(gift.record.id, updatedData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`确定要删除 ${giftData.name} 的记录吗？金额：¥${giftData.amount}`)) {
      const success = await onDelete(gift.record.id);
      if (success) {
        onClose();
      }
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      setIsEditing(false);
      setEditFormData({
        name: giftData.name,
        amount: giftData.amount.toString(),
        type: giftData.type,
        remark: giftData.remark || '',
      });
      setChineseAmount(amountToChinese(giftData.amount));
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 border-b pb-2">
          <h3 className="text-xl font-bold themed-header">
            {isEditing ? '编辑礼金记录' : '礼金详情'}
          </h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {isEditing ? (
            // 编辑模式
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  姓名
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="w-full p-2 border themed-ring rounded"
                  placeholder="来宾姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  金额
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editFormData.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full p-2 border themed-ring rounded"
                  placeholder="金额 (元)"
                />
                {chineseAmount && (
                  <div className="text-sm text-gray-600 mt-1 text-right themed-text">
                    {chineseAmount}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  收款类型
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['现金', '微信', '支付宝', '其他'] as GiftType[]).map(
                    (type) => (
                      <label
                        key={type}
                        className={`flex items-center justify-center p-2 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                          editFormData.type === type
                            ? 'bg-[var(--select-bg)] border-[var(--select-border)] text-[var(--select-text)] font-semibold shadow-sm'
                            : 'bg-white border-[var(--primary-border-color)] text-[var(--primary-text-color)] hover:border-[var(--select-hover-border)] hover:bg-[var(--select-hover-bg)]'
                        }`}
                        onClick={() =>
                          setEditFormData({ ...editFormData, type })
                        }
                      >
                        <input
                          type="radio"
                          name="editType"
                          value={type}
                          checked={editFormData.type === type}
                          onChange={() => {}}
                          className="sr-only"
                        />
                        <span>{type}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  备注
                </label>
                <input
                  type="text"
                  value={editFormData.remark}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, remark: e.target.value })
                  }
                  className="w-full p-2 border themed-ring rounded"
                  placeholder="备注内容（选填）"
                />
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={handleCancel}
                >
                  取消
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleSave}
                >
                  保存
                </Button>
              </div>
            </div>
          ) : (
            // 详情模式
            <div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="font-semibold text-gray-600">姓名：</div>
                <div className="font-bold text-lg">
                  {gift.data.name}
                </div>

                <div className="font-semibold text-gray-600">金额：</div>
                <div className="font-bold text-lg text-red-600">
                  ¥{gift.data.amount.toFixed(2)}
                </div>

                <div className="font-semibold text-gray-600">大写：</div>
                <div className="font-bold text-lg font-kaiti">
                  {amountToChinese(gift.data.amount)}
                </div>

                <div className="font-semibold text-gray-600">类型：</div>
                <div className="font-bold">{gift.data.type}</div>

                <div className="font-semibold text-gray-600">时间：</div>
                <div className="text-gray-700">
                  {(() => {
                    const date = new Date(gift.data.timestamp);
                    const pad = (num: number) =>
                      num.toString().padStart(2, '0');
                    return `${date.getFullYear()}-${pad(
                      date.getMonth() + 1
                    )}-${pad(date.getDate())} ${pad(
                      date.getHours()
                    )}:${pad(date.getMinutes())}`;
                  })()}
                </div>

                {gift.data.remark && (
                  <>
                    <div className="font-semibold text-gray-600">
                      备注：
                    </div>
                    <div className="col-span-2 text-gray-700 bg-gray-50 p-2 rounded">
                      {gift.data.remark}
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => setIsEditing(true)}
                >
                  ✏️ 修改
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={handleDelete}
                >
                  🗑️ 删除
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
