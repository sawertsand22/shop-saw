'use client';

import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import { cn } from '@/shared/lib/utils';
import { useRouter } from 'next/navigation';
import React from 'react';
import { DesignEditor } from '../design_editor'; // путь зависит от расположения

interface Props {
  open: boolean;
  className?: string;
}

export const DesignEditorModal: React.FC<Props> = ({ open, className }) => {
  const router = useRouter();

  console.log('== DesignEditorModal rendered ==');
  return (
    <Dialog open={open} onOpenChange={() => router.back()}>
      <DialogContent
        className={cn(
          'p-0 w-[900px] max-w-[900px] min-h-[500px] bg-white overflow-hidden',
          className
        )}>
        <DesignEditor />
      </DialogContent>
    </Dialog>
  );
};
