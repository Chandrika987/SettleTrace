import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  eyebrow?: string;
  body: React.ReactNode;
  confirmLabel: string;
  confirmVariant?: 'primary' | 'approve' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  eyebrow,
  body,
  confirmLabel,
  confirmVariant = 'primary',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open ?
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center px-4"
        role="dialog"
        aria-modal="true"
        aria-label={title}>
        
          <motion.div
          className="absolute inset-0 bg-ink-950/45"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
          onClick={onCancel} />
        
          <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full max-w-md border border-line bg-surface shadow-pop rounded-lg overflow-hidden">
          
            <div className="border-b border-hairline px-5 py-3.5 bg-surface">
              {eyebrow ?
            <div className="font-mono text-2xs uppercase tracking-label text-ink-400">
                  {eyebrow}
                </div> :
            null}
              <h2 className="mt-0.5 text-base font-semibold text-ink-50">{title}</h2>
            </div>
            <div className="px-5 py-4 text-[13px] leading-5 text-ink-300">{body}</div>
            <div className="flex items-center justify-end gap-2 border-t border-hairline bg-surface/50 px-5 py-3">
              <Button size="md" onClick={onCancel}>
                Cancel
              </Button>
              <Button size="md" variant={confirmVariant} onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div> :
      null}
    </AnimatePresence>);

}