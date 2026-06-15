import { X, Droplets, Flame, Thermometer, Clock, Wine, Archive, ShoppingBag, CheckCircle, Circle, ChevronRight, User, Calendar } from 'lucide-react';
import type { Batch } from '../../types';
import StatusBadge from '../StatusBadge';

interface BatchTrackModalProps {
  batch: Batch | null;
  onClose: () => void;
}

const stages = [
  { key: 'soaking', name: '糯米浸泡', icon: Droplets, color: 'blue' },
  { key: 'steaming', name: '蒸饭落缸', icon: Flame, color: 'orange' },
  { key: 'fermentation', name: '前酵开耙', icon: Thermometer, color: 'amber' },
  { key: 'aging', name: '后酵养醅', icon: Clock, color: 'purple' },
  { key: 'pressing', name: '压榨煎酒', icon: Wine, color: 'pine' },
  { key: 'cellar', name: '陈酿装坛', icon: Archive, color: 'clay' },
  { key: 'sale', name: '成品销售', icon: ShoppingBag, color: 'green' },
];

const stageStatusMap: Record<string, string[]> = {
  soaking: ['soaking'],
  steaming: ['steaming'],
  fermentation: ['fermenting'],
  aging: ['aging'],
  pressing: ['pressing'],
  cellar: ['cellaring', 'finished'],
  sale: ['sold'],
};

function getStageStatus(batch: Batch, stageKey: string): 'completed' | 'current' | 'pending' {
  const statuses = stageStatusMap[stageKey] || [];
  const batchStatus = batch.status;
  
  const stageOrder = ['soaking', 'steaming', 'fermentation', 'aging', 'pressing', 'cellar', 'sale'];
  const currentIndex = stageOrder.findIndex(s => stageStatusMap[s]?.includes(batchStatus));
  const thisIndex = stageOrder.indexOf(stageKey);
  
  if (currentIndex === -1) {
    if (batchStatus === 'finished' && stageKey === 'cellar') return 'completed';
    if (batchStatus === 'finished' && thisIndex < stageOrder.indexOf('cellar')) return 'completed';
    if (batchStatus === 'finished' && stageKey === 'sale') return 'pending';
  }
  
  if (thisIndex < currentIndex) return 'completed';
  if (thisIndex === currentIndex) return 'current';
  return 'pending';
}

function getStageData(batch: Batch, stageKey: string) {
  switch (stageKey) {
    case 'soaking':
      return batch.soaking;
    case 'steaming':
      return batch.steaming;
    case 'fermentation':
      return batch.fermentation;
    case 'aging':
      return batch.aging;
    case 'pressing':
      return batch.pressing;
    case 'cellar':
      return batch.cellar;
    case 'sale':
      return batch.saleRecords && batch.saleRecords.length > 0 ? batch.saleRecords : null;
    default:
      return null;
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  return dateStr;
}

export default function BatchTrackModal({ batch, onClose }: BatchTrackModalProps) {
  if (!batch) return null;

  const colorMap: Record<string, { bg: string; text: string; border: string; lightBg: string }> = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-300', lightBg: 'bg-blue-50' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-300', lightBg: 'bg-orange-50' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-300', lightBg: 'bg-amber-50' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-300', lightBg: 'bg-purple-50' },
    pine: { bg: 'bg-pine-500', text: 'text-pine-600', border: 'border-pine-300', lightBg: 'bg-pine-50' },
    clay: { bg: 'bg-clay-500', text: 'text-clay-600', border: 'border-clay-300', lightBg: 'bg-clay-50' },
    green: { bg: 'bg-green-500', text: 'text-green-600', border: 'border-green-300', lightBg: 'bg-green-50' },
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        <div className="p-6 border-b border-amber-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
              <Thermometer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-amber-900">{batch.batchNo}</h3>
              <p className="text-sm text-amber-500">{batch.riceType} · {batch.riceWeight}kg · 全流程追踪</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={batch.status} />
            <button onClick={onClose} className="p-2 hover:bg-amber-50 rounded-lg transition-colors">
              <X className="w-5 h-5 text-amber-500" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              {stages.map((stage, index) => {
                const Icon = stage.icon;
                const status = getStageStatus(batch, stage.key);
                const colors = colorMap[stage.color];
                const isLast = index === stages.length - 1;
                
                return (
                  <div key={stage.key} className="flex-1 flex flex-col items-center relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                      status === 'completed' ? `${colors.bg} text-white shadow-lg` :
                      status === 'current' ? `${colors.bg} text-white shadow-lg scale-110 ring-4 ring-white ring-opacity-50` :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {status === 'completed' ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <p className={`text-xs font-medium text-center ${
                      status === 'current' ? colors.text :
                      status === 'completed' ? 'text-gray-700' :
                      'text-gray-400'
                    }`}>
                      {stage.name}
                    </p>
                    
                    {!isLast && (
                      <div className="absolute top-6 left-1/2 w-full h-0.5 -translate-y-1/2">
                        <div className={`h-full ${
                          status === 'completed' ? colors.bg : 'bg-gray-200'
                        }`} style={{ width: 'calc(100% + 12px)' }}></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              {stages.map((stage) => {
                const status = getStageStatus(batch, stage.key);
                const data = getStageData(batch, stage.key);
                const Icon = stage.icon;
                const colors = colorMap[stage.color];
                
                if (status === 'pending' && !data) {
                  return (
                    <div key={stage.key} className="bg-gray-50 rounded-xl p-4 border border-gray-100 opacity-60">
                      <div className="flex items-center gap-2 mb-2">
                        <Circle className="w-5 h-5 text-gray-400" />
                        <h4 className="font-medium text-gray-400">{stage.name}</h4>
                        <span className="text-xs text-gray-400 ml-auto">待开始</span>
                      </div>
                      <p className="text-sm text-gray-400">尚未进行该工序</p>
                    </div>
                  );
                }
                
                return (
                  <div key={stage.key} className={`rounded-xl p-5 border ${colors.lightBg} ${colors.border} border-opacity-50`}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <h4 className={`font-serif font-bold ${colors.text}`}>{stage.name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${
                        status === 'completed' ? 'bg-green-100 text-green-700' :
                        status === 'current' ? `${colors.bg} text-white` :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {status === 'completed' ? '已完成' : status === 'current' ? '进行中' : '待开始'}
                      </span>
                    </div>

                    {stage.key === 'soaking' && data && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white/70 rounded-lg p-3">
                          <p className="text-xs text-amber-500 mb-1">开始时间</p>
                          <p className="text-sm font-medium text-amber-800">{(data as any).startTime || '-'}</p>
                        </div>
                        <div className="bg-white/70 rounded-lg p-3">
                          <p className="text-xs text-amber-500 mb-1">水温</p>
                          <p className="text-sm font-medium text-amber-800">{(data as any).waterTemp}°C</p>
                        </div>
                        <div className="bg-white/70 rounded-lg p-3">
                          <p className="text-xs text-amber-500 mb-1">酸度</p>
                          <p className="text-sm font-medium text-amber-800">pH {(data as any).acidity}</p>
                        </div>
                        <div className="bg-white/70 rounded-lg p-3">
                          <p className="text-xs text-amber-500 mb-1">计划浸泡</p>
                          <p className="text-sm font-medium text-amber-800">{(data as any).soakHours} 小时</p>
                        </div>
                      </div>
                    )}

                    {stage.key === 'steaming' && data && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white/70 rounded-lg p-3">
                          <p className="text-xs text-amber-500 mb-1">蒸制时间</p>
                          <p className="text-sm font-medium text-amber-800">{(data as any).steamTime || '-'}</p>
                        </div>
                        <div className="bg-white/70 rounded-lg p-3">
                          <p className="text-xs text-amber-500 mb-1">蒸制温度</p>
                          <p className="text-sm font-medium text-amber-800">{(data as any).steamTemp}°C</p>
                        </div>
                        <div className="bg-white/70 rounded-lg p-3">
                          <p className="text-xs text-amber-500 mb-1">摊冷温度</p>
                          <p className="text-sm font-medium text-amber-800">{(data as any).coolTemp}°C</p>
                        </div>
                        <div className="bg-white/70 rounded-lg p-3">
                          <p className="text-xs text-amber-500 mb-1">酒药/麦曲</p>
                          <p className="text-sm font-medium text-amber-800">{(data as any).yeastAmount}% / {(data as any).quAmount}%</p>
                        </div>
                      </div>
                    )}

                    {stage.key === 'fermentation' && data && (
                      <div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          <div className="bg-white/70 rounded-lg p-3">
                            <p className="text-xs text-amber-500 mb-1">当前温度</p>
                            <p className="text-sm font-medium text-amber-800">{(data as any).temperature}°C</p>
                          </div>
                          <div className="bg-white/70 rounded-lg p-3">
                            <p className="text-xs text-amber-500 mb-1">糖度</p>
                            <p className="text-sm font-medium text-amber-800">{(data as any).sugarContent}°Bx</p>
                          </div>
                          <div className="bg-white/70 rounded-lg p-3">
                            <p className="text-xs text-amber-500 mb-1">酒精度</p>
                            <p className="text-sm font-medium text-amber-800">{(data as any).alcoholContent}%</p>
                          </div>
                          <div className="bg-white/70 rounded-lg p-3">
                            <p className="text-xs text-amber-500 mb-1">开耙次数</p>
                            <p className="text-sm font-medium text-amber-800">{(data as any).rakeTimes || 0} 次</p>
                          </div>
                        </div>
                        {(data as any).rakeRecords && (data as any).rakeRecords.length > 0 && (
                          <div className="bg-white/70 rounded-lg p-3">
                            <p className="text-xs text-amber-500 mb-2">开耙记录</p>
                            <div className="space-y-2">
                              {(data as any).rakeRecords.slice(0, 3).map((r: any) => (
                                <div key={r.id} className="flex items-center justify-between text-xs">
                                  <span className="text-amber-600">{r.time}</span>
                                  <span className="text-amber-800">{r.temperature}°C</span>
                                  <span className="text-amber-500">{r.operator || '-'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {stage.key === 'aging' && data && (
                      <div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          <div className="bg-white/70 rounded-lg p-3">
                            <p className="text-xs text-amber-500 mb-1">开始日期</p>
                            <p className="text-sm font-medium text-amber-800">{(data as any).startDate || '-'}</p>
                          </div>
                          <div className="bg-white/70 rounded-lg p-3">
                            <p className="text-xs text-amber-500 mb-1">已养醅</p>
                            <p className="text-sm font-medium text-amber-800">{(data as any).days} 天</p>
                          </div>
                          <div className="bg-white/70 rounded-lg p-3">
                            <p className="text-xs text-amber-500 mb-1">环境温度</p>
                            <p className="text-sm font-medium text-amber-800">{(data as any).temp}°C</p>
                          </div>
                          <div className="bg-white/70 rounded-lg p-3">
                            <p className="text-xs text-amber-500 mb-1">环境湿度</p>
                            <p className="text-sm font-medium text-amber-800">{(data as any).humidity}%</p>
                          </div>
                        </div>
                        {(data as any).inspectionRecords && (data as any).inspectionRecords.length > 0 && (
                          <div className="bg-white/70 rounded-lg p-3">
                            <p className="text-xs text-amber-500 mb-2">抽检记录</p>
                            <div className="space-y-2">
                              {(data as any).inspectionRecords.slice(0, 3).map((r: any) => (
                                <div key={r.id} className="flex items-center justify-between text-xs">
                                  <span className="text-amber-600">{r.date}</span>
                                  <span className="text-amber-800">{r.temperature}°C / {r.humidity}%</span>
                                  <span className="text-amber-500">{r.operator || '-'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {stage.key === 'pressing' && data && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white/70 rounded-lg p-3">
                          <p className="text-xs text-amber-500 mb-1">压榨日期</p>
                          <p className="text-sm font-medium text-amber-800">{(data as any).pressDate || '-'}</p>
                        </div>
                        <div className="bg-white/70 rounded-lg p-3">
                          <p className="text-xs text-amber-500 mb-1">出酒量</p>
                          <p className="text-sm font-medium text-amber-800">{(data as any).wineYield} kg</p>
                        </div>
                        <div className="bg-white/70 rounded-lg p-3">
                          <p className="text-xs text-amber-500 mb-1">灭菌温度</p>
                          <p className="text-sm font-medium text-amber-800">{(data as any).sterilizeTemp}°C</p>
                        </div>
                        <div className="bg-white/70 rounded-lg p-3">
                          <p className="text-xs text-amber-500 mb-1">出酒率</p>
                          <p className="text-sm font-medium text-amber-800">{((data as any).wineYield / batch.riceWeight * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    )}

                    {stage.key === 'cellar' && data && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white/70 rounded-lg p-3">
                          <p className="text-xs text-amber-500 mb-1">坛号</p>
                          <p className="text-sm font-medium text-amber-800 font-mono">{(data as any).jarNo || '-'}</p>
                        </div>
                        <div className="bg-white/70 rounded-lg p-3">
                          <p className="text-xs text-amber-500 mb-1">酒龄</p>
                          <p className="text-sm font-medium text-amber-800">{(data as any).wineAge} 年陈</p>
                        </div>
                        <div className="bg-white/70 rounded-lg p-3">
                          <p className="text-xs text-amber-500 mb-1">容量/剩余</p>
                          <p className="text-sm font-medium text-amber-800">
                            {(data as any).remainingCapacity ?? (data as any).capacity} / {(data as any).capacity} kg
                          </p>
                        </div>
                        <div className="bg-white/70 rounded-lg p-3">
                          <p className="text-xs text-amber-500 mb-1">存放位置</p>
                          <p className="text-sm font-medium text-amber-800">{(data as any).location || '-'}</p>
                        </div>
                      </div>
                    )}

                    {stage.key === 'sale' && data && Array.isArray(data) && data.length > 0 && (
                      <div className="bg-white/70 rounded-lg p-3">
                        <p className="text-xs text-amber-500 mb-2">销售记录</p>
                        <div className="space-y-2">
                          {data.slice(0, 3).map((r: any) => (
                            <div key={r.id} className="flex items-center justify-between text-xs pb-2 border-b border-amber-100 last:border-0">
                              <span className="text-amber-700 font-medium">{r.customer}</span>
                              <span className="text-amber-600">{r.quantity} kg × ¥{r.price}</span>
                              <span className="text-green-600 font-medium">¥{r.totalAmount?.toLocaleString() || (r.quantity * r.price).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {stage.key === 'sale' && (!data || (Array.isArray(data) && data.length === 0)) && (
                      <p className="text-sm text-gray-400">暂无销售记录</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-amber-100">
              <div className="flex items-center gap-4 text-sm text-amber-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>创建时间: {batch.createdAt}</span>
                </div>
                {batch.operator && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>负责人: {batch.operator}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
