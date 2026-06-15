import { useState } from 'react';
import { useBatchStore } from '../../store/useBatchStore';
import BatchTable from '../../components/BatchTable';
import StatusBadge from '../../components/StatusBadge';
import { Plus, Droplets, Clock, Thermometer, Beaker, Check, X } from 'lucide-react';
import type { Batch, SoakingRecord } from '../../types';

export default function SoakingPage() {
  const { batches, getBatchesByStatus, addBatch, updateBatch } = useBatchStore();
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const now = new Date();
  const batchNo = `HJ${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(batches.length + 1).padStart(3, '0')}`;
  
  const [createForm, setCreateForm] = useState({
    batchNo,
    riceType: '糯米',
    riceWeight: 500,
    waterTemp: 25,
    acidity: 3.8,
    soakHours: 48,
    notes: '',
  });

  const soakingBatches = getBatchesByStatus('soaking');
  const allRelatedBatches = batches.filter(b => 
    ['soaking', 'steaming'].includes(b.status) || b.soaking
  );

  const todayCount = batches.filter(b => {
    const today = new Date().toISOString().slice(0, 10);
    return b.createdAt === today;
  }).length;

  const stats = [
    { label: '正在浸泡', value: soakingBatches.length, icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: '今日新增', value: todayCount || 2, icon: Plus, color: 'text-green-600', bg: 'bg-green-100' },
    { label: '平均浸泡时间', value: '48', unit: '小时', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: '酸度达标率', value: '95', unit: '%', icon: Beaker, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const handleView = (batch: Batch) => {
    setSelectedBatch(batch);
    setShowModal(true);
  };

  const handleCreateBatch = () => {
    const now = new Date();
    const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const soakingRecord: SoakingRecord = {
      id: Math.random().toString(36).substr(2, 9),
      startTime: nowStr,
      waterTemp: createForm.waterTemp,
      acidity: createForm.acidity,
      soakHours: createForm.soakHours,
      status: 'soaking',
      notes: createForm.notes,
    };

    const newBatch: Batch = {
      id: Math.random().toString(36).substr(2, 9),
      batchNo: createForm.batchNo,
      riceType: createForm.riceType,
      riceWeight: createForm.riceWeight,
      status: 'soaking',
      currentStage: '糯米浸泡',
      createdAt: dateStr,
      soaking: soakingRecord,
    };

    addBatch(newBatch);
    setShowCreateModal(false);
    setCreateForm({
      ...createForm,
      batchNo: `HJ${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(batches.length + 2).padStart(3, '0')}`,
      notes: '',
    });
  };

  const handleAdvanceToSteaming = () => {
    if (!selectedBatch) return;
    updateBatch(selectedBatch.id, {
      status: 'steaming',
      currentStage: '蒸饭落缸',
      soaking: {
        ...selectedBatch.soaking!,
        status: 'completed',
      },
    });
    setShowModal(false);
  };

  const handleRefreshBatchNo = () => {
    const now = new Date();
    const newNo = `HJ${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(batches.length + 1).padStart(3, '0')}`;
    setCreateForm({ ...createForm, batchNo: newNo });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
            <Droplets className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-amber-900">糯米浸泡</h2>
            <p className="text-amber-500 text-sm">糯米浸渍酸浆管理</p>
          </div>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          新建浸泡批次
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-5 shadow-amber border border-amber-100">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-amber-500">{stat.label}</p>
                  <p className="text-2xl font-bold font-serif text-amber-900">
                    {stat.value}
                    {stat.unit && <span className="text-sm font-normal text-amber-500 ml-1">{stat.unit}</span>}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {soakingBatches.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-200">
          <h3 className="font-serif font-bold text-amber-900 mb-4 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            正在浸泡中的批次 ({soakingBatches.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {soakingBatches.map((batch) => (
              <div key={batch.id} className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-mono font-medium text-amber-900">{batch.batchNo}</p>
                    <p className="text-xs text-amber-500">{batch.riceType} · {batch.riceWeight}kg</p>
                  </div>
                  <StatusBadge status={batch.status} size="sm" />
                </div>
                <div className="space-y-2 mb-3 text-xs">
                  {batch.soaking && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-amber-500">水温</span>
                        <span className="text-amber-800">{batch.soaking.waterTemp}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-500">酸度</span>
                        <span className="text-amber-800">pH {batch.soaking.acidity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-500">开始时间</span>
                        <span className="text-amber-800">{batch.soaking.startTime.slice(11)}</span>
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => handleView(batch)}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg text-sm font-medium hover:from-amber-600 hover:to-amber-700 transition-all flex items-center justify-center gap-1"
                >
                  查看详情
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-bold text-amber-900">批次列表</h3>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 text-sm bg-amber-100 text-amber-700 rounded-lg">共 {allRelatedBatches.length} 批</span>
              </div>
            </div>
          </div>
          
          <BatchTable 
            batches={allRelatedBatches} 
            onView={handleView}
            onEdit={handleView}
          />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
            <h3 className="text-lg font-serif font-bold text-amber-900 mb-4">浸泡工艺标准</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-amber-50">
                <span className="text-amber-600">浸泡水温</span>
                <span className="font-medium text-amber-900">24-26°C</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-amber-50">
                <span className="text-amber-600">浸泡时间</span>
                <span className="font-medium text-amber-900">44-48小时</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-amber-50">
                <span className="text-amber-600">酸浆酸度</span>
                <span className="font-medium text-amber-900">pH 3.5-4.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-600">米水比例</span>
                <span className="font-medium text-amber-900">1:1.5</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-serif font-bold mb-3">温馨提示</h3>
            <p className="text-amber-100 text-sm leading-relaxed">
              浸泡时间需根据气温适当调整。夏季气温高时可适当缩短浸泡时间，冬季则需延长。
              浸泡好的糯米应达到：米粒松软、手指能碾碎、无白芯。
            </p>
          </div>
        </div>
      </div>

      {showModal && selectedBatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-6 border-b border-amber-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-amber-900">{selectedBatch.batchNo}</h3>
                    <p className="text-sm text-amber-500">浸泡详情</p>
                  </div>
                </div>
                <StatusBadge status={selectedBatch.status} />
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-sm text-amber-500 mb-1">米种</p>
                  <p className="font-medium text-amber-900">{selectedBatch.riceType}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-sm text-amber-500 mb-1">重量</p>
                  <p className="font-medium text-amber-900">{selectedBatch.riceWeight} kg</p>
                </div>
              </div>

              {selectedBatch.soaking ? (
                <div className="space-y-4">
                  <h4 className="font-medium text-amber-800">浸泡记录</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-blue-600">开始时间</span>
                      </div>
                      <p className="font-medium text-blue-900">{selectedBatch.soaking.startTime}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Thermometer className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">水温</span>
                      </div>
                      <p className="font-medium text-green-900">{selectedBatch.soaking.waterTemp} °C</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Beaker className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-purple-600">酸度</span>
                      </div>
                      <p className="font-medium text-purple-900">pH {selectedBatch.soaking.acidity}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-amber-600">计划浸泡</span>
                      </div>
                      <p className="font-medium text-amber-900">{selectedBatch.soaking.soakHours} 小时</p>
                    </div>
                  </div>
                  
                  {selectedBatch.soaking.notes && (
                    <div className="bg-amber-50 rounded-xl p-4">
                      <p className="text-sm text-amber-600 mb-1">备注</p>
                      <p className="text-amber-800">{selectedBatch.soaking.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-blue-50 rounded-xl">
                  <Droplets className="w-12 h-12 mx-auto text-blue-400 mb-3" />
                  <p className="text-amber-600">该批次无浸泡记录</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-amber-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                关闭
              </button>
              {selectedBatch.status === 'soaking' && (
                <button 
                  onClick={handleAdvanceToSteaming}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  进入下一道工序
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg animate-slide-up">
            <div className="p-6 border-b border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-amber-900">新建浸泡批次</h3>
                  <p className="text-sm text-amber-500">录入糯米浸泡信息</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-amber-700 mb-2">批次号</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={createForm.batchNo}
                    onChange={(e) => setCreateForm({ ...createForm, batchNo: e.target.value })}
                    className="flex-1 px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent font-mono"
                  />
                  <button
                    onClick={handleRefreshBatchNo}
                    className="px-3 py-2.5 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-colors"
                    title="刷新"
                  >
                    <Clock className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-amber-700 mb-2">米种</label>
                  <select
                    value={createForm.riceType}
                    onChange={(e) => setCreateForm({ ...createForm, riceType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                  >
                    <option value="糯米">糯米</option>
                    <option value="籼米">籼米</option>
                    <option value="粳米">粳米</option>
                    <option value="黑米">黑米</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-amber-700 mb-2">重量 (kg)</label>
                  <input
                    type="number"
                    value={createForm.riceWeight}
                    onChange={(e) => setCreateForm({ ...createForm, riceWeight: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-amber-700 mb-2">水温 (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={createForm.waterTemp}
                    onChange={(e) => setCreateForm({ ...createForm, waterTemp: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-amber-700 mb-2">酸度 (pH)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={createForm.acidity}
                    onChange={(e) => setCreateForm({ ...createForm, acidity: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-amber-700 mb-2">计划浸泡时间 (小时)</label>
                  <input
                    type="number"
                    value={createForm.soakHours}
                    onChange={(e) => setCreateForm({ ...createForm, soakHours: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-amber-700 mb-2">备注</label>
                <textarea
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  rows={3}
                  placeholder="记录浸泡过程中的注意事项..."
                  className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-amber-100 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-5 py-2.5 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                取消
              </button>
              <button
                onClick={handleCreateBatch}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                开始浸泡
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
