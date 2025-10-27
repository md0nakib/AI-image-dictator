
import React, { useState, useCallback } from 'react';
import { analyzeImageForAI } from './services/geminiService';
import ResultDisplay from './components/ResultDisplay';
import Spinner from './components/Spinner';
import type { AnalysisResult } from './types';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};


const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);

  const handleImageChange = (file: File | null) => {
    if (file && (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp")) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
      setError(null);
    } else if (file) {
      setError("শুধুমাত্র JPEG, PNG, বা WEBP ফরম্যাটের ছবি আপলোড করুন।");
    }
  };
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
        handleImageChange(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(true);
  };
    
  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (!imageFile) return;

    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);

    try {
      const base64Image = await fileToBase64(imageFile);
      const result = await analyzeImageForAI(base64Image, imageFile.type);
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "একটি অজানা ত্রুটি ঘটেছে।");
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);
  
  const handleReset = () => {
      setImageFile(null);
      setImageUrl(null);
      setAnalysisResult(null);
      setError(null);
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
          এআই ইমেজ ডিটেক্টর
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          একটি ছবি আপলোড করে জেনে নিন সেটি কৃত্রিম বুদ্ধিমত্তা (AI) দ্বারা তৈরি কিনা।
        </p>

        <div className="mt-8 flex flex-col items-center">
          {!imageUrl && (
             <label
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              htmlFor="file-upload"
              className={`relative flex flex-col items-center justify-center w-full max-w-md h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                ${dragOver ? 'border-cyan-400 bg-gray-800/50' : 'border-gray-600 hover:border-gray-500 bg-gray-800/20'}`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-10 h-10 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">ছবি আপলোড করতে ক্লিক করুন</span> অথবা টেনে আনুন</p>
                <p className="text-xs text-gray-500">PNG, JPG or WEBP</p>
              </div>
              <input id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileSelect} />
            </label>
          )}

          {imageUrl && (
            <div className="w-full max-w-md bg-gray-800/50 p-4 rounded-xl shadow-lg ring-1 ring-gray-700">
                <img src={imageUrl} alt="Uploaded preview" className="max-h-80 w-auto rounded-lg mx-auto" />
            </div>
          )}

          {imageFile && (
            <div className="flex items-center gap-4 mt-6">
                 <button
                    onClick={handleAnalyzeClick}
                    disabled={isLoading}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:scale-105 transform transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                 >
                    {isLoading ? (
                        <>
                         <Spinner />
                         <span className="ml-2">বিশ্লেষণ করা হচ্ছে...</span>
                        </>
                    ) : (
                        'বিশ্লেষণ করুন'
                    )}
                </button>
                 <button
                    onClick={handleReset}
                    disabled={isLoading}
                    className="px-6 py-3 bg-gray-700 text-gray-300 font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    বাতিল করুন
                </button>
            </div>
          )}
          
          {error && (
            <div className="mt-6 text-red-400 bg-red-500/10 px-4 py-2 rounded-lg max-w-md">
                {error}
            </div>
          )}
          
          {analysisResult && <ResultDisplay result={analysisResult} />}
        </div>
      </div>
    </div>
  );
};

export default App;
