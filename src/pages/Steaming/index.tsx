import { useState } from 'react';
import { useBatchStore } from '../../store/useBatchStore';
import BatchTable from '../../components/BatchTable';
import StatusBadge from '../../components/StatusBadge';
import { Plus, Flame, Snowflake, Leaf, Jar } from 'lucide-react';
import type { Batch } from '../../types';

export default function SteamingPage() {
  const { batches, getBatchesByStatus } = useBatchStore();
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showModal, setShowModal] = useState(false);

  const steamingBatches = getBatchesByStatus('steaming');
  const allRelatedBatches = batches.filter(b => 
    ['steaming', 'fermenting'].includes(b.status) || b.steaming
  );

  const stats = [
    { label: '蒸饭中', value: steamingBatches.length, icon: Flame, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: '今日蒸饭', value: 3, icon: Plus, color: 'text-green-600', bg: 'bg-green-100' },
    { label: '平均蒸制时间', value: '45', unit: '分钟', icon: Flame, color: 'text-red-600', bg: 'bg-red-100' },
    { label: '落缸成功率', value: '98', unit: '%', icon: Droplet, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  const handleView = (batch: Batch) => {
    setSelectedBatch(batch);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-amber-900">蒸饭落缸</h2>
            <p className="text-amber-500 text-sm">蒸饭摊冷、酒药麦曲投放、落缸糖化</p>
          </div>
        </div>
        <button className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-200 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          开始蒸饭
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
          <BatchTable batches={allRelatedBatches} onView={handleView} onEdit={handleView} />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
            <h3 className="text-lg font-serif font-bold text-amber-900 mb-4">工艺参数</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-amber-50">
                <span className="text-amber-600">蒸饭温度</span>
                <span className="font-medium text-amber-900">100°C</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-amber-50">
                <span className="text-amber-600">蒸制时间</span>
                <span className="font-medium text-amber-900">40-50分钟</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-amber-50">
                <span className="text-amber-600">摊冷温度</span>
                <span className="font-medium text-amber-900">28-32°C</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-amber-50">
                <span className="text-amber-600">酒药用量</span>
                <span className="font-medium text-amber-900">0.4-0.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-600">麦曲用量</span>
                <span className="font-medium text-amber-900">3-5%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
            <h3 className="text-lg font-serif font-bold text-amber-900 mb-4">工艺流程</h3>
            <div className="space-y-3">
              {['淘米浸泡', '上甑蒸饭', '摊风冷饭', '酒药拌曲', '落缸糖化'].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i < 3 ? 'bg-green-500 text-white' : 'bg-amber-200 text-amber-600'
                  }`}>
                    {i + 1}
                  </div>
                  <span className={`text-sm ${i < 3 ? 'text-amber-800' : 'text-amber-400'}`}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedBatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-6 border-b border-amber-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-amber-900">{selectedBatch.batchNo}</h3>
                    <p className="text-sm text-amber-500">蒸饭落缸详情</p>
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

              {selectedBatch.steaming && (
                <div className="space-y-4">
                  <h4 className="font-medium text-amber-800">蒸饭记录</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-50 rounded-xl p-4">
                      <p className="text-sm text-orange-600 mb-1">蒸饭时间</p>
                      <p className="font-medium text-orange-900">{selectedBatch.steaming.steamTime}</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4">
                      <p className="text-sm text-red-600 mb-1">蒸制温度</p>
                      <p className="font-medium text-red-900">{selectedBatch.steaming.steamTemp}°C</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-sm text-blue-600 mb-1">摊冷温度</p>
                      <p className="font-medium text-blue-900">{selectedBatch.steaming.coolTemp}°C</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4">
                      <p className="text-sm text-amber-600 mb-1">蒸制时长</p>
                      <p className="font-medium text-amber-900">{selectedBatch.steaming.steamDuration}分钟</p>
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-amber-800 pt-2">曲药投放</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Leaf className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">酒药用量</span>
                      </div>
                      <p className="font-medium text-green-900">{selectedBatch.steaming.yeastAmount} kg</p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Leaf className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-700">麦曲用量</span>
                      </div>
                      <p className="font-medium text-yellow-800">{selectedBatch.steaming.quAmount} kg</p>
                    </div>
                  </div>

                  {selectedBatch.steaming.notes && (
                    <div className="bg-amber-50 rounded-xl p-4">
                      <p className="text-sm text-amber-600 mb-1">备注</p>
                      <p className="text-amber-800">{selectedBatch.steaming.notes}</p>
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
                进入发酵
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
