import { QrFormatter } from './qrFormatter';
import { TextData, ContactData, LocationData, WifiData, BusinessCardData } from './types';

describe('QrFormatter', () => {
  describe('formatText', () => {
    it('should format text data correctly', () => {
      const textData: TextData = { content: 'Hello World' };
      expect(QrFormatter.formatText(textData)).toBe('Hello World');
    });
  });

  describe('formatContact', () => {
    it('should format phone contact data correctly', () => {
      const contactData: ContactData = { type: 'tel', value: '1234567890' };
      expect(QrFormatter.formatContact(contactData)).toBe('tel:1234567890');
    });

    it('should format email contact data correctly', () => {
      const contactData: ContactData = { type: 'mailto', value: 'test@example.com' };
      expect(QrFormatter.formatContact(contactData)).toBe('mailto:test@example.com');
    });
  });

  describe('formatLocation', () => {
    it('should format location data correctly', () => {
      const locationData: LocationData = { latitude: 40.7128, longitude: -74.0060 };
      expect(QrFormatter.formatLocation(locationData)).toBe('geo:40.7128,-74.006');
    });
  });

  describe('formatWifi', () => {
    it('should format wifi data with password correctly', () => {
      const wifiData: WifiData = { 
        ssid: 'MyNetwork', 
        encryption: 'WPA2', 
        password: 'password123' 
      };
      expect(QrFormatter.formatWifi(wifiData)).toBe('WIFI:S:MyNetwork;T:WPA2;P:password123;;');
    });

    it('should format wifi data without password correctly', () => {
      const wifiData: WifiData = { 
        ssid: 'OpenNetwork', 
        encryption: 'nopass', 
        password: '' 
      };
      expect(QrFormatter.formatWifi(wifiData)).toBe('WIFI:S:OpenNetwork;T:nopass;;');
    });
  });

  describe('formatBusinessCard', () => {
    it('should format business card data correctly', () => {
      const businessCardData: BusinessCardData = {
        name: 'John Doe',
        phone: '1234567890',
        email: 'john@example.com',
        company: 'Example Inc',
        title: 'Developer',
        address: '123 Main St',
        website: 'https://example.com'
      };
      
      const expected = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
ORG:Example Inc
TITLE:Developer
TEL:1234567890
EMAIL:john@example.com
ADR:123 Main St
URL:https://example.com
END:VCARD`;
      
      expect(QrFormatter.formatBusinessCard(businessCardData)).toBe(expected);
    });
  });
});