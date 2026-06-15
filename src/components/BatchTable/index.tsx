import { Eye, Edit, ArrowRight } from 'lucide-react';
import StatusBadge from '../StatusBadge';
import type { Batch } from '../../types';

interface BatchTableProps {
  batches: Batch[];
  onView?: (batch: Batch) => void;
  onEdit?: (batch: Batch) => void;
  onNextStage?: (batch: Batch) => void;
  showActions?: boolean;
}

export default function BatchTable({ batches, onView, onEdit, onNextStage, showActions = true }: BatchTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-amber border border-amber-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-amber-50 to-amber-100/50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-amber-800">批次号</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-amber-800">米种</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-amber-800">重量(kg)</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-amber-800">当前工序</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-amber-800">状态</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-amber-800">创建日期</th>
              {showActions && (
                <th className="px-6 py-4 text-right text-sm font-semibold text-amber-800">操作</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-100">
            {batches.map((batch) => (
              <tr 
                key={batch.id} 
                className="hover:bg-amber-50/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="font-medium text-amber-900 font-mono">{batch.batchNo}</span>
                </td>
                <td className="px-6 py-4 text-amber-700">{batch.riceType}</td>
                <td className="px-6 py-4 text-amber-700">{batch.riceWeight}</td>
                <td className="px-6 py-4 text-amber-700">{batch.currentStage}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={batch.status} size="sm" />
                </td>
                <td className="px-6 py-4 text-amber-500 text-sm">{batch.createdAt}</td>
                {showActions && (
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onView?.(batch)}
                        className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                        title="查看详情"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onEdit?.(batch)}
                        className="p-2 text-pine-500 hover:text-pine-700 hover:bg-pine-100 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {onNextStage && !['sold', 'finished'].includes(batch.status) && (
                        <button 
                          onClick={() => onNextStage(batch)}
                          className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-colors"
                          title="进入下一道工序"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {batches.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-amber-400">暂无数据</p>
        </div>
      )}
    </div>
  );
}
