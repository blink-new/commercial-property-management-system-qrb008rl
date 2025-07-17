import { Property, Unit, Tenancy, MaintenanceIssue, InsurancePolicy } from '../types'

export const generateSampleData = () => {
  const currentDate = new Date()
  const futureDate = (months: number) => {
    const date = new Date(currentDate)
    date.setMonth(date.getMonth() + months)
    return date.toISOString().split('T')[0]
  }

  const pastDate = (months: number) => {
    const date = new Date(currentDate)
    date.setMonth(date.getMonth() - months)
    return date.toISOString().split('T')[0]
  }

  // Sample Properties
  const sampleProperties: Property[] = [
    {
      id: 'prop-1',
      userId: 'current-user',
      name: 'Central Business Plaza',
      address: '123 Main Street, London, SW1A 1AA',
      propertyType: 'Office Building',
      totalUnits: 3,
      occupiedUnits: 2,
      description: 'Modern office building in prime location',
      purchasePrice: 2500000,
      currentValue: 2800000,
      purchaseDate: pastDate(24),
      status: 'active',
      tenure: 'freehold',
      propertyManager: 'current-user',
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prop-2',
      userId: 'current-user',
      name: 'Riverside Retail Center',
      address: '456 River Road, Manchester, M1 1AA',
      propertyType: 'Retail',
      totalUnits: 2,
      occupiedUnits: 1,
      description: 'Prime retail space with high footfall',
      purchasePrice: 1800000,
      currentValue: 2100000,
      purchaseDate: pastDate(18),
      status: 'active',
      tenure: 'freehold',
      propertyManager: 'current-user',
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ]

  // Sample Units
  const sampleUnits: Unit[] = [
    {
      id: 'unit-1',
      userId: 'current-user',
      propertyId: 'prop-1',
      unitNumber: '101',
      floorNumber: 1,
      unitType: 'Office',
      sizeSqft: 2500,
      rentAmount: 8500,
      status: 'occupied',
      description: 'Ground floor office suite',
      rateableValue: 85000,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'unit-2',
      userId: 'current-user',
      propertyId: 'prop-1',
      unitNumber: '201',
      floorNumber: 2,
      unitType: 'Office',
      sizeSqft: 1800,
      rentAmount: 6200,
      status: 'occupied',
      description: 'Second floor office space',
      rateableValue: 62000,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'unit-3',
      userId: 'current-user',
      propertyId: 'prop-1',
      unitNumber: '301',
      floorNumber: 3,
      unitType: 'Office',
      sizeSqft: 1200,
      rentAmount: 4800,
      status: 'vacant',
      description: 'Third floor office space',
      rateableValue: 48000,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'unit-4',
      userId: 'current-user',
      propertyId: 'prop-2',
      unitNumber: 'A',
      floorNumber: 1,
      unitType: 'Retail',
      sizeSqft: 3200,
      rentAmount: 12000,
      status: 'occupied',
      description: 'Large retail unit with street frontage',
      rateableValue: 120000,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'unit-5',
      userId: 'current-user',
      propertyId: 'prop-2',
      unitNumber: 'B',
      floorNumber: 1,
      unitType: 'Retail',
      sizeSqft: 1800,
      rentAmount: 7500,
      status: 'vacant',
      description: 'Smaller retail unit',
      rateableValue: 75000,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ]

  // Sample Tenancies with Diary Settings
  const sampleTenancies: Tenancy[] = [
    {
      id: 'tenancy-1',
      userId: 'current-user',
      unitId: 'unit-1',
      tenantName: 'TechCorp Solutions Ltd',
      tenantEmail: 'admin@techcorp.com',
      tenantPhone: '+44 20 7123 4567',
      leaseStartDate: pastDate(12),
      leaseEndDate: futureDate(6), // Expires in 6 months
      monthlyRent: 8500,
      securityDeposit: 25500,
      status: 'active',
      notes: 'Long-term tenant, excellent payment history',
      insideAct: 'yes',
      breakDate: futureDate(3), // Break clause in 3 months
      breakNoticePeriod: 6,
      breakNoticePeriodUnit: 'months',
      breakType: 'mutual',
      rentReviewDate: futureDate(4), // Rent review in 4 months
      rentReviewType: 'open_market',
      repairingObligation: 'fri',
      diarySettings: {
        leaseExpiry: { enabled: true, monthsBefore: 3 },
        rentReview: { enabled: true, monthsBefore: 2 },
        tenancyBreak: { enabled: true, monthsBefore: 1 }
      },
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tenancy-2',
      userId: 'current-user',
      unitId: 'unit-2',
      tenantName: 'Creative Design Studio',
      tenantEmail: 'hello@creativedesign.co.uk',
      tenantPhone: '+44 20 7987 6543',
      leaseStartDate: pastDate(8),
      leaseEndDate: futureDate(10), // Expires in 10 months
      monthlyRent: 6200,
      securityDeposit: 18600,
      status: 'active',
      notes: 'Creative agency, good tenant',
      insideAct: 'yes',
      rentReviewDate: futureDate(2), // Rent review in 2 months
      rentReviewType: 'indexed_rpi',
      repairingObligation: 'iri',
      diarySettings: {
        leaseExpiry: { enabled: true, monthsBefore: 6 },
        rentReview: { enabled: true, monthsBefore: 3 },
        tenancyBreak: { enabled: false, monthsBefore: 3 }
      },
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tenancy-3',
      userId: 'current-user',
      unitId: 'unit-4',
      tenantName: 'Fashion Boutique Ltd',
      tenantEmail: 'manager@fashionboutique.com',
      tenantPhone: '+44 161 234 5678',
      leaseStartDate: pastDate(6),
      leaseEndDate: futureDate(18), // Expires in 18 months
      monthlyRent: 12000,
      securityDeposit: 36000,
      status: 'active',
      notes: 'High-end fashion retailer',
      insideAct: 'no',
      breakDate: futureDate(12), // Break clause in 12 months
      breakNoticePeriod: 3,
      breakNoticePeriodUnit: 'months',
      breakType: 'tenant_only',
      rentReviewDate: futureDate(6), // Rent review in 6 months
      rentReviewType: 'upwards_only_open_market',
      repairingObligation: 'fri',
      diarySettings: {
        leaseExpiry: { enabled: true, monthsBefore: 12 },
        rentReview: { enabled: true, monthsBefore: 3 },
        tenancyBreak: { enabled: true, monthsBefore: 6 }
      },
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ]

  // Sample Maintenance Issues
  const sampleMaintenanceIssues: MaintenanceIssue[] = [
    {
      id: 'maint-1',
      userId: 'current-user',
      propertyId: 'prop-1',
      unitId: 'unit-1',
      title: 'Air Conditioning System Repair',
      description: 'The main AC unit in the ground floor office is making unusual noises and not cooling effectively. Tenant has reported the issue and it needs urgent attention.',
      status: 'in_progress',
      priority: 'high',
      reportedDate: pastDate(0.5),
      deadline: futureDate(0.5),
      assignedTo: 'HVAC Solutions Ltd',
      estimatedCost: 1200,
      actualCost: undefined,
      comments: [
        {
          id: 'comment-1',
          text: 'Initial inspection completed. Compressor needs replacement.',
          createdAt: pastDate(0.3),
          createdBy: 'HVAC Solutions Ltd'
        },
        {
          id: 'comment-2',
          text: 'Parts ordered, should arrive by end of week.',
          createdAt: pastDate(0.1),
          createdBy: 'HVAC Solutions Ltd'
        }
      ],
      attachments: [
        {
          id: 'attach-1',
          name: 'HVAC_Quote_2024.pdf',
          type: 'quote',
          url: 'https://example.com/quote1.pdf',
          uploadedAt: pastDate(0.4)
        }
      ],
      diarySettings: {
        enabled: true,
        daysBefore: 3
      },
      isArchived: false,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'maint-2',
      userId: 'current-user',
      propertyId: 'prop-2',
      unitId: undefined,
      title: 'Roof Leak Investigation',
      description: 'Water stains noticed on the ceiling of Unit A. Need to investigate potential roof leak and arrange repairs.',
      status: 'reported',
      priority: 'urgent',
      reportedDate: pastDate(0.1),
      deadline: futureDate(0.3),
      assignedTo: 'Roofing Experts Ltd',
      estimatedCost: 2500,
      actualCost: undefined,
      comments: [],
      attachments: [
        {
          id: 'attach-2',
          name: 'roof_damage_photo.jpg',
          type: 'photo',
          url: 'https://example.com/photo1.jpg',
          uploadedAt: pastDate(0.1)
        }
      ],
      diarySettings: {
        enabled: true,
        daysBefore: 7
      },
      isArchived: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'maint-3',
      userId: 'current-user',
      propertyId: 'prop-1',
      unitId: 'unit-2',
      title: 'Window Cleaning - Quarterly Service',
      description: 'Quarterly professional window cleaning for all exterior windows.',
      status: 'completed',
      priority: 'low',
      reportedDate: pastDate(1),
      deadline: pastDate(0.5),
      completedDate: pastDate(0.7),
      assignedTo: 'Crystal Clear Windows',
      estimatedCost: 350,
      actualCost: 350,
      comments: [
        {
          id: 'comment-3',
          text: 'Service completed successfully. All windows cleaned inside and out.',
          createdAt: pastDate(0.7),
          createdBy: 'Crystal Clear Windows'
        }
      ],
      attachments: [
        {
          id: 'attach-3',
          name: 'window_cleaning_invoice.pdf',
          type: 'invoice',
          url: 'https://example.com/invoice1.pdf',
          uploadedAt: pastDate(0.6)
        }
      ],
      diarySettings: {
        enabled: false,
        daysBefore: 7
      },
      isArchived: false,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ]

  // Sample Insurance Policies
  const sampleInsurancePolicies: InsurancePolicy[] = [
    {
      id: 'ins-1',
      userId: 'current-user',
      propertyIds: ['prop-1'],
      policyType: 'buildings',
      insuranceCompany: 'Aviva Commercial',
      brokerName: 'Commercial Insurance Brokers Ltd',
      brokerContact: 'Sarah Johnson',
      brokerEmail: 'sarah.johnson@cib.co.uk',
      brokerPhone: '+44 20 7123 9876',
      policyNumber: 'AV-BUILD-2024-001',
      startDate: pastDate(2),
      expiryDate: futureDate(10),
      annualPremium: 8500,
      sumInsured: 2800000,
      documents: [
        {
          id: 'doc-1',
          name: 'Buildings_Insurance_Policy_2024.pdf',
          url: 'https://example.com/policy1.pdf',
          uploadedAt: pastDate(2)
        },
        {
          id: 'doc-2',
          name: 'Insurance_Schedule_2024.pdf',
          url: 'https://example.com/schedule1.pdf',
          uploadedAt: pastDate(2)
        }
      ],
      diarySettings: {
        enabled: true,
        daysBefore: 60
      },
      isArchived: false,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'ins-2',
      userId: 'current-user',
      propertyIds: ['prop-1', 'prop-2'],
      policyType: 'public_liability',
      insuranceCompany: 'Zurich Insurance',
      brokerName: 'Commercial Insurance Brokers Ltd',
      brokerContact: 'Sarah Johnson',
      brokerEmail: 'sarah.johnson@cib.co.uk',
      brokerPhone: '+44 20 7123 9876',
      policyNumber: 'ZUR-PL-2024-002',
      startDate: pastDate(3),
      expiryDate: futureDate(9),
      annualPremium: 2200,
      sumInsured: 5000000,
      documents: [
        {
          id: 'doc-3',
          name: 'Public_Liability_Policy_2024.pdf',
          url: 'https://example.com/policy2.pdf',
          uploadedAt: pastDate(3)
        }
      ],
      diarySettings: {
        enabled: true,
        daysBefore: 30
      },
      isArchived: false,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'ins-3',
      userId: 'current-user',
      propertyIds: ['prop-2'],
      policyType: 'buildings',
      insuranceCompany: 'AXA Commercial',
      brokerName: 'Property Insurance Solutions',
      brokerContact: 'Michael Brown',
      brokerEmail: 'michael.brown@pisolutions.co.uk',
      brokerPhone: '+44 161 456 7890',
      policyNumber: 'AXA-BUILD-2024-003',
      startDate: pastDate(1),
      expiryDate: futureDate(11),
      annualPremium: 6800,
      sumInsured: 2100000,
      documents: [
        {
          id: 'doc-4',
          name: 'Riverside_Buildings_Policy_2024.pdf',
          url: 'https://example.com/policy3.pdf',
          uploadedAt: pastDate(1)
        }
      ],
      diarySettings: {
        enabled: true,
        daysBefore: 90
      },
      isArchived: false,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'ins-4',
      userId: 'current-user',
      propertyIds: ['prop-1', 'prop-2'],
      policyType: 'terrorism',
      insuranceCompany: 'Pool Re',
      brokerName: undefined,
      brokerContact: undefined,
      brokerEmail: undefined,
      brokerPhone: undefined,
      policyNumber: 'POOLRE-TERR-2024-004',
      startDate: pastDate(1.5),
      expiryDate: futureDate(10.5),
      annualPremium: 1200,
      sumInsured: 4900000,
      documents: [],
      diarySettings: {
        enabled: false,
        daysBefore: 30
      },
      isArchived: false,
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ]

  return {
    properties: sampleProperties,
    units: sampleUnits,
    tenancies: sampleTenancies,
    maintenanceIssues: sampleMaintenanceIssues,
    insurancePolicies: sampleInsurancePolicies
  }
}