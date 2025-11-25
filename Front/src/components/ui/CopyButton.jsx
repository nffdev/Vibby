import React from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function CopyButton({
  text,
  variant = 'outline',
  size = 'sm',
  className,
  children,
  stopPropagation = false,
  onCopied,
  successMessage = 'Link copied',
  errorMessage = 'Copy failed'
}) {
  const handleClick = async (e) => {
    if (stopPropagation && e && typeof e.stopPropagation === 'function') e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      toast.success(successMessage)
      if (typeof onCopied === 'function') onCopied()
    } catch {
      toast.error(errorMessage)
    }
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleClick}>
      {children}
    </Button>
  )
}
