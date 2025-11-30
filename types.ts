
export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  LOGO_FRESH = 'LOGO_FRESH',
  SUBSCRIPTION = 'SUBSCRIPTION',
  PROFILE = 'PROFILE'
}

export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';
export type ImageSize = '1K' | '2K' | '4K';

export interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
  isThinking?: boolean;
}

export interface GenerationConfig {
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
}

export interface LogoVariation {
  id: string;
  title: string;
  rationale: string;
  palette: {
    hex: string[];
    usage: { role: string; hex: string }[];
  };
  geometry: {
    iconAdjustments: string;
  };
  typography: {
    change: boolean;
    family: string;
  };
}

export interface LogoFreshResponse {
  variations: LogoVariation[];
  dice?: LogoVariation[];
  brandSummary?: {
    integrityNotes: string;
  };
}

export interface Occasion {
  value: string;
  label: string;
  category: string;
  tone: 'celebratory' | 'neutral' | 'somber' | 'supportive' | 'fun' | 'bold' | 'natural' | 'spirited' | 'respectful';
  color: string;
  imageUrl: string; // URL for high-fidelity banner image
  months: number[]; // 0-11 (Jan-Dec)
}