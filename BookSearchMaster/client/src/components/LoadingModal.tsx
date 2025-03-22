import React from 'react';

interface LoadingModalProps {
  title: string;
  message: string;
  progress: number;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ title, message, progress }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 text-center mb-4">{message}</p>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-purple-600 h-2 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="text-sm text-gray-500">This may take a minute or two</div>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;
