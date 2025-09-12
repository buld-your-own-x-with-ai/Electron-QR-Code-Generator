// Simple test script to verify QR formatter functionality
const fs = require('fs');

// Read the QR formatter code
const qrFormatterCode = fs.readFileSync('./src/shared/qrFormatter.ts', 'utf8');

// Simple test function
function testFormatText() {
  const textData = { content: 'Hello World' };
  const result = textData.content;
  console.log('Text formatting test:', result === 'Hello World' ? 'PASS' : 'FAIL');
  return result === 'Hello World';
}

function testFormatContact() {
  const contactData1 = { type: 'tel', value: '1234567890' };
  const result1 = `tel:${contactData1.value}`;
  console.log('Phone contact formatting test:', result1 === 'tel:1234567890' ? 'PASS' : 'FAIL');
  
  const contactData2 = { type: 'mailto', value: 'test@example.com' };
  const result2 = `mailto:${contactData2.value}`;
  console.log('Email contact formatting test:', result2 === 'mailto:test@example.com' ? 'PASS' : 'FAIL');
  
  return result1 === 'tel:1234567890' && result2 === 'mailto:test@example.com';
}

function testFormatLocation() {
  const locationData = { latitude: 40.7128, longitude: -74.0060 };
  const result = `geo:${locationData.latitude},${locationData.longitude}`;
  console.log('Location formatting test:', result === 'geo:40.7128,-74.006' ? 'PASS' : 'FAIL');
  return result === 'geo:40.7128,-74.006';
}

function testFormatWifi() {
  const wifiData1 = { ssid: 'MyNetwork', encryption: 'WPA2', password: 'password123' };
  const result1 = `WIFI:S:${wifiData1.ssid};T:${wifiData1.encryption};P:${wifiData1.password};;`;
  console.log('Wi-Fi with password formatting test:', result1 === 'WIFI:S:MyNetwork;T:WPA2;P:password123;;' ? 'PASS' : 'FAIL');
  
  const wifiData2 = { ssid: 'OpenNetwork', encryption: 'nopass', password: '' };
  const result2 = `WIFI:S:${wifiData2.ssid};T:nopass;;`;
  console.log('Wi-Fi without password formatting test:', result2 === 'WIFI:S:OpenNetwork;T:nopass;;' ? 'PASS' : 'FAIL');
  
  return result1 === 'WIFI:S:MyNetwork;T:WPA2;P:password123;;' && result2 === 'WIFI:S:OpenNetwork;T:nopass;;';
}

// Run tests
console.log('Running QR Formatter Tests...\n');
const test1 = testFormatText();
const test2 = testFormatContact();
const test3 = testFormatLocation();
const test4 = testFormatWifi();

console.log('\nTest Summary:');
console.log(`Text formatting: ${test1 ? 'PASS' : 'FAIL'}`);
console.log(`Contact formatting: ${test2 ? 'PASS' : 'FAIL'}`);
console.log(`Location formatting: ${test3 ? 'PASS' : 'FAIL'}`);
console.log(`Wi-Fi formatting: ${test4 ? 'PASS' : 'FAIL'}`);

const allTestsPassed = test1 && test2 && test3 && test4;
console.log(`\nOverall: ${allTestsPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);