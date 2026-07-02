import { Link, useLocation } from "react-router-dom"
import {
	LayoutDashboard,
	Users,
	Settings,
	ChevronRight,
	FileText,
	ShieldCheck,
	UserCircle,
	History,
	Layers,
	Sparkles,
	KeyRound,
	Box,
	Folder,
	Image,
	Phone,
	Building2,
	MessageSquare,
	Palette,
	Monitor,
	Sun,
	Moon,
	Ruler,
	Ticket,
	ShoppingBag,
	BarChart3,
	Wallet,
	Truck,
	Layout,
	MapPin,
	Mail,
} from "lucide-react"


import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarMenuSub,
	SidebarMenuSubItem,
	SidebarMenuSubButton,
	useSidebar,
} from "@/components/ui/sidebar"

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { hasAnyRole, hasPermission, isSuperAdmin } from "@/components/can"
import { useTheme } from "@/components/theme-provider"
import { useState, useEffect } from "react"
import axiosClient from "@/lib/axios"

const items = [
	{
		title: "Inicio",
		url: "/",
		icon: LayoutDashboard,
	},
	{
		title: "Tienda",
		icon: Box,
		permission: "users.view",
		children: [
			{
				title: "Productos",
				url: "/productos",
				icon: Box,
				permission: "view products",
			},
			{
				title: "Categorías",
				url: "/productos-categorias",
				icon: Layers,
				permission: "view products",
			},
			{
				title: "Colores",
				url: "/productos-colores",
				icon: Palette,
				permission: "view products",
			},
			{
				title: "Talles",
				url: "/productos-talles",
				icon: Ruler,
				permission: "view products",
			},
			{
				title: "Cupones",
				url: "/cupones",
				icon: Ticket,
				permission: "users.view",
			},
			{
				title: "Métodos de Pago",
				url: "/metodos-pago",
				icon: Wallet,
				permission: "users.view",
			},
			{
				title: "Métodos de Envío",
				url: "/metodos-envio",
				icon: Truck,
				permission: "users.view",
			},
			{
				title: "Configuración",
				url: "/configuracion-tienda",
				icon: Settings,
				permission: "users.view",
			},
		],
	},
	{
		title: "Pedidos",
		url: "/pedidos",
		icon: ShoppingBag,
		permission: "view orders",
	},
	{
		title: "Estadísticas",
		url: "/estadisticas",
		icon: BarChart3,
		roles: ["Super Admin", "Admin"],
	},
	{
		title: "Clientes",
		url: "/clientes",
		icon: Building2,
		permission: "users.view",
	},
	{
		title: "Mensajes Contacto",
		url: "/mensajes-contacto",
		icon: MessageSquare,
		permission: "users.view",
	},
	{
		title: "Sitio",
		icon: Monitor,
		permission: "users.view",
		children: [
			{
				title: "Contenido",
				url: "/contenido-configuracion",
				icon: Layout,
				permission: "users.view",
			},
			{
				title: "Suscripciones",
				url: "/newsletter",
				icon: Mail,
				permission: "users.view",
			},
		],
	},
	{
		title: "Sistema",
		icon: Monitor,
		permission: "users.view",
		children: [
			{
				title: "Usuarios",
				url: "/usuarios",
				icon: UserCircle,
				permission: "users.view",
			},
			{
				title: "Roles",
				url: "/roles",
				icon: ShieldCheck,
				superAdminOnly: true,
			},
			{
				title: "Permisos",
				url: "/permisos",
				icon: KeyRound,
				superAdminOnly: true,
			},
			{
				title: "Registros de Actividad",
				url: "/registros-actividad",
				icon: History,
				permission: "view activity logs",
			},
			{
				title: "Provincias",
				url: "/provincias",
				icon: Building2,
				permission: "users.view",
			},
			{
				title: "Localidades",
				url: "/localidades",
				icon: MapPin,
				permission: "users.view",
			},
		],
	},
	{
		title: "Configuraciones",
		icon: Settings,
		permission: "users.view",
		children: [
			{
				title: "General",
				url: "/configuracion",
				icon: Settings,
				permission: "users.view",
			},
			{
				title: "Info de Negocio",
				url: "/info-negocio",
				icon: Phone,
				permission: "users.view",
			},
			{
				title: "Sistema",
				url: "/configuracion-del-sistema",
				icon: Settings,
				superAdminOnly: true,
			},
			{
				title: "Apariencia",
				url: "/apariencia-configuracion",
				icon: Palette,
				superAdminOnly: true,
			},
		],
	},
]

const getUserRole = () => {
	const primaryRole = JSON.parse(localStorage.getItem('USER_PRIMARY_ROLE') || 'null');
	if (primaryRole?.display_name) return primaryRole.display_name;
	if (primaryRole?.name) return primaryRole.name;
	return 'Usuario';
};

export function AppSidebar() {
	const location = useLocation();
	const { state, isMobile, setOpenMobile } = useSidebar();
	const { theme, setTheme } = useTheme();
	const [businessName, setBusinessName] = useState('');

	useEffect(() => {
		if (isMobile) {
			setOpenMobile(false);
		}
	}, [location.pathname, isMobile, setOpenMobile]);

	useEffect(() => {
		// Fetch business name from settings
		axiosClient.get("/system-settings/business_name")
			.then(({ data }) => {
				if (data.data?.value) {
					setBusinessName(data.data.value);
				}
			})
			.catch(() => {
				// Silently fail if setting doesn't exist
			});
	}, []);

	const isActive = (url) => location.pathname === url;
	const isGroupActive = (item) => {
		if (item.url && isActive(item.url)) return true;
		if (item.children) return item.children.some(child => isActive(child.url));
		return false;
	};

	const filteredItems = items.map(item => {
		if (item.children) {
			// Filter children based on permissions or superAdminOnly
			const filteredChildren = item.children.filter(child => {
				if (child.superAdminOnly) {
					return isSuperAdmin();
				}
				if (child.roles) {
					return hasAnyRole(child.roles);
				}
				return !child.permission || hasPermission(child.permission);
			});
			return { ...item, children: filteredChildren };
		}
		return item;
	}).filter(item => {
		if (item.children) {
			return item.children.length > 0;
		}
		if (item.superAdminOnly) {
			return isSuperAdmin();
		}
		if (item.roles) {
			return hasAnyRole(item.roles);
		}
		return !item.permission || hasPermission(item.permission);
	});

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader className="p-4 mb-2 group-data-[collapsible=icon]:px-2">
				<div className="flex flex-col items-center">
					<div className="flex items-center gap-3 font-bold text-2xl tracking-tight group-data-[collapsible=icon]:justify-center">
						<span className="bg-linear-to-r from-cyan-400 via-teal-400 to-blue-500 bg-clip-text text-transparent whitespace-nowrap">
							{state === "collapsed" ? "V" : "VADMIN3"}
						</span>
					</div>
					{businessName && state !== "collapsed" && (
						<span className="text-xs font-thin text-muted-foreground truncate max-w-[180px] mt-1">
							{businessName}
						</span>
					)}
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className="px-2 mb-2 text-xs uppercase tracking-widest font-bold opacity-50">{"Menú Principal"}</SidebarGroupLabel>
					<SidebarMenu className="gap-1">
						{filteredItems.map((item) => {
							const active = isGroupActive(item);
							return (
								<SidebarMenuItem key={item.title}>
									{item.children ? (
										state === "collapsed" ? (
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<SidebarMenuButton
														tooltip={item.title}
														isActive={active}
														className={`group h-10 transition-all duration-200 group-data-[collapsible=icon]:justify-center ${active ? "bg-linear-to-r from-primary/20 to-transparent" : "hover:bg-primary/5"}`}
													>
														{item.icon && (
															<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 mr-1 group-data-[collapsible=icon]:mr-0 transition-colors duration-200 group-hover:bg-primary/20">
																<item.icon className="h-4 w-4 text-primary" />
															</div>
														)}
														<span className="font-medium text-sm transition-colors duration-200 group-data-[collapsible=icon]:hidden">{item.title}</span>
													</SidebarMenuButton>
												</DropdownMenuTrigger>
												<DropdownMenuContent side="right" align="start" className="min-w-48">
													{item.children
														.filter(subItem => !subItem.permission || hasPermission(subItem.permission))
														.map((subItem) => {
															if (subItem.isThemeToggle) {
																const ThemeIcon = theme === 'dark' ? Sun : Moon;
																return (
																	<DropdownMenuItem
																		key={subItem.title}
																		onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
																		className="flex items-center gap-2 cursor-pointer"
																	>
																		<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
																			<ThemeIcon className="h-3.5 w-3.5 text-primary" />
																		</div>
																		<span className="text-sm">{subItem.title}</span>
																	</DropdownMenuItem>
																);
															}
															return (
																<DropdownMenuItem key={subItem.title} asChild>
																	<Link to={subItem.url} className="flex items-center gap-2 cursor-pointer">
																		{subItem.icon && (
																			<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
																				<subItem.icon className="h-3.5 w-3.5 text-primary" />
																			</div>
																		)}
																		<span className="text-sm">{subItem.title}</span>
																	</Link>
																</DropdownMenuItem>
															);
														})}
												</DropdownMenuContent>
											</DropdownMenu>
										) : (
											<Collapsible className="group/collapsible" defaultOpen={active}>
												<CollapsibleTrigger asChild>
													<SidebarMenuButton
														tooltip={item.title}
														isActive={active}
														className={`group h-10 transition-all duration-200 group-data-[collapsible=icon]:justify-center ${active ? "bg-linear-to-r from-primary/20 to-transparent" : "hover:bg-primary/5"}`}
													>
														{item.icon && (
															<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 mr-1 group-data-[collapsible=icon]:mr-0 transition-colors duration-200 group-hover/collapsible:bg-primary/20">
																<item.icon className="h-4 w-4 text-primary" />
															</div>
														)}
														<span className="font-medium text-sm transition-colors duration-200 group-data-[collapsible=icon]:hidden">{item.title}</span>
														<ChevronRight className="ml-auto h-3.5 w-3.5 opacity-40 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
													</SidebarMenuButton>
												</CollapsibleTrigger>
												<CollapsibleContent>
													<SidebarMenuSub className="ml-5 border-l-0 py-1 gap-1">
														{item.children.map((subItem) => {
															const subActive = isActive(subItem.url);
															if (subItem.isThemeToggle) {
																const ThemeIcon = theme === 'dark' ? Sun : Moon;
																return (
																	<SidebarMenuSubItem key={subItem.title}>
																		<SidebarMenuSubButton
																			isActive={false}
																			onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
																			className="h-9 px-3 transition-all duration-200 hover:bg-primary/5 cursor-pointer w-full flex items-center gap-2"
																		>
																			<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
																				<ThemeIcon className="h-3.5 w-3.5 text-primary" />
																			</div>
																			<span className="text-sm opacity-80">{subItem.title}</span>
																		</SidebarMenuSubButton>
																	</SidebarMenuSubItem>
																);
															}
															return (
																<SidebarMenuSubItem key={subItem.title}>
																	<SidebarMenuSubButton
																		asChild
																		isActive={subActive}
																		className={`h-9 px-3 transition-all duration-200 ${subActive ? "bg-linear-to-r from-primary/20 to-transparent font-medium" : "hover:bg-primary/5"}`}
																	>
																		<Link to={subItem.url} className="w-full flex items-center gap-2">
																			{subItem.icon && (
																				<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
																					<subItem.icon className="h-3.5 w-3.5 text-primary" />
																				</div>
																			)}
																			<span className="text-sm opacity-80">{subItem.title}</span>
																		</Link>
																	</SidebarMenuSubButton>
																</SidebarMenuSubItem>
															);
														})}
													</SidebarMenuSub>
												</CollapsibleContent>
											</Collapsible>
										)
									) : (
										<SidebarMenuButton
											asChild
											tooltip={item.title}
											isActive={isActive(item.url)}
											className={`group h-10 transition-all duration-200 group-data-[collapsible=icon]:justify-center ${isActive(item.url) ? "bg-linear-to-r from-primary/20 to-transparent" : "hover:bg-primary/5"}`}
										>
											<Link to={item.url} className="flex items-center w-full group-data-[collapsible=icon]:justify-center">
												{item.icon && (
													<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 mr-1 group-data-[collapsible=icon]:mr-0 transition-colors duration-200 group-hover:bg-primary/20">
														<item.icon className="h-4 w-4 text-primary" />
													</div>
												)}
												<span className="font-medium text-sm transition-colors duration-200 group-data-[collapsible=icon]:hidden">{item.title}</span>
											</Link>
										</SidebarMenuButton>
									)}
								</SidebarMenuItem>
							);
						})}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className="p-4 border-t border-primary/5">
				<div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
					<div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
						<UserCircle className="h-5 w-5 text-primary" />
					</div>
					<div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden text-left">
						<span className="text-sm font-semibold truncate text-primary">{"Rol"}</span>
						<span className="text-[10px] tracking-wider text-muted-foreground truncate">{getUserRole()}</span>
					</div>
				</div>
			</SidebarFooter>
		</Sidebar>
	)
}
