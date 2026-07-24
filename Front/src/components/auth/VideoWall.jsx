import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const GRAIN =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")";

export const EASE = [0.16, 1, 0.3, 1];

export const TILES = [
    { hue: 268, label: "skate / 3am", n: "01" },
    { hue: 322, label: "bedroom pop", n: "02" },
    { hue: 190, label: "cooking fail", n: "03" },
    { hue: 42, label: "desert drive", n: "04" },
    { hue: 292, label: "first take", n: "05" },
    { hue: 12, label: "loop this", n: "06" },
    { hue: 152, label: "no filter", n: "07" },
    { hue: 220, label: "midnight run", n: "08" },
    { hue: 340, label: "stray cat", n: "09" },
];

export function Tile({ hue, label, n }) {
    return (
        <div
            className="relative shrink-0 w-full aspect-[9/14] rounded-2xl overflow-hidden border border-white/10"
            style={{
                background: `linear-gradient(155deg, hsl(${hue} 80% 22%), hsl(${(hue + 48) % 360} 70% 9%) 55%, #07070a)`,
            }}
        >
            <div
                className="absolute -inset-8 opacity-60 blur-2xl"
                style={{ background: `radial-gradient(circle at 30% 20%, hsl(${hue} 95% 55% / .55), transparent 60%)` }}
            />
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0_2px,rgba(0,0,0,.25)_2px_4px)] mix-blend-overlay" />
            <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
                <span className="text-[10px] uppercase tracking-[0.18em] text-white/70">{label}</span>
                <span className="text-[10px] font-mono text-white/40">{n}</span>
            </div>
            <div className="absolute top-3 left-3 h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
        </div>
    );
}

export function Column({ speed, offset = 0, reverse = false, mdOnly = false }) {
    return (
        <div className={cn("relative overflow-hidden h-full", mdOnly && "hidden md:block")}>
            <motion.div
                className="flex flex-col gap-4"
                initial={{ y: reverse ? "-50%" : "0%" }}
                animate={{ y: reverse ? "0%" : "-50%" }}
                transition={{ duration: speed, repeat: Infinity, ease: "linear", delay: offset }}
            >
                {[...TILES, ...TILES].map((tile, i) => (
                    <Tile key={i} {...tile} />
                ))}
            </motion.div>
        </div>
    );
}

const AUTH_COLUMNS = [
    { speed: 44 },
    { speed: 58, reverse: true },
    { speed: 36, offset: -6, mdOnly: true },
];

export function AuthBackdrop() {
    return (
        <>
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 grid grid-cols-2 gap-4 opacity-40 md:grid-cols-3 [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black_75%)]"
            >
                {AUTH_COLUMNS.map((column, i) => (
                    <Column key={i} {...column} />
                ))}
            </div>
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,7,10,.72),#07070a_70%)]"
            />
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 z-40 opacity-[0.16] mix-blend-soft-light"
                style={{ backgroundImage: GRAIN }}
            />
        </>
    );
}
