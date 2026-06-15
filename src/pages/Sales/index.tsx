import { useState } from 'react';
import { useBatchStore } from '../../store/useBatchStore';
import StatusBadge from '../../components/StatusBadge';
import { Plus, ShoppingBag, DollarSign, Package, TrendingUp, Users } from 'lucide-react';
import type { Batch } from '../../types';

export default function SalesPage() {
  const { batches, getBatchesByStatus } = useBatchStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  const soldBatches = getBatchesByStatus('sold');
  const finishedBatches = getBatchesByStatus('finished');
  const allSalesBatches = batches.filter(b => 
    ['sold', 'finished'].includes(b.status) || b.sale
  );

  const totalSales = soldBatches.reduce((sum, b) => {
    return sum + (b.sale?.quantity || 0) * (b.sale?.price || 0);
  }, 0);

  const totalQuantity = soldBatches.reduce((sum, b) => {
    return sum + (b.sale?.quantity || 0);
  }, 0);

  const stats = [
    { label: '本月销售额', value: (totalSales / 1000).toFixed(1), unit: '万元', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { label: '本月销量', value: totalQuantity, unit: 'kg', icon: ShoppingBag, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: '成品库存', value: finishedBatches.length * 25, unit: 'kg', icon: Package, color: 'text-pine-600', bg: 'bg-pine-100' },
    { label: '合作客户', value: 12, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  const customers = [
    { name: '杏花楼酒家', purchases: 1500, lastOrder: '2026-05-20' },
    { name: '老正兴菜馆', purchases: 1200, lastOrder: '2026-05-15' },
    { name: '德兴面馆', purchases: 800, lastOrder: '2026-05-10' },
    { name: '沈大成', purchases: 600, lastOrder: '2026-05-05' },
    { name: '绿波廊', purchases: 500, lastOrder: '2026-04-28' },
  ];

  const handleSale = (batch: Batch) => {
    setSelectedBatch(batch);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-amber-900">成品销售</h2>
            <p className="text-amber-500 text-sm">黄酒出库销售、库存管理</p>
          </div>
        </div>
        <button className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-200 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          销售出库
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
              <h3 className="text-lg font-serif font-bold text-amber-900">销售记录</h3>
              <button className="text-sm text-amber-500 hover:text-amber-700">查看全部</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-amber-50 to-amber-100/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-amber-800">批次号</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-amber-800">客户</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-amber-800">数量</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-amber-800">金额</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-amber-800">日期</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-amber-800">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {soldBatches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-amber-50/30">
                      <td className="px-4 py-3 font-mono text-sm text-amber-800">{batch.batchNo}</td>
                      <td className="px-4 py-3 text-amber-700">{batch.sale?.customer || '-'}</td>
                      <td className="px-4 py-3 text-amber-700">{batch.sale?.quantity || 0} kg</td>
                      <td className="px-4 py-3 text-amber-800 font-medium">
                        ¥{(batch.sale?.quantity || 0) * (batch.sale?.price || 0)}
                      </td>
                      <td className="px-4 py-3 text-amber-500 text-sm">{batch.sale?.saleDate || '-'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={batch.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-bold text-amber-900">待出库成品</h3>
              <span className="text-sm text-amber-500">共 {finishedBatches.length} 坛</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {finishedBatches.map((batch) => (
                <div key={batch.id} className="p-4 bg-green-50 rounded-xl border border-green-200/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-amber-900">{batch.cellar?.jarNo}</p>
                      <p className="text-sm text-amber-500">{batch.batchNo}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      {batch.cellar?.wineAge}年陈
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-500">容量</p>
                      <p className="font-medium text-amber-800">{batch.cellar?.capacity} kg</p>
                    </div>
                    <button
                      onClick={() => handleSale(batch)}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
                    >
                      销售出库
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
            <h3 className="text-lg font-serif font-bold text-amber-900 mb-4">销售趋势</h3>
            <div className="space-y-4">
              {[
                { month: '1月', sales: 1500 },
                { month: '2月', sales: 1800 },
                { month: '3月', sales: 1600 },
                { month: '4月', sales: 2000 },
                { month: '5月', sales: 2200 },
                { month: '6月', sales: 1820 },
              ].map((item) => (
                <div key={item.month}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-amber-600">{item.month}</span>
                    <span className="text-amber-800 font-medium">{item.sales} kg</span>
                  </div>
                  <div className="h-6 bg-amber-50 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-lg"
                      style={{ width: `${(item.sales / 2500) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
            <h3 className="text-lg font-serif font-bold text-amber-900 mb-4">主要客户</h3>
            <div className="space-y-3">
              {customers.map((customer, index) => (
                <div key={customer.name} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-900">{customer.name}</p>
                      <p className="text-xs text-amber-500">最近订单: {customer.lastOrder}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-amber-800">{customer.purchases} kg</p>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>常客</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-serif font-bold mb-3">本月销售目标</h3>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-green-100">目标完成度</span>
                <span className="font-medium">73%</span>
              </div>
              <div className="h-3 bg-green-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: '73%' }}></div>
              </div>
            </div>
            <p className="text-sm text-green-100">
              距目标还差约 810 kg，继续加油！
            </p>
          </div>
        </div>
      </div>

      {showModal && selectedBatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-6 border-b border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-amber-900">销售出库</h3>
                  <p className="text-sm text-amber-500">{selectedBatch.batchNo}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-amber-700 mb-2">客户名称</label>
                <select className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white">
                  <option>请选择客户</option>
                  <option>杏花楼酒家</option>
                  <option>老正兴菜馆</option>
                  <option>德兴面馆</option>
                  <option>沈大成</option>
                  <option>绿波廊</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-amber-700 mb-2">出库数量 (kg)</label>
                <input 
                  type="number" 
                  defaultValue={selectedBatch.cellar?.capacity || 25}
                  className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm text-amber-700 mb-2">单价 (元/kg)</label>
                <input 
                  type="number" 
                  defaultValue={128}
                  className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
              
              <div className="bg-amber-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-amber-600">预计金额</span>
                  <span className="text-2xl font-bold font-serif text-amber-900">
                    ¥{(selectedBatch.cellar?.capacity || 25) * 128}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-amber-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
              >
                取消
              </button>
              <button className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all">
                确认出库
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
