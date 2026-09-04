import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, InfoIcon, ShieldAlertIcon } from 'lucide-react';

type ToastTone = 'success' | 'info' | 'warn';

interface Toast {
  id: number;
  title: string;
  detail?: string;
  tone: ToastTone;
}

interface ToastApi {
  notify: (t: {title: string;detail?: string;tone?: ToastTone;}) => void;
}

const ToastContext = createContext<ToastApi>({ notify: () => {} });

export function useToast(): ToastApi {
  return useContext(ToastContext);
}

const TONE = {
  success: { border: 'border-pos-line', bar: 'bg-pos', icon: CheckIcon, text: 'text-pos' },
  info: { border: 'border-accent-line', bar: 'bg-accent', icon: InfoIcon, text: 'text-accent-600' },
  warn: { border: 'border-warn-line', bar: 'bg-warn', icon: ShieldAlertIcon, text: 'text-warn' }
};

export function ToastProvider({ children }: {children: React.ReactNode;}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback<ToastApi['notify']>(({ title, detail, tone = 'success' }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, title, detail, tone }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4200);
  }, []);

  const api = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-[336px] flex-col gap-2"
        role="status"
        aria-live="polite">
        
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const tone = TONE[t.tone];
            const Icon = tone.icon;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                className={`pointer-events-auto flex items-start gap-3 border ${tone.border} bg-surface px-3.5 py-3 shadow-pop`}>
                
                <span className={`mt-0.5 ${tone.text}`}>
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold leading-4 text-ink-900">{t.title}</p>
                  {t.detail ?
                  <p className="mt-1 text-xs leading-4 text-ink-500">{t.detail}</p> :
                  null}
                </div>
              </motion.div>);

          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>);

}