export type BatchStatus = 
  | 'soaking' 
  | 'steaming' 
  | 'fermenting' 
  | 'aging' 
  | 'pressing' 
  | 'cellaring' 
  | 'finished' 
  | 'sold';

export type StageName = 
  | '糯米浸泡' 
  | '蒸饭落缸' 
  | '前酵开耙' 
  | '后酵养醅' 
  | '压榨煎酒' 
  | '陈酿装坛' 
  | '成品销售';

export interface Batch {
  id: string;
  batchNo: string;
  riceType: string;
  riceWeight: number;
  status: BatchStatus;
  currentStage: StageName;
  createdAt: string;
  soaking?: SoakingRecord;
  steaming?: SteamingRecord;
  fermentation?: FermentationRecord;
  aging?: AgingRecord;
  pressing?: PressingRecord;
  cellar?: CellarRecord;
  sale?: SaleRecord;
}

export interface SoakingRecord {
  id: string;
  startTime: string;
  waterTemp: number;
  acidity: number;
  soakHours: number;
  status: 'pending' | 'soaking' | 'completed';
  notes?: string;
}

export interface SteamingRecord {
  id: string;
  steamTime: string;
  steamTemp: number;
  steamDuration: number;
  coolTemp: number;
  yeastAmount: number;
  quAmount: number;
  jarTime: string;
  status: 'pending' | 'steaming' | 'cooling' | 'jared' | 'completed';
  notes?: string;
}

export interface TempPoint {
  time: string;
  temperature: number;
}

export interface FermentationRecord {
  id: string;
  rakeTimes: number;
  temperature: number;
  sugarContent: number;
  alcoholContent: number;
  tempHistory: TempPoint[];
  rakeRecords: RakeRecord[];
  status: 'pending' | 'fermenting' | 'completed';
  notes?: string;
}

export interface RakeRecord {
  id: string;
  time: string;
  temperature: number;
  operator: string;
  notes?: string;
}

export interface AgingRecord {
  id: string;
  startDate: string;
  days: number;
  location: string;
  temp: number;
  humidity: number;
  inspectionRecords: InspectionRecord[];
  status: 'pending' | 'aging' | 'completed';
  notes?: string;
}

export interface InspectionRecord {
  id: string;
  date: string;
  temperature: number;
  humidity: number;
  taste?: string;
  operator: string;
}

export interface PressingRecord {
  id: string;
  pressDate: string;
  wineYield: number;
  sterilizeTemp: number;
  sterilizeDuration: number;
  pressDuration: number;
  status: 'pending' | 'pressing' | 'sterilizing' | 'completed';
  notes?: string;
}

export interface CellarRecord {
  id: string;
  jarNo: string;
  wineAge: number;
  location: string;
  cellarDate: string;
  capacity: number;
  status: 'stored' | 'aging' | 'ready' | 'sold';
  notes?: string;
}

export interface SaleRecord {
  id: string;
  customer: string;
  quantity: number;
  price: number;
  saleDate: string;
  operator: string;
  notes?: string;
}

export interface StatsCardData {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  icon: string;
  color: string;
}

export interface ActivityLog {
  id: string;
  time: string;
  action: string;
  batchNo: string;
  operator: string;
}
