import { useState } from 'react';
import { useBatchStore } from '../../store/useBatchStore';
import BatchTable from '../../components/BatchTable';
import StatusBadge from '../../components/StatusBadge';
import { Plus, Clock, Thermometer, Droplets, Calendar } from 'lucide-react';
import type { Batch } from '../../types';

export default function AgingPage() {
  const { batches, getBatchesByStatus } = useBatchStore();
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showModal, setShowModal] = useState(false);

  const agingBatches = getBatchesByStatus('aging');
  const allRelatedBatches = batches.filter(b => 
    ['aging', 'pressing'].includes(b.status) || b.aging
  );

  const stats = [
    { label: '养醅中', value: agingBatches.length, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: '平均养醅天数', value: '30', unit: '天', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: '环境温度', value: '18', unit: '°C', icon: Thermometer, color: 'text-green-600', bg: 'bg-green-100' },
    { label: '环境湿度', value: '75', unit: '%', icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  ];

  const handleView = (batch: Batch) => {
    setSelectedBatch(batch);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-amber-900">后酵养醅</h2>
            <p className="text-amber-500 text-sm">后酵养醅静置、醅液监测</p>
          </div>
        </div>
        <button className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-200 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          抽检记录
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
            <h3 className="text-lg font-serif font-bold text-amber-900 mb-4">养醅环境</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-amber-50">
                <span className="text-amber-600">养醅温度</span>
                <span className="font-medium text-amber-900">15-20°C</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-amber-50">
                <span className="text-amber-600">环境湿度</span>
                <span className="font-medium text-amber-900">70-80%</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-amber-50">
                <span className="text-amber-600">养醅周期</span>
                <span className="font-medium text-amber-900">20-30天</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-600">抽检频率</span>
                <span className="font-medium text-amber-900">每5天一次</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-serif font-bold mb-3">养醅要点</h3>
            <div className="space-y-2 text-sm text-purple-100">
              <p>• 后酵期酶促反应缓慢进行</p>
              <p>• 酒精度逐渐升高，糖分下降</p>
              <p>• 风味物质慢慢形成</p>
              <p>• 需保持恒温恒湿环境</p>
              <p>• 定期抽检观察醅液状态</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
            <h3 className="text-lg font-serif font-bold text-amber-900 mb-4">即将完成</h3>
            <div className="space-y-3">
              {batches.filter(b => b.status === 'aging').slice(0, 2).map(batch => (
                <div key={batch.id} className="p-3 bg-purple-50 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-amber-800 text-sm">{batch.batchNo}</span>
                    <span className="text-xs text-purple-600">还剩5天</span>
                  </div>
                  <div className="h-1.5 bg-purple-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '85%' }}></div>
                  </div>
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
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-amber-900">{selectedBatch.batchNo}</h3>
                    <p className="text-sm text-amber-500">后酵养醅详情</p>
                  </div>
                </div>
                <StatusBadge status={selectedBatch.status} />
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {selectedBatch.aging && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 rounded-xl p-4">
                      <p className="text-sm text-purple-600 mb-1">开始日期</p>
                      <p className="font-medium text-purple-900">{selectedBatch.aging.startDate}</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                      <p className="text-sm text-purple-600 mb-1">养醅天数</p>
                      <p className="font-medium text-purple-900">{selectedBatch.aging.days} 天</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-sm text-green-600 mb-1">环境温度</p>
                      <p className="font-medium text-green-900">{selectedBatch.aging.temp}°C</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-sm text-blue-600 mb-1">环境湿度</p>
                      <p className="font-medium text-blue-900">{selectedBatch.aging.humidity}%</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 rounded-xl p-4">
                    <p className="text-sm text-amber-600 mb-1">存放位置</p>
                    <p className="font-medium text-amber-900">{selectedBatch.aging.location}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-amber-800 mb-3">抽检记录</h4>
                    <div className="space-y-2">
                      {selectedBatch.aging.inspectionRecords.map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100">
                          <div>
                            <p className="text-sm font-medium text-amber-800">{record.date}</p>
                            <p className="text-xs text-amber-500">{record.operator}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-amber-700">
                              {record.temperature}°C · {record.humidity}%
                            </p>
                            {record.taste && (
                              <p className="text-xs text-amber-500">口感：{record.taste}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
                压榨取酒
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
