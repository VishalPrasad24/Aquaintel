
export type UserRole = 'user' | 'hospital';

export interface UserProfile {
  id: string; // From Supabase auth
  name: string;
  location: string;
  avatarUrl: string | null;
  phone?: string;
  age?: number | null;
}

export interface HospitalProfile {
  id: string; // UUID from database
  unique_id: string; // The 8-digit hospital ID
  name: string;
  location: string;
}

export type Profile = UserProfile | HospitalProfile;

export enum Disease {
  Cholera = 'Cholera',
  Typhoid = 'Typhoid',
  HepatitisA = 'Hepatitis A',
  Dysentery = 'Dysentery',
  Giardiasis = 'Giardiasis',
  Shigellosis = 'Shigellosis',
  Amoebiasis = 'Amoebiasis',
  Cryptosporidiosis = 'Cryptosporidiosis',
}

export interface DiseaseData {
  [Disease.Cholera]: number;
  [Disease.Typhoid]: number;
  [Disease.HepatitisA]: number;
  [Disease.Dysentery]: number;
  [Disease.Giardiasis]: number;
  [Disease.Shigellosis]: number;
  [Disease.Amoebiasis]: number;
  [Disease.Cryptosporidiosis]: number;
}

export interface WaterQuality {
  ph: number;
  turbidity: number; // in NTU
}

export interface LocationData {
  id: string;
  city: string;
  district: string;
  state: string;
  coords: { lat: number; lng: number };
  cases: DiseaseData;
  waterQuality: WaterQuality;
}

export type Language = 'en' | 'hi' | 'as' | 'ne';

export type Translations = {
  [key: string]: {
    [lang in Language]: string;
  };
};

export interface StudyModule {
  id: string;
  title: string;
  summary: string;
  symptoms: string[];
  prevention: string[];
  imageUrl: string;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export interface HospitalContact {
    name: string;
    district: string;
    phone: string;
    address?: string;
}

export interface HealthAuthorityContact {
  state: string;
  helplines: {
    name: string;
    phone: string;
  }[];
  hospitals: HospitalContact[];
}

export interface CaseReport {
    id: number;
    hospital_id: string;
    location_id: string;
    disease: Disease;
    case_count: number;
    report_date: string; // YYYY-MM-DD
}

export interface PendingBulkReport {
    id?: number;
    hospitalId: string;
    locationId: string;
    disease: Disease;
    count: number;
    date: string; // YYYY-MM-DD
    timestamp: number;
}

export interface OutbreakAlertInfo {
    disease: Disease;
    level: 'High';
    message: string;
}
