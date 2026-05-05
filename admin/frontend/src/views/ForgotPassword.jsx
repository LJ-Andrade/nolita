import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import axiosPublic from "@/lib/axios-public";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import DeepSpaceBackground from "@/components/ui/DeepSpaceBackground";

export default function ForgotPassword() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const response = await axiosPublic.post("/password/email", { email });
			const message = response.data.message;
			
			// Map Laravel response keys to Spanish if needed
			const translations = {
				"passwords.sent": "¡Te hemos enviado por correo el enlace para restablecer tu contraseña!",
				"passwords.throttled": "Por favor espera antes de intentar de nuevo.",
				"passwords.user": "No podemos encontrar un usuario con esa dirección de correo electrónico.",
			};

			toast.success(translations[message] || message || "Hemos enviado un enlace de recuperación a tu correo.");
		} catch (err) {
			console.error("Error requesting password reset:", err);
			const message = err.response?.data?.message;
			
			const translations = {
				"passwords.throttled": "Por favor espera antes de intentar de nuevo.",
				"passwords.user": "No podemos encontrar un usuario con esa dirección de correo electrónico.",
			};

			toast.error(translations[message] || message || "Ocurrió un error al procesar tu solicitud.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-black">
			<div className="absolute inset-0">
				{/* Background Gradients */}
				<div className="absolute inset-0" style={{
					background: 'linear-gradient(to bottom, #000000 0%, #0a0010 20%, #150020 40%, #1a0a2e 55%, #2d1040 70%, #3d1045 85%, #1a0a15 100%)'
				}} />
				<div className="absolute inset-0" style={{
					background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(255, 0, 128, 0.7) 0%, rgba(200, 0, 100, 0.5) 15%, rgba(150, 0, 80, 0.35) 30%, rgba(80, 0, 60, 0.2) 50%, transparent 70%)',
					pointerEvents: 'none',
				}} />
				<div className="absolute inset-0" style={{
					background: 'radial-gradient(ellipse 40% 45% at 70% 95%, rgba(200, 60, 20, 0.5) 0%, rgba(160, 40, 10, 0.3) 25%, rgba(100, 20, 5, 0.15) 50%, transparent 70%)',
					pointerEvents: 'none',
				}} />
				<div className="absolute inset-0" style={{
					background: 'radial-gradient(ellipse 35% 40% at 25% 98%, rgba(200, 100, 20, 0.3) 0%, rgba(150, 50, 10, 0.15) 30%, transparent 60%)',
					pointerEvents: 'none',
				}} />
				<div className="absolute inset-0" style={{
					background: 'radial-gradient(ellipse 30% 20% at 50% 105%, rgba(255, 100, 200, 0.8) 0%, rgba(255, 50, 150, 0.4) 30%, transparent 60%)',
					pointerEvents: 'none',
				}} />
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
				<div className="text-center mb-8">
					<h1 className="text-5xl font-bold tracking-tight">
						<span className="bg-linear-to-r from-cyan-400 via-teal-400 to-blue-500 bg-clip-text text-transparent">
							<b>VADMIN</b>
						</span>
					</h1>
				</div>

				<Card className="bg-slate-900/92 backdrop-blur-xl border-none shadow-2xl" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
					<CardHeader>
						<CardTitle className="text-2xl font-semibold text-center">Recuperar Contraseña</CardTitle>
						<CardDescription className="text-center">
							Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
						</CardDescription>
					</CardHeader>
					<form onSubmit={handleSubmit}>
						<CardContent className="space-y-4 pt-4">
							<div className="space-y-2">
								<Label htmlFor="email" className="text-sm font-medium text-slate-300">Correo Electrónico</Label>
								<div className="relative">
									<Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
									<Input
										id="email"
										type="email"
										placeholder="tu@email.com"
										className="h-11 pl-10 bg-slate-800/50 border-none focus:ring-2 focus:ring-cyan-500/20 text-slate-100 placeholder:text-slate-500 transition-all"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
									/>
								</div>
							</div>
						</CardContent>
						<CardFooter className="flex flex-col space-y-4 pb-8">
							<Button 
								type="submit" 
								className="w-full h-11 font-medium bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-900/20"
								disabled={loading}
							>
								{loading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Enviando...
									</>
								) : (
									"Enviar Enlace"
								)}
							</Button>
							
							<Link to="/login" className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
								<ArrowLeft className="h-4 w-4" />
								Volver al inicio de sesión
							</Link>
						</CardFooter>
					</form>
				</Card>
			</div>
		</div>
	);
}
