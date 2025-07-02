import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'

const ImageUpload = ({ 
  label = "Attach Images", 
  images = [], 
  onChange, 
  maxImages = 5,
  maxSizeKB = 2048,
  className = '',
  required = false 
}) => {
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef()

  const handleFileSelect = (files) => {
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        return false
      }
      if (file.size > maxSizeKB * 1024) {
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    const remainingSlots = maxImages - images.length
    const filesToProcess = validFiles.slice(0, remainingSlots)

    filesToProcess.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          data: e.target.result,
          name: file.name,
          size: file.size
        }
        onChange([...images, newImage])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const removeImage = (imageId) => {
    onChange(images.filter(img => img.id !== imageId))
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${dragOver 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={images.length >= maxImages}
        />
        
        <div className="space-y-2">
          <div className="flex justify-center">
            <div className={`p-3 rounded-full ${dragOver ? 'bg-primary-100' : 'bg-gray-100'}`}>
              <ApperIcon 
                name={dragOver ? "Upload" : "ImagePlus"} 
                size={24} 
                className={dragOver ? 'text-primary-600' : 'text-gray-400'}
              />
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">
              {images.length >= maxImages 
                ? `Maximum ${maxImages} images reached` 
                : 'Drop images here or click to browse'
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG up to {maxSizeKB / 1024}MB each
            </p>
          </div>
        </div>
      </div>

      {/* Image Previews */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
          >
            {images.map((image) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={image.data}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage(image.id)
                  }}
                  variant="danger"
                  size="sm"
                  icon="X"
                  className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1 text-xs truncate rounded-b-lg">
                  {image.name}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ImageUpload