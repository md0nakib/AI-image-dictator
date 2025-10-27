
import React from 'react';
import type { AnalysisResult } from '../types';

interface ResultDisplayProps {
  result: AnalysisResult;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const confidencePercentage = (result.confidence * 100).toFixed(0);
  const isAi = result.isAiGenerated;

  const resultColor = isAi ? 'text-red-400' : 'text-green-400';
  const bgColor = isAi ? 'bg-red-500/10' : 'bg-green-500/10';
  const ringColor = isAi ? 'ring-red-500/30' : 'ring-green-500/30';

  const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const ExclamationIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );


  return (
    <div className={`w-full max-w-md p-6 rounded-xl shadow-lg ring-1 ${ringColor} ${bgColor} backdrop-blur-sm mt-6`}>
      <div className="flex items-center gap-4 mb-4">
        {isAi ? <ExclamationIcon /> : <CheckIcon />}
        <h2 className={`text-2xl font-bold ${resultColor}`}>
          {isAi ? 'কৃত্রিম বুদ্ধিমত্তা দ্বারা তৈরি' : 'সম্ভবত আসল ছবি'}
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-400">আস্থা</h3>
          <div className="flex items-center gap-3 mt-1">
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className={`${isAi ? 'bg-red-500' : 'bg-green-500'} h-2.5 rounded-full`}
                style={{ width: `${confidencePercentage}%` }}
              ></div>
            </div>
            <span className={`text-lg font-semibold ${resultColor}`}>
              {confidencePercentage}%
            </span>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-400">কারণ</h3>
          <p className="mt-1 text-gray-300 text-base">{result.reasoning}</p>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
