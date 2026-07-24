import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Asterisk, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Column, GRAIN, EASE } from "@/components/auth/VideoWall";
import { cn } from "@/lib/utils";

const COLUMNS = [
    { speed: 38 },
    { speed: 52, reverse: true },
    { speed: 30, offset: -6 },
    { speed: 46, reverse: true, offset: -3, mdOnly: true },
    { speed: 34, offset: -9, mdOnly: true },
];

const WORDS = ["POST IT RAW", "NO ALGORITHM THEATRE", "9:16 OR NOTHING", "LOOPS > LIKES", "SHOT ON WHATEVER"];

const HEADLINE = ["FILME", "PUBLIE", "BOUCLE"];

const LINES = [
    { k: "Tu filmes.", s: "Deux secondes après, c'est en ligne. Pas de compression d'ego." },
    { k: "On regarde.", s: "Un mur vertical, sans fin, sans page d'accueil à réapprendre." },
    { k: "Ça tourne.", s: "Les boucles comptent plus que les cœurs. Le reste, c'est du bruit." },
];

const SPECS = [
    { k: "9:16", t: "Vertical natif", d: "Pensé 9:16 du premier pixel au dernier. Pas de recadrage de secours." },
    { k: "~4s", t: "Upload direct", d: "Ta vidéo part vers Mux, l'encodage suit tout seul pendant que tu fermes l'onglet." },
    { k: "∞", t: "Feed sans fond", d: "Défilement continu, préchargement de la suivante, aucune coupure noire." },
];

function fadeIn(delay, y = 0, duration = 0.7) {
    return {
        initial: { opacity: 0, y },
        animate: { opacity: 1, y: 0 },
        transition: { delay, duration },
    };
}

function CursorGlow() {
    const x = useMotionValue(-500);
    const y = useMotionValue(-500);
    const spring = { stiffness: 120, damping: 22, mass: 0.4 };
    const left = useSpring(x, spring);
    const top = useSpring(y, spring);

    useEffect(() => {
        const move = (e) => {
            x.set(e.clientX);
            y.set(e.clientY);
        };
        window.addEventListener("pointermove", move);
        return () => window.removeEventListener("pointermove", move);
    }, [x, y]);

    return (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-30 hidden overflow-hidden md:block">
            <motion.div
                className="absolute h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                    left,
                    top,
                    background:
                        "radial-gradient(circle, rgba(168,85,247,.16), rgba(236,72,153,.08) 38%, transparent 66%)",
                }}
            />
        </div>
    );
}

function Ticker() {
    return (
        <div className="relative overflow-hidden border-y border-white/10 bg-white/[0.02] py-3">
            <motion.div
                className="flex gap-10 whitespace-nowrap"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            >
                {Array.from({ length: 4 }, () => WORDS).flat().map((word, i) => (
                    <span key={i} className="text-xs uppercase tracking-[0.35em] text-white/35 flex items-center gap-10">
                        {word}
                        <Asterisk className="h-3.5 w-3.5 shrink-0 text-fuchsia-500/60" />
                    </span>
                ))}
            </motion.div>
        </div>
    );
}

function Manifesto() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
    const [active, setActive] = useState(0);
    const barWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    useEffect(
        () =>
            scrollYProgress.on("change", (v) => {
                setActive(Math.min(LINES.length - 1, Math.floor(v * LINES.length * 1.0001)));
            }),
        [scrollYProgress]
    );

    return (
        <section ref={ref} className="relative" style={{ height: `${LINES.length * 100}vh` }}>
            <div className="sticky top-0 h-screen flex items-center overflow-hidden">
                <div className="mx-auto w-full max-w-6xl px-6">
                    <div className="mb-10 flex items-center gap-4">
                        <span className="font-mono text-[11px] text-white/40">
                            {String(active + 1).padStart(2, "0")} / {String(LINES.length).padStart(2, "0")}
                        </span>
                        <div className="h-px flex-1 bg-white/10">
                            <motion.div style={{ width: barWidth }} className="h-px bg-gradient-to-r from-violet-400 to-fuchsia-500" />
                        </div>
                    </div>

                    <div className="relative h-[46vh] md:h-[38vh]">
                        {LINES.map((line, i) => (
                            <motion.div
                                key={line.k}
                                className="absolute inset-x-0 top-0"
                                animate={{
                                    opacity: active === i ? 1 : 0,
                                    y: active === i ? 0 : active > i ? -40 : 40,
                                    filter: active === i ? "blur(0px)" : "blur(12px)",
                                }}
                                transition={{ duration: 0.55, ease: EASE }}
                            >
                                <h3 className="text-[clamp(2.75rem,9vw,7rem)] font-extrabold leading-[0.92] tracking-tight text-white">
                                    {line.k}
                                </h3>
                                <p className="mt-6 max-w-xl text-base md:text-lg text-white/50 leading-relaxed">{line.s}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function Home() {
    const navigate = useNavigate();
    const isAuthenticated = !!localStorage.getItem("token");
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const wallY = useTransform(scrollYProgress, [0, 1], [0, -140]);
    const wallOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.15]);
    const titleY = useTransform(scrollYProgress, [0, 1], [0, 180]);

    return (
        <div className="vibby-landing relative isolate min-h-screen w-full overflow-x-clip bg-[#07070a] text-white antialiased selection:bg-fuchsia-500/30">
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 z-40 opacity-[0.16] mix-blend-soft-light"
                style={{ backgroundImage: GRAIN }}
            />
            <CursorGlow />

            <header className="fixed top-0 inset-x-0 z-50">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                    <div className="flex items-center gap-2.5">
                        <img src="/logo.png" alt="logo" className="h-7 w-7 object-contain" />
                        <span className="text-sm font-semibold tracking-[0.28em] uppercase">Vibby</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {isAuthenticated ? (
                            <Button
                                variant="ghost"
                                size={null}
                                onClick={() => navigate("/videoscreen")}
                                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-normal backdrop-blur-md transition hover:bg-white/10 hover:text-inherit"
                            >
                                Retour au feed
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    size={null}
                                    onClick={() => navigate("/auth/login")}
                                    className="rounded-full px-4 py-2 text-sm font-normal text-white/60 transition hover:bg-transparent hover:text-white"
                                >
                                    Se connecter
                                </Button>
                                <Button
                                    variant="ghost"
                                    size={null}
                                    onClick={() => navigate("/auth/register")}
                                    className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-normal backdrop-blur-md transition hover:bg-white/10 hover:text-inherit"
                                >
                                    Créer un compte
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <section ref={heroRef} className="relative h-screen overflow-hidden">
                <motion.div
                    style={{ y: wallY, opacity: wallOpacity }}
                    className="absolute inset-0 grid grid-cols-3 gap-4 px-4 md:grid-cols-5 md:gap-5 md:px-5 [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_62%,transparent)]"
                >
                    {COLUMNS.map((column, i) => (
                        <Column key={i} {...column} />
                    ))}
                </motion.div>

                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_5%,#07070a_72%)]" />

                <motion.div
                    style={{ y: titleY }}
                    className="relative z-10 flex h-screen flex-col items-center justify-center px-6 text-center"
                >
                    <motion.div {...fadeIn(0.15, 12)} className="mb-7">
                        <Badge
                            variant="outline"
                            className="border-white/10 bg-black/40 px-4 py-1.5 text-[11px] font-normal uppercase tracking-[0.28em] text-white/55 backdrop-blur-md"
                        >
                            Bêta ouverte · aucun quota de talent
                        </Badge>
                    </motion.div>

                    <h1 className="font-extrabold leading-[0.82] tracking-[-0.045em]">
                        {HEADLINE.map((word, i) => (
                            <motion.span
                                key={word}
                                initial={{ opacity: 0, y: 60, filter: "blur(14px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                transition={{ delay: 0.2 + i * 0.11, duration: 0.85, ease: EASE }}
                                className={cn(
                                    "block text-[clamp(3.4rem,14vw,10.5rem)]",
                                    i === 1
                                        ? "bg-gradient-to-r from-violet-300 via-fuchsia-400 to-orange-300 bg-clip-text text-transparent"
                                        : "text-white"
                                )}
                            >
                                {word}
                            </motion.span>
                        ))}
                    </h1>

                    <motion.p {...fadeIn(0.7, 0, 0.8)} className="mt-8 max-w-md text-[15px] leading-relaxed text-white/50">
                        Vibby, c'est un mur de vidéos verticales fait par des gens qui n'attendent
                        pas d'avoir le bon matériel pour appuyer sur rec.
                    </motion.p>

                    <motion.div {...fadeIn(0.85, 16)} className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
                        <Button
                            variant="ghost"
                            size={null}
                            onClick={() => navigate("/videoscreen")}
                            className="group relative overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition-transform hover:bg-white hover:scale-[1.03] active:scale-95"
                        >
                            <span className="relative z-10">Entrer dans le feed</span>
                            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-transform duration-500 group-hover:translate-x-0" />
                        </Button>
                        <Button
                            variant="ghost"
                            size={null}
                            onClick={() => navigate("/upload")}
                            className="rounded-full border border-white/15 px-8 py-4 text-sm font-normal text-white/75 backdrop-blur-md transition hover:border-white/35 hover:bg-transparent hover:text-white"
                        >
                            Poster une vidéo
                        </Button>
                    </motion.div>
                </motion.div>

                <motion.div
                    {...fadeIn(1.4)}
                    className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-white/30"
                >
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 animate-bounce" />
                    scroll
                </motion.div>
            </section>

            <Ticker />

            <Manifesto />

            <section className="relative border-t border-white/10 px-6 py-28">
                <div className="mx-auto max-w-6xl">
                    <div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-3">
                        {SPECS.map((spec) => (
                            <div key={spec.t} className="group relative bg-[#0a0a0f] p-8 transition-colors hover:bg-[#0e0e15]">
                                <div className="mb-8 font-mono text-4xl text-white/15 transition-colors group-hover:text-fuchsia-400/60">
                                    {spec.k}
                                </div>
                                <h4 className="text-lg font-semibold">{spec.t}</h4>
                                <p className="mt-3 text-sm leading-relaxed text-white/45">{spec.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden px-6 pb-32 pt-10">
                <div className="mx-auto max-w-5xl rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-12 text-center md:p-20">
                    <h2 className="text-[clamp(2rem,6vw,4.25rem)] font-extrabold leading-[0.95] tracking-tight">
                        La prochaine vidéo <br />
                        <span className="bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">
                            c'est la tienne.
                        </span>
                    </h2>
                    <Button
                        variant="ghost"
                        size={null}
                        onClick={() => navigate("/auth/register")}
                        className="mt-10 rounded-full bg-white px-10 py-4 text-sm font-semibold text-black transition-transform hover:bg-white hover:scale-[1.03] active:scale-95"
                    >
                        Rejoindre Vibby
                    </Button>
                </div>

                <footer className="mx-auto mt-20 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/30 sm:flex-row">
                    <span>&copy; {new Date().getFullYear()} Vibby</span>
                    <span className="font-mono tracking-widest">MADE FOR THE LOOP</span>
                </footer>
            </section>
        </div>
    );
}
