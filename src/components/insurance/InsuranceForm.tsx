import { useState } from 'react'
import { X, Building2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Switch } from '../ui/switch'
import { Checkbox } from '../ui/checkbox'
import { useData } from '../../context/DataContext'
import { InsuranceFormData } from '../../types'
import toast from 'react-hot-toast'

interface InsuranceFormProps {
  onClose: () => void
}

export function InsuranceForm({ onClose }: InsuranceFormProps) {
  const { properties, addInsurancePolicy } = useData()
  const [formData, setFormData] = useState<InsuranceFormData>({
    propertyIds: [],
    policyType: 'buildings',
    insuranceCompany: '',
    brokerName: '',
    brokerContact: '',
    brokerEmail: '',
    brokerPhone: '',
    policyNumber: '',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    annualPremium: 0,
    sumInsured: 0,
    diarySettings: {
      enabled: true,
      daysBefore: 30
    }
  })

  const activeProperties = properties.filter(p => !p.isArchived)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.policyNumber || !formData.insuranceCompany || !formData.expiryDate || formData.propertyIds.length === 0) {
      toast.error('Please fill in all required fields')
      return
    }

    addInsurancePolicy(formData)
    onClose()
  }

  const handlePropertyToggle = (propertyId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      propertyIds: checked 
        ? [...prev.propertyIds, propertyId]
        : prev.propertyIds.filter(id => id !== propertyId)
    }))
  }

  const getPolicyTypeName = (type: string) => {
    switch (type) {
      case 'buildings':
        return 'Buildings Insurance'
      case 'public_liability':
        return 'Public Liability Insurance'
      case 'contents':
        return 'Contents Insurance'
      case 'terrorism':
        return 'Terrorism Insurance'
      default:
        return type
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Add Insurance Policy</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Policy Type */}
            <div className="space-y-2">
              <Label htmlFor="policyType">Policy Type *</Label>
              <Select 
                value={formData.policyType} 
                onValueChange={(value: 'buildings' | 'public_liability' | 'contents' | 'terrorism') => 
                  setFormData(prev => ({ ...prev, policyType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buildings">Buildings Insurance</SelectItem>
                  <SelectItem value="public_liability">Public Liability Insurance</SelectItem>
                  <SelectItem value="contents">Contents Insurance</SelectItem>
                  <SelectItem value="terrorism">Terrorism Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Property Assignment */}
            <div className="space-y-3">
              <Label>Assign to Properties *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3">
                {activeProperties.map((property) => (
                  <div key={property.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`property-${property.id}`}
                      checked={formData.propertyIds.includes(property.id)}
                      onCheckedChange={(checked) => 
                        handlePropertyToggle(property.id, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`property-${property.id}`}
                      className="text-sm font-normal cursor-pointer flex items-center gap-2"
                    >
                      <Building2 className="h-4 w-4 text-gray-400" />
                      {property.name}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.propertyIds.length === 0 && (
                <p className="text-sm text-red-600">Please select at least one property</p>
              )}
            </div>

            {/* Insurance Company Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="insuranceCompany">Insurance Company *</Label>
                <Input
                  id="insuranceCompany"
                  value={formData.insuranceCompany}
                  onChange={(e) => setFormData(prev => ({ ...prev, insuranceCompany: e.target.value }))}
                  placeholder="e.g., Aviva, AXA, Zurich"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="policyNumber">Policy Number *</Label>
                <Input
                  id="policyNumber"
                  value={formData.policyNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, policyNumber: e.target.value }))}
                  placeholder="Policy reference number"
                  required
                />
              </div>
            </div>

            {/* Broker Details */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Broker Details (Optional)</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brokerName">Broker Name</Label>
                  <Input
                    id="brokerName"
                    value={formData.brokerName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, brokerName: e.target.value || undefined }))}
                    placeholder="Broker company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brokerContact">Broker Contact Person</Label>
                  <Input
                    id="brokerContact"
                    value={formData.brokerContact || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, brokerContact: e.target.value || undefined }))}
                    placeholder="Contact person name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brokerEmail">Broker Email</Label>
                  <Input
                    id="brokerEmail"
                    type="email"
                    value={formData.brokerEmail || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, brokerEmail: e.target.value || undefined }))}
                    placeholder="broker@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brokerPhone">Broker Phone</Label>
                  <Input
                    id="brokerPhone"
                    type="tel"
                    value={formData.brokerPhone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, brokerPhone: e.target.value || undefined }))}
                    placeholder="+44 20 1234 5678"
                  />
                </div>
              </div>
            </div>

            {/* Policy Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Policy Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Policy Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="annualPremium">Annual Premium (£) *</Label>
                <Input
                  id="annualPremium"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.annualPremium}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    annualPremium: parseFloat(e.target.value) || 0 
                  }))}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sumInsured">Sum Insured - BDV (£) *</Label>
                <Input
                  id="sumInsured"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.sumInsured}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    sumInsured: parseFloat(e.target.value) || 0 
                  }))}
                  placeholder="Building Declared Value"
                  required
                />
                <p className="text-xs text-gray-500">Building Declared Value (BDV)</p>
              </div>
            </div>

            {/* Diary Reminder Settings */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="diaryEnabled">Expiry Reminder</Label>
                  <p className="text-sm text-gray-600">Get reminded about policy expiry in your diary</p>
                </div>
                <Switch
                  id="diaryEnabled"
                  checked={formData.diarySettings?.enabled || false}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      diarySettings: {
                        ...prev.diarySettings,
                        enabled: checked,
                        daysBefore: prev.diarySettings?.daysBefore || 30
                      }
                    }))
                  }
                />
              </div>

              {formData.diarySettings?.enabled && (
                <div className="space-y-2">
                  <Label htmlFor="daysBefore">Remind me (days before expiry)</Label>
                  <Select 
                    value={formData.diarySettings.daysBefore.toString()} 
                    onValueChange={(value) => 
                      setFormData(prev => ({
                        ...prev,
                        diarySettings: {
                          ...prev.diarySettings!,
                          daysBefore: parseInt(value)
                        }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">1 week before</SelectItem>
                      <SelectItem value="14">2 weeks before</SelectItem>
                      <SelectItem value="30">1 month before</SelectItem>
                      <SelectItem value="60">2 months before</SelectItem>
                      <SelectItem value="90">3 months before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Add Policy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}