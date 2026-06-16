import { useEffect, useMemo, useState } from 'react';
import axiosClient from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const emptyLine = { product_variant_id: '', quantity: 1 };

const initialForm = {
	customer_id: '',
	status: 'pending',
	price_mode: 'retail',
	name: '',
	email: '',
	phone: '',
	whatsapp: '',
	cuit: '',
	address: '',
	postal_code: '',
	province_id: '',
	province: '',
	locality_id: '',
	locality: '',
	delivery_method_id: '',
	payment_method_id: '',
	coupon_code: '',
	notes: '',
};

const formatMoney = (value) => {
	const amount = Number(value || 0);
	return `$${amount.toFixed(2)}`;
};

const formatPercent = (value) => {
	const amount = Number(value || 0);
	return `${amount.toFixed(2)}%`;
};

const FieldLabel = ({ children }) => (
	<label className="text-sm font-medium leading-none">{children}</label>
);

const pricedAmount = (price, discount) => {
	const originalPrice = Number(price || 0);
	const safeDiscount = Math.min(Math.max(Number(discount || 0), 0), 100);
	return Number((originalPrice * (1 - safeDiscount / 100)).toFixed(2));
};

const calculatePaymentFee = (subtotal, method) => {
	const paymentPercent = Number(method?.fee || 0);
	return Number((Math.max(Number(subtotal || 0), 0) * paymentPercent / 100).toFixed(2));
};

const methodAppliesToPriceMode = (method, priceMode) => {
	const scope = method?.price_mode_scope || 'both';
	return scope === 'both' || scope === priceMode;
};

export default function ManualOrderForm({ onCreated }) {
	const [options, setOptions] = useState({
		customers: [],
		products: [],
		delivery_methods: [],
		payment_methods: [],
	});
	const [form, setForm] = useState(initialForm);
	const [lines, setLines] = useState([{ ...emptyLine }]);
	const [loadingOptions, setLoadingOptions] = useState(true);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		setLoadingOptions(true);
		axiosClient
			.get('admin/orders/manual-options')
			.then(({ data }) => {
				setOptions({
					customers: data.customers || [],
					products: data.products || [],
					delivery_methods: data.delivery_methods || [],
					payment_methods: data.payment_methods || [],
				});
			})
			.catch(() => toast.error('Error al cargar datos para el pedido'))
			.finally(() => setLoadingOptions(false));
	}, []);

	const selectedCustomer = useMemo(
		() => options.customers.find((customer) => String(customer.id) === String(form.customer_id)),
		[options.customers, form.customer_id],
	);

	const variantOptions = useMemo(() => {
		return options.products.flatMap((product) => (
			(product.variants || []).map((variant) => {
				const basePrice = form.price_mode === 'wholesale'
					? product.wholesale_price
					: product.sale_price;
				const discount = form.price_mode === 'wholesale'
					? product.wholesale_discount
					: product.discount;
				return {
					...variant,
					product,
					unitPrice: pricedAmount(basePrice, discount),
					label: [
						product.code,
						product.name,
						variant.color,
						variant.size,
						variant.sku ? `SKU ${variant.sku}` : null,
						`Stock ${variant.stock}`,
					].filter(Boolean).join(' · '),
				};
			})
		)).filter((variant) => variant.unitPrice > 0);
	}, [options.products, form.price_mode]);

	const deliveryMethods = useMemo(
		() => options.delivery_methods.filter((method) => methodAppliesToPriceMode(method, form.price_mode)),
		[options.delivery_methods, form.price_mode],
	);
	const paymentMethods = useMemo(
		() => options.payment_methods.filter((method) => methodAppliesToPriceMode(method, form.price_mode)),
		[options.payment_methods, form.price_mode],
	);

	const subtotal = lines.reduce((total, line) => {
		const variant = variantOptions.find((item) => String(item.id) === String(line.product_variant_id));
		return total + (variant ? variant.unitPrice * Number(line.quantity || 0) : 0);
	}, 0);
	const deliveryFee = Number(
		deliveryMethods.find((method) => String(method.id) === String(form.delivery_method_id))?.fee || 0,
	);
	const paymentFee = Number(
		calculatePaymentFee(
			subtotal,
			paymentMethods.find((method) => String(method.id) === String(form.payment_method_id)),
		),
	);
	const estimatedTotal = Math.max(subtotal + paymentFee, 0) + deliveryFee;
	const fieldsDisabled = !form.customer_id;

	const updateField = (field, value) => {
		setForm((current) => ({ ...current, [field]: value }));
	};

	useEffect(() => {
		setForm((current) => {
			const deliveryStillValid = deliveryMethods.some((method) => String(method.id) === String(current.delivery_method_id));
			const paymentStillValid = paymentMethods.some((method) => String(method.id) === String(current.payment_method_id));

			if (deliveryStillValid && paymentStillValid) {
				return current;
			}

			return {
				...current,
				delivery_method_id: deliveryStillValid ? current.delivery_method_id : '',
				payment_method_id: paymentStillValid ? current.payment_method_id : '',
			};
		});
	}, [deliveryMethods, paymentMethods]);

	const handleCustomerChange = (customerId) => {
		const customer = options.customers.find((item) => String(item.id) === String(customerId));
		setForm((current) => ({
			...current,
			customer_id: customerId,
			name: customer?.name || '',
			email: customer?.email || '',
			phone: customer?.phone || '',
			address: customer?.address || '',
			postal_code: customer?.postal_code || '',
			province_id: customer?.province_id ? String(customer.province_id) : '',
			province: customer?.province || '',
			locality_id: customer?.locality_id ? String(customer.locality_id) : '',
			locality: customer?.locality || '',
		}));
	};

	const updateLine = (index, field, value) => {
		setLines((current) => current.map((line, lineIndex) => (
			lineIndex === index ? { ...line, [field]: value } : line
		)));
	};

	const addLine = () => {
		setLines((current) => [...current, { ...emptyLine }]);
	};

	const removeLine = (index) => {
		setLines((current) => current.filter((_, lineIndex) => lineIndex !== index));
	};

	const resetForm = () => {
		setForm(initialForm);
		setLines([{ ...emptyLine }]);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		const validLines = lines
			.filter((line) => line.product_variant_id && Number(line.quantity) > 0)
			.map((line) => ({
				product_variant_id: Number(line.product_variant_id),
				quantity: Number(line.quantity),
			}));

		if (!form.customer_id) {
			toast.error('Seleccioná un cliente para continuar');
			return;
		}

		if (validLines.length === 0) {
			toast.error('Agregá al menos un producto');
			return;
		}

		setSaving(true);
		try {
			const payload = {
				...form,
				customer_id: Number(form.customer_id),
				delivery_method_id: Number(form.delivery_method_id),
				payment_method_id: Number(form.payment_method_id),
				province_id: form.province_id ? Number(form.province_id) : null,
				locality_id: form.locality_id ? Number(form.locality_id) : null,
				lines: validLines,
			};
			await axiosClient.post('admin/orders', payload);
			toast.success('Pedido cargado correctamente');
			resetForm();
			onCreated?.();
		} catch (error) {
			toast.error(error.response?.data?.message || 'Error al cargar el pedido');
		} finally {
			setSaving(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-5 rounded-md border bg-muted/20 p-4">
			<div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
				<div className="space-y-2">
					<FieldLabel>Cliente</FieldLabel>
					<Select
						value={form.customer_id}
						onValueChange={handleCustomerChange}
						disabled={loadingOptions}
					>
						<SelectTrigger>
							<SelectValue placeholder={loadingOptions ? 'Cargando clientes...' : 'Seleccionar cliente'} />
						</SelectTrigger>
						<SelectContent>
							{options.customers.map((customer) => (
								<SelectItem key={customer.id} value={String(customer.id)}>
									{customer.name} · {customer.email}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2">
					<FieldLabel>Tipo de pedido</FieldLabel>
					<Select
						value={form.price_mode}
						onValueChange={(value) => updateField('price_mode', value)}
						disabled={fieldsDisabled}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="retail">Minorista</SelectItem>
							<SelectItem value="wholesale">Mayorista</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2">
					<FieldLabel>Estado</FieldLabel>
					<Select
						value={form.status}
						onValueChange={(value) => updateField('status', value)}
						disabled={fieldsDisabled}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="pending">Pendiente</SelectItem>
							<SelectItem value="processing">Procesando</SelectItem>
							<SelectItem value="completed">Completada</SelectItem>
							<SelectItem value="cancelled">Cancelada</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="space-y-2">
					<FieldLabel>Nombre</FieldLabel>
					<Input value={form.name} onChange={(event) => updateField('name', event.target.value)} disabled={fieldsDisabled} required />
				</div>
				<div className="space-y-2">
					<FieldLabel>Email</FieldLabel>
					<Input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} disabled={fieldsDisabled} required />
				</div>
				<div className="space-y-2">
					<FieldLabel>Teléfono</FieldLabel>
					<Input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} disabled={fieldsDisabled} />
				</div>
				<div className="space-y-2">
					<FieldLabel>CUIT</FieldLabel>
					<Input value={form.cuit} onChange={(event) => updateField('cuit', event.target.value)} disabled={fieldsDisabled} />
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="space-y-2 lg:col-span-2">
					<FieldLabel>Dirección</FieldLabel>
					<Input value={form.address} onChange={(event) => updateField('address', event.target.value)} disabled={fieldsDisabled} />
				</div>
				<div className="space-y-2">
					<FieldLabel>Localidad</FieldLabel>
					<Input value={form.locality} onChange={(event) => updateField('locality', event.target.value)} disabled={fieldsDisabled} />
				</div>
				<div className="space-y-2">
					<FieldLabel>Provincia</FieldLabel>
					<Input value={form.province} onChange={(event) => updateField('province', event.target.value)} disabled={fieldsDisabled} />
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="space-y-2">
					<FieldLabel>Código postal</FieldLabel>
					<Input value={form.postal_code} onChange={(event) => updateField('postal_code', event.target.value)} disabled={fieldsDisabled} />
				</div>
				<div className="space-y-2">
					<FieldLabel>WhatsApp</FieldLabel>
					<Input value={form.whatsapp} onChange={(event) => updateField('whatsapp', event.target.value)} disabled={fieldsDisabled} />
				</div>
				<div className="space-y-2">
					<FieldLabel>Método de entrega</FieldLabel>
					<Select value={form.delivery_method_id} onValueChange={(value) => updateField('delivery_method_id', value)} disabled={fieldsDisabled}>
						<SelectTrigger>
							<SelectValue placeholder="Seleccionar" />
						</SelectTrigger>
						<SelectContent>
							{deliveryMethods.map((method) => (
								<SelectItem key={method.id} value={String(method.id)}>
									{method.name} · {formatMoney(method.fee)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2">
					<FieldLabel>Método de pago</FieldLabel>
					<Select value={form.payment_method_id} onValueChange={(value) => updateField('payment_method_id', value)} disabled={fieldsDisabled}>
						<SelectTrigger>
							<SelectValue placeholder="Seleccionar" />
						</SelectTrigger>
						<SelectContent>
							{paymentMethods.map((method) => (
								<SelectItem key={method.id} value={String(method.id)}>
									{method.name} · {formatPercent(method.fee)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="space-y-3">
				<div className="flex items-center justify-between gap-3">
					<FieldLabel>Productos</FieldLabel>
					<Button type="button" variant="outline" size="sm" onClick={addLine} disabled={fieldsDisabled}>
						<Plus className="h-4 w-4" />
						Agregar producto
					</Button>
				</div>
				<div className="space-y-2">
					{lines.map((line, index) => {
						const variant = variantOptions.find((item) => String(item.id) === String(line.product_variant_id));
						return (
							<div key={index} className="grid gap-2 rounded-md border bg-background/50 p-3 lg:grid-cols-[minmax(0,1fr)_120px_120px_40px]">
								<Select
									value={line.product_variant_id}
									onValueChange={(value) => updateLine(index, 'product_variant_id', value)}
									disabled={fieldsDisabled}
								>
									<SelectTrigger>
										<SelectValue placeholder="Producto / variante" />
									</SelectTrigger>
									<SelectContent>
										{variantOptions.map((item) => (
											<SelectItem key={item.id} value={String(item.id)}>
												{item.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Input
									type="number"
									min="1"
									value={line.quantity}
									onChange={(event) => updateLine(index, 'quantity', event.target.value)}
									disabled={fieldsDisabled}
								/>
								<div className="flex h-10 items-center justify-end rounded-md border bg-muted/40 px-3 text-sm font-medium">
									{formatMoney((variant?.unitPrice || 0) * Number(line.quantity || 0))}
								</div>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => removeLine(index)}
									disabled={fieldsDisabled || lines.length === 1}
								>
									<Trash2 className="h-4 w-4 text-red-500" />
								</Button>
							</div>
						);
					})}
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
				<div className="space-y-2">
					<FieldLabel>Notas</FieldLabel>
					<Textarea value={form.notes} onChange={(event) => updateField('notes', event.target.value)} disabled={fieldsDisabled} />
				</div>
				<div className="space-y-2">
					<FieldLabel>Cupón</FieldLabel>
					<Input value={form.coupon_code} onChange={(event) => updateField('coupon_code', event.target.value)} disabled={fieldsDisabled} />
					<div className="rounded-md border bg-background/50 p-3 text-sm">
						<div className="flex justify-between"><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
						<div className="flex justify-between"><span>Envío</span><strong>{formatMoney(deliveryFee)}</strong></div>
						<div className="flex justify-between"><span>Ajuste pago</span><strong>{formatMoney(paymentFee)}</strong></div>
						<div className="mt-2 flex justify-between border-t pt-2 text-base"><span>Total estimado</span><strong>{formatMoney(estimatedTotal)}</strong></div>
					</div>
				</div>
			</div>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
					Limpiar
				</Button>
				<Button type="submit" disabled={saving || fieldsDisabled}>
					{saving ? 'Cargando...' : 'Guardar pedido'}
				</Button>
			</div>

			{!selectedCustomer && (
				<p className="text-sm text-muted-foreground">
					Seleccioná un cliente para habilitar el resto de los campos.
				</p>
			)}
		</form>
	);
}
