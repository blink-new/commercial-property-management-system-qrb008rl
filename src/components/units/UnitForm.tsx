import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Unit, UnitFormData } from '../../types'
import { useData } from '../../context/DataContext'

interface UnitFormProps {
  isOpen: boolean
  onClose: () => void
  unit?: Unit
}

const unitTypes = [
  'Studio',
  'One Bedroom',
  'Two Bedroom',
  'Three Bedroom',
  'Four Bedroom',
  'Penthouse',
  'Office',
  'Retail',
  'Warehouse',
  'Other'
]

const unitStatuses = [
  { value: 'vacant', label: 'Vacant' },
  { value: 'occupied', label: 'Occupied' }
]

export function UnitForm({ isOpen, onClose, unit }: UnitFormProps) {
  const { addUnit, updateUnit, properties } = useData()
  const [formData, setFormData] = useState<UnitFormData>({
    propertyId: '',
    unitNumber: '',
    floorNumber: undefined,
    unitType: '',
    sizeSqft: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    rentAmount: undefined,
    status: 'vacant',
    description: '',
    rateableValue: undefined,
    ratesPayable: undefined
  })

  const activeProperties = properties.filter(p => !p.isArchived)

  useEffect(() => {
    if (unit) {
      setFormData({
        propertyId: unit.propertyId,
        unitNumber: unit.unitNumber,
        floorNumber: unit.floorNumber,
        unitType: unit.unitType,
        sizeSqft: unit.sizeSqft,
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        rentAmount: unit.rentAmount,
        status: unit.status,
        description: unit.description || '',
        rateableValue: unit.rateableValue,
        ratesPayable: unit.ratesPayable
      })
    } else {
      setFormData({
        propertyId: '',
        unitNumber: '',
        floorNumber: undefined,
        unitType: '',
        sizeSqft: undefined,
        bedrooms: undefined,
        bathrooms: undefined,
        rentAmount: undefined,
        status: 'vacant',
        description: '',
        rateableValue: undefined,
        ratesPayable: undefined
      })
    }
  }, [unit, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (unit) {
      updateUnit(unit.id, formData)
    } else {
      addUnit(formData)
    }
    
    onClose()
  }

  const handleInputChange = (field: keyof UnitFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {unit ? 'Edit Unit' : 'Add New Unit'}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyId">Property *</Label>
              <Select
                value={formData.propertyId}
                onValueChange={(value) => handleInputChange('propertyId', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {activeProperties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitNumber">Unit Number *</Label>
              <Input
                id="unitNumber"
                value={formData.unitNumber}
                onChange={(e) => handleInputChange('unitNumber', e.target.value)}
                placeholder="e.g., 101, A1, Suite 200"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitType">Unit Type *</Label>
              <Select
                value={formData.unitType}
                onValueChange={(value) => handleInputChange('unitType', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit type" />
                </SelectTrigger>
                <SelectContent>
                  {unitTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'vacant' | 'occupied') => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unitStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="floorNumber">Floor Number</Label>
              <Input
                id="floorNumber"
                type="number"
                min="0"
                value={formData.floorNumber || ''}
                onChange={(e) => handleInputChange('floorNumber', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                value={formData.bedrooms || ''}
                onChange={(e) => handleInputChange('bedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                step="0.5"
                value={formData.bathrooms || ''}
                onChange={(e) => handleInputChange('bathrooms', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sizeSqft">Size (sq ft)</Label>
              <Input
                id="sizeSqft"
                type="number"
                min="0"
                value={formData.sizeSqft || ''}
                onChange={(e) => handleInputChange('sizeSqft', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rentAmount">Monthly Rent</Label>
              <Input
                id="rentAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.rentAmount || ''}
                onChange={(e) => handleInputChange('rentAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rateableValue">Rateable Value</Label>
              <Input
                id="rateableValue"
                type="number"
                min="0"
                step="0.01"
                value={formData.rateableValue || ''}
                onChange={(e) => handleInputChange('rateableValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ratesPayable">Rates Payable</Label>
              <Input
                id="ratesPayable"
                type="number"
                min="0"
                step="0.01"
                value={formData.ratesPayable || ''}
                onChange={(e) => handleInputChange('ratesPayable', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter unit description..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {unit ? 'Update Unit' : 'Create Unit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}