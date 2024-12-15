import { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { UserContext } from "@/lib/contexts/userContext";
import { BASE_API, API_VERSION } from "../../config.json";
import Login from "../../routes/auth/Login";

export function useAuth() {
	return useContext(UserContext);
}

export function AuthWrapper({ children }) {
	const [isLoading, setIsLoading] = useState(false);
	const [onboarding, setOnboarding] = useState(false);
	const { user, updateUser } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	
	const auth = localStorage.getItem('token');
	if (window.location.pathname.startsWith('/auth') && auth) return window.location.replace('/dash/dashboard');

	useEffect(() => {
		if (!['/dash', '/profile', '/upload'].some(path => window.location.pathname.startsWith(path)) || !auth || (user && user.id)) return;
		setIsLoading(true);

		async function getUser() {
			const data = await fetch(`${BASE_API}/v${API_VERSION}/profiles/me`, { method: 'GET', headers: { 'Authorization': `${auth}` } }).then(response => response.json()).catch(() => null);
			
			if (data?.message === 'Unauthorized.') localStorage.removeItem('token');

			if (data?.error === 'COMPLETE_ONBOARDING') {
				setOnboarding(true);
				if (!window.location.pathname.startsWith('/profile/onboarding')) navigate('/profile/onboarding');
			}

			if (window.location.pathname.startsWith('/profile/onboarding') && data?.id) {
				navigate('/dash/dashboard');
			}

			if (data?.id) {
				updateUser(data);
			}
			setIsLoading(false);
		}

		getUser();
	}, [location]);

	if (onboarding) return <>{children}</>;
	if (!['/dash', '/profile', '/upload'].some(path => window.location.pathname.startsWith(path))) return <>{children}</>;
	if (user && user.id) return <>{children}</>;
	if (!auth) return <Login />;

	return isLoading ? <Loader2 className="animate-spin" /> : user ? <>{children}</> : <Login />;
}

function Layout({ children }) {
	return <>
        <div className="flex">
			<div className="flex items-center justify-between w-full h-full">
				{children}
			</div>
		</div>
	</>
}