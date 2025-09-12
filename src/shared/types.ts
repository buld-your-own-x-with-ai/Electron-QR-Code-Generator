// Data type models for QR Code Generator

export interface TextData {
  content: string;
}

export interface ContactData {
  type: 'tel' | 'mailto';
  value: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface WifiData {
  ssid: string;
  encryption: 'WEP' | 'WPA' | 'WPA2' | 'nopass';
  password: string;
}

export interface BusinessCardData {
  name: string;
  phone: string;
  email: string;
  company: string;
  title?: string;
  address?: string;
  website?: string;
}

export type QrDataType = 'text' | 'contact' | 'location' | 'wifi' | 'businessCard';

export interface QrCodeData {
  type: QrDataType;
  data: TextData | ContactData | LocationData | WifiData | BusinessCardData;
}

export interface CustomizationOptions {
  size: number;
  fgColor: string;
  bgColor: string;
  logo?: string; // Base64 encoded logo
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  includeMargin?: boolean;
}

export interface ExportSettings {
  format: 'png' | 'jpg' | 'svg';
  batchSize: number;
}

export interface AppState {
  currentInput: QrCodeData;
  customization: CustomizationOptions;
  generatedQrCode?: string; // Data URL of generated QR code
  exportSettings: ExportSettings;
}