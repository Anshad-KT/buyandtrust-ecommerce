import React, { useState } from "react";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function CompleteProfileModal({ missingFields, onSubmit }: { missingFields: string[], onSubmit: (values: any) => void }) {
  const [values, setValues] = useState<any>({});
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleChange = (field: string, value: string) => {
    setValues((prev: any) => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (field: string, value: string | undefined) => {
    if (!value) {
      setErrors(prev => ({ ...prev, [field]: 'Phone number is required' }));
      setValues((prev: any) => ({ ...prev, [field]: '' }));
      return;
    }
    
    // Validate phone number has at least 7 digits
    const digitsOnly = value.replace(/[^0-9]/g, "");
    if (digitsOnly.length < 7) {
      setErrors(prev => ({ ...prev, [field]: 'Phone number must have at least 7 digits' }));
    } else {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    setValues((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (Object.values(errors).some(error => error)) {
      return;
    }
    
    // Format phone numbers: remove + and spaces, keep only digits
    const formattedValues = { ...values };
    missingFields.forEach(field => {
      if (field.toLowerCase().includes('phone') && values[field]) {
        // Remove all non-digit characters (including + and spaces)
        formattedValues[field] = values[field].replace(/[^0-9]/g, '');
      }
    });
    
    onSubmit(formattedValues);
  };

  return (
    <>
      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.4);
          z-index: 1000;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .modal {
          background: #fff;
          border-radius: 24px 24px 0 0;
          box-shadow: 0 -4px 32px rgba(0,0,0,0.15);
          padding: 2rem 1.5rem 1.5rem 1.5rem;
          width: 100%;
          max-width: 420px;
          min-height: 260px;
          margin-bottom: 0;
          animation: slideUp 0.3s cubic-bezier(.4,0,.2,1);
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .modal h2 {
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
          font-weight: 600;
          text-align: center;
        }
        .modal label {
          display: block;
          margin-bottom: 0.25rem;
          font-weight: 500;
        }
        .modal input {
          width: 100%;
          padding: 0.6rem 1rem;
          margin-bottom: 1.2rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          transition: border 0.2s;
        }
        .modal input:focus {
          border: 1.5px solid #222;
          outline: none;
        }
        .modal :global(.PhoneInput) {
          margin-bottom: 1.2rem;
        }
        .modal :global(.PhoneInputInput) {
          width: 100%;
          padding: 0.6rem 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          transition: border 0.2s;
        }
        .modal :global(.PhoneInputInput:focus) {
          border: 1.5px solid #222;
          outline: none;
        }
        .modal :global(.PhoneInputInput.error) {
          border: 1.5px solid #ff4444;
        }
        .modal button {
          width: 100%;
          padding: 0.8rem;
          background: #222;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .modal button:hover {
          background: #444;
        }
        .modal input.error {
          border: 1.5px solid #ff4444;
        }
        .error-message {
          color: #ff4444;
          font-size: 0.875rem;
          margin-top: -1rem;
          margin-bottom: 1rem;
        }
      `}</style>
      <div className="modal-backdrop">
        <div className="modal">
          <h2 style={{fontFamily: 'Helvetica'}}>Complete Your Profile</h2>
          {missingFields.map((field: string) => (
            <div key={field}>
              <label style={{fontFamily: 'Helvetica'}}>{field.replace("_", " ")}:</label>
              {field.toLowerCase().includes('phone') ? (
                <PhoneInput
                  international
                  defaultCountry="IN"
                  value={values[field] || ""}
                  onChange={(value) => handlePhoneChange(field, value)}
                  placeholder="Enter phone number"
                  className={errors[field] ? 'error' : ''}
                />
              ) : (
                <input
                  type="text"
                  value={values[field] || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className={errors[field] ? 'error' : ''}
                />
              )}
              {errors[field] && <div className="error-message">{errors[field]}</div>}
            </div>
          ))}
          <button 
            style={{fontFamily: 'Helvetica'}} 
            onClick={handleSubmit}
            disabled={Object.values(errors).some(error => error)}
          >
            Submit
          </button>
        </div>
      </div>
    </>
  );
}