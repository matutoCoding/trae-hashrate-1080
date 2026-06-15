import { useState, useMemo } from 'react';
import { useBatchStore } from '../../store/useBatchStore';
import StatusBadge from '../../components/StatusBadge';
import {
  Clock,
  Thermometer,
  Droplets,
  Plus,
  Check,
  X,
  Eye,
  User,
  FileText,
  ArrowRight,
  Flame,
  Leaf,
  Wind,
  MapPin,
} from 'lucide-react';
import type {
  Batch,
  InspectionRecord,
  AgingRecord,
  PressingRecord,
} from '../../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDateTime = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const formatDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export default function AgingPage() {
  const { batches, getBatchesByStatus, updateBatch } = useBatchStore();
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [inspectForm, setInspectForm] = useState({
    temperature: 18,
    humidity: 75,
    alcoholContent: 14,
    acidity: 0.45,
    taste: '醇和',
    operator: '系统管理员',
    notes: '',
  });

  const agingBatches = getBatchesByStatus('aging');

  const avgTemp = useMemo(() => {
    if (agingBatches.length === 0) return 18;
    const total = agingBatches.reduce((sum, b) => sum + (b.aging?.temp || 18), 0);
    return Math.round((total / agingBatches.length) * 10) / 10;
  }, [agingBatches]);

  const avgHumidity = useMemo(() => {
    if (agingBatches.length === 0) return 75;
    const total = agingBatches.reduce((sum, b) => sum + (b.aging?.humidity || 75), 0);
    return Math.round(total / agingBatches.length);
  }, [agingBatches]);

  const totalInspections = useMemo(() => {
    return agingBatches.reduce((sum, b) => sum + (b.aging?.inspectionRecords.length || 0), 0);
  }, [agingBatches]);

  const stats = [
    { label: '养醅中', value: agingBatches.length, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: '平均环境温度', value: avgTemp, unit: '°C', icon: Thermometer, color: 'text-green-600', bg: 'bg-green-100' },
    { label: '平均环境湿度', value: avgHumidity, unit: '%', icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-100' },
    { label: '抽检次数', value: totalInspections, icon: Eye, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  const handleViewDetail = (batch: Batch) => {
    setSelectedBatch(batch);
    setShowDetailModal(true);
  };

  const handleOpenInspectModal = (batch: Batch) => {
    setSelectedBatch(batch);
    const lastRecord = batch.aging?.inspectionRecords[batch.aging.inspectionRecords.length - 1];
    setInspectForm({
      temperature: lastRecord?.temperature || batch.aging?.temp || 18,
      humidity: lastRecord?.humidity || batch.aging?.humidity || 75,
      alcoholContent: 14,
      acidity: 0.45,
      taste: lastRecord?.taste || '醇和',
      operator: '系统管理员',
      notes: '',
    });
    setShowInspectModal(true);
  };

  const handleSubmitInspect = () => {
    if (!selectedBatch || !selectedBatch.aging) return;

    const nowStr = formatDateTime();
    const dateStr = formatDate();

    const inspectionRecord: InspectionRecord = {
      id: generateId(),
      date: dateStr,
      temperature: inspectForm.temperature,
      humidity: inspectForm.humidity,
      taste: inspectForm.taste,
      operator: inspectForm.operator,
    };

    const startDate = selectedBatch.aging.startDate
      ? new Date(selectedBatch.aging.startDate)
      : new Date();
    const days = Math.max(1, Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    const updatedAging: AgingRecord = {
      ...selectedBatch.aging,
      temp: inspectForm.temperature,
      humidity: inspectForm.humidity,
      days,
      inspectionRecords: [...selectedBatch.aging.inspectionRecords, inspectionRecord],
      notes: inspectForm.notes || selectedBatch.aging.notes,
    };

    updateBatch(selectedBatch.id, {
      aging: updatedAging,
    });

    setShowInspectModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAdvanceToPressing = () => {
    if (!selectedBatch || !selectedBatch.aging) return;

    const nowStr = formatDateTime();
    const dateStr = formatDate();

    const pressingRecord: PressingRecord = {
      id: generateId(),
      pressDate: dateStr,
      wineYield: Math.round(selectedBatch.riceWeight * 0.65 * 10) / 10,
      sterilizeTemp: 85,
      sterilizeDuration: 25,
      pressDuration: 6,
      status: 'pending',
      notes: '',
    };

    updateBatch(selectedBatch.id, {
      status: 'pressing',
      currentStage: '压榨煎酒',
      aging: {
        ...selectedBatch.aging,
        status: 'completed',
      },
      pressing: pressingRecord,
    });

    setShowDetailModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 relative">
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-purple-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-slide-up flex items-center gap-3">
          <Check className="w-6 h-6" />
          <div>
            <p className="font-bold">操作成功！</p>
            <p className="text-sm text-purple-100">批次状态已更新</p>
          </div>
        </div>
      )}

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

      {agingBatches.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-200">
          <h3 className="font-serif font-bold text-amber-900 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-500" />
            养醅中批次 ({agingBatches.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agingBatches.map((batch) => (
              <div
                key={batch.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-purple-100 hover:shadow-md transition-shadow"
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

                {batch.aging && (
                  <div className="space-y-2 mb-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-amber-500">开始时间</span>
                      <span className="text-amber-800">{batch.aging.startDate || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-500">环境温度</span>
                      <span className="text-green-600 font-medium">{batch.aging.temp || 18}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-500">环境湿度</span>
                      <span className="text-cyan-600 font-medium">{batch.aging.humidity || 75}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-500">抽检次数</span>
                      <span className="text-purple-600 font-medium">
                        {batch.aging.inspectionRecords.length} 次
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenInspectModal(batch);
                    }}
                    className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-purple-700 transition-all flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    抽检
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetail(batch);
                    }}
                    className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-all"
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
          <div className="bg-white rounded-2xl shadow-amber border border-amber-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-100 bg-gradient-to-r from-purple-50 to-pink-50">
              <h3 className="text-lg font-serif font-bold text-amber-900">养醅批次列表</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-amber-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-800">批次号</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-800">开始时间</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-800">温度</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-800">湿度</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-800">抽检次数</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-800">状态</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-amber-800">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {agingBatches.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-amber-400">
                        暂无养醅中批次
                      </td>
                    </tr>
                  ) : (
                    agingBatches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-medium text-amber-900 font-mono">{batch.batchNo}</span>
                        </td>
                        <td className="px-6 py-4 text-amber-700">{batch.aging?.startDate || '-'}</td>
                        <td className="px-6 py-4 text-green-600">{batch.aging?.temp || '-'}°C</td>
                        <td className="px-6 py-4 text-cyan-600">{batch.aging?.humidity || '-'}%</td>
                        <td className="px-6 py-4 text-purple-600">
                          {batch.aging?.inspectionRecords.length || 0} 次
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
                              onClick={() => handleOpenInspectModal(batch)}
                              className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
                              title="抽检记录"
                            >
                              <Eye className="w-4 h-4" />
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
            <h3 className="text-lg font-serif font-bold text-amber-900 mb-4">养醅环境标准</h3>
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
              {agingBatches.length === 0 ? (
                <p className="text-center text-amber-500 py-4 text-sm">暂无即将完成的批次</p>
              ) : (
                agingBatches.slice(0, 3).map((batch) => (
                  <div key={batch.id} className="p-3 bg-purple-50 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-amber-800 text-sm">{batch.batchNo}</span>
                      <span className="text-xs text-purple-600">养醅中</span>
                    </div>
                    <div className="h-1.5 bg-purple-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${Math.min((batch.aging?.days || 0) / 25, 1) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
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
                  <>
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
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Leaf className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-green-600">酒药用量</span>
                        </div>
                        <p className="text-sm font-medium text-green-900">{selectedBatch.steaming.yeastAmount} kg</p>
                      </div>
                      <div className="bg-yellow-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Leaf className="w-4 h-4 text-yellow-600" />
                          <span className="text-xs text-yellow-700">麦曲用量</span>
                        </div>
                        <p className="text-sm font-medium text-yellow-800">{selectedBatch.steaming.quAmount} kg</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 text-center text-amber-400">
                    暂无蒸饭记录
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-amber-800 flex items-center gap-2 text-lg">
                  <Wind className="w-5 h-5 text-amber-500" />
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
                  <>
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

                    {selectedBatch.aging.location && (
                      <div className="bg-amber-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-amber-500" />
                          <span className="text-xs text-amber-600">存放位置</span>
                        </div>
                        <p className="text-sm font-medium text-amber-900">{selectedBatch.aging.location}</p>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-amber-800">抽检记录</h5>
                        {selectedBatch.status === 'aging' && (
                          <button
                            onClick={() => {
                              setShowDetailModal(false);
                              handleOpenInspectModal(selectedBatch);
                            }}
                            className="text-sm px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            新增抽检
                          </button>
                        )}
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedBatch.aging.inspectionRecords.length === 0 ? (
                          <p className="text-center py-6 text-amber-500 bg-amber-50/50 rounded-xl">
                            暂无抽检记录
                          </p>
                        ) : (
                          selectedBatch.aging.inspectionRecords
                            .slice()
                            .reverse()
                            .map((record, idx) => (
                              <div
                                key={record.id}
                                className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                    {selectedBatch.aging!.inspectionRecords.length - idx}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-amber-800">{record.date}</p>
                                    <p className="text-xs text-amber-500">{record.operator}</p>
                                  </div>
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
                            ))
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 text-center text-amber-400">
                    暂无养醅记录
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
              {selectedBatch.status === 'aging' && selectedBatch.aging && (
                <button
                  onClick={handleAdvanceToPressing}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-200 flex items-center gap-2"
                >
                  推进压榨
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showInspectModal && selectedBatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg animate-slide-up">
            <div className="p-6 border-b border-amber-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-amber-900">抽检记录</h3>
                    <p className="text-sm text-amber-500">{selectedBatch.batchNo}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInspectModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-amber-700 mb-2">环境温度 (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inspectForm.temperature}
                    onChange={(e) => setInspectForm({ ...inspectForm, temperature: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-amber-700 mb-2">环境湿度 (%)</label>
                  <input
                    type="number"
                    step="1"
                    value={inspectForm.humidity}
                    onChange={(e) => setInspectForm({ ...inspectForm, humidity: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-amber-700 mb-2">酒精度 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inspectForm.alcoholContent}
                    onChange={(e) => setInspectForm({ ...inspectForm, alcoholContent: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-amber-700 mb-2">酸度 (g/100ml)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={inspectForm.acidity}
                    onChange={(e) => setInspectForm({ ...inspectForm, acidity: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-amber-700 mb-2">口感评估</label>
                <select
                  value={inspectForm.taste}
                  onChange={(e) => setInspectForm({ ...inspectForm, taste: e.target.value })}
                  className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                >
                  <option value="醇和">醇和</option>
                  <option value="醇厚">醇厚</option>
                  <option value="鲜甜">鲜甜</option>
                  <option value="清爽">清爽</option>
                  <option value="浓郁">浓郁</option>
                  <option value="偏酸">偏酸</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-amber-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  操作人
                </label>
                <input
                  type="text"
                  value={inspectForm.operator}
                  onChange={(e) => setInspectForm({ ...inspectForm, operator: e.target.value })}
                  className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-amber-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  备注
                </label>
                <textarea
                  value={inspectForm.notes}
                  onChange={(e) => setInspectForm({ ...inspectForm, notes: e.target.value })}
                  rows={2}
                  placeholder="抽检备注..."
                  className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-amber-100 flex justify-end gap-3">
              <button
                onClick={() => setShowInspectModal(false)}
                className="px-5 py-2.5 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                取消
              </button>
              <button
                onClick={handleSubmitInspect}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-200 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                确认记录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
