import { useState } from 'react';
import { useBatchStore } from '../../store/useBatchStore';
import BatchTable from '../../components/BatchTable';
import StatusBadge from '../../components/StatusBadge';
import { Plus, Droplets, Clock, Thermometer, Beaker } from 'lucide-react';
import type { Batch } from '../../types';

export default function SoakingPage() {
  const { batches, getBatchesByStatus } = useBatchStore();
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showModal, setShowModal] = useState(false);

  const soakingBatches = getBatchesByStatus('soaking');
  const allRelatedBatches = batches.filter(b => 
    ['soaking', 'steaming'].includes(b.status) || b.soaking
  );

  const stats = [
    { label: '正在浸泡', value: soakingBatches.length, icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: '今日新增', value: 2, icon: Plus, color: 'text-green-600', bg: 'bg-green-100' },
    { label: '平均浸泡时间', value: '48', unit: '小时', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: '酸度达标率', value: '95', unit: '%', icon: Beaker, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const handleView = (batch: Batch) => {
    setSelectedBatch(batch);
    setShowModal(true);
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
        <button className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-200 flex items-center gap-2">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-bold text-amber-900">浸泡中的批次</h3>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-sm bg-amber-100 text-amber-700 rounded-lg">全部</button>
                <button className="px-3 py-1.5 text-sm text-amber-500 hover:bg-amber-50 rounded-lg">浸泡中</button>
                <button className="px-3 py-1.5 text-sm text-amber-500 hover:bg-amber-50 rounded-lg">已完成</button>
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

              {selectedBatch.soaking && (
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
              )}
            </div>

            <div className="p-6 border-t border-amber-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
              >
                关闭
              </button>
              <button className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all">
                进入下一道工序
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
