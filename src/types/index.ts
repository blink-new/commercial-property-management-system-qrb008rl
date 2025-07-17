export interface Property {
  id: string
  userId: string
  name: string
  address: string
  propertyType: string
  totalUnits: number
  occupiedUnits: number
  description?: string
  propertyDescription?: string // New: Long text property description
  locationDescription?: string // New: Long text location description
  purchasePrice?: number
  currentValue?: number
  purchaseDate?: string
  photoUrl?: string // Cover photo
  photoGallery?: string[] // New: Array of photo URLs for gallery
  status: 'active' | 'inactive'
  // New property fields
  tenure?: 'freehold' | 'leasehold'
  valuationDate?: string
  valuedBy?: string
  titleNumber?: string
  propertyManager?: string
  isArchived: boolean
  isDeleted?: boolean // New: For recycle bin
  deletedAt?: string // New: When item was deleted
  createdAt: string
  updatedAt: string
}

export interface Unit {
  id: string
  userId: string
  propertyId: string
  unitNumber: string
  floorNumber?: number
  unitType: string
  sizeSqft?: number
  bedrooms?: number
  bathrooms?: number
  rentAmount?: number
  status: 'vacant' | 'occupied'
  description?: string
  epcRating?: string
  epcUrl?: string
  // New unit fields
  rateableValue?: number
  ratesPayable?: number
  isArchived: boolean
  isDeleted?: boolean // New: For recycle bin
  deletedAt?: string // New: When item was deleted
  createdAt: string
  updatedAt: string
}

export interface Tenancy {
  id: string
  userId: string
  unitId: string
  tenantName: string
  tenantEmail?: string
  tenantPhone?: string
  leaseStartDate: string
  leaseEndDate: string
  monthlyRent: number
  securityDeposit?: number
  status: 'active' | 'expired' | 'terminated'
  notes?: string
  // New tenancy fields
  insideAct?: 'yes' | 'no' | 'na_scotland'
  breakDate?: string
  breakNoticePeriod?: number
  breakNoticePeriodUnit?: 'months' | 'weeks'
  breakType?: 'mutual' | 'landlord_only' | 'tenant_only'
  rentReviewDate?: string
  rentReviewType?: 'fixed' | 'indexed_rpi' | 'indexed_cpi' | 'open_market' | 'upwards_only_open_market'
  repairingObligation?: 'fri' | 'iri'
  tenancyDocuments?: string[]
  // Diary notification settings
  diarySettings?: {
    leaseExpiry?: { enabled: boolean; monthsBefore: number }
    rentReview?: { enabled: boolean; monthsBefore: number }
    tenancyBreak?: { enabled: boolean; monthsBefore: number }
  }
  isArchived: boolean
  isDeleted?: boolean // New: For recycle bin
  deletedAt?: string // New: When item was deleted
  createdAt: string
  updatedAt: string
}

export interface EPCData {
  id: string
  userId: string
  unitId: string
  rating: string
  certificateUrl?: string
  governmentPortalUrl?: string
  validUntil?: string
  notes?: string
  isArchived: boolean
  isDeleted?: boolean // New: For recycle bin
  deletedAt?: string // New: When item was deleted
  createdAt: string
  updatedAt: string
}

export interface DiaryEvent {
  id: string
  userId: string
  propertyId: string
  unitId?: string
  tenancyId?: string
  maintenanceId?: string
  insuranceId?: string
  eventType: 'lease_expiry' | 'rent_review' | 'tenancy_break' | 'maintenance_deadline' | 'insurance_expiry'
  eventDate: string
  title: string
  description: string
  comments?: string
  status?: 'vacating' | 'in_talks_directly' | 'in_negotiations' | 'in_legals' | 'pending'
  isArchived: boolean
  isDeleted?: boolean // New: For recycle bin
  deletedAt?: string // New: When item was deleted
  createdAt: string
  updatedAt: string
}

export interface MaintenanceIssue {
  id: string
  userId: string
  propertyId: string
  unitId?: string
  title: string
  description: string
  status: 'reported' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  reportedDate: string
  deadline?: string
  completedDate?: string
  assignedTo?: string
  estimatedCost?: number
  actualCost?: number
  comments: MaintenanceComment[]
  attachments: MaintenanceAttachment[]
  diarySettings?: {
    enabled: boolean
    daysBefore: number
  }
  isArchived: boolean
  isDeleted?: boolean // New: For recycle bin
  deletedAt?: string // New: When item was deleted
  createdAt: string
  updatedAt: string
}

export interface MaintenanceComment {
  id: string
  text: string
  createdAt: string
  createdBy: string
}

export interface MaintenanceAttachment {
  id: string
  name: string
  type: 'quote' | 'invoice' | 'photo' | 'other'
  url: string
  uploadedAt: string
}

export interface InsurancePolicy {
  id: string
  userId: string
  propertyIds: string[]
  policyType: 'buildings' | 'public_liability' | 'contents' | 'terrorism'
  insuranceCompany: string
  brokerName?: string
  brokerContact?: string
  brokerEmail?: string
  brokerPhone?: string
  policyNumber: string
  startDate: string
  expiryDate: string
  annualPremium: number
  sumInsured: number // BDV - Building Declared Value
  // Loss of rent for buildings insurance (optional)
  lossOfRent?: {
    amount: number // Amount in GBP
    years: number // Number of years
  }
  comments?: string // Comments for all insurance types
  documents: InsuranceDocument[]
  diarySettings?: {
    enabled: boolean
    daysBefore: number
  }
  isArchived: boolean
  isDeleted?: boolean // New: For recycle bin
  deletedAt?: string // New: When item was deleted
  createdAt: string
  updatedAt: string
}

export interface InsuranceDocument {
  id: string
  name: string
  url: string
  uploadedAt: string
}

export type PropertyFormData = Omit<Property, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isArchived'>
export type UnitFormData = Omit<Unit, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isArchived'>
export type TenancyFormData = Omit<Tenancy, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isArchived'>
export type EPCFormData = Omit<EPCData, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isArchived'>
export type DiaryFormData = Omit<DiaryEvent, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isArchived'>
export type MaintenanceFormData = Omit<MaintenanceIssue, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isArchived' | 'comments' | 'attachments'>
export type InsuranceFormData = Omit<InsurancePolicy, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isArchived' | 'documents'>

// Currency formatting utility
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(amount)
}