import { useState, useMemo } from 'react';
import { useBatchStore } from '../../store/useBatchStore';
import StatusBadge from '../../components/StatusBadge';
import {
  Thermometer,
  Droplets,
  Percent,
  Plus,
  Check,
  X,
  Wind,
  User,
  FileText,
  ArrowRight,
  Flame,
  Leaf,
  Clock,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Batch, RakeRecord, FermentationRecord, AgingRecord, TempPoint } from '../../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDateTime = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const formatTimeShort = () => {
  const now = new Date();
  return `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

export default function FermentationPage() {
  const { batches, getBatchesByStatus, updateBatch } = useBatchStore();
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRakeModal, setShowRakeModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [rakeForm, setRakeForm] = useState({
    temperature: 30,
    sugarContent: 15,
    alcoholContent: 5,
    operator: '系统管理员',
    notes: '',
  });

  const fermentingBatches = getBatchesByStatus('fermenting');

  const avgTemp = useMemo(() => {
    if (fermentingBatches.length === 0) return 28;
    const total = fermentingBatches.reduce((sum, b) => sum + (b.fermentation?.temperature || 28), 0);
    return Math.round((total / fermentingBatches.length) * 10) / 10;
  }, [fermentingBatches]);

  const avgRakeCount = useMemo(() => {
    if (fermentingBatches.length === 0) return 0;
    const total = fermentingBatches.reduce((sum, b) => sum + (b.fermentation?.rakeRecords.length || 0), 0);
    return Math.round(total / fermentingBatches.length);
  }, [fermentingBatches]);

  const stats = [
    { label: '发酵中', value: fermentingBatches.length, icon: Thermometer, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: '平均温度', value: avgTemp, unit: '°C', icon: Thermometer, color: 'text-red-600', bg: 'bg-red-100' },
    { label: '平均酒精度', value: '8.2', unit: '%', icon: Percent, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: '平均开耙次数', value: avgRakeCount, icon: Wind, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  const chartData = useMemo(() => {
    if (selectedBatch?.fermentation?.tempHistory?.length) {
      return selectedBatch.fermentation.tempHistory;
    }
    return [];
  }, [selectedBatch]);

  const handleViewDetail = (batch: Batch) => {
    setSelectedBatch(batch);
    setShowDetailModal(true);
  };

  const handleOpenRakeModal = (batch: Batch) => {
    setSelectedBatch(batch);
    setRakeForm({
      temperature: batch.fermentation?.temperature || 30,
      sugarContent: batch.fermentation?.sugarContent || 15,
      alcoholContent: batch.fermentation?.alcoholContent || 5,
      operator: '系统管理员',
      notes: '',
    });
    setShowRakeModal(true);
  };

  const handleSubmitRake = () => {
    if (!selectedBatch || !selectedBatch.fermentation) return;

    const nowStr = formatDateTime();
    const timeShort = formatTimeShort();

    const rakeRecord: RakeRecord = {
      id: generateId(),
      time: nowStr,
      temperature: rakeForm.temperature,
      operator: rakeForm.operator,
      notes: rakeForm.notes,
    };

    const newTempPoint: TempPoint = {
      time: timeShort,
      temperature: rakeForm.temperature,
    };

    const newTempHistory = [...(selectedBatch.fermentation.tempHistory || []), newTempPoint].slice(-20);
    const newRakeRecords = [...selectedBatch.fermentation.rakeRecords, rakeRecord];

    const updatedFermentation: FermentationRecord = {
      ...selectedBatch.fermentation,
      temperature: rakeForm.temperature,
      sugarContent: rakeForm.sugarContent,
      alcoholContent: rakeForm.alcoholContent,
      rakeTimes: newRakeRecords.length,
      rakeRecords: newRakeRecords,
      tempHistory: newTempHistory,
    };

    updateBatch(selectedBatch.id, {
      fermentation: updatedFermentation,
    });

    setShowRakeModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAdvanceToAging = () => {
    if (!selectedBatch || !selectedBatch.fermentation) return;

    const nowStr = formatDateTime();
    const dateStr = nowStr.slice(0, 10);

    const agingRecord: AgingRecord = {
      id: generateId(),
      startDate: dateStr,
      days: 0,
      location: '后酵车间A区',
      temp: selectedBatch.fermentation.temperature || 18,
      humidity: 75,
      inspectionRecords: [],
      status: 'aging',
      notes: '',
    };

    updateBatch(selectedBatch.id, {
      status: 'aging',
      currentStage: '后酵养醅',
      fermentation: {
        ...selectedBatch.fermentation,
        status: 'completed',
      },
      aging: agingRecord,
    });

    setShowDetailModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 relative">
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-amber-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-slide-up flex items-center gap-3">
          <Check className="w-6 h-6" />
          <div>
            <p className="font-bold">操作成功！</p>
            <p className="text-sm text-amber-100">批次状态已更新</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
            <Thermometer className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-amber-900">前酵开耙</h2>
            <p className="text-amber-500 text-sm">开耙降温控温、主发酵醪液监测</p>
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

      {fermentingBatches.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
          <h3 className="font-serif font-bold text-amber-900 mb-4 flex items-center gap-2">
            <Wind className="w-5 h-5 text-amber-500" />
            发酵中批次 ({fermentingBatches.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fermentingBatches.map((batch) => (
              <div
                key={batch.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-amber-100 hover:shadow-md transition-shadow"
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

                {batch.fermentation && (
                  <div className="space-y-2 mb-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-amber-500">品温</span>
                      <span className="text-red-600 font-medium">{batch.fermentation.temperature}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-500">糖度</span>
                      <span className="text-purple-600 font-medium">{batch.fermentation.sugarContent}°Bx</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-500">酒精度</span>
                      <span className="text-green-600 font-medium">{batch.fermentation.alcoholContent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-500">开耙次数</span>
                      <span className="text-amber-800 font-medium">{batch.fermentation.rakeRecords.length} 次</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenRakeModal(batch);
                    }}
                    className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg text-sm font-medium hover:from-amber-600 hover:to-amber-700 transition-all flex items-center justify-center gap-1"
                  >
                    <Wind className="w-4 h-4" />
                    记录开耙
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetail(batch);
                    }}
                    className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm hover:bg-amber-200 transition-all"
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
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-bold text-amber-900">
                发酵温度曲线
                {selectedBatch && (
                  <span className="text-sm font-normal text-amber-500"> · {selectedBatch.batchNo}</span>
                )}
              </h3>
              <select
                value={selectedBatch?.id || ''}
                onChange={(e) => {
                  const batch = fermentingBatches.find((b) => b.id === e.target.value);
                  setSelectedBatch(batch || null);
                }}
                className="px-3 py-1.5 text-sm border border-amber-200 rounded-lg bg-white text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">选择批次</option>
                {fermentingBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchNo}
                  </option>
                ))}
              </select>
            </div>
            <div className="h-64">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F5E0CC" />
                    <XAxis dataKey="time" stroke="#CD853F" fontSize={12} />
                    <YAxis stroke="#CD853F" fontSize={12} domain={[20, 35]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFF8E7',
                        border: '1px solid #CD853F',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#8B4513"
                      strokeWidth={2}
                      dot={{ fill: '#8B4513', strokeWidth: 2 }}
                      name="温度(°C)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-amber-400">
                  <div className="text-center">
                    <Thermometer className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>请选择发酵批次查看温度曲线</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-amber border border-amber-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <h3 className="text-lg font-serif font-bold text-amber-900">发酵批次列表</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-amber-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-800">批次号</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-800">品温</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-800">糖度</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-800">酒精度</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-800">开耙次数</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-800">状态</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-amber-800">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {fermentingBatches.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-amber-400">
                        暂无发酵中批次
                      </td>
                    </tr>
                  ) : (
                    fermentingBatches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-medium text-amber-900 font-mono">{batch.batchNo}</span>
                        </td>
                        <td className="px-6 py-4 text-red-600">
                          {batch.fermentation?.temperature || '-'}°C
                        </td>
                        <td className="px-6 py-4 text-purple-600">
                          {batch.fermentation?.sugarContent || '-'}°Bx
                        </td>
                        <td className="px-6 py-4 text-green-600">
                          {batch.fermentation?.alcoholContent || '-'}%
                        </td>
                        <td className="px-6 py-4 text-amber-700">
                          {batch.fermentation?.rakeRecords.length || 0} 次
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
                              onClick={() => handleOpenRakeModal(batch)}
                              className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-colors"
                              title="记录开耙"
                            >
                              <Wind className="w-4 h-4" />
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
            <h3 className="text-lg font-serif font-bold text-amber-900 mb-4">发酵要点</h3>
            <div className="space-y-3 text-sm text-amber-700">
              <p>• 前酵期约3-5天，是主发酵阶段</p>
              <p>• 头耙在品温升至30-31°C时进行</p>
              <p>• 二耙间隔约8-10小时</p>
              <p>• 三耙后品温控制在26-28°C</p>
              <p>• 每天监测糖度、酒精度变化</p>
              <p>• 注意观察醪液形态和气味</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-serif font-bold mb-3">工艺标准</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-amber-100">头耙温度</span>
                <span className="font-medium">30-31°C</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-amber-100">二耙温度</span>
                <span className="font-medium">28-29°C</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-amber-100">控制温度</span>
                <span className="font-medium">26-28°C</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-amber-100">前酵天数</span>
                <span className="font-medium">3-5天</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
            <h3 className="text-lg font-serif font-bold text-amber-900 mb-4">质量指标参考</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-amber-600">糖度下降</span>
                  <span className="text-amber-800 font-medium">正常</span>
                </div>
                <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-amber-600">酒精度上升</span>
                  <span className="text-amber-800 font-medium">正常</span>
                </div>
                <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-amber-600">酸度控制</span>
                  <span className="text-amber-800 font-medium">正常</span>
                </div>
                <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '30%' }}></div>
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
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Thermometer className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-amber-900">{selectedBatch.batchNo}</h3>
                    <p className="text-sm text-amber-500">前酵开耙详情</p>
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
                  <Thermometer className="w-5 h-5 text-amber-500" />
                  前酵工序
                </h4>
                {selectedBatch.fermentation ? (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-red-50 rounded-xl p-3">
                        <p className="text-xs text-red-500 mb-1">当前品温</p>
                        <p className="text-xl font-bold font-serif text-red-800">
                          {selectedBatch.fermentation.temperature}°C
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-3">
                        <p className="text-xs text-purple-500 mb-1">糖度</p>
                        <p className="text-xl font-bold font-serif text-purple-800">
                          {selectedBatch.fermentation.sugarContent}°Bx
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3">
                        <p className="text-xs text-green-600 mb-1">酒精度</p>
                        <p className="text-xl font-bold font-serif text-green-800">
                          {selectedBatch.fermentation.alcoholContent}%
                        </p>
                      </div>
                    </div>

                    <div className="bg-amber-50 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wind className="w-4 h-4 text-amber-500" />
                          <span className="text-xs text-amber-600">开耙次数</span>
                        </div>
                        <span className="font-medium text-amber-900">
                          {selectedBatch.fermentation.rakeRecords.length} 次
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-amber-800">开耙记录</h5>
                        {selectedBatch.status === 'fermenting' && (
                          <button
                            onClick={() => {
                              setShowDetailModal(false);
                              handleOpenRakeModal(selectedBatch);
                            }}
                            className="text-sm px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            新增开耙
                          </button>
                        )}
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedBatch.fermentation.rakeRecords.length === 0 ? (
                          <p className="text-center py-6 text-amber-500 bg-amber-50/50 rounded-xl">
                            暂无开耙记录
                          </p>
                        ) : (
                          selectedBatch.fermentation.rakeRecords
                            .slice()
                            .reverse()
                            .map((rake, idx) => (
                              <div
                                key={rake.id}
                                className="flex items-center justify-between p-3 bg-amber-50/50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm font-bold">
                                    {selectedBatch.fermentation!.rakeRecords.length - idx}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-amber-800">{rake.time}</p>
                                    <p className="text-xs text-amber-500">{rake.operator}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-amber-800 font-medium">{rake.temperature}°C</p>
                                  {rake.notes && <p className="text-xs text-amber-500">{rake.notes}</p>}
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 text-center text-amber-400">
                    暂无发酵记录
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
              {selectedBatch.status === 'fermenting' && selectedBatch.fermentation && (
                <button
                  onClick={handleAdvanceToAging}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-200 flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  推进后酵
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showRakeModal && selectedBatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg animate-slide-up">
            <div className="p-6 border-b border-amber-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Wind className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-amber-900">记录开耙</h3>
                    <p className="text-sm text-amber-500">{selectedBatch.batchNo}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRakeModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-amber-700 mb-2">品温 (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={rakeForm.temperature}
                    onChange={(e) => setRakeForm({ ...rakeForm, temperature: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-amber-700 mb-2">糖度 (°Bx)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={rakeForm.sugarContent}
                    onChange={(e) => setRakeForm({ ...rakeForm, sugarContent: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-amber-700 mb-2">酒精度 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={rakeForm.alcoholContent}
                    onChange={(e) => setRakeForm({ ...rakeForm, alcoholContent: Number(e.target.value) })}
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
                    value={rakeForm.operator}
                    onChange={(e) => setRakeForm({ ...rakeForm, operator: e.target.value })}
                    className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-amber-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  备注
                </label>
                <textarea
                  value={rakeForm.notes}
                  onChange={(e) => setRakeForm({ ...rakeForm, notes: e.target.value })}
                  rows={2}
                  placeholder="开耙过程备注..."
                  className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                />
              </div>

              <div className="bg-amber-50 rounded-xl p-4">
                <div className="grid grid-cols-3 gap-4 text-center text-xs">
                  <div>
                    <Thermometer className="w-5 h-5 mx-auto mb-1 text-red-500" />
                    <p className="text-red-600">品温</p>
                    <p className="font-bold text-red-900">{rakeForm.temperature}°C</p>
                  </div>
                  <div>
                    <Percent className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                    <p className="text-purple-600">糖度</p>
                    <p className="font-bold text-purple-900">{rakeForm.sugarContent}°Bx</p>
                  </div>
                  <div>
                    <Droplets className="w-5 h-5 mx-auto mb-1 text-green-500" />
                    <p className="text-green-600">酒精度</p>
                    <p className="font-bold text-green-800">{rakeForm.alcoholContent}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-amber-100 flex justify-end gap-3">
              <button
                onClick={() => setShowRakeModal(false)}
                className="px-5 py-2.5 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                取消
              </button>
              <button
                onClick={handleSubmitRake}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-200 flex items-center gap-2"
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
