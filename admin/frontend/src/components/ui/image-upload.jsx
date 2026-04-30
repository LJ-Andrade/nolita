import React, { useState, useCallback, useId } from 'react'
import Cropper from 'react-easy-crop'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Camera, Loader2, Image as ImageIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    return null
  }

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    }, 'image/jpeg')
  })
}

export function ImageUpload({ 
  value, 
  onChange, 
  disabled, 
  aspect = 1, 
  cropShape = 'rect',
  className 
}) {
  const inputtId = useId()
  const [image, setImage] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const onCropComplete = useCallback((reachedArea, reachedAreaPixels) => {
    setCroppedAreaPixels(reachedAreaPixels)
  }, [])

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImage(reader.result)
        setIsDialogOpen(true)
      })
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleCropSave = async () => {
    try {
      setIsUploading(true)
      const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels)
      
      const file = new File([croppedImageBlob], 'cover.jpg', {
        type: 'image/jpeg',
      })

      if (onChange) {
        await onChange(file)
      }
      
      setIsDialogOpen(false)
      setImage(null)
    } catch (e) {
      console.error(e)
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onChange) {
      onChange(null)
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div 
        className={cn(
          "relative group border-2 border-dashed border-muted rounded-lg overflow-hidden bg-muted/50 transition-all hover:bg-muted",
          aspect === 1 ? "w-full max-w-[280px] aspect-square" : "w-full aspect-video"
        )}
      >
        {value ? (
          <>
            <img 
              src={typeof value === 'string' ? value : URL.createObjectURL(value)} 
              alt="Upload" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
              <button
                type="button"
                onClick={removeImage}
                className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors mr-2"
              >
                <X className="h-5 w-5" />
              </button>
              <label
                htmlFor={inputtId}
                className="p-2 bg-primary rounded-full text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <Camera className="h-5 w-5" />
              </label>
            </div>
          </>
        ) : (
          <label
            htmlFor={inputtId}
            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
          >
            <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground font-medium">Click to upload</span>
            <input
              id={inputtId}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
              disabled={disabled || isUploading}
            />
          </label>
        )}
        <input
          id={inputtId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
          disabled={disabled || isUploading}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          <div className="relative h-[400px] w-full mt-4 bg-black overflow-hidden rounded-md">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              cropShape={cropShape}
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
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                setImage(null)
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button onClick={handleCropSave} disabled={isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Subir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
