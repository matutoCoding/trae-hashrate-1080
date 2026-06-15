import { Bell, User, Search } from 'lucide-react';
import { useBatchStore } from '../../store/useBatchStore';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { batches } = useBatchStore();
  
  const activeBatches = batches.filter(
    (b) => !['sold', 'finished'].includes(b.status)
  ).length;

  return (
    <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-amber-200/50 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-serif font-bold text-amber-800">{title}</h2>
        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full">
          在制批次: {activeBatches}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
          <input
            type="text"
            placeholder="搜索批次号..."
            className="pl-10 pr-4 py-2 w-64 bg-amber-50/50 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
          />
        </div>

        <button className="relative p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-amber-200">
          <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-amber-900">酿造主管</p>
            <p className="text-xs text-amber-500">张师傅</p>
          </div>
        </div>
      </div>
    </header>
  );
}
