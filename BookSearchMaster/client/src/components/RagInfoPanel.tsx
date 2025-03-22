import React from 'react';
import { Database, Brain } from 'lucide-react';

interface RagInfoPanelProps {
  showAdvancedFeatures: boolean;
  showResults: boolean;
  ragState: string;
  retrievedDocuments: any[];
  agentThoughts: string[];
}

const RagInfoPanel: React.FC<RagInfoPanelProps> = ({
  showAdvancedFeatures,
  showResults,
  ragState,
  retrievedDocuments,
  agentThoughts
}) => {
  if (!showAdvancedFeatures && !showResults) return null;
  
  return (
    <div className="md:col-span-1">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-sm font-medium mb-3 flex items-center">
          <Database className="h-4 w-4 mr-1 text-purple-600" />
          RAG Information
        </h3>
        
        <div className="space-y-3">
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">Vector Database</div>
            <div className="flex items-center">
              <span className="text-sm">Pinecone</span>
              <span className="bg-green-100 text-green-800 text-xs rounded px-1.5 py-0.5 ml-2">Connected</span>
            </div>
          </div>
          
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">Knowledge Base</div>
            <div className="text-sm">Educational Content DB</div>
          </div>
          
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">Search Status</div>
            <div className="text-sm flex items-center">
              <span className={`text-xs rounded px-1.5 py-0.5 mr-2 ${
                ragState === 'complete' ? 'bg-green-100 text-green-800' :
                ragState === 'error' ? 'bg-red-100 text-red-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {ragState === 'idle' ? 'Ready' :
                 ragState === 'processing' ? 'Processing' :
                 ragState === 'retrieving' ? 'Retrieving' :
                 ragState === 'generating' ? 'Generating' :
                 ragState === 'complete' ? 'Complete' : 'Error'}
              </span>
              {ragState === 'complete' && (
                <span>Found {retrievedDocuments.length * 8} relevant documents</span>
              )}
            </div>
          </div>
          
          {retrievedDocuments.length > 0 && (
            <div className="border-t pt-3 mt-3">
              <div className="text-xs font-medium text-gray-500 mb-2">Top Matched Documents</div>
              <div className="space-y-2">
                {retrievedDocuments.map((doc, index) => (
                  <div key={index} className="border rounded p-2 bg-gray-50 text-xs">
                    <div className="font-medium">{doc.title}</div>
                    <div className="text-gray-500 mt-1">Match: {Math.round(doc.similarity * 100)}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {agentThoughts.length > 0 && (
            <div className="border-t pt-3 mt-3">
              <div className="text-xs font-medium text-gray-500 mb-2">AI Agent Thoughts</div>
              <div className="text-xs text-gray-700 space-y-1.5">
                {agentThoughts.map((thought, index) => (
                  <div key={index}>
                    <span className="text-purple-500 mr-1">•</span>
                    <span>{thought}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RagInfoPanel;
