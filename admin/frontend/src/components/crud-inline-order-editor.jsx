import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CrudInlineOrderEditor({
	value,
	onSave,
	emptyValue = 0,
	inputClassName = "h-7 w-16 text-sm",
	displayClassName = "text-sm",
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [draftValue, setDraftValue] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);

	const displayValue = value ?? emptyValue;

	const startEditing = () => {
		setIsEditing(true);
		setDraftValue(String(displayValue));
	};

	const cancelEditing = () => {
		setIsEditing(false);
		setDraftValue("");
	};

	const saveOrder = async () => {
		if (draftValue === "") {
			cancelEditing();
			return;
		}

		const orderValue = parseInt(draftValue, 10);
		if (Number.isNaN(orderValue)) {
			toast.error("Ingresá un número válido");
			return;
		}

		setIsSaving(true);
		try {
			await onSave(orderValue);
			setIsEditing(false);
			setShowSuccess(true);
			setTimeout(() => setShowSuccess(false), 2000);
		} catch (error) {
			toast.error("Error al guardar");
			console.error(error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleKeyDown = (event) => {
		if (event.key === "Enter") {
			saveOrder();
		} else if (event.key === "Escape") {
			cancelEditing();
		}
	};

	if (isEditing) {
		return (
			<div className="flex items-center gap-1">
				<Input
					type="number"
					className={inputClassName}
					value={draftValue}
					onChange={(event) => setDraftValue(event.target.value)}
					onKeyDown={handleKeyDown}
					autoFocus
				/>
				<Button
					variant="ghost"
					size="icon"
					className="h-7 w-7 text-green-500 hover:text-green-600"
					onClick={saveOrder}
					disabled={isSaving}
					aria-label="Guardar orden"
				>
					{isSaving ? (
						<div className="h-4 w-4 animate-spin rounded-full border-2 border-b-transparent border-l-transparent border-r-transparent border-t-green-500" />
					) : (
						<Check className="h-4 w-4" />
					)}
				</Button>
			</div>
		);
	}

	if (showSuccess) {
		return (
			<div className="flex items-center gap-1 text-green-500">
				<span className={displayClassName}>{displayValue}</span>
				<Check className="h-4 w-4" />
			</div>
		);
	}

	return (
		<button
			type="button"
			className="inline-block cursor-pointer rounded px-1 -mx-1 hover:bg-muted/50"
			onClick={startEditing}
		>
			<span className={displayClassName}>{displayValue}</span>
		</button>
	);
}
