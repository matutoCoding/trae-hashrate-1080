import { useState } from 'react';
import { useBatchStore } from '../../store/useBatchStore';
import StatusBadge from '../../components/StatusBadge';
import {
  Flame,
  Thermometer,
  Leaf,
  Droplets,
  Check,
  Clock,
  User,
  FileText,
  X,
  ArrowRight,
  Plus,
} from 'lucide-react';
import type { Batch, SteamingRecord, FermentationRecord, TempPoint } from '../../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDateTime = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

export default function SteamingPage() {
  const { batches, getBatchesByStatus, updateBatch } = useBatchStore();
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSteamingModal, setShowSteamingModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    steamTemp: 100,
    steamDuration: 45,
    coolTemp: 30,
    yeastAmount: 2.5,
    quAmount: 15,
    operator: '系统管理员',
    notes: '',
  });

  const steamingBatches = getBatchesByStatus('steaming');

  const stats = [
    { label: '待蒸饭', value: steamingBatches.length, icon: Flame, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: '今日蒸饭', value: 3, icon: Plus, color: 'text-green-600', bg: 'bg-green-100' },
    { label: '平均蒸制时间', value: '45', unit: '分钟', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: '落缸成功率', value: '98', unit: '%', icon: Check, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const handleViewDetail = (batch: Batch) => {
    setSelectedBatch(batch);
    setShowDetailModal(true);
  };

  const handleStartSteaming = (batch: Batch) => {
    setSelectedBatch(batch);
    setFormData({
      steamTemp: 100,
      steamDuration: 45,
      coolTemp: 30,
      yeastAmount: Math.round(batch.riceWeight * 0.005 * 10) / 10,
      quAmount: Math.round(batch.riceWeight * 0.03 * 10) / 10,
      operator: '系统管理员',
      notes: '',
    });
    setShowSteamingModal(true);
  };

  const handleSubmitSteaming = () => {
    if (!selectedBatch) return;

    const nowStr = formatDateTime();
    const timeShort = `${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;

    const steamingRecord: SteamingRecord = {
      id: generateId(),
      steamTime: nowStr,
      steamTemp: formData.steamTemp,
      steamDuration: formData.steamDuration,
      coolTemp: formData.coolTemp,
      yeastAmount: formData.yeastAmount,
      quAmount: formData.quAmount,
      jarTime: nowStr,
      status: 'completed',
      notes: formData.notes,
    };

    const initialTempPoint: TempPoint = {
      time: timeShort,
      temperature: formData.coolTemp,
    };

    const fermentationRecord: FermentationRecord = {
      id: generateId(),
      rakeTimes: 0,
      temperature: formData.coolTemp,
      sugarContent: 20,
      alcoholContent: 0,
      tempHistory: [initialTempPoint],
      rakeRecords: [],
      status: 'fermenting',
      notes: '',
    };

    updateBatch(selectedBatch.id, {
      status: 'fermenting',
      currentStage: '前酵开耙',
      steaming: steamingRecord,
      fermentation: fermentationRecord,
    });

    setShowSteamingModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAdvanceToFermentation = () => {
    if (!selectedBatch) return;

    const timeShort = `${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;

    const initialTempPoint: TempPoint = {
      time: timeShort,
      temperature: selectedBatch.steaming?.coolTemp || 30,
    };

    const fermentationRecord: FermentationRecord = {
      id: generateId(),
      rakeTimes: 0,
      temperature: selectedBatch.steaming?.coolTemp || 30,
      sugarContent: 20,
      alcoholContent: 0,
      tempHistory: [initialTempPoint],
      rakeRecords: [],
      status: 'fermenting',
      notes: '',
    };

    updateBatch(selectedBatch.id, {
      status: 'fermenting',
      currentStage: '前酵开耙',
      fermentation: fermentationRecord,
    });

    setShowDetailModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

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
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-amber-900">蒸饭落缸</h2>
            <p className="text-amber-500 text-sm">蒸饭摊冷、酒药麦曲投放、落缸糖化</p>
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

      {steamingBatches.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-200">
          <h3 className="font-serif font-bold text-amber-900 mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            待蒸饭批次 ({steamingBatches.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {steamingBatches.map((batch) => (
              <div
                key={batch.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-orange-100 hover:shadow-md transition-shadow"
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

                <div className="space-y-2 mb-4 text-xs bg-orange-50/50 rounded-lg p-3">
                  <p className="text-amber-600 font-medium mb-2 flex items-center gap-1">
                    <Droplets className="w-3 h-3" />
                    浸泡工序数据
                  </p>
                  {batch.soaking ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-amber-500">浸泡水温</span>
                        <span className="text-blue-600 font-medium">{batch.soaking.waterTemp}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-500">酸度</span>
                        <span className="text-green-600 font-medium">{batch.soaking.acidity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-500">浸泡时长</span>
                        <span className="text-amber-700 font-medium">{batch.soaking.soakHours}小时</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-amber-400">暂无浸泡数据</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleStartSteaming(batch)}
                    className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-1"
                  >
                    <Flame className="w-4 h-4" />
                    开始蒸饭
                  </button>
                  <button
                    onClick={() => handleViewDetail(batch)}
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
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-amber border border-amber-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <h3 className="text-lg font-serif font-bold text-amber-900">蒸饭批次列表</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-amber-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-800">批次号</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-800">米种</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-800">重量(kg)</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-800">浸泡水温</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-800">状态</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-amber-800">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {steamingBatches.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-amber-400">
                        暂无待蒸饭批次
                      </td>
                    </tr>
                  ) : (
                    steamingBatches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-medium text-amber-900 font-mono">{batch.batchNo}</span>
                        </td>
                        <td className="px-6 py-4 text-amber-700">{batch.riceType}</td>
                        <td className="px-6 py-4 text-amber-700">{batch.riceWeight}</td>
                        <td className="px-6 py-4 text-amber-700">
                          {batch.soaking ? `${batch.soaking.waterTemp}°C` : '-'}
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
                              onClick={() => handleStartSteaming(batch)}
                              className="p-2 text-orange-500 hover:text-orange-700 hover:bg-orange-100 rounded-lg transition-colors"
                              title="开始蒸饭"
                            >
                              <ArrowRight className="w-4 h-4" />
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

          <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-serif font-bold mb-3">工艺流程</h3>
            <div className="space-y-3">
              {['淘米浸泡', '上甑蒸饭', '摊风冷饭', '酒药拌曲', '落缸糖化'].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i < 2 ? 'bg-white text-orange-600' : 'bg-orange-400/50 text-white'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className={`text-sm ${i < 2 ? 'text-white' : 'text-orange-200'}`}>{step}</span>
                </div>
              ))}
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
                      <div className="bg-amber-50 rounded-xl p-3">
                        <p className="text-xs text-amber-600 mb-1">蒸制时长</p>
                        <p className="text-sm font-medium text-amber-800">{selectedBatch.steaming.steamDuration}分钟</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-3">
                        <p className="text-xs text-blue-500 mb-1">摊冷温度</p>
                        <p className="text-sm font-medium text-blue-900">{selectedBatch.steaming.coolTemp}°C</p>
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

                    {selectedBatch.steaming.jarTime && (
                      <div className="bg-purple-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Check className="w-4 h-4 text-purple-500" />
                          <span className="text-xs text-purple-600">落缸时间</span>
                        </div>
                        <p className="text-sm font-medium text-purple-900">{selectedBatch.steaming.jarTime}</p>
                      </div>
                    )}

                    {selectedBatch.steaming.notes && (
                      <div className="bg-amber-50 rounded-xl p-3">
                        <p className="text-xs text-amber-600 mb-1">备注</p>
                        <p className="text-sm text-amber-800">{selectedBatch.steaming.notes}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 bg-orange-50 rounded-xl">
                    <Flame className="w-10 h-10 mx-auto text-orange-400 mb-2" />
                    <p className="text-amber-600 mb-3">该批次尚未开始蒸饭</p>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleStartSteaming(selectedBatch);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all"
                    >
                      开始蒸饭
                    </button>
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
              {selectedBatch.steaming && selectedBatch.status === 'steaming' && (
                <button
                  onClick={handleAdvanceToFermentation}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all flex items-center gap-2"
                >
                  进入发酵
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showSteamingModal && selectedBatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg animate-slide-up">
            <div className="p-6 border-b border-amber-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-amber-900">开始蒸饭</h3>
                    <p className="text-sm text-amber-500">{selectedBatch.batchNo}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSteamingModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-xs text-amber-500 mb-1">米种（不可编辑）</p>
                  <p className="font-medium text-amber-900">{selectedBatch.riceType}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-xs text-amber-500 mb-1">投料重量（不可编辑）</p>
                  <p className="font-medium text-amber-900">{selectedBatch.riceWeight} kg</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-amber-700 mb-2">蒸制温度 (°C)</label>
                  <input
                    type="number"
                    value={formData.steamTemp}
                    onChange={(e) => setFormData({ ...formData, steamTemp: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-amber-700 mb-2">蒸制时长 (分钟)</label>
                  <input
                    type="number"
                    value={formData.steamDuration}
                    onChange={(e) => setFormData({ ...formData, steamDuration: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-amber-700 mb-2">摊冷温度 (°C)</label>
                  <input
                    type="number"
                    value={formData.coolTemp}
                    onChange={(e) => setFormData({ ...formData, coolTemp: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-amber-700 mb-2">酒药用量 (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.yeastAmount}
                    onChange={(e) => setFormData({ ...formData, yeastAmount: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-amber-700 mb-2">麦曲用量 (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.quAmount}
                  onChange={(e) => setFormData({ ...formData, quAmount: Number(e.target.value) })}
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
                  value={formData.operator}
                  onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                  className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-amber-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  备注
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="记录蒸饭过程中的注意事项..."
                  className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-amber-100 flex justify-end gap-3">
              <button
                onClick={() => setShowSteamingModal(false)}
                className="px-5 py-2.5 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmitSteaming}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                完成蒸饭落缸
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
