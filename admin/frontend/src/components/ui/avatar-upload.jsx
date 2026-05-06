import React, { useState, useCallback, useRef } from 'react'
import Cropper from 'react-easy-crop'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Loader2, User } from 'lucide-react'

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', reject)
    image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues
    image.src = url
  })

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc)
  const canvas = document.createElementt("canvas")
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

export function AvatarUpload({ value, onChange, disabled }) {
  const [image, setImage] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const onCropComplete = useCallback((reachedArea, reachedAreaPixels) => {
    setCroppedAreaPixels(reachedAreaPixels)
  }, [])

  const resetCropper = () => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
  }

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImage(reader.result)
        resetCropper()
        setIsDialogOpen(true)
      })
      reader.readAsDataURL(e.target.files[0])
      
      // Limpiar el input para permitir selectcionar el mismo archivo nuevamente
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleCropSave = async () => {
    try {
      setIsUploading(true)
      const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels)
      
      const file = new File([croppedImageBlob], 'avatar.jpg', {
        type: 'image/jpeg',
      })

      if (onChange) {
        await onChange(file)
      }
      
      setIsDialogOpen(false)
      setImage(null)
      resetCropper()
    } catch (error) {
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className="h-24 w-24 border-2 border-muted transition-all group-hover:opacity-80">
          <AvatarImage key={value} src={value} />
          <AvatarFallback>
            <User className="h-12 w-12 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <label
          htmlFor="avatar-input"
          className="absolute inset-0 flex items-center justify-center cursor-pointer rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-black/40"
        >
          <Camera className="h-8 w-8 text-white" />
          <input
            ref={fileInputRef}
            id="avatar-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
            disabled={disabled || isUploading}
          />
        </label>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Crop Avatar</DialogTitle>
          </DialogHeader>
          <div className="relative h-[400px] w-full mt-4 bg-muted overflow-hidden rounded-md">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
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
              onChange={(e) => setZoom(e.target.value)}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                setImage(null)
                resetCropper()
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button onClick={handleCropSave} disabled={isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
