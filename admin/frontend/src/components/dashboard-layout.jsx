import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { User, LogOut, Bell, Moon, X } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/components/theme-provider"
import axiosClient from "@/lib/axios"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"

export default function DashboardLayout({ children }) {
	const { theme, setTheme } = useTheme()
	const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
	const [user, setUser] = useState(null)
	const [isMounted, setIsMounted] = useState(false)
	const [notifications, setNotifications] = useState([])
	const [unreadCount, setUnreadCount] = useState(0)

	useEffect(() => {
		setIsMounted(true)
	}, [])

	useEffect(() => {
		axiosClient.get("user")
			.then(({ data }) => {
				setUser(data.data)
			})
			.catch(() => {
			})
	}, [])

	useEffect(() => {
		fetchNotifications()
	}, [])

	const fetchNotifications = () => {
		axiosClient.get("notifications")
			.then(({ data }) => {
				setNotifications(data.notifications || [])
				setUnreadCount(data.unread_count || 0)
			})
			.catch(() => {
			})
	}

	const handleLogout = () => {
		localStorage.removeItem('ACCESS_TOKEN');
		localStorage.removeItem('USER_ROLES');
		localStorage.removeItem('USER_PERMISSIONS');
		localStorage.removeItem('TOKEN_EXPIRES_AT');
		localStorage.removeItem('REMEMBER_ME');
		window.location.href = '/vadmin/login';
	};

	const markAsRead = (notificationId) => {
		axiosClient.patch(`notifications/${notificationId}/read`)
			.then(() => {
				setNotifications(prev =>
					prev.map(n => n.id === notificationId ? { ...n, read_at: new Date() } : n)
				)
				setUnreadCount(prev => Math.max(0, prev - 1))
			})
			.catch(() => {
			})
	}

	const markAllAsRead = () => {
		axiosClient.patch("notifications/read-all")
			.then(() => {
				setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date() })))
				setUnreadCount(0)
			})
			.catch(() => {
			})
	}

	const deleteNotification = (e, notificationId) => {
		e.stopPropagation()
		axiosClient.delete(`notifications/${notificationId}`)
			.then(() => {
				const notification = notifications.find(n => n.id === notificationId)
				setNotifications(prev => prev.filter(n => n.id !== notificationId))
				if (notification && !notification.read_at) {
					setUnreadCount(prev => Math.max(0, prev - 1))
				}
			})
			.catch(() => {
			})
	}

	return (
		<>
			<div
				className={`fixed inset-0 bg-[#020617] z-9999 transition-opacity duration-1000 pointer-events-none ${isMounted ? 'opacity-0' : 'opacity-100'
					}`} />
			<SidebarProvider>
				<AppSidebar className="glass-panel border-r border-white/5" />
				<SidebarInset className="bg-transparent">
					<header className="flex h-20 shrink-0 items-center justify-between px-6 md:px-10 sticky top-0 z-10 glass-panel border-b border-white/10 shadow-lg">
						<div className="flex items-center gap-2">
							<SidebarTrigger className="-ml-1 hover:bg-primary/10 transition-colors" />
							<Separator orientation="vertical" className="mx-2 h-6 bg-white/10" />
						</div>

						<div className="flex items-center gap-3">

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="relative h-10 w-10 rounded-full hover:bg-primary/10 transition-colors"
									>
										<Bell className="h-5 w-5" />
										{unreadCount > 0 && (
											<span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
												{unreadCount > 9 ? '9+' : unreadCount}
											</span>
										)}
										<span className="sr-only">Notificaciones</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-80 glass-panel border-white/10 shadow-2xl p-2">
									<DropdownMenuLabel className="flex items-center justify-between">
										<span>Notificaciones</span>
										{unreadCount > 0 && (
											<Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-auto p-1">
												Marcar todas leídas
											</Button>
										)}
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{notifications.length === 0 ? (
										<div className="p-4 text-center text-muted-foreground text-sm">
											No hay notificaciones
										</div>
									) : (
										<div className="max-h-80 overflow-y-auto">
											{notifications.slice(0, 10).map((notification) => (
												<DropdownMenuItem
													key={notification.id}
													className="flex flex-col items-start p-3 cursor-pointer rounded-lg hover:bg-primary/10 transition-colors duration-200 focus:bg-primary/10"
													onClick={() => !notification.read_at && markAsRead(notification.id)}
												>
													<div className="flex items-center gap-2 w-full">
														{!notification.read_at && (
															<span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
														)}
														<span className="font-medium text-sm flex-1 truncate">{notification.title}</span>
														<button
															onClick={(e) => deleteNotification(e, notification.id)}
															className="h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center shrink-0"
														>
															<X className="h-3 w-3" />
														</button>
													</div>
													{notification.message && (
														<p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
													)}
													<span className="text-xs text-muted-foreground mt-1">
														{new Date(notification.created_at).toLocaleString('es-ES')}
													</span>
												</DropdownMenuItem>
											))}
										</div>
									)}
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<Link to="/mis-notificaciones" className="cursor-pointer text-center text-sm text-primary">
											Ver todas las notificaciones
										</Link>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
										<Avatar className="h-10 w-10">
											<AvatarImage src={user?.avatar_url} alt={user?.name} />
											<AvatarFallback className="bg-primary/10 text-primary">
												{user?.name?.charAt(0)?.toUpperCase() || "U"}
											</AvatarFallback>
										</Avatar>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-64 glass-panel border-white/10 shadow-2xl p-2">
									<DropdownMenuLabel className="font-normal">
										<div className="flex flex-col space-y-1">
											<p className="text-sm font-medium">{user?.name || "common.user"}</p>
											<p className="text-xs text-muted-foreground">{user?.email}</p>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<Link to="/perfil" className="cursor-pointer flex items-center py-3 px-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200 focus:bg-primary/10 group">
											<User className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
											<span className="font-medium">{"Perfil"}</span>
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link to="/perfil/notificaciones" className="cursor-pointer flex items-center py-3 px-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200 focus:bg-primary/10 group">
											<Bell className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
											<span className="font-medium">{"Notificaciones"}</span>
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<div className="flex items-center justify-between px-3 py-3">
										<div className="flex items-center gap-2">
											<Moon className="h-4 w-4 text-muted-foreground" />
											<span className="text-sm">{"Modo Oscuro"}</span>
										</div>
										<Switch
											checked={theme === "dark"}
											onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
										/>
									</div>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => setLogoutConfirmOpen(true)}
										className="py-3 px-3 rounded-lg cursor-pointer flex items-center text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 focus:bg-red-500/10 focus:text-red-300 group"
									>
										<LogOut className="mr-3 h-4 w-4 text-red-400/70 group-hover:text-red-400 transition-colors" />
										<span className="font-medium">{"Cerrar Sesión"}</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</header>
					<main className="flex-1 p-6 md:p-5">
						{children}
					</main>
				</SidebarInset>
			</SidebarProvider>

			<AlertDialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{"¿Cerrar sesión?"}</AlertDialogTitle>
						<AlertDialogDescription>
							{"¿Estás seguro de que quieres cerrar sesión?"}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{"Cancelar"}</AlertDialogCancel>
						<AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
							{"Cerrar Sesión"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}