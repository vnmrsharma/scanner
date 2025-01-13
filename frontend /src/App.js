import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const App = () => {
    const [barcode, setBarcode] = useState('');
    const [scannerId, setScannerId] = useState('');
    const [message, setMessage] = useState('');
    const [errorDetails, setErrorDetails] = useState(null);
    const barcodeInputRef = useRef(null);

    useEffect(() => {
        // Set focus to the barcode input field on component mount
        barcodeInputRef.current.focus();
    }, []);

    const handleBarcodeInput = (e) => {
        setBarcode(e.target.value);
    };

    const handleScannerIdInput = (e) => {
        setScannerId(e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            submitBarcode();
        }
    };

    const submitBarcode = async () => {
        try {
            const response = await axios.post('http://localhost:5001/add-barcode', {
                barcode,
                scanner_id: scannerId || undefined,
            });
            setMessage(response.data.message);
            setErrorDetails(null);
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.duplicate) {
                const { scanner_id, scanned_at } = error.response.data.duplicate;
                setErrorDetails({ scanner_id, scanned_at });
                setMessage('Duplicate barcode detected');
            } else {
                setMessage('Error connecting to server');
                setErrorDetails(null);
            }
        } finally {
            // Clear the barcode input field and refocus for the next scan
            setBarcode('');
            barcodeInputRef.current.focus();
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Parcel Barcode Scanner</h1>
            <input
                ref={barcodeInputRef}
                type="text"
                value={barcode}
                onChange={handleBarcodeInput}
                onKeyDown={handleKeyPress}
                placeholder="Scan or type barcode"
                style={{ padding: '10px', width: '300px', fontSize: '16px', marginBottom: '10px' }}
            />
            <br />
            <input
                type="text"
                value={scannerId}
                onChange={handleScannerIdInput}
                placeholder="Enter scanner ID (optional)"
                style={{ padding: '10px', width: '300px', fontSize: '16px', marginBottom: '10px' }}
            />
            <br />
            <button onClick={submitBarcode} style={{ padding: '10px', marginTop: '10px' }}>
                Submit
            </button>
            {message && (
                <p style={{ marginTop: '20px', fontSize: '18px', color: errorDetails ? 'red' : 'green' }}>
                    {message}
                </p>
            )}
            {errorDetails && (
                <div style={{ marginTop: '10px', fontSize: '16px', color: 'red' }}>
                    <p>Scanner ID: {errorDetails.scanner_id}</p>
                    <p>Scanned At: {new Date(errorDetails.scanned_at).toLocaleString()}</p>
                </div>
            )}
        </div>
    );
};

export default App;
