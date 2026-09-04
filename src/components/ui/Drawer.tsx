import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  width?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Drawer({
  open,
  onClose,
  title,
  eyebrow,
  width = 'max-w-3xl',
  children,
  footer
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ?
      <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div
          className="absolute inset-0 bg-ink-950/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          onClick={onClose} />
        
          <motion.div
          className={`relative flex h-full w-full ${width} flex-col border-l border-line bg-surface`}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 40, opacity: 0 }}
          transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}>
          
            <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-3.5 bg-surface">
              <div>
                {eyebrow ?
              <div className="font-mono text-2xs uppercase tracking-label text-ink-500">
                    {eyebrow}
                  </div> :
              null}
                <h2 className="mt-0.5 text-base font-semibold text-ink-50">{title}</h2>
              </div>
              <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              className="flex h-7 w-7 items-center justify-center rounded-sm border border-line text-ink-400 transition-colors duration-150 ease-out hover:bg-surface-hover hover:text-white">
              
                <XIcon className="h-3.5 w-3.5" aria-hidden />
              </button>
            </header>
            <div className="rr-scroll flex-1 overflow-y-auto">{children}</div>
            {footer ?
          <footer className="border-t border-line bg-canvas px-5 py-3">{footer}</footer> :
          null}
          </motion.div>
        </div> :
      null}
    </AnimatePresence>);

}