import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ActionMenu({
  triggerClassName,
  menuClassName,
  stopPropagation = false,
  children
}) {
  const [open, setOpen] = useState(false)

  const toggle = (e) => {
    if (stopPropagation && e && typeof e.stopPropagation === 'function') e.stopPropagation()
    setOpen(v => !v)
  }

  const close = () => setOpen(false)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className={cn(triggerClassName)}
        onClick={toggle}
      >
        <MoreVertical className="h-6 w-6" />
      </Button>
      {open && (
        <div className={cn(
          "absolute top-8 right-0 rounded-md p-2 flex flex-col gap-2 min-w-[140px]",
          menuClassName || "bg-black/60 backdrop-blur text-white"
        )}>
          {typeof children === 'function' ? children({ close }) : children}
        </div>
      )}
    </div>
  )
}
