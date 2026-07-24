import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthBackdrop, EASE } from "./VideoWall";

export default function AuthShell({ eyebrow, title, accent, error, children, footer }) {
    return (
        <div className="vibby-landing relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#07070a] px-4 py-12 text-white antialiased selection:bg-fuchsia-500/30">
            <AuthBackdrop />

            <Link
                to="/"
                className="absolute left-6 top-6 z-20 flex items-center gap-2.5 transition-opacity hover:opacity-70"
            >
                <img src="/logo.png" alt="logo" className="h-7 w-7 object-contain" />
                <span className="text-sm font-semibold uppercase tracking-[0.28em]">Vibby</span>
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
                style={{ willChange: "transform, opacity" }}
                className="relative z-10 w-full max-w-[26rem]"
            >
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl sm:p-10">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{eyebrow}</span>

                    <h1 className="mt-4 text-[2.5rem] font-extrabold leading-[0.95] tracking-tight">
                        {title}
                        <br />
                        <span className="bg-gradient-to-r from-violet-300 via-fuchsia-400 to-orange-300 bg-clip-text text-transparent">
                            {accent}
                        </span>
                    </h1>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                        >
                            {error}
                        </motion.p>
                    )}

                    {children}
                </div>

                <p className="mt-6 text-center text-sm text-white/40">{footer}</p>
            </motion.div>
        </div>
    );
}
