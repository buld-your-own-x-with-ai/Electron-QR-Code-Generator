import React, { useState, useRef } from 'react';
import QRCode from 'qrcode.react';
import { QrFormatter } from '../shared/qrFormatter';
import { QrDataType, TextData, ContactData, LocationData, WifiData, BusinessCardData } from '../shared/types';
import { ExportUtils } from './exportUtils';
import './App.css';

const App: React.FC = () => {
  const qrRef = useRef<HTMLDivElement>(null);
  
  const [dataType, setDataType] = useState<QrDataType>('text');
  const [textData, setTextData] = useState<TextData>({ content: 'Hello, World!' });
  const [contactData, setContactData] = useState<ContactData>({ type: 'tel', value: '' });
  const [locationData, setLocationData] = useState<LocationData>({ latitude: 0, longitude: 0 });
  const [wifiData, setWifiData] = useState<WifiData>({ ssid: '', encryption: 'WPA2', password: '' });
  const [businessCardData, setBusinessCardData] = useState<BusinessCardData>({ 
    name: '', 
    phone: '', 
    email: '', 
    company: '' 
  });
  
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [logo, setLogo] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(0.2); // Default to 20% of QR code size
  const [isExporting, setIsExporting] = useState(false);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [margin, setMargin] = useState(0);
  const [includeMargin, setIncludeMargin] = useState(true);

  // Get the formatted data for the QR code based on the selected type
  const getFormattedData = (): string => {
    switch (dataType) {
      case 'text':
        return QrFormatter.formatText(textData);
      case 'contact':
        return QrFormatter.formatContact(contactData);
      case 'location':
        return QrFormatter.formatLocation(locationData);
      case 'wifi':
        return QrFormatter.formatWifi(wifiData);
      case 'businessCard':
        return QrFormatter.formatBusinessCard(businessCardData);
      default:
        return textData.content;
    }
  };

  // Save current preferences
  const savePreferences = async () => {
    const preferences = {
      dataType,
      textData,
      contactData,
      locationData,
      wifiData,
      businessCardData,
      size,
      fgColor,
      bgColor
    };
    
    try {
      // @ts-ignore
      if (window.electronAPI && window.electronAPI.invoke) {
        const result = await window.electronAPI.invoke('save-preferences', preferences);
        if (result.success) {
          alert('Preferences saved successfully!');
        } else {
          alert('Failed to save preferences: ' + result.error);
        }
      } else {
        // Fallback for browser environment - save to localStorage
        localStorage.setItem('qrCodePreferences', JSON.stringify(preferences));
        alert('Preferences saved to browser storage!');
      }
    } catch (error: any) {
      alert('Error saving preferences: ' + error.message);
    }
  };

  // Load preferences
  const loadPreferences = async () => {
    try {
      // @ts-ignore
      if (window.electronAPI && window.electronAPI.invoke) {
        const preferences = await window.electronAPI.invoke('load-preferences');
        if (Object.keys(preferences).length > 0) {
          setDataType(preferences.dataType || dataType);
          setTextData(preferences.textData || textData);
          setContactData(preferences.contactData || contactData);
          setLocationData(preferences.locationData || locationData);
          setWifiData(preferences.wifiData || wifiData);
          setBusinessCardData(preferences.businessCardData || businessCardData);
          setSize(preferences.size || size);
          setFgColor(preferences.fgColor || fgColor);
          setBgColor(preferences.bgColor || bgColor);
          alert('Preferences loaded successfully!');
        } else {
          alert('No saved preferences found.');
        }
      } else {
        // Fallback for browser environment - load from localStorage
        const savedPreferences = localStorage.getItem('qrCodePreferences');
        if (savedPreferences) {
          const preferences = JSON.parse(savedPreferences);
          setDataType(preferences.dataType || dataType);
          setTextData(preferences.textData || textData);
          setContactData(preferences.contactData || contactData);
          setLocationData(preferences.locationData || locationData);
          setWifiData(preferences.wifiData || wifiData);
          setBusinessCardData(preferences.businessCardData || businessCardData);
          setSize(preferences.size || size);
          setFgColor(preferences.fgColor || fgColor);
          setBgColor(preferences.bgColor || bgColor);
          alert('Preferences loaded from browser storage!');
        } else {
          alert('No saved preferences found in browser storage.');
        }
      }
    } catch (error: any) {
      alert('Error loading preferences: ' + error.message);
    }
  };

  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.match('image.*')) {
        alert('Please select an image file (JPEG, PNG, GIF, etc.)');
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Please select an image smaller than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setLogo(reader.result as string);
        }
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Error loading image. Please try another file.');
      };
      reader.readAsDataURL(file);
    }
    // Reset the input value to allow uploading the same file again
    if (event.target) {
      event.target.value = '';
    }
  };

  // Remove logo
  const removeLogo = () => {
    setLogo(null);
  };

  // Export the QR code as PNG
  const exportAsPng = async () => {
    if (isExporting) return; // Prevent multiple simultaneous exports
    
    setIsExporting(true);
    try {
      if (qrRef.current) {
        // Add a small delay to ensure QR code is fully rendered
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get the canvas element from the QR code
        const canvas = qrRef.current.querySelector('canvas');
        if (canvas) {
          // Use the new function that includes logo
          const dataUrl = await ExportUtils.canvasToDataUrlWithLogo(canvas, logo, logoSize, 'png');
          const filename = `qr-code-${new Date().getTime()}.png`;
          
          // Try to save through IPC first (Electron environment)
          // @ts-ignore
          if (window.electronAPI && window.electronAPI.invoke) {
            const result = await ExportUtils.saveFileThroughIPC(dataUrl, filename);
            if (!result.success && !(result as any).canceled) {
              // Fallback to download if IPC fails
              ExportUtils.downloadFile(dataUrl, filename);
            }
          } else {
            // Fallback to download in browser environment
            ExportUtils.downloadFile(dataUrl, filename);
          }
        } else {
          console.error('Canvas element not found in QR code container');
          alert('QR code not ready. Please try again in a moment.');
        }
      }
    } catch (error) {
      console.error('Error exporting QR code with logo:', error);
      alert('Error exporting QR code. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Batch export functionality
  const batchExport = async () => {
    if (isExporting) return; // Prevent multiple simultaneous exports
    
    setIsExporting(true);
    try {
      // Add a small delay to ensure QR code is fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // For batch export, we would typically have an array of data
      // For this implementation, we'll create a simple batch with the current data
      if (qrRef.current) {
        // Get the canvas element from the QR code
        const canvas = qrRef.current.querySelector('canvas');
        if (canvas) {
          // Use the new function that includes logo
          const dataUrl = await ExportUtils.canvasToDataUrlWithLogo(canvas, logo, logoSize, 'png');
          
          const batchData = [
            {
              name: 'qr-code-1',
              dataUrl: dataUrl
            }
          ];
          
          // Try to export through IPC first (Electron environment)
          // @ts-ignore
          if (window.electronAPI && window.electronAPI.invoke) {
            const result = await ExportUtils.exportBatchThroughIPC(batchData);
            if (!result.success && !(result as any).canceled) {
              alert('Batch export failed: ' + result.error);
            } else if (result.success) {
              alert(`Batch export completed successfully! ${result.results?.length} files exported.`);
            }
          } else {
            // Fallback for browser environment
            alert('Batch export is only available in the desktop application.');
          }
        } else {
          console.error('Canvas element not found in QR code container');
          alert('QR code not ready. Please try again in a moment.');
        }
      }
    } catch (error) {
      console.error('Error in batch export:', error);
      alert('Error during batch export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Render the appropriate input form based on the selected data type
  const renderInputForm = () => {
    switch (dataType) {
      case 'text':
        return (
          <div className="input-form">
            <h3>Text/URL</h3>
            <textarea
              value={textData.content}
              onChange={(e) => setTextData({ content: e.target.value })}
              placeholder="Enter text or URL"
              rows={4}
              cols={50}
            />
          </div>
        );
      
      case 'contact':
        return (
          <div className="input-form">
            <h3>Contact Information</h3>
            <div className="form-group">
              <label>
                <input
                  type="radio"
                  value="tel"
                  checked={contactData.type === 'tel'}
                  onChange={() => setContactData({ ...contactData, type: 'tel' })}
                />
                Phone Number
              </label>
              <label>
                <input
                  type="radio"
                  value="mailto"
                  checked={contactData.type === 'mailto'}
                  onChange={() => setContactData({ ...contactData, type: 'mailto' })}
                />
                Email Address
              </label>
            </div>
            <input
              type="text"
              value={contactData.value}
              onChange={(e) => setContactData({ ...contactData, value: e.target.value })}
              placeholder={contactData.type === 'tel' ? "Enter phone number" : "Enter email address"}
            />
          </div>
        );
      
      case 'location':
        return (
          <div className="input-form">
            <h3>Location</h3>
            <div className="form-group">
              <label>Latitude:</label>
              <input
                type="number"
                step="any"
                value={locationData.latitude}
                onChange={(e) => setLocationData({ ...locationData, latitude: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label>Longitude:</label>
              <input
                type="number"
                step="any"
                value={locationData.longitude}
                onChange={(e) => setLocationData({ ...locationData, longitude: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        );
      
      case 'wifi':
        return (
          <div className="input-form">
            <h3>Wi-Fi Network</h3>
            <div className="form-group">
              <label>Network Name (SSID):</label>
              <input
                type="text"
                value={wifiData.ssid}
                onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
                placeholder="Enter network name"
              />
            </div>
            <div className="form-group">
              <label>Encryption:</label>
              <select
                value={wifiData.encryption}
                onChange={(e) => setWifiData({ ...wifiData, encryption: e.target.value as any })}
              >
                <option value="WPA2">WPA2</option>
                <option value="WPA">WPA</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password</option>
              </select>
            </div>
            {wifiData.encryption !== 'nopass' && (
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={wifiData.password}
                  onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
            )}
          </div>
        );
      
      case 'businessCard':
        return (
          <div className="input-form">
            <h3>Business Card (vCard)</h3>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={businessCardData.name}
                onChange={(e) => setBusinessCardData({ ...businessCardData, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            <div className="form-group">
              <label>Phone:</label>
              <input
                type="text"
                value={businessCardData.phone}
                onChange={(e) => setBusinessCardData({ ...businessCardData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={businessCardData.email}
                onChange={(e) => setBusinessCardData({ ...businessCardData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="form-group">
              <label>Company:</label>
              <input
                type="text"
                value={businessCardData.company}
                onChange={(e) => setBusinessCardData({ ...businessCardData, company: e.target.value })}
                placeholder="Enter company name"
              />
            </div>
            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                value={businessCardData.title || ''}
                onChange={(e) => setBusinessCardData({ ...businessCardData, title: e.target.value })}
                placeholder="Enter job title"
              />
            </div>
            <div className="form-group">
              <label>Address:</label>
              <input
                type="text"
                value={businessCardData.address || ''}
                onChange={(e) => setBusinessCardData({ ...businessCardData, address: e.target.value })}
                placeholder="Enter address"
              />
            </div>
            <div className="form-group">
              <label>Website:</label>
              <input
                type="text"
                value={businessCardData.website || ''}
                onChange={(e) => setBusinessCardData({ ...businessCardData, website: e.target.value })}
                placeholder="Enter website URL"
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Electron QR Code Generator</h1>
      </header>
      
      <main className="app-main">
        <div className="input-section">
          <h2>Input Data</h2>
          
          <div className="data-type-selector">
            <label>Data Type:</label>
            <select value={dataType} onChange={(e) => setDataType(e.target.value as QrDataType)}>
              <option value="text">Text/URL</option>
              <option value="contact">Contact</option>
              <option value="location">Location</option>
              <option value="wifi">Wi-Fi</option>
              <option value="businessCard">Business Card</option>
            </select>
          </div>
          
          {renderInputForm()}
          
          <div className="customization-panel">
            <h2>Customization</h2>
            <div className="control-group">
              <label>Size: {size}px</label>
              <input
                type="range"
                min="100"
                max="500"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
              />
            </div>
            
            <div className="control-group">
              <label>Foreground Color:</label>
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
              />
            </div>
            
            <div className="control-group">
              <label>Background Color:</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
              />
            </div>
            
            <div className="control-group">
              <button onClick={savePreferences}>
                Save Preferences
              </button>
              <button onClick={loadPreferences}>
                Load Preferences
              </button>
            </div>
          </div>
        </div>
        
        <div className="preview-section">
          <h2>QR Code Preview</h2>
          <div className="qr-code-container" ref={qrRef}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <QRCode
                value={getFormattedData()}
                size={size}
                fgColor={fgColor}
                bgColor={bgColor}
                level={errorCorrectionLevel}
                includeMargin={includeMargin}
                marginSize={margin}
              />
              {logo && (
                <div style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={logo} 
                    alt="" 
                    onError={(e) => {
                      console.error('Error loading preview logo:', e);
                    }}
                    style={{ 
                      width: Math.min(size * logoSize, size * 0.5), 
                      height: 'auto',
                      maxWidth: size * 0.5,
                      maxHeight: size * 0.5,
                      objectFit: 'contain',
                      display: 'block',
                      // Add a slight shadow to make the logo more visible on similar backgrounds
                      filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.5))'
                    }} 
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="logo-upload">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleLogoUpload} 
              style={{ display: 'none' }} 
              id="logo-upload" 
            />
            <label htmlFor="logo-upload" className="button">
              Upload Logo
            </label>
            {logo && (
              <button onClick={removeLogo} style={{ marginLeft: '10px' }}>
                Remove Logo
              </button>
            )}
          </div>
          
          {logo && (
            <div className="logo-controls">
              <div className="control-group">
                <label>Logo Size: {Math.round(logoSize * 100)}%</label>
                <input
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.05"
                  value={logoSize}
                  onChange={(e) => setLogoSize(parseFloat(e.target.value))}
                />
              </div>
            </div>
          )}
          
          <div className="advanced-customization">
            <h3>Advanced Customization</h3>
            <div className="control-group">
              <label>Error Correction Level:</label>
              <select 
                value={errorCorrectionLevel} 
                onChange={(e) => setErrorCorrectionLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
              >
                <option value="L">L - ~7% correction</option>
                <option value="M">M - ~15% correction</option>
                <option value="Q">Q - ~25% correction</option>
                <option value="H">H - ~30% correction</option>
              </select>
              <p className="help-text">
                Higher levels allow the QR code to be scanned even if damaged, but require more space.
              </p>
            </div>
            
            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={includeMargin}
                  onChange={(e) => setIncludeMargin(e.target.checked)}
                />
                Include Margin
              </label>
            </div>
            
            {includeMargin && (
              <div className="control-group">
                <label>Margin Size: {margin}px</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value))}
                />
              </div>
            )}
          </div>
          
          <div className="export-panel">
            <button onClick={exportAsPng} disabled={isExporting}>
              {isExporting ? 'Exporting...' : 'Export as PNG'}
            </button>
            <button onClick={batchExport} disabled={isExporting}>
              {isExporting ? 'Exporting...' : 'Batch Export'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;