import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { EcomService } from '@/services/api/ecom-service';
import { ToastVariant, toastWithTimeout } from '@/hooks/use-toast';
import { useCustomize } from '@/app/customize/_contexts/Customize';

const FileUploadComponent = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {referenceImage,setReferenceImage} = useCustomize()

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadClick = async () => {
    // Simulate API upload - replace with actual upload logic
    if (file) {
   
      const formData = new FormData();
      formData.append('file', file);
      const res = await new EcomService().uploadFile(formData, Date.now().toString()+"_"+file.name, "images")
      toastWithTimeout(ToastVariant.Default, "File uploaded successfully")
      setReferenceImage(res.fullPath)
    } else {
      toastWithTimeout(ToastVariant.Default, "Please select a file first")
    }
  };

  return (
    <div className="w-[90%] lg:my-5 mx-auto lg:w-[87%] p-2">
      <div 
        className={`border-2 w-full  border-dashed rounded-lg lg:p-6 p-3 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragging ? 'border-gray-500 bg-gray-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        
        
        <section className='flex   items-center justify-center lg:gap-10 gap-5'>
        <svg className='lg:block hidden' width="35" height="35" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.91667 31.6667H33.0833C33.4591 31.6667 33.8194 31.8159 34.0851 32.0816C34.3507 32.3473 34.5 32.7076 34.5 33.0833C34.5 33.4591 34.3507 33.8194 34.0851 34.0851C33.8194 34.3507 33.4591 34.5 33.0833 34.5H1.91667C1.54094 34.5 1.18061 34.3507 0.914932 34.0851C0.649256 33.8194 0.5 33.4591 0.5 33.0833C0.5 32.7076 0.649256 32.3473 0.914932 32.0816C1.18061 31.8159 1.54094 31.6667 1.91667 31.6667ZM18.9167 6.06467V26H16.0833V5.78133L5.3365 16.5282L3.33333 14.525L17.3583 0.5L31.3833 14.525L29.3773 16.5282L18.9167 6.06467Z" fill="black"/>
</svg>
<svg className='lg:hidden block' width="20" height="20" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.91667 31.6667H33.0833C33.4591 31.6667 33.8194 31.8159 34.0851 32.0816C34.3507 32.3473 34.5 32.7076 34.5 33.0833C34.5 33.4591 34.3507 33.8194 34.0851 34.0851C33.8194 34.3507 33.4591 34.5 33.0833 34.5H1.91667C1.54094 34.5 1.18061 34.3507 0.914932 34.0851C0.649256 33.8194 0.5 33.4591 0.5 33.0833C0.5 32.7076 0.649256 32.3473 0.914932 32.0816C1.18061 31.8159 1.54094 31.6667 1.91667 31.6667ZM18.9167 6.06467V26H16.0833V5.78133L5.3365 16.5282L3.33333 14.525L17.3583 0.5L31.3833 14.525L29.3773 16.5282L18.9167 6.06467Z" fill="black"/>
</svg>

        <div className="text-center">
            
          <h3 className="lg:text-lg text-[11px] font-medium text-gray-700">Upload Reference Image</h3>
          <p className="lg:text-sm text-[10px] text-gray-500 ">(Optional)</p>
        </div>
        <button 
          className="lg:px-7 px-3 py-2 bg-red-500 text-white lg:text-base text-[10px]  rounded-sm hover:bg-red-600 transition-colors"
          onClick={handleUploadClick}
        >
          Upload
        </button>
        </section>
      </div>
      
      {file && (
        <div className="mt-4">
          <p className="lg:text-sm text-[12px] text-gray-700">Selected file: {file.name}</p>
        </div>
      )}
      
      
    </div>
  );
};

export default FileUploadComponent;