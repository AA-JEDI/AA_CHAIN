import { create } from 'zustand';

interface Modal {
    id: string;
    component: string;
    props?: Record<string, unknown>;
}

interface Toast {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message?: string;
    duration?: number;
}

interface UIState {
    // Issue #12: Theme removed - dark mode only
    sidebarOpen: boolean;
    modals: Modal[];
    toasts: Toast[];

    // Actions
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    openModal: (modal: Modal) => void;
    closeModal: (id: string) => void;
    closeAllModals: () => void;
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
    // Issue #12: Dark mode only - no theme state needed
    sidebarOpen: true,
    modals: [],
    toasts: [],

    toggleSidebar: () =>
        set((state) => ({
            sidebarOpen: !state.sidebarOpen,
        })),

    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    openModal: (modal) =>
        set((state) => ({
            modals: [...state.modals, modal],
        })),

    closeModal: (id) =>
        set((state) => ({
            modals: state.modals.filter((m) => m.id !== id),
        })),

    closeAllModals: () => set({ modals: [] }),

    addToast: (toast) =>
        set((state) => ({
            toasts: [...state.toasts, { ...toast, id: `toast_${Date.now()}` }],
        })),

    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),
}));
