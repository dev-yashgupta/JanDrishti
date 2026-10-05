// ============================================================
// Application Constants
// ============================================================

export const APP_NAME = 'JanDrishti AI';
export const APP_TAGLINE = 'See a Problem. Report It. Prioritize It. Resolve It.';
export const APP_DESCRIPTION =
  'JanDrishti AI uses artificial intelligence and community intelligence to identify, analyse and prioritise unresolved civic problems across India.';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_FILE_SIZE_MB = 10;
export const MAX_VIDEO_SIZE_MB = 50;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4'];

export const DEFAULT_MAP_CENTER: [number, number] = [22.9734, 78.6569]; // India centre
export const DEFAULT_MAP_ZOOM = 5;
export const CITY_MAP_ZOOM = 12;

export const PRIORITY_WEIGHTS = {
  severity: 0.30,
  urgency: 0.25,
  frequency: 0.20,
  community_impact: 0.15,
  persistence: 0.10,
};

export const PRIORITY_THRESHOLDS = {
  CRITICAL: 75,
  HIGH: 50,
  MEDIUM: 25,
  LOW: 0,
};

export const SIMILARITY_THRESHOLD = 0.75;
export const SIMILARITY_RADIUS_KM = 2.0;

// Demo data label — shown on any seeded content
export const DEMO_LABEL = '⚡ Demo Data';

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
];

export const DEMO_CITIES = [
  { city: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.209 },
  { city: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777 },
  { city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
  { city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { city: 'Chandigarh', state: 'Punjab', lat: 30.7333, lng: 76.7794 },
  { city: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376 },
  { city: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126 },
  { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
];

export const CATEGORY_ICONS: Record<string, string> = {
  'roads-infrastructure': '🛣️',
  'water-supply': '💧',
  'sanitation-waste': '🗑️',
  healthcare: '🏥',
  education: '🏫',
  electricity: '⚡',
  'public-safety': '🚨',
  environment: '🌿',
  'drainage-flooding': '🌊',
  'public-transport': '🚌',
  housing: '🏠',
  other: '📋',
};

export const NAV_LINKS_CITIZEN = [
  { href: '/', label: 'Home' },
  { href: '/report', label: 'Report Problem' },
  { href: '/explore', label: 'Explore Issues' },
  { href: '/dashboard', label: 'My Reports' },
  { href: '/notifications', label: 'Notifications' },
];

export const NAV_LINKS_AUTHORITY = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/problems', label: 'Problems' },
  { href: '/admin/map', label: 'Map' },
  { href: '/admin/clusters', label: 'Clusters' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/assignments', label: 'Assignments' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/settings', label: 'Settings' },
];

// ── Indian states list (also available from utils.ts) ────────
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];
