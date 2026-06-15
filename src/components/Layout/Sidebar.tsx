import { 
  LayoutDashboard, 
  Droplets, 
  Flame, 
  Thermometer, 
  Clock, 
  Wine, 
  Archive, 
  ShoppingBag,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useUIStore } from '../../store/useBatchStore';

const menuItems = [
  { icon: LayoutDashboard, label: '数据看板', path: '/dashboard', key: 'dashboard' },
  { icon: Droplets, label: '糯米浸泡', path: '/soaking', key: 'soaking' },
  { icon: Flame, label: '蒸饭落缸', path: '/steaming', key: 'steaming' },
  { icon: Thermometer, label: '前酵开耙', path: '/fermentation', key: 'fermentation' },
  { icon: Clock, label: '后酵养醅', path: '/aging', key: 'aging' },
  { icon: Wine, label: '压榨煎酒', path: '/pressing', key: 'pressing' },
  { icon: Archive, label: '陈酿装坛', path: '/cellar', key: 'cellar' },
  { icon: ShoppingBag, label: '成品销售', path: '/sales', key: 'sales' },
];

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export default function Sidebar({ currentPath, onNavigate }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { setCurrentPage } = useUIStore();

  const handleNavigate = (path: string, key: string) => {
    onNavigate(path);
    setCurrentPage(key);
  };

  return (
    <aside 
      className={`h-screen bg-gradient-to-b from-amber-800 to-amber-900 text-white transition-all duration-300 flex flex-col ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className={`p-4 border-b border-amber-700/50 ${sidebarCollapsed ? 'text-center' : ''}`}>
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center font-serif text-lg font-bold">
              黄
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold">黄酒酿造</h1>
              <p className="text-amber-300 text-xs">生产管理系统</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 mx-auto bg-amber-500 rounded-full flex items-center justify-center font-serif text-lg font-bold">
            黄
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <li key={item.key}>
                <button
                  onClick={() => handleNavigate(item.path, item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500/30 text-amber-100 border-l-4 border-amber-400'
                      : 'text-amber-200 hover:bg-amber-700/30 hover:text-white'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-amber-300' : ''}`} />
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        onClick={toggleSidebar}
        className="p-3 border-t border-amber-700/50 text-amber-300 hover:text-white hover:bg-amber-700/30 transition-colors"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-5 h-5 mx-auto" />
        ) : (
          <div className="flex items-center justify-center gap-2">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-xs">收起菜单</span>
          </div>
        )}
      </button>
    </aside>
  );
}
