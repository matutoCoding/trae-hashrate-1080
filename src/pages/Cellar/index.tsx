import { useState } from 'react';
import { useBatchStore } from '../../store/useBatchStore';
import StatusBadge from '../../components/StatusBadge';
import { Plus, Archive, Calendar, MapPin, Droplet } from 'lucide-react';
import type { Batch } from '../../types';

export default function CellarPage() {
  const { batches, getBatchesByStatus } = useBatchStore();
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');

  const cellaringBatches = getBatchesByStatus('cellaring');
  const finishedBatches = getBatchesByStatus('finished');
  const allRelatedBatches = batches.filter(b => 
    ['cellaring', 'finished'].includes(b.status) || b.cellar
  );

  const filteredBatches = filter === 'all' 
    ? allRelatedBatches 
    : filter === 'cellaring' 
      ? cellaringBatches 
      : finishedBatches;

  const totalJars = allRelatedBatches.length;
  const totalCapacity = totalJars * 25;

  const stats = [
    { label: '在储酒坛', value: totalJars, unit: '坛', icon: Archive, color: 'text-clay-600', bg: 'bg-clay-100' },
    { label: '总储量', value: totalCapacity, unit: 'kg', icon: Droplet, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: '可出库', value: finishedBatches.length, unit: '坛', icon: Calendar, color: 'text-green-600', bg: 'bg-green-100' },
    { label: '酒窖区域', value: 3, unit: '个', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  const handleView = (batch: Batch) => {
    setSelectedBatch(batch);
    setShowModal(true);
  };

  const wineAgeGroups = [
    { age: '1年以下', count: 5, jars: ['T-001', 'T-002', 'T-003', 'T-004', 'T-005'] },
    { age: '1-3年', count: 12, jars: ['T-101', 'T-102', 'T-103', 'T-104', 'T-105', 'T-106', 'T-107', 'T-108', 'T-109', 'T-110', 'T-111', 'T-112'] },
    { age: '3-5年', count: 8, jars: ['T-301', 'T-302', 'T-303', 'T-304', 'T-305', 'T-306', 'T-307', 'T-308'] },
    { age: '5年以上', count: 3, jars: ['T-501', 'T-502', 'T-503'] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-clay-400 to-clay-600 flex items-center justify-center shadow-lg">
            <Archive className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-amber-900">陈酿装坛</h2>
            <p className="text-amber-500 text-sm">陶坛陈酿堆放、酒龄年份登记</p>
          </div>
        </div>
        <button className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-200 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          装坛入库
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
                    <span className="text-sm font-normal text-amber-500 ml-1">{stat.unit}</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-bold text-amber-900">酒坛库存</h3>
              <div className="flex items-center gap-2">
                {[
                  { key: 'all', label: '全部' },
                  { key: 'cellaring', label: '陈酿中' },
                  { key: 'finished', label: '可出库' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setFilter(item.key)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      filter === item.key
                        ? 'bg-amber-500 text-white'
                        : 'text-amber-600 hover:bg-amber-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredBatches.slice(0, 12).map((batch) => (
                <div
                  key={batch.id}
                  onClick={() => handleView(batch)}
                  className="p-4 bg-clay-50 rounded-xl cursor-pointer hover:bg-clay-100 transition-colors border border-clay-200/50"
                >
                  <div className="w-12 h-16 mx-auto mb-2 bg-gradient-to-b from-clay-400 to-clay-600 rounded-b-full rounded-t-lg relative">
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-clay-700 rounded-t-sm"></div>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-amber-900 text-sm">{batch.cellar?.jarNo || 'T-000'}</p>
                    <p className="text-xs text-amber-500">{batch.cellar?.wineAge || 0}年陈</p>
                    <div className="mt-2">
                      <StatusBadge status={batch.status} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
            <h3 className="text-lg font-serif font-bold text-amber-900 mb-4">酒龄分布</h3>
            <div className="space-y-4">
              {wineAgeGroups.map((group) => (
                <div key={group.age}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-amber-700 font-medium">{group.age}</span>
                    <span className="text-amber-500">{group.count} 坛</span>
                  </div>
                  <div className="h-8 bg-amber-50 rounded-lg overflow-hidden flex items-center px-2 gap-1">
                    {group.jars.slice(0, 10).map((jar, i) => (
                      <div
                        key={i}
                        className="w-4 h-6 bg-gradient-to-b from-clay-400 to-clay-600 rounded-b-sm rounded-t-xs"
                        title={jar}
                      ></div>
                    ))}
                    {group.count > 10 && (
                      <span className="text-xs text-amber-500 ml-1">+{group.count - 10}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
            <h3 className="text-lg font-serif font-bold text-amber-900 mb-4">酒窖分布</h3>
            <div className="space-y-3">
              {[
                { name: '地下酒窖A区', count: 15, color: 'bg-amber-500' },
                { name: '地下酒窖B区', count: 8, color: 'bg-clay-500' },
                { name: '成品库区', count: 5, color: 'bg-green-500' },
              ].map((area) => (
                <div key={area.name} className="p-3 bg-amber-50 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-amber-800 font-medium">{area.name}</span>
                    <span className="text-sm text-amber-600">{area.count} 坛</span>
                  </div>
                  <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${area.color} rounded-full`} 
                      style={{ width: `${(area.count / 28) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-clay-500 to-clay-700 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-serif font-bold mb-3">陈酿要点</h3>
            <div className="space-y-2 text-sm text-clay-100">
              <p>• 陶坛透气，有助于酒的老熟</p>
              <p>• 恒温恒湿环境，温度15-20°C</p>
              <p>• 湿度保持在70%左右</p>
              <p>• 定期检查，防止渗漏</p>
              <p>• 做好酒龄登记，先进先出</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
            <h3 className="text-lg font-serif font-bold text-amber-900 mb-4">近期可出库</h3>
            <div className="space-y-3">
              {finishedBatches.slice(0, 3).map((batch) => (
                <div key={batch.id} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div>
                    <p className="font-medium text-amber-900 text-sm">{batch.cellar?.jarNo}</p>
                    <p className="text-xs text-amber-500">{batch.cellar?.wineAge}年陈酿</p>
                  </div>
                  <button className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors">
                    出库
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedBatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-6 border-b border-amber-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-clay-100 flex items-center justify-center">
                    <Archive className="w-5 h-5 text-clay-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-amber-900">
                      {selectedBatch.cellar?.jarNo || '未知酒坛'}
                    </h3>
                    <p className="text-sm text-amber-500">{selectedBatch.batchNo}</p>
                  </div>
                </div>
                <StatusBadge status={selectedBatch.status} />
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {selectedBatch.cellar && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-clay-50 rounded-xl p-4">
                      <p className="text-sm text-clay-600 mb-1">酒龄</p>
                      <p className="text-xl font-bold font-serif text-clay-800">
                        {selectedBatch.cellar.wineAge} 年
                      </p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4">
                      <p className="text-sm text-amber-600 mb-1">容量</p>
                      <p className="text-xl font-bold font-serif text-amber-800">
                        {selectedBatch.cellar.capacity} kg
                      </p>
                    </div>
                  </div>

                  <div className="bg-amber-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-amber-600">存放位置</span>
                    </div>
                    <p className="font-medium text-amber-900">{selectedBatch.cellar.location}</p>
                  </div>

                  <div className="bg-amber-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-amber-600">入窖日期</span>
                    </div>
                    <p className="font-medium text-amber-900">{selectedBatch.cellar.cellarDate}</p>
                  </div>

                  {selectedBatch.cellar.notes && (
                    <div className="bg-amber-50 rounded-xl p-4">
                      <p className="text-sm text-amber-600 mb-1">备注</p>
                      <p className="text-amber-800">{selectedBatch.cellar.notes}</p>
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
              {selectedBatch.status === 'finished' && (
                <button className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all">
                  销售出库
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
