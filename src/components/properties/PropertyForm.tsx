import { useState, useEffect } from 'react'
import { X, Upload, Image } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Property, PropertyFormData } from '../../types'
import { useData } from '../../context/DataContext'

interface PropertyFormProps {
  isOpen: boolean
  onClose: () => void
  property?: Property
}

const propertyTypes = [
  'Apartment Complex',
  'Office Building',
  'Retail Space',
  'Warehouse',
  'Mixed Use',
  'Industrial',
  'Other'
]

const propertyStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
]

const tenureTypes = [
  { value: 'freehold', label: 'Freehold' },
  { value: 'leasehold', label: 'Leasehold' }
]

export function PropertyForm({ isOpen, onClose, property }: PropertyFormProps) {
  const { addProperty, updateProperty } = useData()
  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    address: '',
    propertyType: '',
    totalUnits: 0,
    occupiedUnits: 0,
    description: '',
    purchasePrice: undefined,
    currentValue: undefined,
    purchaseDate: '',
    photoUrl: '',
    status: 'active',
    tenure: undefined,
    valuationDate: '',
    valuedBy: '',
    titleNumber: '',
    propertyManager: ''
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name,
        address: property.address,
        propertyType: property.propertyType,
        totalUnits: property.totalUnits,
        occupiedUnits: property.occupiedUnits,
        description: property.description || '',
        purchasePrice: property.purchasePrice,
        currentValue: property.currentValue,
        purchaseDate: property.purchaseDate || '',
        photoUrl: property.photoUrl || '',
        status: property.status,
        tenure: property.tenure,
        valuationDate: property.valuationDate || '',
        valuedBy: property.valuedBy || '',
        titleNumber: property.titleNumber || '',
        propertyManager: property.propertyManager || ''
      })
      setPhotoPreview(property.photoUrl || '')
    } else {
      setFormData({
        name: '',
        address: '',
        propertyType: '',
        totalUnits: 0,
        occupiedUnits: 0,
        description: '',
        purchasePrice: undefined,
        currentValue: undefined,
        purchaseDate: '',
        photoUrl: '',
        status: 'active',
        tenure: undefined,
        valuationDate: '',
        valuedBy: '',
        titleNumber: '',
        propertyManager: ''
      })
      setPhotoPreview('')
    }
    setPhotoFile(null)
  }, [property, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (property) {
      updateProperty(property.id, formData)
    } else {
      addProperty(formData)
    }
    
    onClose()
  }

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPhotoPreview(result)
        setFormData(prev => ({ ...prev, photoUrl: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview('')
    setFormData(prev => ({ ...prev, photoUrl: '' }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {property ? 'Edit Property' : 'Add New Property'}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Property Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter property name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="propertyType">Property Type *</Label>
            <Select
              value={formData.propertyType}
              onValueChange={(value) => handleInputChange('propertyType', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter full address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="titleNumber">Title Number</Label>
            <Input
              id="titleNumber"
              value={formData.titleNumber}
              onChange={(e) => handleInputChange('titleNumber', e.target.value)}
              placeholder="Enter title number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="propertyManager">Property Manager</Label>
            <Input
              id="propertyManager"
              value={formData.propertyManager}
              onChange={(e) => handleInputChange('propertyManager', e.target.value)}
              placeholder="Enter property manager name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalUnits">Total Units</Label>
              <Input
                id="totalUnits"
                type="number"
                min="0"
                value={formData.totalUnits}
                onChange={(e) => handleInputChange('totalUnits', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupiedUnits">Occupied Units</Label>
              <Input
                id="occupiedUnits"
                type="number"
                min="0"
                max={formData.totalUnits}
                value={formData.occupiedUnits}
                onChange={(e) => handleInputChange('occupiedUnits', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive') => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {propertyStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price</Label>
              <Input
                id="purchasePrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.purchasePrice || ''}
                onChange={(e) => handleInputChange('purchasePrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentValue">Current Value</Label>
              <Input
                id="currentValue"
                type="number"
                min="0"
                step="0.01"
                value={formData.currentValue || ''}
                onChange={(e) => handleInputChange('currentValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <Input
              id="purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tenure">Tenure</Label>
              <Select
                value={formData.tenure || ''}
                onValueChange={(value: 'freehold' | 'leasehold') => handleInputChange('tenure', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tenure" />
                </SelectTrigger>
                <SelectContent>
                  {tenureTypes.map((tenure) => (
                    <SelectItem key={tenure.value} value={tenure.value}>
                      {tenure.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valuationDate">Valuation Date</Label>
              <Input
                id="valuationDate"
                type="date"
                value={formData.valuationDate}
                onChange={(e) => handleInputChange('valuationDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valuedBy">Valued By</Label>
              <Input
                id="valuedBy"
                value={formData.valuedBy}
                onChange={(e) => handleInputChange('valuedBy', e.target.value)}
                placeholder="Enter valuer name/company"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter property description..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Property Photo</Label>
            <div className="space-y-4">
              {photoPreview ? (
                <div className="relative inline-block">
                  <img
                    src={photoPreview}
                    alt="Property preview"
                    className="w-full max-w-sm h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removePhoto}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Upload a property photo</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>{photoPreview ? 'Change Photo' : 'Upload Photo'}</span>
                </Button>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {property ? 'Update Property' : 'Create Property'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}