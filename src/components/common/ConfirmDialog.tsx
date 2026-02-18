import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ConfirmDialogProps {
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function ConfirmDialog({
  trigger,
  title = '确认操作',
  description = '确定要执行此操作吗？',
  confirmLabel = '确认',
  cancelLabel = '取消',
  variant = 'default',
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : internalOpen;
  const setCurrentOpen = isControlled 
    ? (value: boolean) => onOpenChange?.(value)
    : setInternalOpen;

  const handleConfirm = () => {
    onConfirm();
    setCurrentOpen(false);
  };

  const handleCancel = () => {
    onCancel?.();
    setCurrentOpen(false);
  };

  return (
    <>
      {trigger && (
        <div onClick={() => setCurrentOpen(true)}>{trigger}</div>
      )}
      <Dialog open={currentOpen} onOpenChange={setCurrentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              {cancelLabel}
            </Button>
            <Button
              variant={variant === 'destructive' ? 'destructive' : 'default'}
              onClick={handleConfirm}
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ConfirmDialog;
