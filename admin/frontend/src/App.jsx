import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './views/Login';
import Home from './views/Home';
import UsersList from './views/users/UsersList';
import UserForm from './views/users/UserForm';
import CategoriesList from './views/categories/CategoriesList';
import CategoryForm from './views/categories/CategoryForm';
import TagsList from './views/tags/TagsList';
import TagForm from './views/tags/TagForm';
import ArticlesList from './views/articles/ArticlesList';
import ArticleForm from './views/articles/ArticleForm';
import ArticlesPublicList from './views/articles/ArticlesPublicList';
import ArticlePublicView from './views/articles/ArticlePublicView';
import ProductsList from './views/products/ProductsList';
import ProductForm from './views/products/ProductForm';
import ProductCategoriesList from './views/product-categories/CategoriesList';
import ProductCategoryForm from './views/product-categories/CategoryForm';
import ProductTagsList from './views/product-tags/TagsList';
import ProductTagForm from './views/product-tags/TagForm';
import ProductColorsList from './views/product-colors/ProductColorsList';
import ProductColorForm from './views/product-colors/ProductColorForm';
import ProductSizesList from './views/product-sizes/ProductSizesList';
import ProductSizeForm from './views/product-sizes/ProductSizeForm';
import CouponsList from './views/coupons/CouponList';
import CouponForm from './views/coupons/CouponForm';
import PaymentMethodsList from './views/payment-methods/PaymentMethodsList';
import PaymentMethodForm from './views/payment-methods/PaymentMethodForm';
import DeliveryMethodsList from './views/delivery-methods/DeliveryMethodsList';
import DeliveryMethodForm from './views/delivery-methods/DeliveryMethodForm';
import AutopostGenerator from './views/autopost/AutopostGenerator';
import AutopostSettings from './views/autopost/AutopostSettings';
import ProductsShow from './views/products/ProductsShow';
import SettingsList from './views/settings/SettingsList';
import BusinessInfoSettings from './views/settings/BusinessInfoSettings';
import ImageSettings from './views/settings/ImageSettings';
import BlogSettings from './views/settings/BlogSettings';
import ProductSettings from './views/settings/ProductSettings';
import SystemConfigurations from './views/settings/SystemConfigurations';
import SkinSettings from './views/settings/SkinSettings';
import ShopConfigurationForm from './views/settings/ShopConfigurationForm';
import ContentSettings from './views/site/ContentSettings';
import RolesList from './views/roles/RolesList';

import RoleForm from './views/roles/RoleForm';
import PermissionsList from './views/permissions/PermissionsList';
import PermissionForm from './views/permissions/PermissionForm';
import Profile from './views/Profile';
import NotificationPreferences from './views/NotificationPreferences';
import NotificationsPage from './views/NotificationsPage';
import ActivityLogsList from './views/activity-logs/ActivityLogsList';
import CustomersList from './views/customers/CustomersList';
import CustomerForm from './views/customers/CustomerForm';
import LocalitiesList from './views/localities/LocalitiesList';
import LocalityForm from './views/localities/LocalityForm';
import ProvincesList from './views/provinces/ProvincesList';
import ProvinceForm from './views/provinces/ProvinceForm';
import OrdersList from './views/orders/OrdersList';
import OrderDetails from './views/orders/OrderDetails';
import ContactMessagesList from './views/contact-messages/ContactMessagesList';
import Statistics from './views/statistics/Statistics';
import NotFound from './views/NotFound';
import DashboardLayout from './components/dashboard-layout';
import { hasAnyRole, hasPermission, isSuperAdmin } from './components/can';
import ForgotPassword from './views/ForgotPassword';
import ResetPassword from './views/ResetPassword';


const ProtectedRoute = ({ children, permission, roles, superAdminOnly }) => {
	const token = localStorage.getItem('ACCESS_TOKEN');
	const expiresAt = localStorage.getItem('TOKEN_EXPIRES_AT');
	
	// Check if token exists and is not expired
	const isAuthenticated = !!token;
	const isTokenExpired = expiresAt && new Date(expiresAt) < new Date();
	
	if (!isAuthenticated || isTokenExpired) {
		// Clear expired token data
		if (isTokenExpired) {
			localStorage.removeItem('ACCESS_TOKEN');
			localStorage.removeItem('USER_ROLES');
			localStorage.removeItem('USER_PERMISSIONS');
			localStorage.removeItem('TOKEN_EXPIRES_AT');
			localStorage.removeItem('REMEMBER_ME');
		}
		return <Navigate to="/login" />;
	}
	
	if (superAdminOnly && !isSuperAdmin()) return <Navigate to="/" />;
	if (roles && !hasAnyRole(roles)) return <Navigate to="/" />;
	if (permission && !hasPermission(permission)) return <Navigate to="/" />;
	return (
		<DashboardLayout>
			{children}
		</DashboardLayout>
	);
};

function App() {
	const token = localStorage.getItem('ACCESS_TOKEN');
	const expiresAt = localStorage.getItem('TOKEN_EXPIRES_AT');
	
	// Check if token exists and is not expired
	const isTokenExpired = expiresAt && new Date(expiresAt) < new Date();
	const isAuthenticated = !!token && !isTokenExpired;

	return (
		<Router basename="/vadmin">
			<Routes>
				<Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
				<Route path="/forgot-password" element={<ForgotPassword />} />
				<Route path="/reset-password" element={<ResetPassword />} />

				<Route path="/blog" element={<ArticlesPublicList />} />
				<Route path="/articulos/:slug" element={<ArticlePublicView />} />

				<Route path="/" element={
					<ProtectedRoute>
						<Home />
					</ProtectedRoute>
				} />

				<Route path="/usuarios" element={
					<ProtectedRoute permission="users.view">
						<UsersList />
					</ProtectedRoute>
				} />

				<Route path="/usuarios/crear" element={
					<ProtectedRoute permission="users.create">
						<UserForm />
					</ProtectedRoute>
				} />

				<Route path="/usuarios/editar/:id" element={
					<ProtectedRoute permission="users.edit">
						<UserForm />
					</ProtectedRoute>
				} />

				<Route path="/categorias" element={
					<ProtectedRoute permission="view categories">
						<CategoriesList />
					</ProtectedRoute>
				} />

				<Route path="/categorias/crear" element={
					<ProtectedRoute permission="manage categories">
						<CategoryForm />
					</ProtectedRoute>
				} />

				<Route path="/categorias/editar/:id" element={
					<ProtectedRoute permission="manage categories">
						<CategoryForm />
					</ProtectedRoute>
				} />

				<Route path="/articulos" element={
					<ProtectedRoute permission="view articles">
						<ArticlesList />
					</ProtectedRoute>
				} />

				<Route path="/articulos/crear" element={
					<ProtectedRoute permission="manage articles">
						<ArticleForm />
					</ProtectedRoute>
				} />

				<Route path="/articulos/editar/:id" element={
					<ProtectedRoute permission="manage articles">
						<ArticleForm />
					</ProtectedRoute>
				} />

				<Route path="/etiquetas" element={
					<ProtectedRoute permission="view tags">
						<TagsList />
					</ProtectedRoute>
				} />

				<Route path="/etiquetas/crear" element={
					<ProtectedRoute permission="manage tags">
						<TagForm />
					</ProtectedRoute>
				} />

				<Route path="/etiquetas/editar/:id" element={
					<ProtectedRoute permission="manage tags">
						<TagForm />
					</ProtectedRoute>
				} />

				<Route path="/productos" element={
					<ProtectedRoute permission="view products">
						<ProductsList />
					</ProtectedRoute>
				} />

				<Route path="/productos/crear" element={
					<ProtectedRoute permission="manage products">
						<ProductForm />
					</ProtectedRoute>
				} />

				<Route path="/productos/editar/:id" element={
					<ProtectedRoute permission="manage products">
						<ProductForm />
					</ProtectedRoute>
				} />

				<Route path="/productos/:id" element={
					<ProtectedRoute permission="view products">
						<ProductsShow />
					</ProtectedRoute>
				} />

				<Route path="/productos-categorias" element={
					<ProtectedRoute permission="users.view">
						<ProductCategoriesList />
					</ProtectedRoute>
				} />

				<Route path="/productos-categorias/crear" element={
					<ProtectedRoute permission="users.view">
						<ProductCategoryForm />
					</ProtectedRoute>
				} />

				<Route path="/productos-categorias/editar/:id" element={
					<ProtectedRoute permission="users.view">
						<ProductCategoryForm />
					</ProtectedRoute>
				} />

				<Route path="/productos-etiquetas" element={
					<ProtectedRoute permission="users.view">
						<ProductTagsList />
					</ProtectedRoute>
				} />

				<Route path="/productos-etiquetas/crear" element={
					<ProtectedRoute permission="users.view">
						<ProductTagForm />
					</ProtectedRoute>
				} />

				<Route path="/productos-etiquetas/editar/:id" element={
					<ProtectedRoute permission="users.view">
						<ProductTagForm />
					</ProtectedRoute>
				} />

				<Route path="/roles" element={

					<ProtectedRoute superAdminOnly={true}>
						<RolesList />
					</ProtectedRoute>
				} />

				<Route path="/roles/crear" element={
					<ProtectedRoute superAdminOnly={true}>
						<RoleForm />
					</ProtectedRoute>
				} />

				<Route path="/roles/editar/:id" element={
					<ProtectedRoute superAdminOnly={true}>
						<RoleForm />
					</ProtectedRoute>
				} />

				<Route path="/permisos" element={
					<ProtectedRoute superAdminOnly={true}>
						<PermissionsList />
					</ProtectedRoute>
				} />

				<Route path="/permisos/crear" element={
					<ProtectedRoute superAdminOnly={true}>
						<PermissionForm />
					</ProtectedRoute>
				} />

				<Route path="/permisos/editar/:id" element={
					<ProtectedRoute superAdminOnly={true}>
						<PermissionForm />
					</ProtectedRoute>
				} />

				<Route path="/perfil" element={
					<ProtectedRoute>
						<Profile />
					</ProtectedRoute>
				} />

				<Route path="/perfil/notificaciones" element={
					<ProtectedRoute>
						<NotificationPreferences />
					</ProtectedRoute>
				} />

				<Route path="/mis-notificaciones" element={
					<ProtectedRoute>
						<NotificationsPage />
					</ProtectedRoute>
				} />

				<Route path="/registros-actividad" element={
					<ProtectedRoute permission="view activity logs">
						<ActivityLogsList />
					</ProtectedRoute>
				} />

				<Route path="/clientes" element={
					<ProtectedRoute permission="users.view">
						<CustomersList />
					</ProtectedRoute>
				} />

				<Route path="/clientes/crear" element={
					<ProtectedRoute permission="users.view">
						<CustomerForm />
					</ProtectedRoute>
				} />

				<Route path="/clientes/editar/:id" element={
					<ProtectedRoute permission="users.view">
						<CustomerForm />
					</ProtectedRoute>
				} />

				<Route path="/localidades" element={
					<ProtectedRoute permission="users.view">
						<LocalitiesList />
					</ProtectedRoute>
				} />

				<Route path="/localidades/crear" element={
					<ProtectedRoute permission="users.view">
						<LocalityForm />
					</ProtectedRoute>
				} />

				<Route path="/localidades/editar/:id" element={
					<ProtectedRoute permission="users.view">
						<LocalityForm />
					</ProtectedRoute>
				} />

				<Route path="/provincias" element={
					<ProtectedRoute permission="users.view">
						<ProvincesList />
					</ProtectedRoute>
				} />

				<Route path="/provincias/crear" element={
					<ProtectedRoute permission="users.view">
						<ProvinceForm />
					</ProtectedRoute>
				} />

				<Route path="/provincias/editar/:id" element={
					<ProtectedRoute permission="users.view">
						<ProvinceForm />
					</ProtectedRoute>
				} />

				<Route path="/pedidos" element={
					<ProtectedRoute permission="view orders">
						<OrdersList />
					</ProtectedRoute>
				} />

				<Route path="/pedidos/:id" element={
					<ProtectedRoute permission="view orders">
						<OrderDetails />
					</ProtectedRoute>
				} />

				<Route path="/mensajes-contacto" element={
					<ProtectedRoute permission="users.view">
						<ContactMessagesList />
					</ProtectedRoute>
				} />

				<Route path="/estadisticas" element={
					<ProtectedRoute roles={["Super Admin", "Admin"]}>
						<Statistics />
					</ProtectedRoute>
				} />

				<Route path="/autopost" element={
					<ProtectedRoute permission="manage articles">
						<AutopostGenerator />
					</ProtectedRoute>
				} />

				<Route path="/autopost-configuracion" element={
					<ProtectedRoute permission="manage articles">
						<AutopostSettings />
					</ProtectedRoute>
				} />

				<Route path="/productos-colores" element={
					<ProtectedRoute permission="users.view">
						<ProductColorsList />
					</ProtectedRoute>
				} />

				<Route path="/productos-colores/crear" element={
					<ProtectedRoute permission="users.view">
						<ProductColorForm />
					</ProtectedRoute>
				} />

				<Route path="/productos-colores/editar/:id" element={
					<ProtectedRoute permission="users.view">
						<ProductColorForm />
					</ProtectedRoute>
				} />

				<Route path="/productos-talles" element={
					<ProtectedRoute permission="users.view">
						<ProductSizesList />
					</ProtectedRoute>
				} />

				<Route path="/productos-talles/crear" element={
					<ProtectedRoute permission="users.view">
						<ProductSizeForm />
					</ProtectedRoute>
				} />

				<Route path="/productos-talles/editar/:id" element={
					<ProtectedRoute permission="users.view">
						<ProductSizeForm />
					</ProtectedRoute>
				} />

				<Route path="/cupones" element={
					<ProtectedRoute permission="users.view">
						<CouponsList />
					</ProtectedRoute>
				} />

				<Route path="/cupones/crear" element={
					<ProtectedRoute permission="users.view">
						<CouponForm />
					</ProtectedRoute>
				} />

				<Route path="/cupones/editar/:id" element={
					<ProtectedRoute permission="users.view">
						<CouponForm />
					</ProtectedRoute>
				} />

				<Route path="/metodos-pago" element={
					<ProtectedRoute permission="users.view">
						<PaymentMethodsList />
					</ProtectedRoute>
				} />

				<Route path="/metodos-pago/crear" element={
					<ProtectedRoute permission="users.view">
						<PaymentMethodForm />
					</ProtectedRoute>
				} />

				<Route path="/metodos-pago/editar/:id" element={
					<ProtectedRoute permission="users.view">
						<PaymentMethodForm />
					</ProtectedRoute>
				} />

				<Route path="/metodos-envio" element={
					<ProtectedRoute permission="users.view">
						<DeliveryMethodsList />
					</ProtectedRoute>
				} />

				<Route path="/metodos-envio/crear" element={
					<ProtectedRoute permission="users.view">
						<DeliveryMethodForm />
					</ProtectedRoute>
				} />

				<Route path="/metodos-envio/editar/:id" element={
					<ProtectedRoute permission="users.view">
						<DeliveryMethodForm />
					</ProtectedRoute>
				} />

				<Route path="/configuracion" element={
					<ProtectedRoute>
						<SettingsList />
					</ProtectedRoute>
				} />

				<Route path="/info-negocio" element={
					<ProtectedRoute>
						<BusinessInfoSettings />
					</ProtectedRoute>
				} />

				<Route path="/configuracion-tienda" element={
					<ProtectedRoute>
						<ShopConfigurationForm />
					</ProtectedRoute>
				} />

				<Route path="/imagenes-configuracion" element={
					<ProtectedRoute permission="manage articles">
						<ImageSettings />
					</ProtectedRoute>
				} />

				<Route path="/blog-configuracion" element={
					<ProtectedRoute permission="view blog">
						<BlogSettings />
					</ProtectedRoute>
				} />

				<Route path="/productos-configuracion" element={
					<ProtectedRoute permission="view products">
						<ProductSettings />
					</ProtectedRoute>
				} />

				<Route path="/configuracion-del-sistema" element={
					<ProtectedRoute superAdminOnly={true}>
						<SystemConfigurations />
					</ProtectedRoute>
				} />

				<Route path="/apariencia-configuracion" element={
					<ProtectedRoute superAdminOnly={true}>
						<SkinSettings />
					</ProtectedRoute>
				} />

				<Route path="/contenido-configuracion" element={
					<ProtectedRoute>
						<ContentSettings />
					</ProtectedRoute>
				} />

				<Route path="/dashboard" element={<Navigate to="/" />} />

				{/* Catch-all 404 Route */}
				<Route path="*" element={
					<DashboardLayout>
						<NotFound />
					</DashboardLayout>
				} />
			</Routes>
		</Router>
	);
}

export default App;
