import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { BASE_API, API_VERSION, GOOGLE_CLIENT_ID } from "../../config.json";

const GSI_SRC = "https://accounts.google.com/gsi/client";

function loadGsi() {
    return new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) return resolve();
        const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
        if (existing) {
            existing.addEventListener("load", () => resolve());
            existing.addEventListener("error", reject);
            return;
        }
        const script = document.createElement("script");
        script.src = GSI_SRC;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

export default function GoogleButton({ onError, label = "Continuer avec Google" }) {
    const containerRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);

    const configured = GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.startsWith("YOUR_");

    useEffect(() => {
        if (!configured) return;
        let cancelled = false;

        const handleCredential = async (response) => {
            setLoading(true);
            try {
                const r = await fetch(`${BASE_API}/v${API_VERSION}/auth/google`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ credential: response.credential }),
                });
                const json = await r.json();
                if (json.token) {
                    localStorage.setItem("token", json.token);
                    window.location.replace("/videoscreen");
                    return;
                }
                onError?.(json.message || "La connexion Google a échoué.");
            } catch {
                onError?.("La connexion Google a échoué.");
            }
            setLoading(false);
        };

        loadGsi()
            .then(() => {
                if (cancelled || !window.google?.accounts?.id) return;
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleCredential,
                });
                if (containerRef.current) {
                    window.google.accounts.id.renderButton(containerRef.current, {
                        type: "standard",
                        theme: "filled_black",
                        size: "large",
                        shape: "pill",
                        text: "continue_with",
                        width: containerRef.current.offsetWidth || 320,
                    });
                }
                setReady(true);
            })
            .catch(() => onError?.("Impossible de charger Google."));

        return () => { cancelled = true; };
    }, [configured, onError]);

    if (!configured) {
        return (
            <button
                type="button"
                onClick={() => onError?.("La connexion Google n'est pas encore configurée.")}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-medium text-white/80 backdrop-blur-md transition-colors hover:bg-white/[0.08]"
            >
                <GoogleIcon />
                {label}
            </button>
        );
    }

    return (
        <div className="relative">
            {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[#0b0b10]/70 backdrop-blur-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-white/60" />
                </div>
            )}
            {!ready && (
                <div className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-medium text-white/50">
                    <GoogleIcon />
                    {label}
                </div>
            )}
            <div ref={containerRef} className={ready ? "flex justify-center [color-scheme:light]" : "hidden"} />
        </div>
    );
}

function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
            <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
        </svg>
    );
}
