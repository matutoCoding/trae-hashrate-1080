import { useState } from 'react';
import { useBatchStore } from '../../store/useBatchStore';
import BatchTable from '../../components/BatchTable';
import StatusBadge from '../../components/StatusBadge';
import { Plus, Wine, Droplets, Thermometer, Timer } from 'lucide-react';
import type { Batch } from '../../types';

export default function PressingPage() {
  const { batches, getBatchesByStatus } = useBatchStore();
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showModal, setShowModal] = useState(false);

  const pressingBatches = getBatchesByStatus('pressing');
  const allRelatedBatches = batches.filter(b => 
    ['pressing', 'cellaring'].includes(b.status) || b.pressing
  );

  const totalYield = batches
    .filter(b => b.pressing)
    .reduce((sum, b) => sum + (b.pressing?.wineYield || 0), 0);

  const stats = [
    { label: '压榨中', value: pressingBatches.length, icon: Wine, color: 'text-pine-600', bg: 'bg-pine-100' },
    { label: '本月出酒', value: totalYield, unit: 'kg', icon: Droplets, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: '平均出酒率', value: '65', unit: '%', icon: Wine, color: 'text-green-600', bg: 'bg-green-100' },
    { label: '灭菌温度', value: '85', unit: '°C', icon: Thermometer, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  const handleView = (batch: Batch) => {
    setSelectedBatch(batch);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pine-500 to-pine-700 flex items-center justify-center shadow-lg">
            <Wine className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-amber-900">压榨煎酒</h2>
            <p className="text-amber-500 text-sm">板框压榨取酒、煎酒灭菌</p>
          </div>
        </div>
        <button className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-200 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          开始压榨
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
                <span className="text-amber-600">压榨方式</span>
                <span className="font-medium text-amber-900">板框压榨</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-amber-50">
                <span className="text-amber-600">压榨时间</span>
                <span className="font-medium text-amber-900">4-6小时</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-amber-50">
                <span className="text-amber-600">煎酒温度</span>
                <span className="font-medium text-amber-900">80-90°C</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-amber-50">
                <span className="text-amber-600">灭菌时间</span>
                <span className="font-medium text-amber-900">20-30分钟</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-600">出酒率</span>
                <span className="font-medium text-amber-900">60-70%</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pine-500 to-pine-700 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-serif font-bold mb-3">工艺流程</h3>
            <div className="space-y-3">
              {['酒糟装入滤布', '板框加压', '酒液流出收集', '沉淀澄清', '煎酒灭菌', '冷却装坛'].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    i < 4 ? 'bg-white text-pine-700' : 'bg-pine-600 text-pine-300'
                  }`}>
                    {i + 1}
                  </span>
                  <span className={`text-sm ${i < 4 ? 'text-white' : 'text-pine-300'}`}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
            <h3 className="text-lg font-serif font-bold text-amber-900 mb-4">质量指标</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-amber-600">酒精度</span>
                  <span className="text-amber-800 font-medium">≥14.5%vol</span>
                </div>
                <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-amber-600">总酸</span>
                  <span className="text-amber-800 font-medium">≤0.5g/100ml</span>
                </div>
                <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-amber-600">糖度</span>
                  <span className="text-amber-800 font-medium">≤5.0g/L</span>
                </div>
                <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
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
                  <div className="w-10 h-10 rounded-xl bg-pine-100 flex items-center justify-center">
                    <Wine className="w-5 h-5 text-pine-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-amber-900">{selectedBatch.batchNo}</h3>
                    <p className="text-sm text-amber-500">压榨煎酒详情</p>
                  </div>
                </div>
                <StatusBadge status={selectedBatch.status} />
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {selectedBatch.pressing && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-pine-50 rounded-xl p-4">
                      <p className="text-sm text-pine-600 mb-1">压榨日期</p>
                      <p className="font-medium text-pine-900">{selectedBatch.pressing.pressDate}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4">
                      <p className="text-sm text-amber-600 mb-1">出酒量</p>
                      <p className="font-medium text-amber-900">{selectedBatch.pressing.wineYield} kg</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4">
                      <p className="text-sm text-red-600 mb-1">灭菌温度</p>
                      <p className="font-medium text-red-900">{selectedBatch.pressing.sterilizeTemp}°C</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-sm text-blue-600 mb-1">灭菌时长</p>
                      <p className="font-medium text-blue-900">{selectedBatch.pressing.sterilizeDuration} 分钟</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-amber-600 mb-1">出酒率</p>
                        <p className="text-2xl font-bold font-serif text-amber-900">
                          {((selectedBatch.pressing.wineYield / selectedBatch.riceWeight) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                        <Droplets className="w-10 h-10 text-amber-500" />
                      </div>
                    </div>
                  </div>

                  {selectedBatch.pressing.notes && (
                    <div className="bg-amber-50 rounded-xl p-4">
                      <p className="text-sm text-amber-600 mb-1">备注</p>
                      <p className="text-amber-800">{selectedBatch.pressing.notes}</p>
                    </div>
                  )}
                </>
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
                装坛入库
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
