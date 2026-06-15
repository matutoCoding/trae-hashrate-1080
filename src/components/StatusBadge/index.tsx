import type { BatchStatus } from '../../types';

const statusConfig: Record<BatchStatus, { label: string; color: string; bgColor: string }> = {
  soaking: { label: '浸泡中', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  steaming: { label: '蒸饭中', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  fermenting: { label: '发酵中', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  aging: { label: '养醅中', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  pressing: { label: '压榨中', color: 'text-pine-700', bgColor: 'bg-pine-100' },
  cellaring: { label: '陈酿中', color: 'text-clay-700', bgColor: 'bg-clay-100' },
  finished: { label: '成品', color: 'text-green-700', bgColor: 'bg-green-100' },
  sold: { label: '已销售', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

interface StatusBadgeProps {
  status: BatchStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      } ${config.color} ${config.bgColor}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.color.replace('text-', 'bg-')}`}></span>
      {config.label}
    </span>
  );
}
