import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function AuthField({ id, icon: Icon, label, className, type, ...props }) {
    const [revealed, setRevealed] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && revealed ? "text" : type;

    return (
        <div className="group relative">
            <Icon
                aria-hidden
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-fuchsia-400"
            />
            <Input
                id={id}
                type={inputType}
                placeholder=" "
                className={cn(
                    "peer h-14 rounded-2xl border-white/10 bg-white/[0.04] px-4 pl-11 pt-5 text-sm text-white",
                    "ring-offset-transparent backdrop-blur-md transition-colors",
                    "placeholder:text-transparent hover:border-white/20",
                    "focus-visible:border-fuchsia-400/50 focus-visible:ring-0 focus-visible:ring-offset-0",
                    isPassword && "pr-11",
                    className
                )}
                {...props}
            />
            <label
                htmlFor={id}
                className={cn(
                    "pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 text-sm text-white/40 transition-all",
                    "peer-focus:top-4 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-[0.2em] peer-focus:text-fuchsia-300/80",
                    "peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:text-[10px]",
                    "peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.2em]",
                    "peer-[:not(:placeholder-shown)]:text-white/45"
                )}
            >
                {label}
            </label>
            {isPassword && (
                <button
                    type="button"
                    onClick={() => setRevealed((v) => !v)}
                    aria-label={revealed ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-white/30 transition-colors hover:text-white/70"
                >
                    {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            )}
        </div>
    );
}
