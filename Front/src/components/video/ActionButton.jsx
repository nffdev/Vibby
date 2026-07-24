import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function ActionButton({ icon: Icon, label, onClick, active, activeClassName, fill }) {
  return (
    <Button
      variant="ghost"
      size={null}
      onClick={onClick}
      className="group flex h-auto flex-col items-center gap-1.5 p-0 text-white hover:bg-transparent"
    >
      <span
        className={cn(
          "rounded-full border border-white/10 bg-black/40 p-3 backdrop-blur-md transition-all",
          "group-hover:border-white/25 group-hover:bg-black/60 group-active:scale-90",
          active && activeClassName
        )}
      >
        <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6 transition-transform", fill && "fill-current")} />
      </span>
      <span className="text-[11px] font-medium tabular-nums drop-shadow-md sm:text-xs">{label}</span>
    </Button>
  )
}
