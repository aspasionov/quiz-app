import { create } from 'zustand';

type SnackbarState = {
  message: string | null;
  severity: 'success' | 'error' | 'info' | 'warning';
  open: boolean;
  showSnackbar: (message: string, severity?: SnackbarState['severity']) => void;
  closeSnackbar: () => void;
};

const useSnackBarStore = create<SnackbarState>((set) => ({
  message: null,
  severity: 'success',
  open: false,
  showSnackbar: (message, severity = 'success') =>
    set({ message, severity, open: true }),
  closeSnackbar: () => set({ open: false }),
}));

export default useSnackBarStore;