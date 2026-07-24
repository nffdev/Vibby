import { useState } from "react";
import { Link } from "react-router-dom";
import { AtSign, Lock, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";
import { BASE_API, API_VERSION } from "../../config.json";

export default function Login() {
    const [datas, setDatas] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function login() {
        if (!datas.email) return setError("Email is required.");
        if (!datas.password) return setError("Password is required.");

        setError("");
        setLoading(true);

        try {
            const response = await fetch(`${BASE_API}/v${API_VERSION}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datas),
            });
            const json = await response.json();

            if (json.token) {
                localStorage.setItem("token", json.token);
                window.location.replace("/videoscreen");
                return;
            }
            setError(json.message || "An error occurred.");
        } catch {
            setError("An error occurred.");
        }
        setLoading(false);
    }

    const update = (key) => (e) => setDatas((prev) => ({ ...prev, [key]: e.target.value }));

    return (
        <AuthShell
            eyebrow="Content de te revoir"
            title="Reprends"
            accent="le fil."
            error={error}
            footer={
                <>
                    Pas encore de compte ?{" "}
                    <Link to="/auth/register" className="text-white underline-offset-4 transition hover:underline">
                        Créer un compte
                    </Link>
                </>
            }
        >
            <form
                className="mt-8 space-y-3"
                onSubmit={(e) => {
                    e.preventDefault();
                    login();
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
                    autoComplete="current-password"
                    icon={Lock}
                    label="Mot de passe"
                    value={datas.password}
                    onChange={update("password")}
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
                            Se connecter
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                    )}
                </Button>
            </form>
        </AuthShell>
    );
}
