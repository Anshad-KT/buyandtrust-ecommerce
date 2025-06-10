import React, { useState } from "react";

export default function CompleteProfileModal({ missingFields, onSubmit }: { missingFields: string[], onSubmit: (values: any) => void }) {
  const [values, setValues] = useState<any>({});
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleChange = (field: string, value: string) => {
    if (field.toLowerCase().includes('phone')) {
      // Allow only numbers, restrict to 10 digits
      const digits = value.replace(/\D/g, '').slice(0, 10);
      if (value !== digits) {
        value = digits;
      }
      if (digits.length > 0 && digits.length < 10) {
        setErrors(prev => ({ ...prev, [field]: 'Phone number must be 10 digits' }));
      } else {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
      setValues((prev: any) => ({ ...prev, [field]: digits }));
      return;
    }
    setValues((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (Object.values(errors).some(error => error)) {
      return;
    }
    // Add '91' prefix to phone numbers before submitting
    const formattedValues = { ...values };
    missingFields.forEach(field => {
      if (field.toLowerCase().includes('phone')) {
        if (values[field] && values[field].length === 10) {
          formattedValues[field] = '91' + values[field];
        }
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
              <input
                type={field.toLowerCase().includes('phone') ? "tel" : "text"}
                value={values[field] || ""}
                onChange={(e) => handleChange(field, e.target.value)}
                className={errors[field] ? 'error' : ''}
                placeholder={field.toLowerCase().includes('phone') ? "Enter 10 digit number" : ""}
                maxLength={field.toLowerCase().includes('phone') ? 10 : undefined}
                inputMode={field.toLowerCase().includes('phone') ? "numeric" : undefined}
              />
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