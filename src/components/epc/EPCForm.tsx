import { useState, useEffect } from 'react'
import { X, ExternalLink } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { EPCData, EPCFormData } from '../../types'
import { useData } from '../../context/DataContext'

interface EPCFormProps {
  isOpen: boolean
  onClose: () => void
  epcData?: EPCData
}

const EPC_RATINGS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

export function EPCForm({ isOpen, onClose, epcData }: EPCFormProps) {
  const { addEPCData, updateEPCData, units, properties, getPropertyById } = useData()
  const [formData, setFormData] = useState<EPCFormData>({
    unitId: '',
    rating: '',
    certificateUrl: '',
    governmentPortalUrl: '',
    validUntil: '',
    notes: ''
  })

  // Get active units with their property names for the dropdown
  const activeUnits = units.filter(unit => !unit.isArchived).map(unit => {
    const property = getPropertyById(unit.propertyId)
    return {
      ...unit,
      displayName: property ? `${property.name} - Unit ${unit.unitNumber}` : `Unit ${unit.unitNumber}`
    }
  })

  useEffect(() => {
    if (epcData) {
      setFormData({
        unitId: epcData.unitId,
        rating: epcData.rating,
        certificateUrl: epcData.certificateUrl || '',
        governmentPortalUrl: epcData.governmentPortalUrl || '',
        validUntil: epcData.validUntil || '',
        notes: epcData.notes || ''
      })
    } else {
      setFormData({
        unitId: '',
        rating: '',
        certificateUrl: '',
        governmentPortalUrl: '',
        validUntil: '',
        notes: ''
      })
    }
  }, [epcData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (epcData) {
      updateEPCData(epcData.id, formData)
    } else {
      addEPCData(formData)
    }
    
    onClose()
  }

  const handleInputChange = (field: keyof EPCFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {epcData ? 'Edit EPC Data' : 'Add New EPC Data'}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitId">Unit *</Label>
              <Select
                value={formData.unitId}
                onValueChange={(value) => handleInputChange('unitId', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  {activeUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">EPC Rating *</Label>
              <Select
                value={formData.rating}
                onValueChange={(value) => handleInputChange('rating', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {EPC_RATINGS.map((rating) => (
                    <SelectItem key={rating} value={rating}>
                      Rating {rating}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="validUntil">Valid Until</Label>
            <Input
              id="validUntil"
              type="date"
              value={formData.validUntil}
              onChange={(e) => handleInputChange('validUntil', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificateUrl">Certificate URL</Label>
            <div className="flex space-x-2">
              <Input
                id="certificateUrl"
                type="url"
                value={formData.certificateUrl}
                onChange={(e) => handleInputChange('certificateUrl', e.target.value)}
                placeholder="https://example.com/certificate.pdf"
                className="flex-1"
              />
              {formData.certificateUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(formData.certificateUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="governmentPortalUrl">Government Portal URL</Label>
            <div className="flex space-x-2">
              <Input
                id="governmentPortalUrl"
                type="url"
                value={formData.governmentPortalUrl}
                onChange={(e) => handleInputChange('governmentPortalUrl', e.target.value)}
                placeholder="https://find-energy-certificate.service.gov.uk/..."
                className="flex-1"
              />
              {formData.governmentPortalUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(formData.governmentPortalUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Link to the official government EPC certificate lookup
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about the EPC certificate..."
              rows={3}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Quick Access</h4>
            <p className="text-sm text-blue-700 mb-3">
              Find EPC certificates on the official government portal:
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.open('https://find-energy-certificate.service.gov.uk/', '_blank')}
              className="flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open Government EPC Portal</span>
            </Button>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {epcData ? 'Update EPC Data' : 'Add EPC Data'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}