import { useState, useCallback } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Cropper from "react-easy-crop";
import { X, Plus, GripVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { getMediaUrl } from "@/lib/media-url";

const createImage = (url) =>
	new Promise((resolve, reject) => {
		const image = new Image();
		image.addEventListener("load", () => resolve(image));
		image.addEventListener("error", (error) => reject(error));
		image.setAttribute("crossOrigin", "anonymous");
		image.src = url;
	});

async function getCroppedImg(imageSrc, pixelCrop, outputSize) {
	const image = await createImage(imageSrc);
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");

	if (!ctx) {
		return null;
	}

	canvas.width = outputSize?.width || pixelCrop.width;
	canvas.height = outputSize?.height || pixelCrop.height;

	ctx.drawImage(
		image,
		pixelCrop.x,
		pixelCrop.y,
		pixelCrop.width,
		pixelCrop.height,
		0,
		0,
		canvas.width,
		canvas.height
	);

	return new Promise((resolve) => {
		canvas.toBlob((blob) => {
			resolve(blob);
		}, "image/jpeg", 0.92);
	});
}

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
			className="relative group aspect-[5/7] rounded-md overflow-hidden border bg-muted"
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

export function ImageGallery({
	value = [],
	onChange,
	onRemoveExisting,
	aspect = 5 / 7,
	outputSize = { width: 500, height: 700 },
}) {
	const [isUploading, setIsUploading] = useState(false);
	const [pendingFiles, setPendingFiles] = useState([]);
	const [activeFile, setActiveFile] = useState(null);
	const [activeImage, setActiveImage] = useState(null);
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

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

	const openCropperForFile = useCallback((file) => {
		const reader = new FileReader();
		reader.addEventListener("load", () => {
			setActiveFile(file);
			setActiveImage(reader.result);
			setCrop({ x: 0, y: 0 });
			setZoom(1);
			setIsDialogOpen(true);
		});
		reader.readAsDataURL(file);
	}, []);

	const processNextFile = useCallback((files) => {
		const [nextFile, ...remainingFiles] = files;
		setPendingFiles(remainingFiles);

		if (nextFile) {
			openCropperForFile(nextFile);
			return;
		}

		setActiveFile(null);
		setActiveImage(null);
		setIsDialogOpen(false);
		setIsUploading(false);
	}, [openCropperForFile]);

	const handleFileSelect = useCallback((e) => {
		const files = Array.from(e.target.files);
		if (files.length === 0) return;

		setIsUploading(true);
		processNextFile(files);
		e.target.value = "";
	}, [processNextFile]);

	const onCropComplete = useCallback((_reachedArea, reachedAreaPixels) => {
		setCroppedAreaPixels(reachedAreaPixels);
	}, []);

	const handleCropSave = async () => {
		if (!activeFile || !activeImage || !croppedAreaPixels) return;

		try {
			const croppedImageBlob = await getCroppedImg(
				activeImage,
				croppedAreaPixels,
				outputSize
			);
			const file = new File([croppedImageBlob], activeFile.name || "gallery.jpg", {
				type: "image/jpeg",
			});
			const newImage = {
				id: `new-${Date.now()}-${activeFile.name}`,
				file,
				preview: URL.createObjectURL(file),
			};

			onChange([...value, newImage]);
			processNextFile(pendingFiles);
		} catch (error) {
			console.error(error);
			setIsUploading(false);
		}
	};

	const handleCropCancel = () => {
		processNextFile(pendingFiles);
	};

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

						<label className="aspect-[5/7] rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 bg-muted/30">
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

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>Crop Image</DialogTitle>
					</DialogHeader>
					<div className="relative h-[460px] w-full mt-4 bg-black overflow-hidden rounded-md">
						<Cropper
							image={activeImage}
							crop={crop}
							zoom={zoom}
							aspect={aspect}
							showGrid={true}
							onCropChange={setCrop}
							onCropComplete={onCropComplete}
							onZoomChange={setZoom}
						/>
					</div>
					<div className="mt-4">
						<label className="text-sm font-medium">Zoom</label>
						<input
							type="range"
							value={zoom}
							min={1}
							max={3}
							step={0.1}
							aria-labelledby="Zoom"
							onChange={(e) => setZoom(parseFloat(e.target.value))}
							className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={handleCropCancel} disabled={!isUploading}>
							Skip
						</Button>
						<Button onClick={handleCropSave} disabled={!isUploading}>
							{isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Subir
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
