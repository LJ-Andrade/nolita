import { useState, useCallback } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, Plus, GripVertical, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMediaUrl } from "@/lib/media-url";

function SortableImage({ image, onRemove }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: image.id,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="relative group aspect-square rounded-md overflow-hidden border bg-muted"
		>
			<img
				src={getMediaUrl(image.url) || image.preview}
				alt="Gallery image"
				className="w-full h-full object-cover"
			/>
			<div
				{...attributes}
				{...listeners}
				className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-grab active:cursor-grabbing"
			>
				<GripVertical className="text-white h-6 w-6" />
			</div>
			<button
				type="button"
				onClick={() => onRemove(image.id)}
				className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/80"
			>
				<X className="h-3 w-3" />
			</button>
		</div>
	);
}

export function ImageGallery({ value = [], onChange, onRemoveExisting }) {
	const [isUploading, setIsUploading] = useState(false);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragEnd = (event) => {
		const { active, over } = event;

		if (active.id !== over?.id) {
			const oldIndex = value.findIndex((item) => item.id === active.id);
			const newIndex = value.findIndex((item) => item.id === over.id);
			onChange(arrayMove(value, oldIndex, newIndex));
		}
	};

	const handleFileSelect = useCallback((e) => {
		const files = Array.from(e.target.files);
		if (files.length === 0) return;

		setIsUploading(true);

		const newImages = files.map((file, index) => ({
			id: `new-${Date.now()}-${index}`,
			file,
			preview: URL.createObjectURL(file),
		}));

		onChange([...value, ...newImages]);
		setIsUploading(false);
		e.target.value = "";
	}, [value, onChange]);

	const handleRemove = useCallback((id) => {
		const image = value.find((img) => img.id === id);
		// If image id doesn't start with 'new-', it exists in the backend
		const isExisting = image && !image.id.toString().startsWith('new-');
		if (isExisting && onRemoveExisting) {
			onRemoveExisting(image.id);
			return;
		}
		onChange(value.filter((img) => img.id !== id));
	}, [value, onChange, onRemoveExisting]);

	return (
		<div className="space-y-3">
			<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
				<SortableContext items={value.map((img) => img.id)} strategy={horizontalListSortingStrategy}>
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
						{value.map((image) => (
							<SortableImage key={image.id} image={image} onRemove={handleRemove} />
						))}

						<label className="aspect-square rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 bg-muted/30">
							<input
								type="file"
								accept="image/*"
								multiple
								className="hidden"
								onChange={handleFileSelect}
								disabled={isUploading}
							/>
							{isUploading ? (
								<div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
							) : (
								<>
									<Plus className="h-6 w-6 text-muted-foreground" />
									<span className="text-xs text-muted-foreground">Agregar</span>
								</>
							)}
						</label>
					</div>
				</SortableContext>
			</DndContext>
		</div>
	);
}
