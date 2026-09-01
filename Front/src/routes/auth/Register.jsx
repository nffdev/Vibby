import { useState } from "react";
import { Link } from "react-router-dom";
import { AtSign, Lock, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";
import GoogleButton from "@/components/auth/GoogleButton";
import { BASE_API, API_VERSION } from "../../config.json";

export default function Register() {
    const [datas, setDatas] = useState({ email: "", password: "", confirmPassword: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function register() {
        if (!datas.email) return setError("L'email est requis.");
        if (!datas.password) return setError("Le mot de passe est requis.");
        if (!datas.confirmPassword) return setError("La confirmation du mot de passe est requise.");
        if (datas.password !== datas.confirmPassword) return setError("Les mots de passe ne correspondent pas.");

        setError("");
        setLoading(true);

        try {
            const response = await fetch(`${BASE_API}/v${API_VERSION}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datas),
            });
            const json = await response.json();

            if (json.token) {
                localStorage.setItem("token", json.token);
                window.location.replace("/profile/onboarding");
                return;
            }
            setError(json.message || "Une erreur est survenue.");
        } catch {
            setError("Une erreur est survenue.");
        }
        setLoading(false);
    }

    const update = (key) => (e) => setDatas((prev) => ({ ...prev, [key]: e.target.value }));

    return (
        <AuthShell
            eyebrow="Bêta ouverte"
            title="Commence"
            accent="à filmer."
            error={error}
            footer={
                <>
                    Déjà un compte ?{" "}
                    <Link to="/auth/login" className="text-white underline-offset-4 transition hover:underline">
                        Se connecter
                    </Link>
                </>
            }
        >
            <form
                className="mt-8 space-y-3"
                onSubmit={(e) => {
                    e.preventDefault();
                    register();
                }}
            >
                <AuthField
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    icon={AtSign}
                    label="Adresse email"
                    value={datas.email}
                    onChange={update("email")}
                />
                <AuthField
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    icon={Lock}
                    label="Mot de passe"
                    value={datas.password}
                    onChange={update("password")}
                />
                <AuthField
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    icon={ShieldCheck}
                    label="Confirmer le mot de passe"
                    value={datas.confirmPassword}
                    onChange={update("confirmPassword")}
                />

                <Button
                    type="submit"
                    variant="ghost"
                    size={null}
                    disabled={loading}
                    className="group mt-6 w-full rounded-2xl bg-white py-4 text-sm font-semibold text-black transition-transform hover:bg-white hover:scale-[1.02] active:scale-95"
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            Créer mon compte
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                    )}
                </Button>
            </form>

            <div className="my-6 flex items-center gap-4">
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">ou</span>
                <span className="h-px flex-1 bg-white/10" />
            </div>

            <GoogleButton onError={setError} />
        </AuthShell>
    );
}
