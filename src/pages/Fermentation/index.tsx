import { useState } from 'react';
import { useBatchStore } from '../../store/useBatchStore';
import BatchTable from '../../components/BatchTable';
import StatusBadge from '../../components/StatusBadge';
import { Plus, Thermometer, Droplet, Percent, Gauge } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Batch } from '../../types';

export default function FermentationPage() {
  const { batches, getBatchesByStatus } = useBatchStore();
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fermentingBatches = getBatchesByStatus('fermenting');
  const allRelatedBatches = batches.filter(b => 
    ['fermenting', 'aging'].includes(b.status) || b.fermentation
  );

  const stats = [
    { label: '发酵中', value: fermentingBatches.length, icon: Thermometer, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: '平均温度', value: '28', unit: '°C', icon: Thermometer, color: 'text-red-600', bg: 'bg-red-100' },
    { label: '酒精度', value: '8.2', unit: '%', icon: Percent, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: '开耙次数', value: '3-4', icon: Gauge, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  const handleView = (batch: Batch) => {
    setSelectedBatch(batch);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
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
        <button className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-200 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          记录开耙
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
            <h3 className="text-lg font-serif font-bold text-amber-900 mb-4">发酵温度曲线</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedBatch?.fermentation?.tempHistory || []}>
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
            </div>
          </div>
          
          <BatchTable batches={allRelatedBatches} onView={handleView} onEdit={handleView} />
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
            <h3 className="text-lg font-serif font-bold mb-3">今日待办</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                <span className="text-sm text-amber-100">HJ202606001 第四次开耙</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                <span className="text-sm text-amber-100">HJ202605018 糖度检测</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-300 rounded-full"></span>
                <span className="text-sm text-amber-200">HJ202605022 转后酵</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
            <h3 className="text-lg font-serif font-bold text-amber-900 mb-4">质量指标</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-amber-600">糖度</span>
                  <span className="text-amber-800 font-medium">12.5°Bx</span>
                </div>
                <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-amber-600">酒精度</span>
                  <span className="text-amber-800 font-medium">8.2%vol</span>
                </div>
                <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-amber-600">酸度</span>
                  <span className="text-amber-800 font-medium">0.45g/100ml</span>
                </div>
                <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedBatch && (
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
              {selectedBatch.fermentation && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-amber-50 rounded-xl p-4">
                      <p className="text-sm text-amber-500 mb-1">当前温度</p>
                      <p className="text-2xl font-bold font-serif text-amber-900">
                        {selectedBatch.fermentation.temperature}°C
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                      <p className="text-sm text-purple-600 mb-1">糖度</p>
                      <p className="text-2xl font-bold font-serif text-purple-900">
                        {selectedBatch.fermentation.sugarContent}°Bx
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-sm text-green-600 mb-1">酒精度</p>
                      <p className="text-2xl font-bold font-serif text-green-800">
                        {selectedBatch.fermentation.alcoholContent}%
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-amber-800 mb-3">开耙记录</h4>
                    <div className="space-y-2">
                      {selectedBatch.fermentation.rakeRecords.map((rake) => (
                        <div key={rake.id} className="flex items-center justify-between p-3 bg-amber-50/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 text-sm font-bold">
                              耙
                            </div>
                            <div>
                              <p className="text-sm font-medium text-amber-800">{rake.time}</p>
                              <p className="text-xs text-amber-500">{rake.operator}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-amber-800 font-medium">{rake.temperature}°C</p>
                            {rake.notes && (
                              <p className="text-xs text-amber-500">{rake.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
              <button className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all">
                转入后酵
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
