import { useState, useMemo } from 'react';
import { useBatchStore } from '../../store/useBatchStore';
import StatusBadge from '../../components/StatusBadge';
import {
  Archive,
  Calendar,
  MapPin,
  Droplets,
  Plus,
  Check,
  X,
  Eye,
  User,
  FileText,
  Package,
  Wine,
  Flame,
  Thermometer,
  Clock,
  ArrowRight,
} from 'lucide-react';
import type {
  Batch,
  CellarRecord,
} from '../../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

type FilterType = 'all' | 'cellaring' | 'ready' | 'partial';

export default function CellarPage() {
  const { batches, getBatchesByStatus, updateBatch } = useBatchStore();
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const [formData, setFormData] = useState({
    batchId: '',
    jarNo: '',
    wineAge: 0,
    capacity: 25,
    location: '地下酒窖A区',
    operator: '系统管理员',
    notes: '',
  });

  const allCellarBatches = useMemo(
    () => batches.filter((b) => b.cellar && ['cellaring', 'finished', 'sold'].includes(b.status)),
    [batches]
  );

  const cellaringBatches = getBatchesByStatus('cellaring');
  const finishedBatches = getBatchesByStatus('finished');
  const pressingBatches = getBatchesByStatus('pressing');

  const nextJarNo = useMemo(() => {
    let maxNum = 0;
    allCellarBatches.forEach((b) => {
      if (b.cellar?.jarNo) {
        const match = b.cellar.jarNo.match(/T-?(\d+)/i);
        if (match) {
          maxNum = Math.max(maxNum, parseInt(match[1], 10));
        }
      }
    });
    return `T-${String(maxNum + 1).padStart(3, '0')}`;
  }, [allCellarBatches]);

  const filteredJars = useMemo(() => {
    switch (filter) {
      case 'cellaring':
        return cellaringBatches.filter((b) => b.cellar?.status === 'stored' || b.cellar?.status === 'aging');
      case 'ready':
        return allCellarBatches.filter((b) => b.cellar?.status === 'ready');
      case 'partial':
        return allCellarBatches.filter((b) => b.cellar?.status === 'partial');
      default:
        return allCellarBatches;
    }
  }, [filter, allCellarBatches, cellaringBatches]);

  const totalJars = allCellarBatches.length;
  const totalCapacity = useMemo(() => {
    return allCellarBatches.reduce((sum, b) => sum + (b.cellar?.capacity || 0), 0);
  }, [allCellarBatches]);
  const readyCount = finishedBatches.length;
  const cellaringCount = cellaringBatches.length;

  const stats = [
    { label: '酒坛总数', value: totalJars, unit: '坛', icon: Archive, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: '总储量', value: totalCapacity, unit: 'kg', icon: Droplets, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: '陈酿中', value: cellaringCount, unit: '坛', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: '可出库', value: readyCount, unit: '坛', icon: Package, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  const filterOptions = [
    { key: 'all' as const, label: '全部' },
    { key: 'cellaring' as const, label: '陈酿中' },
    { key: 'ready' as const, label: '可出库' },
    { key: 'partial' as const, label: '部分出库' },
  ];

  const wineAgeGroups = useMemo(() => {
    const groups: Record<string, Batch[]> = {
      '1年以下': [],
      '1-3年': [],
      '3-5年': [],
      '5年以上': [],
    };
    allCellarBatches.forEach((b) => {
      const age = b.cellar?.wineAge || 0;
      if (age < 1) groups['1年以下'].push(b);
      else if (age < 3) groups['1-3年'].push(b);
      else if (age < 5) groups['3-5年'].push(b);
      else groups['5年以上'].push(b);
    });
    return Object.entries(groups).map(([age, list]) => ({
      age,
      count: list.length,
    }));
  }, [allCellarBatches]);

  const locationDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    allCellarBatches.forEach((b) => {
      const loc = b.cellar?.location || '未指定';
      map[loc] = (map[loc] || 0) + 1;
    });
    const total = allCellarBatches.length || 1;
    return Object.entries(map).map(([name, count]) => ({
      name,
      count,
      percent: (count / total) * 100,
    }));
  }, [allCellarBatches]);

  const handleViewDetail = (batch: Batch) => {
    setSelectedBatch(batch);
    setShowDetailModal(true);
  };

  const handleOpenForm = () => {
    const availableBatches = [...pressingBatches, ...cellaringBatches.filter((b) => !b.cellar?.jarNo)];
    if (availableBatches.length === 0) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      return;
    }
    const firstBatch = availableBatches[0];
    setFormData({
      batchId: firstBatch.id,
      jarNo: nextJarNo,
      wineAge: 0,
      capacity: firstBatch.cellar?.capacity || 25,
      location: '地下酒窖A区',
      operator: '系统管理员',
      notes: '',
    });
    setShowFormModal(true);
  };

  const handleBatchChange = (batchId: string) => {
    const batch = batches.find((b) => b.id === batchId);
    if (batch) {
      setFormData({
        ...formData,
        batchId,
        capacity: batch.cellar?.capacity || 25,
      });
    }
  };

  const handleSubmitForm = () => {
    const targetBatch = batches.find((b) => b.id === formData.batchId);
    if (!targetBatch) return;

    const dateStr = formatDate();

    const cellarRecord: CellarRecord = {
      id: targetBatch.cellar?.id || generateId(),
      jarNo: formData.jarNo,
      wineAge: formData.wineAge,
      location: formData.location,
      cellarDate: dateStr,
      capacity: formData.capacity,
      remainingCapacity: formData.capacity,
      status: 'stored',
      notes: formData.notes || targetBatch.cellar?.notes,
    };

    updateBatch(targetBatch.id, {
      status: 'cellaring',
      currentStage: '陈酿装坛',
      cellar: cellarRecord,
      operator: formData.operator,
    });

    setShowFormModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleMarkReady = () => {
    if (!selectedBatch || !selectedBatch.cellar) return;

    updateBatch(selectedBatch.id, {
      status: 'finished',
      currentStage: '成品销售',
      cellar: {
        ...selectedBatch.cellar,
        status: 'ready',
      },
    });

    setShowDetailModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const availableForCellaring = useMemo(() => {
    return [...pressingBatches, ...cellaringBatches.filter((b) => !b.cellar?.jarNo)];
  }, [pressingBatches, cellaringBatches]);

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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg">
            <Archive className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-amber-900">陈酿装坛</h2>
            <p className="text-amber-500 text-sm">陶坛陈酿堆放、酒龄年份登记</p>
          </div>
        </div>
        <button
          onClick={handleOpenForm}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-200 flex items-center gap-2"
        >
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
              <h3 className="text-lg font-serif font-bold text-amber-900 flex items-center gap-2">
                <Wine className="w-5 h-5 text-amber-600" />
                酒坛库存
              </h3>
              <div className="flex items-center gap-2">
                {filterOptions.map((item) => (
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

            {filteredJars.length === 0 ? (
              <div className="text-center py-12">
                <Archive className="w-16 h-16 mx-auto text-amber-200 mb-3" />
                <p className="text-amber-500">暂无酒坛数据</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredJars.map((batch) => {
                  const cellar = batch.cellar;
                  const remainingPercent = cellar?.capacity
                    ? (cellar.remainingCapacity / cellar.capacity) * 100
                    : 100;

                  return (
                    <div
                      key={batch.id}
                      onClick={() => handleViewDetail(batch)}
                      className="p-4 bg-gradient-to-b from-amber-50 to-orange-50 rounded-xl cursor-pointer hover:from-amber-100 hover:to-orange-100 transition-all border border-amber-200/50 hover:shadow-lg hover:border-amber-300"
                    >
                      <div className="relative w-16 h-20 mx-auto mb-3">
                        <div className="absolute inset-x-2 top-0 bottom-0 bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700 rounded-b-full rounded-t-lg shadow-inner">
                          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-6 h-3 bg-amber-800 rounded-t-sm"></div>
                          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-10 h-1 bg-amber-400/30 rounded-full"></div>
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-10 h-1 bg-amber-400/20 rounded-full"></div>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-amber-100 rounded text-[10px] font-bold text-amber-700">
                            {cellar?.jarNo || 'T-000'}
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="font-mono font-bold text-amber-900 text-sm">
                          {cellar?.jarNo || 'T-000'}
                        </p>
                        <p className="text-xs text-amber-500 mt-0.5">
                          {cellar?.wineAge || 0}年陈酿
                        </p>
                        <p className="text-xs text-amber-600 mt-0.5">
                          {cellar?.capacity || 25}kg
                        </p>
                        {cellar && cellar.remainingCapacity < cellar.capacity && (
                          <div className="mt-2">
                            <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full transition-all"
                                style={{ width: `${remainingPercent}%` }}
                              ></div>
                            </div>
                            <p className="text-[10px] text-amber-500 mt-1">
                              剩余 {cellar.remainingCapacity}kg
                            </p>
                          </div>
                        )}
                        <div className="mt-2">
                          <StatusBadge status={batch.status} size="sm" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
            <h3 className="text-lg font-serif font-bold text-amber-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              酒龄分布
            </h3>
            <div className="space-y-4">
              {wineAgeGroups.map((group) => (
                <div key={group.age}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-amber-700 font-medium">{group.age}</span>
                    <span className="text-amber-500">{group.count} 坛</span>
                  </div>
                  <div className="h-3 bg-amber-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500"
                      style={{ width: `${totalJars ? (group.count / totalJars) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
            <h3 className="text-lg font-serif font-bold text-amber-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              酒窖分布
            </h3>
            <div className="space-y-3">
              {locationDistribution.length === 0 ? (
                <p className="text-center text-amber-500 py-4 text-sm">暂无分布数据</p>
              ) : (
                locationDistribution.map((area, idx) => {
                  const colors = [
                    'bg-amber-500',
                    'bg-orange-500',
                    'bg-green-500',
                    'bg-blue-500',
                    'bg-purple-500',
                  ];
                  return (
                    <div key={area.name} className="p-3 bg-amber-50 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-amber-800 font-medium">
                          {area.name}
                        </span>
                        <span className="text-sm text-amber-600">{area.count} 坛</span>
                      </div>
                      <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors[idx % colors.length]} rounded-full transition-all duration-500`}
                          style={{ width: `${area.percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-serif font-bold mb-3 flex items-center gap-2">
              <Archive className="w-5 h-5" />
              陈酿要点
            </h3>
            <div className="space-y-2 text-sm text-amber-100">
              <p>• 陶坛透气，有助于酒的老熟</p>
              <p>• 恒温恒湿环境，温度15-20°C</p>
              <p>• 湿度保持在70%左右</p>
              <p>• 定期检查，防止渗漏</p>
              <p>• 做好酒龄登记，先进先出</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
            <h3 className="text-lg font-serif font-bold text-amber-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-green-500" />
              近期可出库
            </h3>
            <div className="space-y-3">
              {finishedBatches.length === 0 ? (
                <p className="text-center text-amber-500 py-4 text-sm">暂无可出库酒坛</p>
              ) : (
                finishedBatches.slice(0, 3).map((batch) => (
                  <div
                    key={batch.id}
                    onClick={() => handleViewDetail(batch)}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-xl cursor-pointer hover:bg-green-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-amber-900 text-sm">
                        {batch.cellar?.jarNo}
                      </p>
                      <p className="text-xs text-amber-500">
                        {batch.cellar?.wineAge}年陈酿 · {batch.cellar?.capacity}kg
                      </p>
                    </div>
                    <Eye className="w-4 h-4 text-green-600" />
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
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Archive className="w-5 h-5 text-amber-600" />
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
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 text-center text-amber-400">
                    暂无压榨记录
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-amber-800 flex items-center gap-2 text-lg">
                  <Archive className="w-5 h-5 text-amber-600" />
                  陈酿工序
                </h4>
                {selectedBatch.cellar ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-amber-50 rounded-xl p-3">
                        <p className="text-xs text-amber-600 mb-1">坛号</p>
                        <p className="text-sm font-bold font-mono text-amber-800">{selectedBatch.cellar.jarNo}</p>
                      </div>
                      <div className="bg-orange-50 rounded-xl p-3">
                        <p className="text-xs text-orange-500 mb-1">酒龄</p>
                        <p className="text-sm font-medium text-orange-900">{selectedBatch.cellar.wineAge} 年</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3">
                        <p className="text-xs text-green-600 mb-1">容量</p>
                        <p className="text-sm font-medium text-green-800">{selectedBatch.cellar.capacity} kg</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-3">
                        <p className="text-xs text-blue-600 mb-1">剩余容量</p>
                        <p className="text-sm font-medium text-blue-800">{selectedBatch.cellar.remainingCapacity} kg</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-purple-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-purple-500" />
                          <span className="text-xs text-purple-600">存放位置</span>
                        </div>
                        <p className="text-sm font-medium text-purple-800">{selectedBatch.cellar.location}</p>
                      </div>
                      <div className="bg-cyan-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-cyan-500" />
                          <span className="text-xs text-cyan-600">入窖日期</span>
                        </div>
                        <p className="text-sm font-medium text-cyan-800">{selectedBatch.cellar.cellarDate}</p>
                      </div>
                    </div>

                    {selectedBatch.cellar.notes && (
                      <div className="bg-amber-50 rounded-xl p-4">
                        <p className="text-sm text-amber-600 mb-1">备注</p>
                        <p className="text-amber-800">{selectedBatch.cellar.notes}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 bg-amber-50 rounded-xl">
                    <Archive className="w-12 h-12 mx-auto text-amber-300 mb-3" />
                    <p className="text-amber-600">该批次暂无装坛记录</p>
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
              {selectedBatch.status === 'cellaring' && selectedBatch.cellar && (
                <button
                  onClick={handleMarkReady}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-200 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  标记可出库
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-6 border-b border-amber-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-amber-900">装坛入库</h3>
                    <p className="text-sm text-amber-500">填写装坛信息并完成入库</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-amber-500 hover:bg-amber-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-amber-700 mb-2">
                  选择批次 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.batchId}
                  onChange={(e) => handleBatchChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                >
                  <option value="">请选择待装坛的批次</option>
                  {availableForCellaring.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchNo} · {b.riceType} · {b.riceWeight}kg
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-amber-700 mb-2">
                    坛号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.jarNo}
                    onChange={(e) => setFormData({ ...formData, jarNo: e.target.value })}
                    className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-amber-700 mb-2">
                    酒龄 (年)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={formData.wineAge}
                    onChange={(e) => setFormData({ ...formData, wineAge: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-amber-700 mb-2">
                    容量 (kg)
                  </label>
                  <input
                    type="number"
                    min={0.1}
                    step={0.5}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
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
              </div>

              <div>
                <label className="block text-sm text-amber-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  存放位置
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                  placeholder="装坛备注信息..."
                  className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-amber-100 flex justify-end gap-3">
              <button
                onClick={() => setShowFormModal(false)}
                className="px-5 py-2.5 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                取消
              </button>
              <button
                onClick={handleSubmitForm}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-200 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                确认入库
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
