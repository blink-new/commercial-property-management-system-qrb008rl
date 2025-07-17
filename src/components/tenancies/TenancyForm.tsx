import { useState, useEffect } from 'react'
import { X, Upload, FileText, Trash2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Tenancy, TenancyFormData } from '../../types'
import { useData } from '../../context/DataContext'

interface TenancyFormProps {
  isOpen: boolean
  onClose: () => void
  tenancy?: Tenancy
}

const tenancyStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'terminated', label: 'Terminated' }
]

const insideActOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'na_scotland', label: 'N/A (Scotland)' }
]

const breakTypes = [
  { value: 'mutual', label: 'Mutual' },
  { value: 'landlord_only', label: 'Landlord Only' },
  { value: 'tenant_only', label: 'Tenant Only' }
]

const rentReviewTypes = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'indexed_rpi', label: 'Indexed Linked RPI' },
  { value: 'indexed_cpi', label: 'Indexed Linked CPI' },
  { value: 'open_market', label: 'Open Market' },
  { value: 'upwards_only_open_market', label: 'Upwards Only Open Market' }
]

const repairingObligations = [
  { value: 'fri', label: 'FRI (Full Repairing and Insuring)' },
  { value: 'iri', label: 'IRI (Internal Repairing and Insuring)' }
]

const noticePeriodUnits = [
  { value: 'months', label: 'Months' },
  { value: 'weeks', label: 'Weeks' }
]

export function TenancyForm({ isOpen, onClose, tenancy }: TenancyFormProps) {
  const { addTenancy, updateTenancy, units, properties } = useData()
  const [formData, setFormData] = useState<TenancyFormData>({
    unitId: '',
    tenantName: '',
    tenantEmail: '',
    tenantPhone: '',
    leaseStartDate: '',
    leaseEndDate: '',
    monthlyRent: 0,
    securityDeposit: undefined,
    status: 'active',
    notes: '',
    insideAct: undefined,
    breakDate: '',
    breakNoticePeriod: undefined,
    breakNoticePeriodUnit: 'months',
    breakType: undefined,
    rentReviewDate: '',
    rentReviewType: undefined,
    repairingObligation: undefined,
    tenancyDocuments: [],
    diarySettings: {
      leaseExpiry: { enabled: false, monthsBefore: 3 },
      rentReview: { enabled: false, monthsBefore: 3 },
      tenancyBreak: { enabled: false, monthsBefore: 3 }
    }
  })
  const [documentFiles, setDocumentFiles] = useState<File[]>([])

  const activeUnits = units.filter(u => !u.isArchived)
  const activeProperties = properties.filter(p => !p.isArchived)

  // Get available units (vacant or the current unit if editing)
  const availableUnits = activeUnits.filter(unit => 
    unit.status === 'vacant' || (tenancy && unit.id === tenancy.unitId)
  )

  useEffect(() => {
    if (tenancy) {
      setFormData({
        unitId: tenancy.unitId,
        tenantName: tenancy.tenantName,
        tenantEmail: tenancy.tenantEmail || '',
        tenantPhone: tenancy.tenantPhone || '',
        leaseStartDate: tenancy.leaseStartDate,
        leaseEndDate: tenancy.leaseEndDate,
        monthlyRent: tenancy.monthlyRent,
        securityDeposit: tenancy.securityDeposit,
        status: tenancy.status,
        notes: tenancy.notes || '',
        insideAct: tenancy.insideAct,
        breakDate: tenancy.breakDate || '',
        breakNoticePeriod: tenancy.breakNoticePeriod,
        breakNoticePeriodUnit: tenancy.breakNoticePeriodUnit || 'months',
        breakType: tenancy.breakType,
        rentReviewDate: tenancy.rentReviewDate || '',
        rentReviewType: tenancy.rentReviewType,
        repairingObligation: tenancy.repairingObligation,
        tenancyDocuments: tenancy.tenancyDocuments || [],
        diarySettings: tenancy.diarySettings || {
          leaseExpiry: { enabled: false, monthsBefore: 3 },
          rentReview: { enabled: false, monthsBefore: 3 },
          tenancyBreak: { enabled: false, monthsBefore: 3 }
        }
      })
    } else {
      setFormData({
        unitId: '',
        tenantName: '',
        tenantEmail: '',
        tenantPhone: '',
        leaseStartDate: '',
        leaseEndDate: '',
        monthlyRent: 0,
        securityDeposit: undefined,
        status: 'active',
        notes: '',
        insideAct: undefined,
        breakDate: '',
        breakNoticePeriod: undefined,
        breakNoticePeriodUnit: 'months',
        breakType: undefined,
        rentReviewDate: '',
        rentReviewType: undefined,
        repairingObligation: undefined,
        tenancyDocuments: [],
        diarySettings: {
          leaseExpiry: { enabled: false, monthsBefore: 3 },
          rentReview: { enabled: false, monthsBefore: 3 },
          tenancyBreak: { enabled: false, monthsBefore: 3 }
        }
      })
    }
  }, [tenancy, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (tenancy) {
      updateTenancy(tenancy.id, formData)
    } else {
      addTenancy(formData)
    }
    
    onClose()
  }

  const handleInputChange = (field: keyof TenancyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getUnitDisplayName = (unit: any) => {
    const property = activeProperties.find(p => p.id === unit.propertyId)
    return `${property?.name || 'Unknown Property'} - Unit ${unit.unitNumber}`
  }

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setDocumentFiles(prev => [...prev, ...files])
    
    // Convert files to data URLs for preview/storage
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setFormData(prev => ({
          ...prev,
          tenancyDocuments: [...(prev.tenancyDocuments || []), result]
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeDocument = (index: number) => {
    setDocumentFiles(prev => prev.filter((_, i) => i !== index))
    setFormData(prev => ({
      ...prev,
      tenancyDocuments: prev.tenancyDocuments?.filter((_, i) => i !== index) || []
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {tenancy ? 'Edit Tenancy' : 'Add New Tenancy'}
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
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {getUnitDisplayName(unit)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableUnits.length === 0 && (
                <p className="text-sm text-red-600">No vacant units available</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'expired' | 'terminated') => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tenancyStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenantName">Tenant Name *</Label>
            <Input
              id="tenantName"
              value={formData.tenantName}
              onChange={(e) => handleInputChange('tenantName', e.target.value)}
              placeholder="Enter tenant full name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tenantEmail">Tenant Email</Label>
              <Input
                id="tenantEmail"
                type="email"
                value={formData.tenantEmail}
                onChange={(e) => handleInputChange('tenantEmail', e.target.value)}
                placeholder="tenant@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenantPhone">Tenant Phone</Label>
              <Input
                id="tenantPhone"
                type="tel"
                value={formData.tenantPhone}
                onChange={(e) => handleInputChange('tenantPhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leaseStartDate">Lease Start Date *</Label>
              <Input
                id="leaseStartDate"
                type="date"
                value={formData.leaseStartDate}
                onChange={(e) => handleInputChange('leaseStartDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="leaseEndDate">Lease End Date *</Label>
              <Input
                id="leaseEndDate"
                type="date"
                value={formData.leaseEndDate}
                onChange={(e) => handleInputChange('leaseEndDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyRent">Monthly Rent *</Label>
              <Input
                id="monthlyRent"
                type="number"
                min="0"
                step="0.01"
                value={formData.monthlyRent}
                onChange={(e) => handleInputChange('monthlyRent', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="securityDeposit">Security Deposit</Label>
              <Input
                id="securityDeposit"
                type="number"
                min="0"
                step="0.01"
                value={formData.securityDeposit || ''}
                onChange={(e) => handleInputChange('securityDeposit', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Legal and Commercial Terms Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium text-gray-900">Legal & Commercial Terms</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="insideAct">Inside of the Act</Label>
                <Select
                  value={formData.insideAct || ''}
                  onValueChange={(value: 'yes' | 'no' | 'na_scotland') => handleInputChange('insideAct', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    {insideActOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="repairingObligation">Repairing Obligation</Label>
                <Select
                  value={formData.repairingObligation || ''}
                  onValueChange={(value: 'fri' | 'iri') => handleInputChange('repairingObligation', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select obligation" />
                  </SelectTrigger>
                  <SelectContent>
                    {repairingObligations.map((obligation) => (
                      <SelectItem key={obligation.value} value={obligation.value}>
                        {obligation.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Break Clause Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium text-gray-900">Break Clause</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="breakDate">Break Date</Label>
                <Input
                  id="breakDate"
                  type="date"
                  value={formData.breakDate}
                  onChange={(e) => handleInputChange('breakDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="breakType">Break Type</Label>
                <Select
                  value={formData.breakType || ''}
                  onValueChange={(value: 'mutual' | 'landlord_only' | 'tenant_only') => handleInputChange('breakType', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select break type" />
                  </SelectTrigger>
                  <SelectContent>
                    {breakTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="breakNoticePeriod">Break Notice Period</Label>
                <Input
                  id="breakNoticePeriod"
                  type="number"
                  min="1"
                  value={formData.breakNoticePeriod || ''}
                  onChange={(e) => handleInputChange('breakNoticePeriod', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Enter period"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="breakNoticePeriodUnit">Period Unit</Label>
                <Select
                  value={formData.breakNoticePeriodUnit || 'months'}
                  onValueChange={(value: 'months' | 'weeks') => handleInputChange('breakNoticePeriodUnit', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {noticePeriodUnits.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Rent Review Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium text-gray-900">Rent Review</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rentReviewDate">Rent Review Date</Label>
                <Input
                  id="rentReviewDate"
                  type="date"
                  value={formData.rentReviewDate}
                  onChange={(e) => handleInputChange('rentReviewDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rentReviewType">Rent Review Type</Label>
                <Select
                  value={formData.rentReviewType || ''}
                  onValueChange={(value: 'fixed' | 'indexed_rpi' | 'indexed_cpi' | 'open_market' | 'upwards_only_open_market') => handleInputChange('rentReviewType', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select review type" />
                  </SelectTrigger>
                  <SelectContent>
                    {rentReviewTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Diary Notification Settings */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium text-gray-900">Diary Notifications</h3>
            <p className="text-sm text-gray-600">Configure when you want to be notified about important tenancy events</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Lease Expiry */}
              <div className="space-y-3 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="leaseExpiryEnabled"
                    checked={formData.diarySettings?.leaseExpiry?.enabled || false}
                    onChange={(e) => handleInputChange('diarySettings', {
                      ...formData.diarySettings,
                      leaseExpiry: {
                        enabled: e.target.checked,
                        monthsBefore: formData.diarySettings?.leaseExpiry?.monthsBefore || 3
                      }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="leaseExpiryEnabled" className="text-sm font-medium text-gray-700">
                    Lease Expiry
                  </label>
                </div>
                {formData.diarySettings?.leaseExpiry?.enabled && (
                  <div className="space-y-2">
                    <label className="text-xs text-gray-600">Notify me</label>
                    <select
                      value={formData.diarySettings?.leaseExpiry?.monthsBefore || 3}
                      onChange={(e) => handleInputChange('diarySettings', {
                        ...formData.diarySettings,
                        leaseExpiry: {
                          enabled: true,
                          monthsBefore: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>1 month before</option>
                      <option value={2}>2 months before</option>
                      <option value={3}>3 months before</option>
                      <option value={6}>6 months before</option>
                      <option value={7}>7 months before</option>
                      <option value={8}>8 months before</option>
                      <option value={9}>9 months before</option>
                      <option value={10}>10 months before</option>
                      <option value={11}>11 months before</option>
                      <option value={12}>12 months before</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Rent Review */}
              <div className="space-y-3 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rentReviewEnabled"
                    checked={formData.diarySettings?.rentReview?.enabled || false}
                    onChange={(e) => handleInputChange('diarySettings', {
                      ...formData.diarySettings,
                      rentReview: {
                        enabled: e.target.checked,
                        monthsBefore: formData.diarySettings?.rentReview?.monthsBefore || 3
                      }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="rentReviewEnabled" className="text-sm font-medium text-gray-700">
                    Rent Review
                  </label>
                </div>
                {formData.diarySettings?.rentReview?.enabled && (
                  <div className="space-y-2">
                    <label className="text-xs text-gray-600">Notify me</label>
                    <select
                      value={formData.diarySettings?.rentReview?.monthsBefore || 3}
                      onChange={(e) => handleInputChange('diarySettings', {
                        ...formData.diarySettings,
                        rentReview: {
                          enabled: true,
                          monthsBefore: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>1 month before</option>
                      <option value={2}>2 months before</option>
                      <option value={3}>3 months before</option>
                      <option value={6}>6 months before</option>
                      <option value={7}>7 months before</option>
                      <option value={8}>8 months before</option>
                      <option value={9}>9 months before</option>
                      <option value={10}>10 months before</option>
                      <option value={11}>11 months before</option>
                      <option value={12}>12 months before</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Tenancy Break */}
              <div className="space-y-3 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="tenancyBreakEnabled"
                    checked={formData.diarySettings?.tenancyBreak?.enabled || false}
                    onChange={(e) => handleInputChange('diarySettings', {
                      ...formData.diarySettings,
                      tenancyBreak: {
                        enabled: e.target.checked,
                        monthsBefore: formData.diarySettings?.tenancyBreak?.monthsBefore || 3
                      }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="tenancyBreakEnabled" className="text-sm font-medium text-gray-700">
                    Tenancy Break
                  </label>
                </div>
                {formData.diarySettings?.tenancyBreak?.enabled && (
                  <div className="space-y-2">
                    <label className="text-xs text-gray-600">Notify me</label>
                    <select
                      value={formData.diarySettings?.tenancyBreak?.monthsBefore || 3}
                      onChange={(e) => handleInputChange('diarySettings', {
                        ...formData.diarySettings,
                        tenancyBreak: {
                          enabled: true,
                          monthsBefore: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>1 month before</option>
                      <option value={2}>2 months before</option>
                      <option value={3}>3 months before</option>
                      <option value={6}>6 months before</option>
                      <option value={7}>7 months before</option>
                      <option value={8}>8 months before</option>
                      <option value={9}>9 months before</option>
                      <option value={10}>10 months before</option>
                      <option value={11}>11 months before</option>
                      <option value={12}>12 months before</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium text-gray-900">Tenancy Documents</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('document-upload')?.click()}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Documents</span>
                </Button>
                <input
                  id="document-upload"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleDocumentUpload}
                  className="hidden"
                />
              </div>

              {documentFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Documents</Label>
                  <div className="space-y-2">
                    {documentFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes about the tenancy..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {tenancy ? 'Update Tenancy' : 'Create Tenancy'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}