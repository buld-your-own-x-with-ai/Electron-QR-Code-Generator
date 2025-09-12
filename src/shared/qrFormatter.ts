import { QrCodeData, TextData, ContactData, LocationData, WifiData, BusinessCardData } from './types';

/**
 * Format data according to QR code standards
 */
export class QrFormatter {
  /**
   * Format text/URL data
   */
  static formatText(data: TextData): string {
    return data.content;
  }

  /**
   * Format contact data (phone or email)
   */
  static formatContact(data: ContactData): string {
    if (data.type === 'tel') {
      return `tel:${data.value}`;
    } else {
      return `mailto:${data.value}`;
    }
  }

  /**
   * Format location data
   */
  static formatLocation(data: LocationData): string {
    return `geo:${data.latitude},${data.longitude}`;
  }

  /**
   * Format Wi-Fi data
   */
  static formatWifi(data: WifiData): string {
    // Handle no password case
    if (data.encryption === 'nopass') {
      return `WIFI:S:${data.ssid};T:nopass;;`;
    }
    
    return `WIFI:S:${data.ssid};T:${data.encryption};P:${data.password};;`;
  }

  /**
   * Format business card data (vCard)
   */
  static formatBusinessCard(data: BusinessCardData): string {
    let vCard = 'BEGIN:VCARD\nVERSION:3.0\n';
    
    if (data.name) vCard += `FN:${data.name}\n`;
    if (data.company) vCard += `ORG:${data.company}\n`;
    if (data.title) vCard += `TITLE:${data.title}\n`;
    if (data.phone) vCard += `TEL:${data.phone}\n`;
    if (data.email) vCard += `EMAIL:${data.email}\n`;
    if (data.address) vCard += `ADR:${data.address}\n`;
    if (data.website) vCard += `URL:${data.website}\n`;
    
    vCard += 'END:VCARD';
    
    return vCard;
  }

  /**
   * Format any QR code data based on its type
   */
  static formatData(qrData: QrCodeData): string {
    switch (qrData.type) {
      case 'text':
        return this.formatText(qrData.data as TextData);
      case 'contact':
        return this.formatContact(qrData.data as ContactData);
      case 'location':
        return this.formatLocation(qrData.data as LocationData);
      case 'wifi':
        return this.formatWifi(qrData.data as WifiData);
      case 'businessCard':
        return this.formatBusinessCard(qrData.data as BusinessCardData);
      default:
        throw new Error(`Unsupported QR data type: ${qrData.type}`);
    }
  }
}