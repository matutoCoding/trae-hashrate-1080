import { 
  Droplets, 
  Flame, 
  Thermometer, 
  Clock, 
  Wine, 
  Archive, 
  ShoppingBag,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import type { StatsCardData } from '../../types';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Droplets,
  Flame,
  Thermometer,
  Clock,
  Wine,
  Archive,
  ShoppingBag,
};

const colorMap: Record<string, string> = {
  amber: 'from-amber-500 to-amber-700',
  pine: 'from-pine-500 to-pine-700',
  clay: 'from-clay-400 to-clay-600',
  blue: 'from-blue-500 to-blue-700',
  purple: 'from-purple-500 to-purple-700',
  green: 'from-green-500 to-green-700',
  orange: 'from-orange-500 to-orange-700',
  red: 'from-red-500 to-red-700',
};

interface StatCardProps {
  data: StatsCardData;
  delay?: number;
}

export default function StatCard({ data, delay = 0 }: StatCardProps) {
  const Icon = iconMap[data.icon] || Droplets;
  const colorGradient = colorMap[data.color] || colorMap.amber;

  return (
    <div 
      className="bg-white rounded-2xl p-6 shadow-amber hover:shadow-amber-lg transition-all duration-300 hover:-translate-y-1 border border-amber-100"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-amber-600 text-sm font-medium mb-1">{data.title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-amber-900 font-serif">{data.value}</span>
            {data.unit && <span className="text-amber-500 text-sm">{data.unit}</span>}
          </div>
          {data.change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {data.change >= 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 text-xs font-medium">+{data.change}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span className="text-red-600 text-xs font-medium">{data.change}%</span>
                </>
              )}
              <span className="text-amber-400 text-xs">较上周</span>
            </div>
          )}
        </div>
        
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorGradient} flex items-center justify-center shadow-lg`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );
}
