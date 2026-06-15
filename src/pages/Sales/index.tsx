import { useState, useMemo } from 'react';
import { useBatchStore } from '../../store/useBatchStore';
import StatusBadge from '../../components/StatusBadge';
import { Plus, ShoppingBag, DollarSign, Package, TrendingUp, Users, Check, X, Calculator, Calendar, User, Wine } from 'lucide-react';
import type { Batch, SaleRecord } from '../../types';

export default function SalesPage() {
  const { batches, getBatchesByStatus, updateBatch } = useBatchStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [saleForm, setSaleForm] = useState({
    customer: '',
    quantity: 0,
    price: 128,
    notes: '',
  });

  const customers = [
    { name: '杏花楼酒家', purchases: 1500, lastOrder: '2026-05-20' },
    { name: '老正兴菜馆', purchases: 1200, lastOrder: '2026-05-15' },
    { name: '德兴面馆', purchases: 800, lastOrder: '2026-05-10' },
    { name: '沈大成', purchases: 600, lastOrder: '2026-05-05' },
    { name: '绿波廊', purchases: 500, lastOrder: '2026-04-28' },
  ];

  const allSaleRecords = useMemo(() => {
    const records: (SaleRecord & { batchId: string; batchNo: string; jarNo: string })[] = [];
    batches.forEach((batch) => {
      if (batch.saleRecords && batch.saleRecords.length > 0) {
        batch.saleRecords.forEach((record) => {
          records.push({
            ...record,
            batchId: batch.id,
            batchNo: batch.batchNo,
            jarNo: batch.cellar?.jarNo || '未编号',
          });
        });
      }
    });
    return records.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
  }, [batches]);

  const availableBatches = useMemo(() => {
    return batches.filter((b) => 
      b.status === 'finished' && b.cellar && b.cellar.remainingCapacity > 0
    );
  }, [batches]);

  const totalSalesAmount = useMemo(() => {
    return allSaleRecords.reduce((sum, record) => sum + record.totalAmount, 0);
  }, [allSaleRecords]);

  const totalSalesQuantity = useMemo(() => {
    return allSaleRecords.reduce((sum, record) => sum + record.quantity, 0);
  }, [allSaleRecords]);

  const finishedStock = useMemo(() => {
    return batches
      .filter((b) => b.status === 'finished' || b.cellar?.status === 'partial')
      .reduce((sum, b) => sum + (b.cellar?.remainingCapacity || 0), 0);
  }, [batches]);

  const stats = [
    { label: '累计销售额', value: (totalSalesAmount / 10000).toFixed(2), unit: '万元', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { label: '累计销量', value: totalSalesQuantity, unit: 'kg', icon: ShoppingBag, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: '成品库存', value: finishedStock, unit: 'kg', icon: Package, color: 'text-pine-600', bg: 'bg-pine-100' },
    { label: '合作客户', value: 12, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  const totalAmount = useMemo(() => {
    return saleForm.quantity * saleForm.price;
  }, [saleForm.quantity, saleForm.price]);

  const handleSale = (batch: Batch) => {
    setSelectedBatch(batch);
    const remaining = batch.cellar?.remainingCapacity || batch.cellar?.capacity || 25;
    setSaleForm({
      customer: '',
      quantity: remaining,
      price: 128,
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenSaleModal = () => {
    if (availableBatches.length === 0) {
      alert('暂无待出库成品，请先完成装坛入库工序！');
      return;
    }
    const firstBatch = availableBatches[0];
    const remaining = firstBatch.cellar?.remainingCapacity || firstBatch.cellar?.capacity || 25;
    setSelectedBatch(firstBatch);
    setSaleForm({
      customer: '',
      quantity: remaining,
      price: 128,
      notes: '',
    });
    setShowModal(true);
  };

  const handleSelectBatch = (batch: Batch) => {
    setSelectedBatch(batch);
    const remaining = batch.cellar?.remainingCapacity || batch.cellar?.capacity || 25;
    setSaleForm({
      ...saleForm,
      quantity: remaining,
    });
  };

  const handleSubmitSale = () => {
    if (!selectedBatch) return;
    if (!saleForm.customer) {
      alert('请选择客户名称');
      return;
    }
    const remainingCapacity = selectedBatch.cellar?.remainingCapacity || selectedBatch.cellar?.capacity || 25;
    if (saleForm.quantity <= 0) {
      alert('出库数量必须大于0');
      return;
    }
    if (saleForm.quantity > remainingCapacity) {
      alert(`出库数量不能超过剩余容量 ${remainingCapacity} kg`);
      return;
    }
    if (saleForm.price <= 0) {
      alert('单价必须大于0');
      return;
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const newSaleRecord: SaleRecord = {
      id: Math.random().toString(36).substr(2, 9),
      customer: saleForm.customer,
      quantity: saleForm.quantity,
      price: saleForm.price,
      totalAmount: totalAmount,
      saleDate: dateStr,
      operator: '系统管理员',
      notes: saleForm.notes,
    };

    const currentSaleRecords = selectedBatch.saleRecords || [];
    const updatedSaleRecords = [...currentSaleRecords, newSaleRecord];
    
    const newRemainingCapacity = remainingCapacity - saleForm.quantity;
    const isSoldOut = newRemainingCapacity <= 0;
    
    const newBatchStatus = isSoldOut ? 'sold' : 'finished';
    const newCellarStatus = isSoldOut ? 'sold' : 'partial';

    updateBatch(selectedBatch.id, {
      status: newBatchStatus,
      currentStage: isSoldOut ? '已销售' : '成品销售',
      saleRecords: updatedSaleRecords,
      cellar: {
        ...selectedBatch.cellar!,
        remainingCapacity: newRemainingCapacity,
        status: newCellarStatus,
      },
    });

    setShowModal(false);
    setSuccessMessage(isSoldOut ? '销售出库成功！该批次已全部售罄' : `销售出库成功！剩余 ${newRemainingCapacity} kg`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getJarStatusBadge = (status?: string) => {
    const configs: Record<string, { label: string; color: string; bg: string }> = {
      ready: { label: '待出库', color: 'text-green-700', bg: 'bg-green-100' },
      partial: { label: '部分出库', color: 'text-amber-700', bg: 'bg-amber-100' },
      sold: { label: '已售罄', color: 'text-gray-600', bg: 'bg-gray-100' },
      stored: { label: '存储中', color: 'text-pine-700', bg: 'bg-pine-100' },
      aging: { label: '陈酿中', color: 'text-clay-700', bg: 'bg-clay-100' },
    };
    const config = configs[status || 'ready'] || configs.ready;
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${config.color} ${config.bg}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 relative">
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-slide-up flex items-center gap-3">
          <Check className="w-6 h-6" />
          <div>
            <p className="font-bold">销售出库成功！</p>
            <p className="text-sm text-green-100">{successMessage}</p>
          </div>
        </div>
      )}

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
        <button 
          onClick={handleOpenSaleModal}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-200 flex items-center gap-2"
        >
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
                    {stat.unit && <span className="text-sm font-normal text-amber-500 ml-1">{stat.unit}</span>}
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
              <h3 className="text-lg font-serif font-bold text-amber-900">销售台账</h3>
              <span className="text-sm text-amber-500">共 {allSaleRecords.length} 条记录</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-amber-50 to-amber-100/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-amber-800">批次号</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-amber-800">坛号</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-amber-800">客户</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-amber-800">数量</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-amber-800">单价</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-amber-800">金额</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-amber-800">日期</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-amber-800">操作人</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {allSaleRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-amber-500">
                        <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>暂无销售记录</p>
                      </td>
                    </tr>
                  ) : (
                    allSaleRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-amber-50/30">
                        <td className="px-4 py-3 font-mono text-sm text-amber-800">{record.batchNo}</td>
                        <td className="px-4 py-3 text-amber-700">{record.jarNo}</td>
                        <td className="px-4 py-3 text-amber-700">{record.customer}</td>
                        <td className="px-4 py-3 text-amber-700">{record.quantity} kg</td>
                        <td className="px-4 py-3 text-amber-700">¥{record.price}</td>
                        <td className="px-4 py-3 text-amber-800 font-medium">
                          ¥{record.totalAmount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-amber-500 text-sm flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {record.saleDate}
                        </td>
                        <td className="px-4 py-3 text-amber-600 text-sm flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {record.operator}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-bold text-amber-900">待出库成品</h3>
              <span className="text-sm text-amber-500">共 {finishedStock} kg · {availableBatches.length} 坛</span>
            </div>

            {availableBatches.length === 0 ? (
              <div className="text-center py-12 bg-green-50/50 rounded-xl">
                <Package className="w-12 h-12 mx-auto mb-3 text-green-400 opacity-50" />
                <p className="text-amber-500">暂无待出库成品</p>
                <p className="text-sm text-amber-400 mt-1">请先完成装坛入库工序</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableBatches.map((batch) => {
                  const remaining = batch.cellar?.remainingCapacity || batch.cellar?.capacity || 25;
                  const capacity = batch.cellar?.capacity || 25;
                  const percentage = (remaining / capacity) * 100;
                  
                  return (
                    <div 
                      key={batch.id} 
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        selectedBatch?.id === batch.id && showModal
                          ? 'bg-green-100 border-green-400 ring-2 ring-green-300'
                          : 'bg-green-50 border-green-200/50 hover:border-green-300 hover:shadow-md'
                      }`}
                      onClick={() => showModal && handleSelectBatch(batch)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-amber-900">{batch.cellar?.jarNo || '未编号'}</p>
                          <p className="text-sm text-amber-500">{batch.batchNo}</p>
                        </div>
                        {getJarStatusBadge(batch.cellar?.status)}
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-amber-600">剩余容量</span>
                          <span className="font-medium text-amber-800">{remaining}/{capacity} kg</span>
                        </div>
                        <div className="h-2 bg-green-200/50 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              percentage > 50 ? 'bg-green-500' : percentage > 20 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-amber-500">
                          <Wine className="w-3.5 h-3.5" />
                          <span>{batch.cellar?.wineAge || 0}年陈</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSale(batch);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md"
                        >
                          销售出库
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
                { month: '6月', sales: totalSalesQuantity > 0 ? totalSalesQuantity : 1820 },
              ].map((item) => (
                <div key={item.month}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-amber-600">{item.month}</span>
                    <span className="text-amber-800 font-medium">{item.sales} kg</span>
                  </div>
                  <div className="h-6 bg-amber-50 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-lg transition-all"
                      style={{ width: `${Math.min((item.sales / 2500) * 100, 100)}%` }}
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
                <span className="font-medium">{Math.min(70 + Math.floor(totalSalesQuantity / 100), 100)}%</span>
              </div>
              <div className="h-3 bg-green-700/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all" 
                  style={{ width: `${Math.min(70 + totalSalesQuantity / 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <p className="text-sm text-green-100">
              累计已销售 {totalSalesQuantity} kg，继续加油！
            </p>
          </div>
        </div>
      </div>

      {showModal && selectedBatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-6 border-b border-amber-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-amber-900">销售出库</h3>
                    <p className="text-sm text-amber-500">{selectedBatch.batchNo} · {selectedBatch.cellar?.jarNo || '未编号'}</p>
                  </div>
                </div>
                <StatusBadge status={selectedBatch.status} size="sm" />
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {availableBatches.length > 1 && (
                <div>
                  <label className="block text-sm text-amber-700 mb-2">选择成品批次</label>
                  <select
                    value={selectedBatch.id}
                    onChange={(e) => {
                      const batch = batches.find(b => b.id === e.target.value);
                      if (batch) handleSelectBatch(batch);
                    }}
                    className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                  >
                    {availableBatches.map((b) => {
                      const remaining = b.cellar?.remainingCapacity || b.cellar?.capacity || 25;
                      const capacity = b.cellar?.capacity || 25;
                      return (
                        <option key={b.id} value={b.id}>
                          {b.cellar?.jarNo || '未编号'} - {b.batchNo} (剩余{remaining}/{capacity}kg · {b.cellar?.wineAge || 0}年陈)
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">剩余可出库</p>
                    <p className="text-xl font-bold font-serif text-green-800">
                      {selectedBatch.cellar?.remainingCapacity || selectedBatch.cellar?.capacity || 25} kg
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-700">总容量</p>
                    <p className="text-xl font-bold font-serif text-green-800">
                      {selectedBatch.cellar?.capacity || 25} kg
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-amber-700 mb-2">客户名称 *</label>
                <select 
                  value={saleForm.customer}
                  onChange={(e) => setSaleForm({ ...saleForm, customer: e.target.value })}
                  className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                >
                  <option value="">请选择客户</option>
                  {customers.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-amber-700 mb-2">出库数量 (kg) *</label>
                  <input 
                    type="number" 
                    value={saleForm.quantity}
                    onChange={(e) => setSaleForm({ ...saleForm, quantity: Number(e.target.value) })}
                    min={1}
                    max={selectedBatch.cellar?.remainingCapacity || selectedBatch.cellar?.capacity || 999}
                    className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                  <p className="text-xs text-amber-400 mt-1">
                    最大可出库: {selectedBatch.cellar?.remainingCapacity || selectedBatch.cellar?.capacity || 25} kg
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-amber-700 mb-2">单价 (元/kg) *</label>
                  <input 
                    type="number" 
                    value={saleForm.price}
                    onChange={(e) => setSaleForm({ ...saleForm, price: Number(e.target.value) })}
                    min={1}
                    step={1}
                    className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-amber-700 mb-2">备注</label>
                <textarea
                  value={saleForm.notes}
                  onChange={(e) => setSaleForm({ ...saleForm, notes: e.target.value })}
                  rows={2}
                  placeholder="备注信息（选填）"
                  className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                />
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Calculator className="w-5 h-5" />
                    <span className="font-medium">合计金额</span>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold font-serif text-amber-900">
                      ¥{totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-amber-500">
                      {saleForm.quantity} kg × ¥{saleForm.price}/kg
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-amber-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                取消
              </button>
              <button 
                onClick={handleSubmitSale}
                className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-200 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                确认出库
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
