import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Batch, BatchStatus, StageName } from '../types';
import { mockBatches } from '../data/mockData';

interface BatchState {
  batches: Batch[];
  selectedBatch: Batch | null;
  addBatch: (batch: Batch) => void;
  updateBatch: (id: string, updates: Partial<Batch>) => void;
  deleteBatch: (id: string) => void;
  selectBatch: (batch: Batch | null) => void;
  getBatchesByStatus: (status: BatchStatus) => Batch[];
  getBatchesByStage: (stage: StageName) => Batch[];
}

export const useBatchStore = create<BatchState>()(
  persist(
    (set, get) => ({
      batches: mockBatches,
      selectedBatch: null,
      
      addBatch: (batch) => {
        set((state) => ({
          batches: [...state.batches, batch],
        }));
      },
      
      updateBatch: (id, updates) => {
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        }));
      },
      
      deleteBatch: (id) => {
        set((state) => ({
          batches: state.batches.filter((b) => b.id !== id),
        }));
      },
      
      selectBatch: (batch) => {
        set({ selectedBatch: batch });
      },
      
      getBatchesByStatus: (status) => {
        return get().batches.filter((b) => b.status === status);
      },
      
      getBatchesByStage: (stage) => {
        return get().batches.filter((b) => b.currentStage === stage);
      },
    }),
    {
      name: 'huangjiu-batches',
    }
  )
);

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),
}));
