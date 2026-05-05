import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import axiosClient from '@/lib/axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from 'lucide-react';
import DeepSpaceBackground from "@/components/ui/DeepSpaceBackground";

export default function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [rememberMe, setRememberMe] = useState(false);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			const { data } = await axiosClient.post('login', {
				email,
				password,
				remember: rememberMe
			});

			const user = data.user;
			const roles = user.roles ? user.roles.map(role => role.name) : [];
			const permissions = user.permissions || [];
			const primaryRole = user.primary_role || null;

			localStorage.setItem('ACCESS_TOKEN', data.access_token);
			localStorage.setItem('USER_ROLES', JSON.stringify(roles));
			localStorage.setItem('USER_PERMISSIONS', JSON.stringify(permissions));
			localStorage.setItem('USER_PRIMARY_ROLE', JSON.stringify(primaryRole));
			localStorage.setItem('TOKEN_EXPIRES_AT', data.expires_at);
			localStorage.setItem('REMEMBER_ME', data.remember ? 'true' : 'false');

			toast.success("¡Inicio de sesión exitoso!");
			window.location.href = '/vadmin/';
		} catch (err) {
			console.error("Login technical error:", err);

			if (err.response && err.response.status === 422) {
				// Validation error or incorrect credentials
				setError(err.response.data.message || "Ocurrió un error durante el inicio de sesión.");
			} else if (err.response && err.response.status >= 500) {
				// Server error (DB connection, etc.)
				setError("Ocurrió un error durante el inicio de sesión.");
			} else {
				// Unknown or network error
				setError("Ocurrió un error durante el inicio de sesión.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-black">
			<div className="absolute inset-0">
				{/* Dark base gradient: black to deep putrple */}
				<div className="absolute inset-0" style={{
					background: 'linear-gradient(to bottom, #000000 0%, #0a0010 20%, #150020 40%, #1a0a2e 55%, #2d1040 70%, #3d1045 85%, #1a0a15 100%)'
				}} />
				{/* Main glowing orb - magenta/pink center */}
				<div className="absolute inset-0" style={{
					background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(255, 0, 128, 0.7) 0%, rgba(200, 0, 100, 0.5) 15%, rgba(150, 0, 80, 0.35) 30%, rgba(80, 0, 60, 0.2) 50%, transparent 70%)',
					pointerEvents: 'none',
				}} />
				{/* Secondary warm red/orange glow - right side */}
				<div className="absolute inset-0" style={{
					background: 'radial-gradient(ellipse 40% 45% at 70% 95%, rgba(200, 60, 20, 0.5) 0%, rgba(160, 40, 10, 0.3) 25%, rgba(100, 20, 5, 0.15) 50%, transparent 70%)',
					pointerEvents: 'none',
				}} />
				{/* Left side subtle warm glow */}
				<div className="absolute inset-0" style={{
					background: 'radial-gradient(ellipse 35% 40% at 25% 98%, rgba(200, 100, 20, 0.3) 0%, rgba(150, 50, 10, 0.15) 30%, transparent 60%)',
					pointerEvents: 'none',
				}} />
				{/* Bright hotspot at the very bottom center */}
				<div className="absolute inset-0" style={{
					background: 'radial-gradient(ellipse 30% 20% at 50% 105%, rgba(255, 100, 200, 0.8) 0%, rgba(255, 50, 150, 0.4) 30%, transparent 60%)',
					pointerEvents: 'none',
				}} />
				{/* Subtle arc/rim light */}
				<div className="absolute w-full" style={{
					bottom: 0,
					left: 0,
					height: '3%',
					background: 'radial-gradient(ellipse 60% 100% at 50% 100%, rgba(255, 180, 100, 0.3) 0%, transparent 70%)',
					pointerEvents: 'none',
				}} />
				<DeepSpaceBackground />
			</div>

			<div className="relative z-10 w-full max-w-md">
				<h1 className="text-5xl font-bold text-center mb-8 tracking-tight">
					<span className="bg-linear-to-r from-cyan-400 via-teal-400 to-blue-500 bg-clip-text text-transparent">
						<b>VADMIN</b>
					</span>
				</h1>

				<Card className="bg-slate-900/92 backdrop-blur-xl border-none shadow-2xl" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
					<CardContent className="pt-8 pb-6">
						<form onSubmit={handleSubmit} className="space-y-5">
							{error && (
								<div className="bg-destructive/15 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
									{error}
								</div>
							)}

							<div className="space-y-2">
								<Label htmlFor="email" className="text-sm font-medium text-slate-300">
									{"Correo Electrónico"}
								</Label>
								<Input
									id="email"
									type="email"
									placeholder="admin@example.com"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="h-11 bg-slate-800/50 border-none focus:ring-2 focus:ring-cyan-500/20 text-slate-100 placeholder:text-slate-500 transition-all"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="password" className="text-sm font-medium text-slate-300">
									{"Contraseña"}
								</Label>
								<Input
									id="password"
									type="password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="h-11 bg-slate-800/50 border-none focus:ring-2 focus:ring-cyan-500/20 text-slate-100 placeholder:text-slate-500 transition-all"
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Checkbox
										id="remember"
										checked={rememberMe}
										onCheckedChange={(checked) => setRememberMe(checked === true)}
										className="border-slate-600 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
									/>
									<Label htmlFor="remember" className="text-sm text-slate-300 cursor-pointer">
										{"Recordarme"}
									</Label>
								</div>
								<Link
									to="/forgot-password"
									className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
								>
									{"¿Olvidaste tu contraseña?"}
								</Link>
							</div>

							<Button
								className="w-full h-11 font-medium bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
								type="submit"
								disabled={loading}
							>
								{loading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										{"Iniciando sesión..."}
									</>
								) : (
									"Ingresar"
								)}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
