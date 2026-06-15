import { useState, useMemo } from 'react';
import { useBatchStore } from '../../store/useBatchStore';
import BatchTable from '../../components/BatchTable';
import StatusBadge from '../../components/StatusBadge';
import { Wine, Droplets, Thermometer, Plus, Check, X, Clock, Calendar, Gauge, Flame } from 'lucide-react';
import type { Batch, PressingRecord, CellarRecord } from '../../types';

export default function PressingPage() {
  const { batches, getBatchesByStatus, updateBatch } = useBatchStore();
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPressModal, setShowPressModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  const [pressForm, setPressForm] = useState({
    batchId: '',
    pressDate: todayStr,
    wineYield: 0,
    sterilizeTemp: 85,
    sterilizeDuration: 25,
    operator: '系统管理员',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const pressingBatches = getBatchesByStatus('pressing');
  const allRelatedBatches = batches.filter(b =>
    ['pressing', 'cellaring'].includes(b.status) || b.pressing
  );

  const totalWineYield = useMemo(() => {
    return batches.reduce((sum, b) => sum + (b.pressing?.wineYield || 0), 0);
  }, [batches]);

  const avgYieldRate = useMemo(() => {
    const validBatches = batches.filter(b => b.pressing?.wineYield && b.riceWeight);
    if (validBatches.length === 0) return 0;
    const totalRate = validBatches.reduce((sum, b) => {
      const rate = ((b.pressing?.wineYield || 0) / b.riceWeight) * 100;
      return sum + rate;
    }, 0);
    return Math.round(totalRate / validBatches.length * 10) / 10;
  }, [batches]);

  const avgSterilizeTemp = useMemo(() => {
    const validBatches = batches.filter(b => b.pressing?.sterilizeTemp);
    if (validBatches.length === 0) return 85;
    const total = validBatches.reduce((sum, b) => sum + (b.pressing?.sterilizeTemp || 0), 0);
    return Math.round(total / validBatches.length * 10) / 10;
  }, [batches]);

  const stats = [
    { label: '压榨中', value: pressingBatches.length, icon: Wine, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: '总出酒量', value: totalWineYield, unit: 'kg', icon: Droplets, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: '平均出酒率', value: avgYieldRate, unit: '%', icon: Gauge, color: 'text-green-600', bg: 'bg-green-100' },
    { label: '平均灭菌温度', value: avgSterilizeTemp, unit: '°C', icon: Thermometer, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!pressForm.batchId) errors.batchId = '请选择批次';
    if (!pressForm.pressDate) errors.pressDate = '请选择压榨日期';
    if (!pressForm.wineYield || pressForm.wineYield <= 0) errors.wineYield = '请输入有效的出酒量';
    if (!pressForm.sterilizeTemp || pressForm.sterilizeTemp <= 0) errors.sterilizeTemp = '请输入有效的灭菌温度';
    if (!pressForm.sterilizeDuration || pressForm.sterilizeDuration <= 0) errors.sterilizeDuration = '请输入有效的灭菌时长';
    if (!pressForm.operator.trim()) errors.operator = '请输入操作人';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleView = (batch: Batch) => {
    setSelectedBatch(batch);
    setShowModal(true);
  };

  const handleOpenPressModal = () => {
    if (pressingBatches.length === 0) {
      alert('暂无待压榨的批次，请先完成后酵养醅工序！');
      return;
    }
    const firstBatch = pressingBatches[0];
    setPressForm({
      batchId: firstBatch.id,
      pressDate: todayStr,
      wineYield: Math.round(firstBatch.riceWeight * 0.65 * 10) / 10,
      sterilizeTemp: 85,
      sterilizeDuration: 25,
      operator: '系统管理员',
      notes: '',
    });
    setFormErrors({});
    setShowPressModal(true);
  };

  const handlePressForBatch = (batch: Batch) => {
    setSelectedBatch(batch);
    setPressForm({
      batchId: batch.id,
      pressDate: todayStr,
      wineYield: Math.round(batch.riceWeight * 0.65 * 10) / 10,
      sterilizeTemp: 85,
      sterilizeDuration: 25,
      operator: '系统管理员',
      notes: '',
    });
    setFormErrors({});
    setShowPressModal(true);
  };

  const handleBatchChange = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    setPressForm({
      ...pressForm,
      batchId,
      wineYield: batch ? Math.round(batch.riceWeight * 0.65 * 10) / 10 : 0,
    });
  };

  const handleSubmitPress = () => {
    if (!validateForm()) return;

    const targetBatch = batches.find(b => b.id === pressForm.batchId);
    if (!targetBatch) {
      alert('未找到指定批次');
      return;
    }

    const pressingRecord: PressingRecord = {
      id: Math.random().toString(36).substr(2, 9),
      pressDate: pressForm.pressDate,
      wineYield: pressForm.wineYield,
      sterilizeTemp: pressForm.sterilizeTemp,
      sterilizeDuration: pressForm.sterilizeDuration,
      pressDuration: 0,
      status: 'completed',
      notes: pressForm.notes,
    };

    const cellarRecord: CellarRecord = {
      id: Math.random().toString(36).substr(2, 9),
      jarNo: '',
      wineAge: 0,
      location: '',
      cellarDate: todayStr,
      capacity: pressForm.wineYield,
      status: 'stored',
      notes: '',
    };

    updateBatch(targetBatch.id, {
      status: 'cellaring',
      currentStage: '陈酿装坛',
      pressing: pressingRecord,
      cellar: cellarRecord,
    });

    setShowPressModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAdvanceToCellaring = () => {
    if (!selectedBatch) return;
    if (!selectedBatch.pressing) {
      alert('该批次尚未完成压榨煎酒');
      return;
    }

    const cellarRecord: CellarRecord = selectedBatch.cellar || {
      id: Math.random().toString(36).substr(2, 9),
      jarNo: '',
      wineAge: 0,
      location: '',
      cellarDate: todayStr,
      capacity: selectedBatch.pressing.wineYield || 0,
      status: 'stored',
      notes: '',
    };

    updateBatch(selectedBatch.id, {
      status: 'cellaring',
      currentStage: '陈酿装坛',
      pressing: {
        ...selectedBatch.pressing,
        status: 'completed',
      },
      cellar: cellarRecord,
    });

    setShowModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const yieldRate = selectedBatch?.pressing?.wineYield && selectedBatch?.riceWeight
    ? Math.round((selectedBatch.pressing.wineYield / selectedBatch.riceWeight) * 1000) / 10
    : 0;

  return (
    <div className="space-y-6 relative">
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-slide-up flex items-center gap-3">
          <Check className="w-6 h-6" />
          <div>
            <p className="font-bold">操作成功！</p>
            <p className="text-sm text-orange-100">批次状态已更新</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
            <Wine className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-amber-900">压榨煎酒</h2>
            <p className="text-amber-500 text-sm">酒醅压榨取酒、高温灭菌</p>
          </div>
        </div>
        <button
          onClick={handleOpenPressModal}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-200 flex items-center gap-2"
        >
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

      {pressingBatches.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-200">
          <h3 className="font-serif font-bold text-amber-900 mb-4 flex items-center gap-2">
            <Wine className="w-5 h-5 text-orange-500" />
            正在压榨中的批次 ({pressingBatches.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pressingBatches.map((batch) => (
              <div key={batch.id} className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-mono font-medium text-amber-900">{batch.batchNo}</p>
                    <p className="text-xs text-amber-500">{batch.riceType} · {batch.riceWeight}kg</p>
                  </div>
                  <StatusBadge status={batch.status} size="sm" />
                </div>
                <div className="space-y-2 mb-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-amber-500">预期出酒量</span>
                    <span className="text-orange-600 font-medium">{Math.round(batch.riceWeight * 0.65 * 10) / 10}kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-500">预期出酒率</span>
                    <span className="text-green-600 font-medium">65%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-500">灭菌温度</span>
                    <span className="text-red-600 font-medium">85°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-500">灭菌时长</span>
                    <span className="text-amber-800 font-medium">25分钟</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePressForBatch(batch)}
                    className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-1"
                  >
                    <Flame className="w-4 h-4" />
                    开始压榨
                  </button>
                  <button
                    onClick={() => handleView(batch)}
                    className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200 transition-all"
                  >
                    详情
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BatchTable batches={allRelatedBatches} onView={handleView} onEdit={handleView} />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
            <h3 className="text-lg font-serif font-bold text-amber-900 mb-4">压榨工艺标准</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-amber-50">
                <span className="text-amber-600">出酒率</span>
                <span className="font-medium text-amber-900">约65%</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-amber-50">
                <span className="text-amber-600">灭菌温度</span>
                <span className="font-medium text-amber-900">80-90°C</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-amber-50">
                <span className="text-amber-600">灭菌时长</span>
                <span className="font-medium text-amber-900">20-30分钟</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-600">压榨压力</span>
                <span className="font-medium text-amber-900">逐步加压</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-serif font-bold mb-3">压榨煎酒要点</h3>
            <div className="space-y-2 text-sm text-orange-100">
              <p>• 压榨前检查设备清洁消毒</p>
              <p>• 酒醅装入滤布需均匀平整</p>
              <p>• 加压需循序渐进，避免骤压</p>
              <p>• 煎酒温度需严格控制在85°C左右</p>
              <p>• 灭菌后酒液需冷却至室温</p>
              <p>• 记录出酒量核算出酒率</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
            <h3 className="text-lg font-serif font-bold text-amber-900 mb-4">质量指标参考</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-amber-600">出酒率达标</span>
                  <span className="text-amber-800 font-medium">≥60%</span>
                </div>
                <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-amber-600">灭菌达标</span>
                  <span className="text-amber-800 font-medium">85°C/25min</span>
                </div>
                <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-amber-600">澄清度</span>
                  <span className="text-amber-800 font-medium">良好</span>
                </div>
                <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '75%' }}></div>
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
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Wine className="w-5 h-5 text-orange-600" />
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
              {selectedBatch.pressing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-orange-600">压榨日期</span>
                      </div>
                      <p className="font-medium text-orange-900">{selectedBatch.pressing.pressDate}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Droplets className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-amber-600">出酒量</span>
                      </div>
                      <p className="font-medium text-amber-900">{selectedBatch.pressing.wineYield} kg</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Thermometer className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-600">灭菌温度</span>
                      </div>
                      <p className="font-medium text-red-900">{selectedBatch.pressing.sterilizeTemp}°C</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-purple-600">灭菌时长</span>
                      </div>
                      <p className="font-medium text-purple-900">{selectedBatch.pressing.sterilizeDuration} 分钟</p>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-green-600 mb-1">投料重量</p>
                        <p className="font-medium text-green-900">{selectedBatch.riceWeight} kg</p>
                      </div>
                      <div>
                        <p className="text-sm text-green-600 mb-1">出酒率</p>
                        <p className="font-bold text-green-900 text-xl font-serif">{yieldRate}%</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <div className="h-2 bg-green-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(yieldRate, 100)}%` }}
                        ></div>
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
              ) : (
                <div className="text-center py-12 bg-orange-50 rounded-xl">
                  <Wine className="w-12 h-12 mx-auto text-orange-400 mb-3 opacity-50" />
                  <p className="text-amber-600">该批次尚未进行压榨煎酒</p>
                  <p className="text-sm text-amber-500 mt-1">请点击「开始压榨」按钮进行操作</p>
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
              {selectedBatch.status === 'pressing' && selectedBatch.pressing && (
                <button
                  onClick={handleAdvanceToCellaring}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-200 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  装坛入库
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showPressModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg animate-slide-up">
            <div className="p-6 border-b border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-amber-900">开始压榨</h3>
                  <p className="text-sm text-amber-500">录入压榨煎酒信息</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-amber-700 mb-2">
                  批次选择 <span className="text-red-500">*</span>
                </label>
                <select
                  value={pressForm.batchId}
                  onChange={(e) => handleBatchChange(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white ${
                    formErrors.batchId ? 'border-red-400' : 'border-amber-200'
                  }`}
                >
                  <option value="">请选择批次</option>
                  {pressingBatches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.batchNo} - {batch.riceType} {batch.riceWeight}kg
                    </option>
                  ))}
                </select>
                {formErrors.batchId && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.batchId}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-amber-700 mb-2">
                    压榨日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={pressForm.pressDate}
                    onChange={(e) => setPressForm({ ...pressForm, pressDate: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                      formErrors.pressDate ? 'border-red-400' : 'border-amber-200'
                    }`}
                  />
                  {formErrors.pressDate && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.pressDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-amber-700 mb-2">
                    出酒量 (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={pressForm.wineYield}
                    onChange={(e) => setPressForm({ ...pressForm, wineYield: Number(e.target.value) })}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                      formErrors.wineYield ? 'border-red-400' : 'border-amber-200'
                    }`}
                  />
                  {formErrors.wineYield && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.wineYield}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-amber-700 mb-2">
                    灭菌温度 (°C) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={pressForm.sterilizeTemp}
                    onChange={(e) => setPressForm({ ...pressForm, sterilizeTemp: Number(e.target.value) })}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                      formErrors.sterilizeTemp ? 'border-red-400' : 'border-amber-200'
                    }`}
                  />
                  {formErrors.sterilizeTemp && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.sterilizeTemp}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-amber-700 mb-2">
                    灭菌时长 (分钟) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={pressForm.sterilizeDuration}
                    onChange={(e) => setPressForm({ ...pressForm, sterilizeDuration: Number(e.target.value) })}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                      formErrors.sterilizeDuration ? 'border-red-400' : 'border-amber-200'
                    }`}
                  />
                  {formErrors.sterilizeDuration && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.sterilizeDuration}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-amber-700 mb-2">
                  操作人 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={pressForm.operator}
                  onChange={(e) => setPressForm({ ...pressForm, operator: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                    formErrors.operator ? 'border-red-400' : 'border-amber-200'
                  }`}
                />
                {formErrors.operator && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.operator}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-amber-700 mb-2">备注</label>
                <textarea
                  value={pressForm.notes}
                  onChange={(e) => setPressForm({ ...pressForm, notes: e.target.value })}
                  rows={2}
                  placeholder="压榨过程备注..."
                  className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                />
              </div>

              <div className="bg-orange-50 rounded-xl p-4">
                <div className="grid grid-cols-3 gap-4 text-center text-xs">
                  <div>
                    <Droplets className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                    <p className="text-amber-600">出酒量</p>
                    <p className="font-bold text-amber-900">{pressForm.wineYield} kg</p>
                  </div>
                  <div>
                    <Thermometer className="w-5 h-5 mx-auto mb-1 text-red-500" />
                    <p className="text-red-600">灭菌温度</p>
                    <p className="font-bold text-red-900">{pressForm.sterilizeTemp}°C</p>
                  </div>
                  <div>
                    <Gauge className="w-5 h-5 mx-auto mb-1 text-green-500" />
                    <p className="text-green-600">出酒率</p>
                    <p className="font-bold text-green-900">
                      {pressForm.batchId && batches.find(b => b.id === pressForm.batchId)
                        ? Math.round((pressForm.wineYield / (batches.find(b => b.id === pressForm.batchId)?.riceWeight || 1)) * 1000) / 10
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-amber-100 flex justify-end gap-3">
              <button
                onClick={() => setShowPressModal(false)}
                className="px-5 py-2.5 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                取消
              </button>
              <button
                onClick={handleSubmitPress}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-200 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                确认压榨
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
