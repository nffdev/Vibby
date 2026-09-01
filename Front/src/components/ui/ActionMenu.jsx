import { useState, useEffect, useRef } from 'react'
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
  const containerRef = useRef(null)

  const toggle = (e) => {
    if (stopPropagation && e && typeof e.stopPropagation === 'function') e.stopPropagation()
    setOpen(v => !v)
  }

  const close = () => setOpen(false)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) close()
    }
    const onKeyDown = (e) => { if (e.key === 'Escape') close() }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size={null}
        aria-label="Options"
        className={cn(triggerClassName)}
        onClick={toggle}
      >
        <MoreVertical className="h-5 w-5" />
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
