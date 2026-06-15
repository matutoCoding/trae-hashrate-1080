import { useBatchStore } from '../../store/useBatchStore';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { mockActivityLogs } from '../../data/mockData';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { 
  Droplets, 
  Flame, 
  Thermometer, 
  Clock, 
  Wine, 
  Archive, 
  ShoppingBag,
  ChevronRight,
  Activity
} from 'lucide-react';

const stages = [
  { name: '糯米浸泡', key: 'soaking', icon: Droplets, color: 'blue' },
  { name: '蒸饭落缸', key: 'steaming', icon: Flame, color: 'orange' },
  { name: '前酵开耙', key: 'fermenting', icon: Thermometer, color: 'amber' },
  { name: '后酵养醅', key: 'aging', icon: Clock, color: 'purple' },
  { name: '压榨煎酒', key: 'pressing', icon: Wine, color: 'pine' },
  { name: '陈酿装坛', key: 'cellaring', icon: Archive, color: 'clay' },
  { name: '成品销售', key: 'sold', icon: ShoppingBag, color: 'green' },
];

const weeklyData = [
  { day: '周一', 产量: 320, 销量: 280 },
  { day: '周二', 产量: 350, 销量: 310 },
  { day: '周三', 产量: 380, 销量: 340 },
  { day: '周四', 产量: 360, 销量: 330 },
  { day: '周五', 产量: 400, 销量: 370 },
  { day: '周六', 产量: 340, 销量: 380 },
  { day: '周日', 产量: 300, 销量: 290 },
];

export default function Dashboard() {
  const { batches } = useBatchStore();

  const statsData = [
    { title: '在制批次', value: batches.filter(b => !['sold', 'finished'].includes(b.status)).length, unit: '批', icon: 'Activity', color: 'amber', change: 12 },
    { title: '本月产量', value: '2,450', unit: '公斤', icon: 'Wine', color: 'pine', change: 8.5 },
    { title: '陈酿库存', value: batches.filter(b => b.status === 'cellaring').length * 25, unit: '坛', icon: 'Archive', color: 'clay', change: 5 },
    { title: '本月销量', value: '1,820', unit: '公斤', icon: 'ShoppingBag', color: 'green', change: 15 },
  ];

  const stageCounts = stages.map(stage => ({
    ...stage,
    count: batches.filter(b => b.status === stage.key).length,
  }));

  const activeBatches = batches.filter(b => !['sold', 'finished'].includes(b.status)).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatCard key={stat.title} data={stat} delay={index * 100} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-serif font-bold text-amber-900">酿造流程图</h3>
            <span className="text-sm text-amber-500">共 {stages.length} 道工序</span>
          </div>
          
          <div className="flex items-stretch justify-between gap-2">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const isActive = stageCounts[index].count > 0;
              return (
                <div key={stage.key} className="flex-1 flex flex-col items-center relative">
                  <div 
                    className={`w-16 h-16 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg scale-105' 
                        : 'bg-amber-100 text-amber-400'
                    }`}
                  >
                    <Icon className={`w-7 h-7 ${isActive ? 'text-white' : ''}`} />
                  </div>
                  <p className={`text-xs font-medium text-center ${isActive ? 'text-amber-800' : 'text-amber-400'}`}>
                    {stage.name}
                  </p>
                  <p className={`text-lg font-bold font-serif ${isActive ? 'text-amber-600' : 'text-amber-300'}`}>
                    {stageCounts[index].count}
                  </p>
                  
                  {index < stages.length - 1 && (
                    <div className="absolute top-8 left-3/4 w-full h-0.5 bg-amber-200">
                      <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-serif font-bold text-amber-900">近期动态</h3>
            <button className="text-sm text-amber-500 hover:text-amber-700">查看全部</button>
          </div>
          
          <div className="space-y-4">
            {mockActivityLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 pb-4 border-b border-amber-50 last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-amber-900 font-medium">{log.action}</p>
                  <p className="text-xs text-amber-500">批次 {log.batchNo} · {log.operator}</p>
                </div>
                <span className="text-xs text-amber-400 flex-shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
          <h3 className="text-lg font-serif font-bold text-amber-900 mb-6">本周产销量趋势</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5E0CC" />
                <XAxis dataKey="day" stroke="#CD853F" fontSize={12} />
                <YAxis stroke="#CD853F" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFF8E7', 
                    border: '1px solid #CD853F',
                    borderRadius: '8px',
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="产量" 
                  stroke="#8B4513" 
                  strokeWidth={2}
                  dot={{ fill: '#8B4513', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="销量" 
                  stroke="#2F4F4F" 
                  strokeWidth={2}
                  dot={{ fill: '#2F4F4F', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-amber border border-amber-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-serif font-bold text-amber-900">在制批次</h3>
            <button className="text-sm text-amber-500 hover:text-amber-700">查看全部</button>
          </div>
          
          <div className="space-y-3">
            {activeBatches.map((batch) => (
              <div 
                key={batch.id} 
                className="flex items-center justify-between p-4 bg-amber-50/50 rounded-xl hover:bg-amber-50 transition-colors cursor-pointer border border-amber-100/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-amber-900">{batch.batchNo}</p>
                    <p className="text-sm text-amber-500">{batch.riceType} · {batch.riceWeight}kg</p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={batch.status} size="sm" />
                  <p className="text-xs text-amber-400 mt-1">{batch.createdAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
