
import { User, Role, Crop, CropCategory, Message, ChatSession, DemandMetric, CrisisAlert, LogisticsOption, MarketRate, ForumPost, BuyerType, Invoice, StorageFacility, Auction, LoanOffer, SoilHealthData, EcoScore, Order, Notification, BuyerRequest, Feedback } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'owner1',
    name: 'nithin',
    role: Role.OWNER,
    location: 'Headquarters',
    email: 'nithin@agrilink.com',
    phone: '0000000000',
    password: '0987',
    avatar: 'https://ui-avatars.com/api/?name=Nithin&background=000000&color=fff',
    preferences: {
      language: 'English',
      darkMode: true
    },
    securityLogs: [
      { id: 'sl-owner', device: 'Admin Console', location: 'HQ', timestamp: Date.now(), ip: '127.0.0.1' }
    ]
  },
  {
    id: 'u1',
    name: 'farmer', 
    role: Role.FARMER,
    location: 'Mandya, India',
    email: 'farmer123@gmail.com',
    phone: '8660591572',
    aadharNumber: '123456123456',
    password: '1234',
    avatar: 'https://picsum.photos/seed/farmer1/200/200',
    trustScore: 4.8,
    riskScore: 5,
    sustainabilityScore: 85,
    blockchainVerified: true,
    creditScore: 750,
    walletBalance: 12500, // INR
    hasFarmTour: true, 
    farm3dProfile: [
      {
        id: 'f3d1',
        name: 'Main Rice Paddy Field',
        type: 'Field',
        imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop', 
        description: '360 View of our organic rice cultivation area.'
      },
      {
        id: 'f3d2',
        name: 'Cold Storage Unit',
        type: 'Storage',
        imageUrl: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=2944&auto=format&fit=crop',
        description: 'Temperature controlled storage for vegetables.'
      },
      {
        id: 'f3d3',
        name: 'Drip Irrigation Setup',
        type: 'Irrigation',
        imageUrl: 'https://images.unsplash.com/photo-1563514227149-561c2c013ca8?q=80&w=2944&auto=format&fit=crop',
        description: 'Advanced water saving irrigation system.'
      }
    ],
    bankDetails: {
      accountHolderName: 'farmer',
      phoneNumber: '8660591572',
      accountNumber: '123456123456',
      ifscCode: 'BARB0MANDYA',
      branchName: 'Mandya',
      upiId: 'farmer@upi'
    },
    preferences: {
      language: 'English',
      darkMode: false,
      timeManagement: '30 mins'
    },
    followers: [],
    following: [],
    blockedUsers: [],
    // New Fields
    kycStatus: 'Verified',
    payoutPreference: 'Bank',
    twoFactorEnabled: true,
    securityLogs: [
      { id: 'sl1', device: 'Chrome / Windows', location: 'Mandya, IN', timestamp: Date.now() - 100000, ip: '192.168.1.1' },
      { id: 'sl2', device: 'Mobile App / Android', location: 'Mysore, IN', timestamp: Date.now() - 86400000, ip: '49.20.11.5' }
    ],
    notificationPreferences: {
      channels: { sms: true, whatsapp: true, email: false, inApp: true },
      alerts: { priceDrop: true, weather: true, crisis: true, payment: true, orders: true }
    },
    documents: [
      { id: 'd1', type: 'Farmer Certificate', status: 'Verified', uploadedAt: '2023-01-10', url: '#' },
      { id: 'd2', type: 'Aadhar', status: 'Verified', uploadedAt: '2023-01-10', url: '#' }
    ],
    dataSharing: { sharePhone: true, shareLocation: true }
  },
  {
    id: 'u2',
    name: 'Ram',
    role: Role.BUYER,
    location: 'Banglore, India',
    email: 'ramu123@gmail.com',
    phone: '8660591572',
    aadharNumber: '123456123456',
    password: '1234',
    avatar: 'https://picsum.photos/seed/buyer1/200/200',
    riskScore: 10,
    buyerType: BuyerType.WHOLESALE,
    bankDetails: {
      accountHolderName: 'Ram',
      phoneNumber: '8660591572',
      accountNumber: '123456123456',
      ifscCode: 'BARB0MANDYA',
      branchName: 'Banglore',
      upiId: 'ram@upi'
    },
    preferences: {
      language: 'English',
      darkMode: false,
      timeManagement: '1 hour'
    },
    followers: [],
    following: [],
    blockedUsers: [],
    kycStatus: 'Verified',
    savedPaymentMethods: [
      { id: 'pm1', type: 'Card', maskedNumber: '**** 4242', provider: 'Visa' },
      { id: 'pm2', type: 'UPI', maskedNumber: 'ram@upi' }
    ],
    notificationPreferences: {
      channels: { sms: true, whatsapp: false, email: true, inApp: true },
      alerts: { priceDrop: true, weather: false, crisis: false, payment: true, orders: true }
    },
    securityLogs: [
      { id: 'sl3', device: 'Safari / Mac', location: 'Banglore, IN', timestamp: Date.now(), ip: '112.10.5.1' }
    ]
  }
];

export const INITIAL_CROPS: Crop[] = [
  {
    id: 'c1',
    farmerId: 'u1',
    farmerName: 'farmer',
    name: 'Organic Wheat',
    category: CropCategory.GRAIN,
    pricePerKg: 30,
    quantityKg: 500,
    description: 'Freshly harvested organic wheat, high quality grain.',
    images: ['https://picsum.photos/seed/wheat/400/300'],
    location: 'Mandya, India',
    harvestDate: '2023-10-15',
    verified: true,
    createdAt: new Date().toISOString(),
    shelfLifeDays: 180,
    aiEstimatedWeight: 510,
    ecoScore: EcoScore.A,
    isOrganic: true,
    arModelUrl: 'mock-model',
    field360Image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop'
  },
  {
    id: 'c2',
    farmerId: 'u1',
    farmerName: 'farmer',
    name: 'Fresh Tomatoes',
    category: CropCategory.VEGETABLE,
    pricePerKg: 40,
    quantityKg: 200,
    description: 'Juicy, red tomatoes grown without pesticides.',
    images: ['https://picsum.photos/seed/tomatoes/400/300'],
    location: 'Mandya, India',
    harvestDate: '2023-11-01',
    verified: true,
    createdAt: new Date().toISOString(),
    shelfLifeDays: 7,
    ecoScore: EcoScore.B,
    isOrganic: false,
    field360Image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=2940&auto=format&fit=crop'
  },
  {
    id: 'c3',
    farmerId: 'u1',
    farmerName: 'farmer',
    name: 'Basmati Rice',
    category: CropCategory.GRAIN,
    pricePerKg: 85,
    quantityKg: 1000,
    description: 'Premium aged Basmati rice. Export quality.',
    images: ['https://picsum.photos/seed/rice/400/300'],
    location: 'Mandya, India',
    harvestDate: '2023-09-20',
    verified: true,
    createdAt: new Date().toISOString(),
    shelfLifeDays: 365,
    ecoScore: EcoScore.A,
    isOrganic: true
  }
];

export const MOCK_SOIL_DATA: SoilHealthData = {
  moisture: 65,
  temperature: 24,
  phLevel: 6.8,
  npk: { n: 'High', p: 'Medium', k: 'Optimal' },
  healthPercentage: 88,
  actionNeeded: 'Nitrogen levels slightly high. Reduce urea application.'
};

export const INITIAL_CHATS: ChatSession[] = [];
export const INITIAL_MESSAGES: Message[] = [];
export const DEMAND_DATA: DemandMetric[] = [
  { region: 'Bengaluru', crop: 'Tomatoes', demandLevel: 'High', trend: 'Up' },
  { region: 'Hyderabad', crop: 'Onions', demandLevel: 'High', trend: 'Stable' }
];
export const CRISIS_ALERTS: CrisisAlert[] = [];
export const LOGISTICS_OPTIONS: LogisticsOption[] = [
  { id: 'l1', type: 'Truck', providerName: 'AgriExpress', pricePerKm: 50, capacityKg: 5000, estimatedTime: '1 Day' }
];
export const MARKET_RATES: MarketRate[] = [
  { cropName: 'Wheat', mandiPrice: 28, marketAverage: 30, minPrice: 26, maxPrice: 35, trend: 'Stable' },
  { cropName: 'Onions', mandiPrice: 22, marketAverage: 25, minPrice: 18, maxPrice: 30, trend: 'Up' }
];
export const FORUM_POSTS: ForumPost[] = [];
export const MOCK_INVOICES: Invoice[] = [];
export const STORAGE_FACILITIES: StorageFacility[] = [];
export const MOCK_AUCTIONS: Auction[] = [];
export const LOAN_OFFERS: LoanOffer[] = [
  {
    id: 'ln1',
    provider: 'AgriBank State',
    amount: 50000,
    interestRate: 4.0,
    tenureMonths: 12,
    type: 'Kissan Micro-Loan',
    probability: 'High',
    link: 'https://www.sbi.co.in/web/agri-rural/agriculture-banking/kisan-credit-card'
  },
  {
    id: 'ln2',
    provider: 'Rural Fintech',
    amount: 200000,
    interestRate: 7.5,
    tenureMonths: 24,
    type: 'Equipment',
    probability: 'Medium',
    link: 'https://www.nabard.org/'
  },
  {
    id: 'ln3',
    provider: 'Mahindra Finance',
    amount: 500000,
    interestRate: 8.5,
    tenureMonths: 60,
    type: 'Tractor Loan',
    probability: 'High',
    link: 'https://www.mahindrafinance.com/loans/tractor-loans'
  },
  {
    id: 'ln4',
    provider: 'Govt of India',
    amount: 1000000,
    interestRate: 3.0,
    tenureMonths: 120,
    type: 'Cold Storage Subsidy',
    probability: 'Medium',
    link: 'https://ncdc.in/'
  }
];

export const MOCK_ORDERS: Order[] = [];
export const MOCK_NOTIFICATIONS: Notification[] = [];
export const MOCK_REQUESTS: BuyerRequest[] = [];
export const MOCK_FEEDBACK: Feedback[] = [
  {
    id: 'f1',
    farmerId: 'u1',
    buyerId: 'u2',
    buyerName: 'Ram',
    rating: 5,
    comment: 'Excellent quality tomatoes! Very fresh and delivered on time.',
    timestamp: Date.now() - 86400000
  }
];
