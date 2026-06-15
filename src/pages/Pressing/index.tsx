import { useState, useMemo } from 'react';
import { useBatchStore } from '../../store/useBatchStore';
import StatusBadge from '../../components/StatusBadge';
import {
  Wine,
  Droplets,
  Thermometer,
  Plus,
  Check,
  X,
  Eye,
  User,
  FileText,
  ArrowRight,
  Flame,
  Gauge,
  Clock,
  Calendar,
  Package,
} from 'lucide-react';
import type {
  Batch,
  PressingRecord,
  CellarRecord,
} from '../../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const formatDateTime = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const JAR_CAPACITY = 25;

export default function PressingPage() {
  const { batches, getBatchesByStatus, updateBatch } = useBatchStore();
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPressModal, setShowPressModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [pressForm, setPressForm] = useState({
    sterilizeTemp: 85,
    sterilizeDuration: 25,
    pressDuration: 6,
    operator: '系统管理员',
    notes: '',
  });

  const pressingBatches = getBatchesByStatus('pressing');

  const nextJarNo = useMemo(() => {
    let maxNum = 0;
    batches.forEach((b) => {
      if (b.cellar?.jarNo) {
        const match = b.cellar.jarNo.match(/T-?(\d+)/i);
        if (match) {
          maxNum = Math.max(maxNum, parseInt(match[1], 10));
        }
      }
    });
    return `T-${String(maxNum + 1).padStart(3, '0')}`;
  }, [batches]);

  const totalWineYield = useMemo(() => {
    return batches.reduce((sum, b) => sum + (b.pressing?.wineYield || 0), 0);
  }, [batches]);

  const avgYieldRate = useMemo(() => {
    const validBatches = batches.filter((b) => b.pressing?.wineYield && b.riceWeight);
    if (validBatches.length === 0) return 0;
    const totalRate = validBatches.reduce((sum, b) => {
      const rate = ((b.pressing?.wineYield || 0) / b.riceWeight) * 100;
      return sum + rate;
    }, 0);
    return Math.round((totalRate / validBatches.length) * 10) / 10;
  }, [batches]);

  const avgSterilizeTemp = useMemo(() => {
    const validBatches = batches.filter((b) => b.pressing?.sterilizeTemp);
    if (validBatches.length === 0) return 85;
    const total = validBatches.reduce((sum, b) => sum + (b.pressing?.sterilizeTemp || 0), 0);
    return Math.round((total / validBatches.length) * 10) / 10;
  }, [batches]);

  const stats = [
    { label: '待压榨', value: pressingBatches.length, icon: Wine, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: '总出酒量', value: totalWineYield, unit: 'kg', icon: Droplets, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: '平均出酒率', value: avgYieldRate, unit: '%', icon: Gauge, color: 'text-green-600', bg: 'bg-green-100' },
    { label: '平均灭菌温度', value: avgSterilizeTemp, unit: '°C', icon: Thermometer, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  const handleViewDetail = (batch: Batch) => {
    setSelectedBatch(batch);
    setShowDetailModal(true);
  };

  const handleOpenPressModal = (batch: Batch) => {
    setSelectedBatch(batch);
    setPressForm({
      sterilizeTemp: 85,
      sterilizeDuration: 25,
      pressDuration: 6,
      operator: '系统管理员',
      notes: '',
    });
    setShowPressModal(true);
  };

  const handleSubmitPress = () => {
    if (!selectedBatch) return;

    const dateStr = formatDate();
    const wineYield = Math.round(selectedBatch.riceWeight * 0.65 * 10) / 10;
    const jarCount = Math.ceil(wineYield / JAR_CAPACITY);
    const capacity = jarCount * JAR_CAPACITY;

    const pressingRecord: PressingRecord = {
      id: generateId(),
      pressDate: dateStr,
      wineYield,
      sterilizeTemp: pressForm.sterilizeTemp,
      sterilizeDuration: pressForm.sterilizeDuration,
      pressDuration: pressForm.pressDuration,
      status: 'completed',
      notes: pressForm.notes,
    };

    const cellarRecord: CellarRecord = {
      id: generateId(),
      jarNo: nextJarNo,
      wineAge: 0,
      location: '地下酒窖待分配',
      cellarDate: dateStr,
      capacity,
      remainingCapacity: capacity,
      status: 'stored',
      notes: `操作人：${pressForm.operator}`,
    };

    updateBatch(selectedBatch.id, {
      status: 'cellaring',
      currentStage: '陈酿装坛',
      pressing: pressingRecord,
      cellar: cellarRecord,
      operator: pressForm.operator,
    });

    setShowPressModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAdvanceToCellaring = () => {
    if (!selectedBatch || !selectedBatch.pressing) return;

    const dateStr = formatDate();
    const wineYield = selectedBatch.pressing.wineYield;
    const jarCount = Math.ceil(wineYield / JAR_CAPACITY);
    const capacity = jarCount * JAR_CAPACITY;

    const cellarRecord: CellarRecord = selectedBatch.cellar || {
      id: generateId(),
      jarNo: nextJarNo,
      wineAge: 0,
      location: '地下酒窖待分配',
      cellarDate: dateStr,
      capacity,
      remainingCapacity: capacity,
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
      cellar: {
        ...cellarRecord,
        capacity,
        remainingCapacity: capacity,
      },
    });

    setShowDetailModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const yieldRate = selectedBatch?.pressing?.wineYield && selectedBatch?.riceWeight
    ? Math.round((selectedBatch.pressing.wineYield / selectedBatch.riceWeight) * 1000) / 10
    : 0;

  const previewWineYield = selectedBatch ? Math.round(selectedBatch.riceWeight * 0.65 * 10) / 10 : 0;
  const previewYieldRate = 65;

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
            待压榨批次 ({pressingBatches.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pressingBatches.map((batch) => {
              const expectedYield = Math.round(batch.riceWeight * 0.65 * 10) / 10;
              return (
                <div
                  key={batch.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-orange-100 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewDetail(batch)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-mono font-medium text-amber-900">{batch.batchNo}</p>
                      <p className="text-xs text-amber-500">
                        {batch.riceType} · {batch.riceWeight}kg
                      </p>
                    </div>
                    <StatusBadge status={batch.status} size="sm" />
                  </div>

                  <div className="space-y-2 mb-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-amber-500">预期出酒量</span>
                      <span className="text-orange-600 font-medium">{expectedYield} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-500">预期出酒率</span>
                      <span className="text-green-600 font-medium">65%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-500">后酵天数</span>
                      <span className="text-purple-600 font-medium">
                        {batch.aging?.days || 0} 天
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPressModal(batch);
                      }}
                      className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-1"
                    >
                      <Flame className="w-4 h-4" />
                      开始压榨
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(batch);
                      }}
                      className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200 transition-all"
                    >
                      详情
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-amber border border-amber-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-100 bg-gradient-to-r from-orange-50 to-amber-50">
              <h3 className="text-lg font-serif font-bold text-amber-900">待压榨批次列表</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-amber-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-800">批次号</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-800">米种</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-800">投料重量</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-800">预期出酒</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-800">后酵天数</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-800">状态</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-amber-800">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {pressingBatches.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-amber-400">
                        暂无待压榨批次
                      </td>
                    </tr>
                  ) : (
                    pressingBatches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-medium text-amber-900 font-mono">{batch.batchNo}</span>
                        </td>
                        <td className="px-6 py-4 text-amber-700">{batch.riceType}</td>
                        <td className="px-6 py-4 text-amber-700">{batch.riceWeight} kg</td>
                        <td className="px-6 py-4 text-orange-600 font-medium">
                          {Math.round(batch.riceWeight * 0.65 * 10) / 10} kg
                        </td>
                        <td className="px-6 py-4 text-purple-600">
                          {batch.aging?.days || 0} 天
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={batch.status} size="sm" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewDetail(batch)}
                              className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                              title="查看详情"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenPressModal(batch)}
                              className="p-2 text-orange-500 hover:text-orange-700 hover:bg-orange-100 rounded-lg transition-colors"
                              title="开始压榨"
                            >
                              <Flame className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
                <span className="text-amber-600">每坛容量</span>
                <span className="font-medium text-amber-900">{JAR_CAPACITY} kg</span>
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

      {showDetailModal && selectedBatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-sm text-amber-500 mb-1">米种</p>
                  <p className="font-medium text-amber-900">{selectedBatch.riceType}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-sm text-amber-500 mb-1">投料重量</p>
                  <p className="font-medium text-amber-900">{selectedBatch.riceWeight} kg</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-amber-800 flex items-center gap-2 text-lg">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  浸泡工序
                </h4>
                {selectedBatch.soaking ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-blue-50 rounded-xl p-3">
                      <p className="text-xs text-blue-500 mb-1">开始时间</p>
                      <p className="text-sm font-medium text-blue-900">{selectedBatch.soaking.startTime}</p>
                    </div>
                    <div className="bg-cyan-50 rounded-xl p-3">
                      <p className="text-xs text-cyan-600 mb-1">浸泡水温</p>
                      <p className="text-sm font-medium text-cyan-800">{selectedBatch.soaking.waterTemp}°C</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3">
                      <p className="text-xs text-green-600 mb-1">酸度</p>
                      <p className="text-sm font-medium text-green-800">{selectedBatch.soaking.acidity}</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3">
                      <p className="text-xs text-purple-600 mb-1">浸泡时长</p>
                      <p className="text-sm font-medium text-purple-800">{selectedBatch.soaking.soakHours}小时</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 text-center text-amber-400">
                    暂无浸泡记录
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-amber-800 flex items-center gap-2 text-lg">
                  <Flame className="w-5 h-5 text-orange-500" />
                  蒸饭工序
                </h4>
                {selectedBatch.steaming ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-orange-50 rounded-xl p-3">
                      <p className="text-xs text-orange-500 mb-1">蒸饭时间</p>
                      <p className="text-sm font-medium text-orange-900">{selectedBatch.steaming.steamTime}</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-3">
                      <p className="text-xs text-red-500 mb-1">蒸制温度</p>
                      <p className="text-sm font-medium text-red-900">{selectedBatch.steaming.steamTemp}°C</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3">
                      <p className="text-xs text-blue-500 mb-1">摊冷温度</p>
                      <p className="text-sm font-medium text-blue-900">{selectedBatch.steaming.coolTemp}°C</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3">
                      <p className="text-xs text-amber-600 mb-1">蒸制时长</p>
                      <p className="text-sm font-medium text-amber-800">{selectedBatch.steaming.steamDuration}分钟</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 text-center text-amber-400">
                    暂无蒸饭记录
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-amber-800 flex items-center gap-2 text-lg">
                  <Thermometer className="w-5 h-5 text-red-500" />
                  前酵工序
                </h4>
                {selectedBatch.fermentation ? (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-red-50 rounded-xl p-3">
                        <p className="text-xs text-red-500 mb-1">品温</p>
                        <p className="text-lg font-bold font-serif text-red-800">
                          {selectedBatch.fermentation.temperature}°C
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-3">
                        <p className="text-xs text-purple-500 mb-1">糖度</p>
                        <p className="text-lg font-bold font-serif text-purple-800">
                          {selectedBatch.fermentation.sugarContent}°Bx
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3">
                        <p className="text-xs text-green-600 mb-1">酒精度</p>
                        <p className="text-lg font-bold font-serif text-green-800">
                          {selectedBatch.fermentation.alcoholContent}%
                        </p>
                      </div>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-amber-600">开耙次数</span>
                        <span className="font-medium text-amber-900">
                          {selectedBatch.fermentation.rakeRecords.length} 次
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 text-center text-amber-400">
                    暂无发酵记录
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-amber-800 flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 text-purple-500" />
                  后酵工序
                </h4>
                {selectedBatch.aging ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-green-50 rounded-xl p-3">
                      <p className="text-xs text-green-600 mb-1">开始日期</p>
                      <p className="text-sm font-medium text-green-800">{selectedBatch.aging.startDate || '-'}</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3">
                      <p className="text-xs text-purple-600 mb-1">养醅天数</p>
                      <p className="text-sm font-medium text-purple-800">{selectedBatch.aging.days || 0} 天</p>
                    </div>
                    <div className="bg-cyan-50 rounded-xl p-3">
                      <p className="text-xs text-cyan-600 mb-1">环境温度</p>
                      <p className="text-sm font-medium text-cyan-800">{selectedBatch.aging.temp || '-'}°C</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3">
                      <p className="text-xs text-blue-600 mb-1">环境湿度</p>
                      <p className="text-sm font-medium text-blue-800">{selectedBatch.aging.humidity || '-'}%</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 text-center text-amber-400">
                    暂无养醅记录
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-amber-800 flex items-center gap-2 text-lg">
                  <Wine className="w-5 h-5 text-orange-500" />
                  压榨工序
                </h4>
                {selectedBatch.pressing ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-orange-50 rounded-xl p-3">
                        <p className="text-xs text-orange-500 mb-1">压榨日期</p>
                        <p className="text-sm font-medium text-orange-900">{selectedBatch.pressing.pressDate}</p>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-3">
                        <p className="text-xs text-amber-600 mb-1">出酒量</p>
                        <p className="text-sm font-medium text-amber-800">{selectedBatch.pressing.wineYield} kg</p>
                      </div>
                      <div className="bg-red-50 rounded-xl p-3">
                        <p className="text-xs text-red-500 mb-1">灭菌温度</p>
                        <p className="text-sm font-medium text-red-900">{selectedBatch.pressing.sterilizeTemp}°C</p>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-3">
                        <p className="text-xs text-purple-600 mb-1">灭菌时长</p>
                        <p className="text-sm font-medium text-purple-800">{selectedBatch.pressing.sterilizeDuration} 分钟</p>
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
                  <div className="text-center py-8 bg-orange-50 rounded-xl">
                    <Wine className="w-12 h-12 mx-auto text-orange-400 mb-3 opacity-50" />
                    <p className="text-amber-600">该批次尚未进行压榨煎酒</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-amber-100 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2.5 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                关闭
              </button>
              {selectedBatch.status === 'pressing' && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleOpenPressModal(selectedBatch);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-200 flex items-center gap-2"
                >
                  <Flame className="w-4 h-4" />
                  开始压榨
                </button>
              )}
              {selectedBatch.status === 'pressing' && selectedBatch.pressing && (
                <button
                  onClick={handleAdvanceToCellaring}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-200 flex items-center gap-2"
                >
                  装坛入库
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showPressModal && selectedBatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg animate-slide-up">
            <div className="p-6 border-b border-amber-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-amber-900">开始压榨</h3>
                    <p className="text-sm text-amber-500">{selectedBatch.batchNo}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPressModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-amber-50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-amber-500 mb-1">米种</p>
                    <p className="font-medium text-amber-900">{selectedBatch.riceType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-500 mb-1">投料重量</p>
                    <p className="font-medium text-amber-900">{selectedBatch.riceWeight} kg</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-amber-700 mb-2">灭菌温度 (°C)</label>
                  <input
                    type="number"
                    step="1"
                    value={pressForm.sterilizeTemp}
                    onChange={(e) => setPressForm({ ...pressForm, sterilizeTemp: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-amber-700 mb-2">灭菌时长 (分钟)</label>
                  <input
                    type="number"
                    step="1"
                    value={pressForm.sterilizeDuration}
                    onChange={(e) => setPressForm({ ...pressForm, sterilizeDuration: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-amber-700 mb-2">压榨时长 (小时)</label>
                <input
                  type="number"
                  step="0.5"
                  value={pressForm.pressDuration}
                  onChange={(e) => setPressForm({ ...pressForm, pressDuration: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-amber-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  操作人
                </label>
                <input
                  type="text"
                  value={pressForm.operator}
                  onChange={(e) => setPressForm({ ...pressForm, operator: e.target.value })}
                  className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-amber-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  备注
                </label>
                <textarea
                  value={pressForm.notes}
                  onChange={(e) => setPressForm({ ...pressForm, notes: e.target.value })}
                  rows={2}
                  placeholder="压榨过程备注..."
                  className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                />
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                <p className="text-sm font-medium text-amber-800 mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  实时预览
                </p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <Droplets className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                    <p className="text-xs text-amber-600">出酒量</p>
                    <p className="font-bold text-amber-900">{previewWineYield} kg</p>
                  </div>
                  <div>
                    <Thermometer className="w-5 h-5 mx-auto mb-1 text-red-500" />
                    <p className="text-xs text-red-600">灭菌温度</p>
                    <p className="font-bold text-red-900">{pressForm.sterilizeTemp}°C</p>
                  </div>
                  <div>
                    <Gauge className="w-5 h-5 mx-auto mb-1 text-green-500" />
                    <p className="text-xs text-green-600">出酒率</p>
                    <p className="font-bold text-green-900">{previewYieldRate}%</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-amber-600">出酒率进度</span>
                    <span className="text-amber-800 font-medium">{previewYieldRate}%</span>
                  </div>
                  <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-300"
                      style={{ width: `${previewYieldRate}%` }}
                    ></div>
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
