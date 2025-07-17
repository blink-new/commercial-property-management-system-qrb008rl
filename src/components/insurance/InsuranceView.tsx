import { useState } from 'react'
import { Plus, Search, Shield, Calendar, AlertTriangle, Building2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { InsuranceForm } from './InsuranceForm'
import { InsuranceDetailsModal } from './InsuranceDetailsModal'
import { useData } from '../../context/DataContext'
import { InsurancePolicy } from '../../types'
import { formatCurrency } from '../../types'

interface InsuranceViewProps {
  searchValue: string
}

export function InsuranceView({ searchValue }: InsuranceViewProps) {
  const { insurancePolicies, properties } = useData()
  const [showForm, setShowForm] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const getPolicyTypeIcon = (type: InsurancePolicy['policyType']) => {
    switch (type) {
      case 'buildings':
        return <Building2 className="h-4 w-4 text-blue-500" />
      case 'public_liability':
        return <Shield className="h-4 w-4 text-green-500" />
      case 'contents':
        return <Shield className="h-4 w-4 text-purple-500" />
      case 'terrorism':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
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
        return 'Buildings'
      case 'public_liability':
        return 'Public Liability'
      case 'contents':
        return 'Contents'
      case 'terrorism':
        return 'Terrorism'
    }
  }

  const filteredPolicies = insurancePolicies
    .filter(policy => !policy.isArchived)
    .filter(policy => {
      if (typeFilter !== 'all' && policy.policyType !== typeFilter) return false
      
      const searchLower = searchValue.toLowerCase()
      const propertyNames = policy.propertyIds
        .map(id => properties.find(p => p.id === id)?.name || '')
        .join(' ')
      
      return (
        policy.policyNumber.toLowerCase().includes(searchLower) ||
        policy.insuranceCompany.toLowerCase().includes(searchLower) ||
        policy.brokerName?.toLowerCase().includes(searchLower) ||
        propertyNames.toLowerCase().includes(searchLower) ||
        getPolicyTypeName(policy.policyType).toLowerCase().includes(searchLower)
      )
    })
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())

  const getPropertyNames = (propertyIds: string[]) => {
    return propertyIds
      .map(id => properties.find(p => p.id === id)?.name)
      .filter(Boolean)
      .join(', ')
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

  const stats = {
    total: filteredPolicies.length,
    expiringSoon: filteredPolicies.filter(p => isExpiringSoon(p.expiryDate)).length,
    expired: filteredPolicies.filter(p => isExpired(p.expiryDate)).length,
    totalPremium: filteredPolicies.reduce((sum, p) => sum + p.annualPremium, 0),
    totalSumInsured: filteredPolicies.reduce((sum, p) => sum + p.sumInsured, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Insurance Manager</h1>
          <p className="text-gray-600">Manage insurance policies for your properties</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Policy
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Policies</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Annual Premium</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalPremium)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Sum Insured</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalSumInsured)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search insurance policies..."
              value={searchValue}
              className="pl-10"
              readOnly
            />
          </div>
        </div>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="buildings">Buildings</SelectItem>
            <SelectItem value="public_liability">Public Liability</SelectItem>
            <SelectItem value="contents">Contents</SelectItem>
            <SelectItem value="terrorism">Terrorism</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Policies List */}
      <div className="grid gap-4">
        {filteredPolicies.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No insurance policies found</h3>
              <p className="text-gray-600 mb-4">
                {searchValue ? 'Try adjusting your search or filters.' : 'Get started by adding your first insurance policy.'}
              </p>
              {!searchValue && (
                <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Policy
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredPolicies.map((policy) => {
            const expiringSoon = isExpiringSoon(policy.expiryDate)
            const expired = isExpired(policy.expiryDate)
            
            return (
              <Card 
                key={policy.id} 
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  expired ? 'border-red-200 bg-red-50' : 
                  expiringSoon ? 'border-yellow-200 bg-yellow-50' : ''
                }`}
                onClick={() => setSelectedPolicy(policy)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getPolicyTypeIcon(policy.policyType)}
                        <h3 className="font-semibold text-gray-900">
                          {getPolicyTypeName(policy.policyType)} Insurance
                        </h3>
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
                      
                      <p className="text-gray-600 mb-3">{policy.insuranceCompany}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-500">
                        <div>
                          <strong>Properties:</strong>
                          <p className="text-gray-700">{getPropertyNames(policy.propertyIds) || 'No properties assigned'}</p>
                        </div>
                        <div>
                          <strong>Expiry Date:</strong>
                          <p className={`${expired ? 'text-red-600 font-medium' : expiringSoon ? 'text-yellow-600 font-medium' : 'text-gray-700'}`}>
                            {new Date(policy.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <strong>Annual Premium:</strong>
                          <p className="text-gray-700">{formatCurrency(policy.annualPremium)}</p>
                        </div>
                        <div>
                          <strong>Sum Insured:</strong>
                          <p className="text-gray-700">{formatCurrency(policy.sumInsured)}</p>
                        </div>
                      </div>
                      
                      {policy.brokerName && (
                        <div className="mt-2 text-sm text-gray-500">
                          <strong>Broker:</strong> {policy.brokerName}
                          {policy.brokerContact && <span> - {policy.brokerContact}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <InsuranceForm
          onClose={() => setShowForm(false)}
        />
      )}
      
      {selectedPolicy && (
        <InsuranceDetailsModal
          policy={selectedPolicy}
          onClose={() => setSelectedPolicy(null)}
        />
      )}
    </div>
  )
}