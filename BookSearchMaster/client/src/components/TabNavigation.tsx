import React from 'react';
import { Search, FileText, Edit, Folder } from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm mb-6">
      <div className="border-b border-gray-200">
        <div className="flex space-x-1 p-1">
          <button 
            className={`px-4 py-2 font-medium flex items-center ${activeTab === 'discovery' 
              ? 'text-purple-700 border-b-2 border-purple-500' 
              : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('discovery')}
          >
            <Search className="h-4 w-4 mr-1" />
            Discovery
          </button>
          <button 
            className={`px-4 py-2 font-medium flex items-center ${activeTab === 'generation' 
              ? 'text-purple-700 border-b-2 border-purple-500' 
              : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('generation')}
          >
            <FileText className="h-4 w-4 mr-1" />
            Generation
          </button>
          <button 
            className={`px-4 py-2 font-medium flex items-center ${activeTab === 'modification' 
              ? 'text-purple-700 border-b-2 border-purple-500' 
              : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('modification')}
          >
            <Edit className="h-4 w-4 mr-1" />
            Modification
          </button>
          <button 
            className={`px-4 py-2 font-medium flex items-center ${activeTab === 'mycontent' 
              ? 'text-purple-700 border-b-2 border-purple-500' 
              : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('mycontent')}
          >
            <Folder className="h-4 w-4 mr-1" />
            My Content
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;
