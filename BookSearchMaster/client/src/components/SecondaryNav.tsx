import React from 'react';
import { Database, Brain, Code, Globe } from 'lucide-react';

interface SecondaryNavProps {
  showAdvancedFeatures: boolean;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const SecondaryNav: React.FC<SecondaryNavProps> = ({ 
  showAdvancedFeatures, 
  activeSection, 
  setActiveSection 
}) => {
  if (!showAdvancedFeatures) return null;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-2 mb-4">
      <div className="flex space-x-2 flex-wrap">
        <button 
          className={activeSection === 'main' 
            ? 'bg-purple-100 text-purple-700 px-3 py-1 text-sm rounded-md' 
            : 'bg-gray-100 text-gray-600 px-3 py-1 text-sm rounded-md hover:bg-gray-200'}
          onClick={() => setActiveSection('main')}
        >
          Discovery
        </button>
        <button 
          className={activeSection === 'architecture' 
            ? 'bg-purple-100 text-purple-700 px-3 py-1 text-sm rounded-md' 
            : 'bg-gray-100 text-gray-600 px-3 py-1 text-sm rounded-md hover:bg-gray-200'}
          onClick={() => setActiveSection('architecture')}
        >
          <span className="flex items-center">
            <Database className="h-3.5 w-3.5 mr-1" />
            RAG Architecture
          </span>
        </button>
        <button 
          className={activeSection === 'agent' 
            ? 'bg-purple-100 text-purple-700 px-3 py-1 text-sm rounded-md' 
            : 'bg-gray-100 text-gray-600 px-3 py-1 text-sm rounded-md hover:bg-gray-200'}
          onClick={() => setActiveSection('agent')}
        >
          <span className="flex items-center">
            <Brain className="h-3.5 w-3.5 mr-1" />
            AI Agent
          </span>
        </button>
        <button 
          className={activeSection === 'knowledge' 
            ? 'bg-purple-100 text-purple-700 px-3 py-1 text-sm rounded-md' 
            : 'bg-gray-100 text-gray-600 px-3 py-1 text-sm rounded-md hover:bg-gray-200'}
          onClick={() => setActiveSection('knowledge')}
        >
          <span className="flex items-center">
            <Code className="h-3.5 w-3.5 mr-1" />
            Knowledge Base
          </span>
        </button>
      </div>
    </div>
  );
};

export default SecondaryNav;
