import { useState } from 'react'
import { X, Edit, Archive, Upload, Download, Trash2, Building2, Shield, Calendar, Phone, Mail } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Separator } from '../ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import { useData } from '../../context/DataContext'
import { InsurancePolicy, InsuranceDocument } from '../../types'
import { formatCurrency } from '../../types'
import toast from 'react-hot-toast'

interface InsuranceDetailsModalProps {
  policy: InsurancePolicy
  onClose: () => void
}

export function InsuranceDetailsModal({ policy, onClose }: InsuranceDetailsModalProps) {
  const { properties, updateInsurancePolicy, archiveInsurancePolicy } = useData()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    propertyIds: policy.propertyIds,
    insuranceCompany: policy.insuranceCompany,
    brokerName: policy.brokerName || '',
    brokerContact: policy.brokerContact || '',
    brokerEmail: policy.brokerEmail || '',
    brokerPhone: policy.brokerPhone || '',
    policyNumber: policy.policyNumber,
    startDate: policy.startDate,
    expiryDate: policy.expiryDate,
    annualPremium: policy.annualPremium.toString(),
    sumInsured: policy.sumInsured.toString()
  })

  const activeProperties = properties.filter(p => !p.isArchived)

  const handleSave = () => {
    const updates: Partial<InsurancePolicy> = {
      propertyIds: editData.propertyIds,
      insuranceCompany: editData.insuranceCompany,
      brokerName: editData.brokerName || undefined,
      brokerContact: editData.brokerContact || undefined,
      brokerEmail: editData.brokerEmail || undefined,
      brokerPhone: editData.brokerPhone || undefined,
      policyNumber: editData.policyNumber,
      startDate: editData.startDate,
      expiryDate: editData.expiryDate,
      annualPremium: parseFloat(editData.annualPremium) || 0,
      sumInsured: parseFloat(editData.sumInsured) || 0
    }

    updateInsurancePolicy(policy.id, updates)
    setIsEditing(false)
  }

  const handleArchive = () => {
    if (confirm('Are you sure you want to archive this insurance policy?')) {
      archiveInsurancePolicy(policy.id)
      onClose()
    }
  }

  const handlePropertyToggle = (propertyId: string, checked: boolean) => {
    setEditData(prev => ({
      ...prev,
      propertyIds: checked 
        ? [...prev.propertyIds, propertyId]
        : prev.propertyIds.filter(id => id !== propertyId)
    }))
  }

  const getPolicyTypeIcon = (type: InsurancePolicy['policyType']) => {
    switch (type) {
      case 'buildings':
        return <Building2 className="h-5 w-5 text-blue-500" />
      case 'public_liability':
        return <Shield className="h-5 w-5 text-green-500" />
      case 'contents':
        return <Shield className="h-5 w-5 text-purple-500" />
      case 'terrorism':
        return <Shield className="h-5 w-5 text-red-500" />
    }
  }

  const getPolicyTypeColor = (type: InsurancePolicy['policyType']) => {
    switch (type) {
      case 'buildings':
        return 'bg-blue-100 text-blue-800'
      case 'public_liability':
        return 'bg-green-100 text-green-800'
      case 'contents':
        return 'bg-purple-100 text-purple-800'
      case 'terrorism':
        return 'bg-red-100 text-red-800'
    }
  }

  const getPolicyTypeName = (type: InsurancePolicy['policyType']) => {
    switch (type) {
      case 'buildings':
        return 'Buildings Insurance'
      case 'public_liability':
        return 'Public Liability Insurance'
      case 'contents':
        return 'Contents Insurance'
      case 'terrorism':
        return 'Terrorism Insurance'
    }
  }

  const getPropertyNames = (propertyIds: string[]) => {
    return propertyIds
      .map(id => properties.find(p => p.id === id))
      .filter(Boolean)
  }

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0
  }

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  const expiringSoon = isExpiringSoon(policy.expiryDate)
  const expired = isExpired(policy.expiryDate)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            {getPolicyTypeIcon(policy.policyType)}
            <div>
              <CardTitle className="text-xl">{getPolicyTypeName(policy.policyType)}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getPolicyTypeColor(policy.policyType)}>
                  {policy.policyNumber}
                </Badge>
                {expired && (
                  <Badge className="bg-red-100 text-red-800">EXPIRED</Badge>
                )}
                {expiringSoon && !expired && (
                  <Badge className="bg-yellow-100 text-yellow-800">EXPIRING SOON</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleArchive}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Policy Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Insurance Company</Label>
                {isEditing ? (
                  <Input
                    value={editData.insuranceCompany}
                    onChange={(e) => setEditData(prev => ({ ...prev, insuranceCompany: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{policy.insuranceCompany}</p>
                )}
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Policy Number</Label>
                {isEditing ? (
                  <Input
                    value={editData.policyNumber}
                    onChange={(e) => setEditData(prev => ({ ...prev, policyNumber: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{policy.policyNumber}</p>
                )}
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Policy Period</Label>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input
                      type="date"
                      value={editData.startDate}
                      onChange={(e) => setEditData(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                    <Input
                      type="date"
                      value={editData.expiryDate}
                      onChange={(e) => setEditData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    />
                  </div>
                ) : (
                  <p className="text-sm mt-1">
                    {new Date(policy.startDate).toLocaleDateString()} - {' '}
                    <span className={expired ? 'text-red-600 font-medium' : expiringSoon ? 'text-yellow-600 font-medium' : ''}>
                      {new Date(policy.expiryDate).toLocaleDateString()}
                    </span>
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Annual Premium</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={editData.annualPremium}
                    onChange={(e) => setEditData(prev => ({ ...prev, annualPremium: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{formatCurrency(policy.annualPremium)}</p>
                )}
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Sum Insured (BDV)</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={editData.sumInsured}
                    onChange={(e) => setEditData(prev => ({ ...prev, sumInsured: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{formatCurrency(policy.sumInsured)}</p>
                )}
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Days Until Expiry</Label>
                <p className={`text-sm mt-1 ${expired ? 'text-red-600 font-medium' : expiringSoon ? 'text-yellow-600 font-medium' : ''}`}>
                  {expired ? 'EXPIRED' : Math.ceil((new Date(policy.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Assigned Properties */}
          <div>
            <Label className="text-sm font-medium text-gray-500 mb-3 block">Assigned Properties</Label>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3">
                {activeProperties.map((property) => (
                  <div key={property.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-property-${property.id}`}
                      checked={editData.propertyIds.includes(property.id)}
                      onCheckedChange={(checked) => 
                        handlePropertyToggle(property.id, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`edit-property-${property.id}`}
                      className="text-sm font-normal cursor-pointer flex items-center gap-2"
                    >
                      <Building2 className="h-4 w-4 text-gray-400" />
                      {property.name}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {getPropertyNames(policy.propertyIds).map((property) => (
                  <div key={property!.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{property!.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Broker Information */}
          <div>
            <Label className="text-sm font-medium text-gray-500 mb-3 block">Broker Information</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-400">Broker Name</Label>
                {isEditing ? (
                  <Input
                    value={editData.brokerName}
                    onChange={(e) => setEditData(prev => ({ ...prev, brokerName: e.target.value }))}
                    className="mt-1"
                    placeholder="Broker company name"
                  />
                ) : (
                  <p className="text-sm mt-1">{policy.brokerName || 'Not specified'}</p>
                )}
              </div>
              
              <div>
                <Label className="text-xs text-gray-400">Contact Person</Label>
                {isEditing ? (
                  <Input
                    value={editData.brokerContact}
                    onChange={(e) => setEditData(prev => ({ ...prev, brokerContact: e.target.value }))}
                    className="mt-1"
                    placeholder="Contact person name"
                  />
                ) : (
                  <p className="text-sm mt-1">{policy.brokerContact || 'Not specified'}</p>
                )}
              </div>
              
              <div>
                <Label className="text-xs text-gray-400">Email</Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editData.brokerEmail}
                    onChange={(e) => setEditData(prev => ({ ...prev, brokerEmail: e.target.value }))}
                    className="mt-1"
                    placeholder="broker@example.com"
                  />
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    {policy.brokerEmail ? (
                      <>
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a href={`mailto:${policy.brokerEmail}`} className="text-sm text-blue-600 hover:underline">
                          {policy.brokerEmail}
                        </a>
                      </>
                    ) : (
                      <p className="text-sm">Not specified</p>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <Label className="text-xs text-gray-400">Phone</Label>
                {isEditing ? (
                  <Input
                    type="tel"
                    value={editData.brokerPhone}
                    onChange={(e) => setEditData(prev => ({ ...prev, brokerPhone: e.target.value }))}
                    className="mt-1"
                    placeholder="+44 20 1234 5678"
                  />
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    {policy.brokerPhone ? (
                      <>
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a href={`tel:${policy.brokerPhone}`} className="text-sm text-blue-600 hover:underline">
                          {policy.brokerPhone}
                        </a>
                      </>
                    ) : (
                      <p className="text-sm">Not specified</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save/Cancel buttons for editing */}
          {isEditing && (
            <>
              <Separator />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                  Save Changes
                </Button>
              </div>
            </>
          )}

          <Separator />

          {/* Documents */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium text-gray-500">Policy Documents</Label>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
            
            {policy.documents.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No documents uploaded</p>
            ) : (
              <div className="space-y-2">
                {policy.documents.map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">{document.name}</p>
                        <p className="text-xs text-gray-500">
                          Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}