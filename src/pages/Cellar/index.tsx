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
  Users,
  Package,
} from 'lucide-react';
import type { Batch, CellarRecord } from '../../types';

export default function CellarPage() {
  const { batches, getBatchesByStatus, updateBatch } = useBatchStore();
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('操作成功！');
  const [filter, setFilter] = useState<'all' | 'cellaring' | 'finished'>('all');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  const allCellarBatches = useMemo(
    () => batches.filter((b) => ['cellaring', 'finished'].includes(b.status) || b.cellar),
    [batches]
  );

  const cellaringBatches = getBatchesByStatus('cellaring');
  const finishedBatches = getBatchesByStatus('finished');

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

  const [formData, setFormData] = useState({
    batchId: '',
    jarNo: nextJarNo,
    cellarDate: todayStr,
    wineAge: 1,
    capacity: 25,
    location: '地下酒窖A区',
    operator: '系统管理员',
    notes: '',
  });

  const stats = useMemo(() => {
    const storageJars = allCellarBatches.length;
    const totalCapacity = allCellarBatches.reduce(
      (sum, b) => sum + (b.cellar?.capacity || 25),
      0
    );
    const readyCount = finishedBatches.length;
    const locations = new Set<string>();
    allCellarBatches.forEach((b) => {
      if (b.cellar?.location) locations.add(b.cellar.location);
    });
    const locationCount = Math.max(locations.size, 1);

    return [
      {
        label: '在储酒坛',
        value: storageJars,
        unit: '坛',
        icon: Archive,
        color: 'text-clay-600',
        bg: 'bg-clay-100',
      },
      {
        label: '总储量',
        value: totalCapacity,
        unit: 'kg',
        icon: Droplets,
        color: 'text-amber-600',
        bg: 'bg-amber-100',
      },
      {
        label: '可出库',
        value: readyCount,
        unit: '坛',
        icon: Package,
        color: 'text-green-600',
        bg: 'bg-green-100',
      },
      {
        label: '酒窖区域',
        value: locationCount,
        unit: '个',
        icon: MapPin,
        color: 'text-blue-600',
        bg: 'bg-blue-100',
      },
    ];
  }, [allCellarBatches, finishedBatches]);

  const filteredJars = useMemo(() => {
    if (filter === 'all') return allCellarBatches;
    if (filter === 'cellaring') return cellaringBatches;
    return finishedBatches;
  }, [filter, allCellarBatches, cellaringBatches, finishedBatches]);

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
      jars: list.map((b) => b.cellar?.jarNo || 'T-000'),
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

  const resetForm = () => {
    setFormData({
      batchId: cellaringBatches[0]?.id || '',
      jarNo: nextJarNo,
      cellarDate: todayStr,
      wineAge: 1,
      capacity: 25,
      location: '地下酒窖A区',
      operator: '系统管理员',
      notes: '',
    });
    setFormErrors({});
  };

  const handleOpenForm = () => {
    if (cellaringBatches.length === 0) {
      setSuccessMessage('暂无待装坛的批次，请先完成压榨煎酒工序！');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      return;
    }
    resetForm();
    setFormData((prev) => ({ ...prev, batchId: cellaringBatches[0]?.id || '' }));
    setShowFormModal(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.batchId) errors.batchId = '请选择批次';
    if (!formData.jarNo.trim()) errors.jarNo = '请输入坛号';
    if (!formData.cellarDate) errors.cellarDate = '请选择入窖日期';
    if (formData.wineAge < 0) errors.wineAge = '酒龄不能为负数';
    if (formData.capacity <= 0) errors.capacity = '容量必须大于0';
    if (!formData.location.trim()) errors.location = '请输入存放位置';
    if (!formData.operator.trim()) errors.operator = '请输入操作人';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = () => {
    if (!validateForm()) return;

    const targetBatch = batches.find((b) => b.id === formData.batchId);
    if (!targetBatch) return;

    const cellarRecord: CellarRecord = {
      id: Math.random().toString(36).substr(2, 9),
      jarNo: formData.jarNo,
      wineAge: formData.wineAge,
      capacity: formData.capacity,
      location: formData.location,
      cellarDate: formData.cellarDate,
      status: 'ready',
      notes: formData.notes
        ? `操作人：${formData.operator} | ${formData.notes}`
        : `操作人：${formData.operator}`,
    };

    updateBatch(targetBatch.id, {
      status: 'finished',
      currentStage: '成品待售',
      cellar: cellarRecord,
    });

    setShowFormModal(false);
    setSuccessMessage(`${targetBatch.batchNo} 已装坛入库，坛号 ${formData.jarNo}`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleView = (batch: Batch) => {
    setSelectedBatch(batch);
    setShowModal(true);
  };

  const handleFinishCellaring = () => {
    if (!selectedBatch) return;
    if (selectedBatch.status !== 'cellaring') return;

    updateBatch(selectedBatch.id, {
      status: 'finished',
      currentStage: '成品待售',
      cellar: selectedBatch.cellar
        ? { ...selectedBatch.cellar, status: 'ready' }
        : undefined,
    });

    setShowModal(false);
    setSuccessMessage(`${selectedBatch.batchNo} 已转为成品待售`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 relative">
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-slide-up flex items-center gap-3 max-w-sm">
          <Check className="w-6 h-6 shrink-0" />
          <div className="min-w-0">
            <p className="font-bold">操作成功！</p>
            <p className="text-sm text-green-100 truncate">{successMessage}</p>
          </div>
        </div>
      )}

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
            <div
              key={index}
              className="bg-white rounded-xl p-5 shadow-amber border border-amber-100"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}
                >
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-amber-500">{stat.label}</p>
                  <p className="text-2xl font-bold font-serif text-amber-900">
                    {stat.value}
                    {stat.unit && (
                      <span className="text-sm font-normal text-amber-500 ml-1">
                        {stat.unit}
                      </span>
                    )}
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
                  { key: 'all' as const, label: '全部' },
                  { key: 'cellaring' as const, label: '陈酿中' },
                  { key: 'finished' as const, label: '可出库' },
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

            {filteredJars.length === 0 ? (
              <div className="text-center py-12">
                <Archive className="w-16 h-16 mx-auto text-amber-200 mb-3" />
                <p className="text-amber-500">暂无酒坛数据</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredJars.map((batch) => (
                  <div
                    key={batch.id}
                    onClick={() => handleView(batch)}
                    className="p-4 bg-clay-50 rounded-xl cursor-pointer hover:bg-clay-100 transition-colors border border-clay-200/50 hover:shadow-md"
                  >
                    <div className="w-12 h-16 mx-auto mb-2 bg-gradient-to-b from-clay-400 to-clay-600 rounded-b-full rounded-t-lg relative shadow-inner">
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-clay-700 rounded-t-sm"></div>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-clay-300/40 rounded-full"></div>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-amber-900 text-sm">
                        {batch.cellar?.jarNo || 'T-000'}
                      </p>
                      <p className="text-xs text-amber-500">
                        {batch.cellar?.wineAge || 0}年陈
                      </p>
                      <div className="mt-2">
                        <StatusBadge status={batch.status} size="sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
            <h3 className="text-lg font-serif font-bold text-amber-900 mb-4">
              酒龄分布
            </h3>
            <div className="space-y-4">
              {wineAgeGroups.map((group) => (
                <div key={group.age}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-amber-700 font-medium">{group.age}</span>
                    <span className="text-amber-500">{group.count} 坛</span>
                  </div>
                  <div className="h-8 bg-amber-50 rounded-lg overflow-hidden flex items-center px-2 gap-1">
                    {group.jars.slice(0, 12).map((jar, i) => (
                      <div
                        key={i}
                        className="w-4 h-6 bg-gradient-to-b from-clay-400 to-clay-600 rounded-b-sm rounded-t-xs shadow-sm shrink-0"
                        title={jar}
                      ></div>
                    ))}
                    {group.count > 12 && (
                      <span className="text-xs text-amber-500 ml-1 shrink-0">
                        +{group.count - 12}
                      </span>
                    )}
                    {group.count === 0 && (
                      <span className="text-xs text-amber-400 ml-1">暂无</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
            <h3 className="text-lg font-serif font-bold text-amber-900 mb-4">
              酒窖分布
            </h3>
            <div className="space-y-3">
              {locationDistribution.length === 0 ? (
                <p className="text-center text-amber-500 py-4 text-sm">暂无分布数据</p>
              ) : (
                locationDistribution.map((area, idx) => {
                  const colors = [
                    'bg-amber-500',
                    'bg-clay-500',
                    'bg-green-500',
                    'bg-blue-500',
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

          <div className="bg-gradient-to-br from-clay-500 to-clay-700 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-serif font-bold mb-3 flex items-center gap-2">
              <Archive className="w-5 h-5" />
              陈酿要点
            </h3>
            <div className="space-y-2 text-sm text-clay-100">
              <p>• 陶坛透气，有助于酒的老熟</p>
              <p>• 恒温恒湿环境，温度15-20°C</p>
              <p>• 湿度保持在70%左右</p>
              <p>• 定期检查，防止渗漏</p>
              <p>• 做好酒龄登记，先进先出</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
            <h3 className="text-lg font-serif font-bold text-amber-900 mb-4">
              近期可出库
            </h3>
            <div className="space-y-3">
              {finishedBatches.length === 0 ? (
                <p className="text-center text-amber-500 py-4 text-sm">暂无可出库酒坛</p>
              ) : (
                finishedBatches.slice(0, 3).map((batch) => (
                  <div
                    key={batch.id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-amber-900 text-sm">
                        {batch.cellar?.jarNo}
                      </p>
                      <p className="text-xs text-amber-500">
                        {batch.cellar?.wineAge}年陈酿 · {batch.cellar?.capacity}kg
                      </p>
                    </div>
                    <button
                      onClick={() => handleView(batch)}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      查看
                    </button>
                  </div>
                ))
              )}
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
              {selectedBatch.cellar ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-clay-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Droplets className="w-4 h-4 text-clay-500" />
                        <p className="text-sm text-clay-600">酒龄</p>
                      </div>
                      <p className="text-xl font-bold font-serif text-clay-800">
                        {selectedBatch.cellar.wineAge} 年
                      </p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-amber-500" />
                        <p className="text-sm text-amber-600">容量</p>
                      </div>
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
                    <p className="font-medium text-amber-900">
                      {selectedBatch.cellar.location}
                    </p>
                  </div>

                  <div className="bg-amber-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-amber-600">入窖日期</span>
                    </div>
                    <p className="font-medium text-amber-900">
                      {selectedBatch.cellar.cellarDate}
                    </p>
                  </div>

                  {selectedBatch.cellar.notes && (
                    <div className="bg-amber-50 rounded-xl p-4">
                      <p className="text-sm text-amber-600 mb-1">备注</p>
                      <p className="text-amber-800 whitespace-pre-wrap">
                        {selectedBatch.cellar.notes}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 bg-amber-50 rounded-xl">
                  <Archive className="w-12 h-12 mx-auto text-amber-300 mb-3" />
                  <p className="text-amber-600">该批次暂无装坛记录</p>
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
              {selectedBatch.status === 'cellaring' && (
                <button
                  onClick={handleFinishCellaring}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-200 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  完成装坛/转为成品
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
                    <h3 className="text-xl font-serif font-bold text-amber-900">
                      装坛入库
                    </h3>
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
                  onChange={(e) =>
                    setFormData({ ...formData, batchId: e.target.value })
                  }
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white ${
                    formErrors.batchId
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-amber-200'
                  }`}
                >
                  <option value="">请选择待装坛的批次</option>
                  {cellaringBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchNo} · {b.riceType} · {b.riceWeight}kg
                    </option>
                  ))}
                </select>
                {formErrors.batchId && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.batchId}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-amber-700 mb-2">
                    坛号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.jarNo}
                    onChange={(e) =>
                      setFormData({ ...formData, jarNo: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                      formErrors.jarNo
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-amber-200'
                    }`}
                  />
                  {formErrors.jarNo && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.jarNo}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-amber-700 mb-2">
                    入窖日期 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                    <input
                      type="date"
                      value={formData.cellarDate}
                      onChange={(e) =>
                        setFormData({ ...formData, cellarDate: e.target.value })
                      }
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                        formErrors.cellarDate
                          ? 'border-red-400 focus:ring-red-400'
                          : 'border-amber-200'
                      }`}
                    />
                  </div>
                  {formErrors.cellarDate && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.cellarDate}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-amber-700 mb-2">
                    酒龄 (年) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={formData.wineAge}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        wineAge: Number(e.target.value),
                      })
                    }
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                      formErrors.wineAge
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-amber-200'
                    }`}
                  />
                  {formErrors.wineAge && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.wineAge}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-amber-700 mb-2">
                    容量 (kg) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                    <input
                      type="number"
                      min={0.1}
                      step={0.5}
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capacity: Number(e.target.value),
                        })
                      }
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                        formErrors.capacity
                          ? 'border-red-400 focus:ring-red-400'
                          : 'border-amber-200'
                      }`}
                    />
                  </div>
                  {formErrors.capacity && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.capacity}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-amber-700 mb-2">
                  存放位置 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                      formErrors.location
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-amber-200'
                    }`}
                  />
                </div>
                {formErrors.location && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.location}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-amber-700 mb-2">
                  操作人 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                  <input
                    type="text"
                    value={formData.operator}
                    onChange={(e) =>
                      setFormData({ ...formData, operator: e.target.value })
                    }
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                      formErrors.operator
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-amber-200'
                    }`}
                  />
                </div>
                {formErrors.operator && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.operator}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-amber-700 mb-2">备注</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
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
