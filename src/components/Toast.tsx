import { useState, useCallback, createContext, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  addToast: (t: Omit<Toast, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  addToast: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
});

export function useToast() { return useContext(ToastContext); }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(x => x.id !== id));
    }, t.duration ?? 4000);
  }, []);

  const success = useCallback((title: string, message?: string) => addToast({ type: "success", title, message }), [addToast]);
  const error   = useCallback((title: string, message?: string) => addToast({ type: "error",   title, message, duration: 6000 }), [addToast]);
  const info    = useCallback((title: string, message?: string) => addToast({ type: "info",    title, message }), [addToast]);
  const warning = useCallback((title: string, message?: string) => addToast({ type: "warning", title, message }), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, success, error, info, warning }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <ToastItem
              key={t.id}
              toast={t}
              onDismiss={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const icons = {
    success: <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />,
    error:   <XCircle     className="w-4 h-4 text-red-400   flex-shrink-0" />,
    info:    <Info        className="w-4 h-4 text-blue-400  flex-shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />,
  };
  const borders = {
    success: "border-green-500/40",
    error:   "border-red-500/40",
    info:    "border-blue-500/40",
    warning: "border-yellow-500/40",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{    opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-auto max-w-sm w-80 bg-[#1a2332] border ${borders[toast.type]}
                  rounded-lg shadow-2xl p-3 flex items-start gap-3`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#c7d5e0]">{toast.title}</p>
        {toast.message && <p className="text-xs text-[#8f98a0] mt-0.5 leading-relaxed">{toast.message}</p>}
      </div>
      <button onClick={onDismiss} className="text-[#8f98a0] hover:text-[#c7d5e0] flex-shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
