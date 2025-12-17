
export enum Role {
  FARMER = 'FARMER',
  BUYER = 'BUYER',
  OWNER = 'OWNER'
}

export enum CropCategory {
  VEGETABLE = 'Vegetable',
  FRUIT = 'Fruit',
  GRAIN = 'Grain',
  PULSE = 'Pulse',
  SPICE = 'Spice',
  OTHER = 'Other'
}

export enum BuyerType {
  RETAIL = 'Retail (Home)',
  WHOLESALE = 'Wholesale / Mandi',
  HORECA = 'Hotel / Restaurant',
  EXPORTER = 'Exporter'
}

export enum EcoScore {
  A = 'Group A (High)',
  B = 'Group B (Good)',
  C = 'Group C (Avg)',
  D = 'Group D (Low)'
}

export type PaymentMethod = 'Google Pay' | 'PhonePe' | 'Paytm' | 'Cash on Delivery' | 'Check Deposit';

export type OrderStatus = 'Pending' | 'Confirmed' | 'Packed' | 'Shipped' | 'On Route' | 'Delivered';

export interface BankDetails {
  accountHolderName: string;
  phoneNumber: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  upiId?: string; // New
}

export interface UserPreferences {
  language: string;
  darkMode: boolean;
  timeManagement?: string;
}

export interface FarmArea3D {
  id: string;
  name: string;
  type: 'Field' | 'Storage' | 'Irrigation' | 'Other';
  imageUrl: string;
  description?: string;
}

// New Types for Account Settings
export type KYCStatus = 'Verified' | 'Pending' | 'Unverified';
export type PayoutPreference = 'Bank' | 'UPI' | 'Cash';

export interface SecurityLog {
  id: string;
  device: string;
  location: string;
  timestamp: number;
  ip: string;
}

export interface NotificationPreferences {
  channels: {
    sms: boolean;
    whatsapp: boolean;
    email: boolean;
    inApp: boolean;
  };
  alerts: {
    priceDrop: boolean;
    weather: boolean;
    crisis: boolean;
    payment: boolean;
    orders: boolean;
  };
}

export interface SavedPaymentMethod {
  id: string;
  type: 'UPI' | 'Card';
  maskedNumber: string; // e.g., "**** 1234" or "user@upi"
  provider?: string;
}

export interface UserDocument {
  id: string;
  type: 'Aadhar' | 'Pan' | 'GST' | 'Farmer Certificate';
  status: 'Verified' | 'Pending' | 'Rejected';
  uploadedAt: string;
  url: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  aadharNumber?: string;
  role: Role;
  location: string;
  avatar: string;
  trustScore?: number;
  riskScore?: number;
  buyerType?: BuyerType;
  flags?: string[];
  
  bankDetails?: BankDetails;
  preferences?: UserPreferences;

  sustainabilityScore?: number;
  blockchainVerified?: boolean;
  creditScore?: number;
  walletBalance?: number;
  
  hasFarmTour?: boolean;
  farm3dProfile?: FarmArea3D[]; 

  followers?: string[]; 
  following?: string[]; 
  blockedUsers?: string[];

  // New Account Management Fields
  kycStatus?: KYCStatus;
  payoutPreference?: PayoutPreference;
  savedPaymentMethods?: SavedPaymentMethod[];
  securityLogs?: SecurityLog[];
  notificationPreferences?: NotificationPreferences;
  documents?: UserDocument[];
  gstNumber?: string;
  twoFactorEnabled?: boolean;
  dataSharing?: {
    sharePhone: boolean;
    shareLocation: boolean;
  };
}

export interface Crop {
  id: string;
  farmerId: string;
  farmerName: string;
  name: string;
  category: CropCategory;
  pricePerKg: number;
  quantityKg: number;
  description: string;
  images: string[];
  location: string;
  harvestDate: string;
  qualityScore?: number;
  verified: boolean;
  createdAt: string;
  shelfLifeDays?: number;
  bestBeforeDate?: string;
  arModelUrl?: string;
  aiEstimatedWeight?: number; 
  verificationStatus?: 'Pending' | 'Verified' | 'Failed';
  
  ecoScore?: EcoScore;
  isOrganic?: boolean;
  field360Image?: string; 
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  items: { cropId: string; name: string; quantity: number; price: number; image: string }[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  date: number;
  trackingUpdates: { status: OrderStatus; timestamp: number }[];
}

export interface Notification {
  id: string;
  userId: string;
  text: string;
  type: 'ORDER_PLACED' | 'ORDER_UPDATE' | 'NEW_CROP' | 'REQUEST_ACCEPTED' | 'CALL_MISSED' | 'FEEDBACK_RECEIVED';
  isRead: boolean;
  timestamp: number;
  referenceId?: string; 
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  isRead: boolean;
  isSystem?: boolean;
  attachment?: {
    type: 'image' | 'video' | 'location' | 'audio';
    url: string; 
  };
  deletedFor?: string[];
  isDeletedForEveryone?: boolean;
}

export interface ChatSession {
  id: string;
  participants: string[];
  lastMessage: string;
  lastTimestamp: number;
}

export interface AIAnalysisResult {
  cropName: string;
  category: string;
  qualityAssessment: string;
  estimatedPriceRange: string;
  estimatedPriceInr: number; 
  confidence: number;
  description: string; 
  ecoScoreEstimate: string; 
  shelfLifePrediction: {
    days: number;
    condition: string;
  };
}

export interface SeasonalForecast {
  season: string;
  location: string;
  recommendations: {
    cropName: string;
    demandTrend: 'High' | 'Medium' | 'Low';
    pricePrediction: 'Rising' | 'Stable' | 'Falling';
    suggestedAction: string;
  }[];
}

export interface DemandMetric {
  region: string;
  crop: string;
  demandLevel: 'High' | 'Medium' | 'Low';
  trend: 'Up' | 'Down' | 'Stable';
}

export interface CrisisAlert {
  id: string;
  type: 'Flood' | 'Drought' | 'Pest' | 'Market Crash' | 'Weather';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  message: string;
  location: string;
  date: string;
  actionRequired?: string;
}

export interface DiseaseAnalysis {
  diseaseName: string;
  severity: 'Low' | 'Medium' | 'High';
  treatment: string;
  isSellable: boolean;
  confidence: number;
}

export interface SoilHealthData {
  moisture: number; 
  temperature: number; 
  phLevel: number; 
  npk: { n: string; p: string; k: string };
  droneScanUrl?: string;
  healthPercentage: number;
  actionNeeded: string;
}

export interface SoilDoctorResult {
  diagnosis: string;
  deficiencies: string[];
  recommendations: string[];
}

export interface InsuranceClaim {
  id: string;
  cropName: string;
  damagePercentage: number;
  estimatedLoss: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
  evidenceImage: string;
}

export interface LogisticsOption {
  id: string;
  type: 'Truck' | 'Tractor' | 'Auto' | 'Tempo';
  providerName: string;
  pricePerKm: number;
  capacityKg: number;
  estimatedTime: string;
}

export interface MarketRate {
  cropName: string;
  mandiPrice: number;
  marketAverage: number;
  minPrice: number;
  maxPrice: number;
  trend: 'Up' | 'Down' | 'Stable';
}

export type Language = 'English' | 'Hindi' | 'Kannada' | 'Tamil' | 'Telugu' | 'Malayalam' | 'Bengali' | 'Marathi' | 'Gujarati' | 'Odia' | 'Punjabi';

export interface ForumPost {
  id: string;
  authorId: string;
  authorName: string;
  category: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  timestamp: number;
}

export interface Invoice {
  id: string;
  orderId: string;
  farmerId: string;
  buyerName: string;
  date: string;
  items: { name: string; qty: number; price: number }[];
  totalAmount: number;
  taxAmount: number;
  status: 'Paid' | 'Pending';
}

export interface StorageFacility {
  id: string;
  name: string;
  location: string;
  type: 'Cold Storage' | 'Warehouse';
  capacityKg: number;
  pricePerDay: number;
  available: boolean;
  temperature?: string;
}

export interface Auction {
  id: string;
  cropName: string;
  quantityKg: number;
  basePrice: number;
  currentBid: number;
  highestBidder: string;
  endTime: number; 
  farmerId: string;
  status: 'Live' | 'Ended';
}

export interface LoanOffer {
  id: string;
  provider: string;
  amount: number;
  interestRate: number;
  tenureMonths: number;
  type: 'Seed Loan' | 'Equipment' | 'Infrastructure' | 'Kissan Micro-Loan' | 'Tractor Loan' | 'Cold Storage Subsidy';
  probability: 'High' | 'Medium' | 'Low';
  link: string; 
}

export interface DeliveryRoute {
  id: string;
  totalDistance: number;
  totalCost: number;
  stops: {
    location: string;
    action: 'Pickup' | 'Drop';
    time: string;
  }[];
}

export interface HarvestSchedule {
  id: string;
  cropName: string;
  sowingDate: string;
  harvestStartDate: string;
  harvestEndDate: string;
  notes: string;
}

export interface BuyerRequest {
  id: string;
  buyerId: string;
  buyerName: string;
  cropName: string;
  quantity: number;
  targetPrice: number;
  requiredDate: string;
  location: string;
  status: 'Open' | 'Fulfilled' | 'Expired';
  createdAt: number;
}

export interface CallSignal {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  receiverId: string;
  type: 'video' | 'audio';
  status: 'offering' | 'accepted' | 'rejected' | 'ended' | 'busy';
  timestamp: number;
}

export interface Feedback {
  id: string;
  farmerId: string;
  buyerId: string;
  buyerName: string;
  cropId?: string;
  cropName?: string;
  rating: number; // 1 to 5
  comment: string;
  timestamp: number;
}
