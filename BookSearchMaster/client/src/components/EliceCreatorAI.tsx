import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  FileText, 
  Code, 
  Award, 
  Globe, 
  ArrowRight, 
  Upload, 
  Edit, 
  CheckSquare, 
  Cpu, 
  Database, 
  Brain, 
  BarChart2, 
  Terminal, 
  MessageSquare, 
  Layers, 
  Zap, 
  Server, 
  RefreshCw, 
  GitBranch, 
  Bookmark, 
  Users,
  HelpCircle,
  Settings,
  Folder
} from 'lucide-react';
import SecondaryNav from './SecondaryNav';
import TabNavigation from './TabNavigation';
import DiscoveryContent from './DiscoveryContent';
import RagInfoPanel from './RagInfoPanel';
import ContentGenerationTab from './ContentGenerationTab';
import ContentModificationTab from './ContentModificationTab';
import MyContentTab from './MyContentTab';
import LoadingModal from './LoadingModal';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';
import { generateContent as aiGenerateContent, modifyContent as aiModifyContent, discoverContent as aiDiscoverContent } from '@/lib/aiService';

function EliceCreatorAI() {
  const [activeTab, setActiveTab] = useState('discovery');
  const [generatingContent, setGeneratingContent] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  const [contentType, setContentType] = useState(null);
  const [modificationMode, setModificationMode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [ragState, setRagState] = useState('idle');
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [agentThoughts, setAgentThoughts] = useState([]);
  const [retrievedDocuments, setRetrievedDocuments] = useState([]);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [activeSection, setActiveSection] = useState('main');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [selectedContent, setSelectedContent] = useState(null);
  const [recentGenerations, setRecentGenerations] = useState([]);
  const { toast } = useToast();
  
  useEffect(() => {
    // Reset state when changing tabs
    if (activeTab !== 'discovery') {
      setShowResults(false);
      setRagState('idle');
      setAgentThoughts([]);
      setRetrievedDocuments([]);
    }
    
    if (activeTab === 'generation' && !selectedCurriculum) {
      setSelectedCurriculum(1);
    }
    
    // Fetch recent generations when entering generation tab
    if (activeTab === 'generation') {
      fetchRecentGenerations();
    }
  }, [activeTab]);
  
  const fetchRecentGenerations = async () => {
    try {
      const response = await apiRequest('GET', '/api/content/recent', undefined);
      const data = await response.json();
      setRecentGenerations(data);
    } catch (error) {
      console.error("Failed to fetch recent generations:", error);
      toast({
        title: "Error",
        description: "Failed to fetch recent generations",
        variant: "destructive"
      });
    }
  };
  
  // Handle the discovery process using the RAG technology
  const handleDiscover = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive"
      });
      return;
    }
    
    setGeneratingContent(true);
    setRagState('processing');
    setAgentThoughts([]);
    setRetrievedDocuments([]);
    setLoadingProgress(10);
    
    try {
      // Start the RAG process using backend API
      const responseData = await aiDiscoverContent(searchQuery);
      
      // Update state with the retrieved documents
      setLoadingProgress(40);
      setRagState('retrieving');
      
      // Simulate progressive updates for a better UX
      console.log("RAG Response Data:", responseData);
      
      if (responseData.thoughts && responseData.thoughts.length > 0) {
        // Show thoughts progressively
        const thoughts = responseData.thoughts.map(thought => {
          // If thought is an object with step/description, extract just the description
          if (thought && typeof thought === 'object' && 'description' in thought) {
            return thought.description;
          }
          // Otherwise, return the thought as is (likely a string)
          return String(thought);
        });
        
        const thoughtCount = thoughts.length;
        console.log("Processed thoughts:", thoughts);
        
        if (thoughtCount >= 1) {
          setAgentThoughts([thoughts[0]]);
        }
        
        // Spread out the thoughts display to give a progressive feel
        setTimeout(() => {
          if (thoughtCount >= 2) {
            setAgentThoughts(prev => [...prev, thoughts[1]]);
          }
          
          // Show the retrieved documents
          setRetrievedDocuments(responseData.documents || []);
          setLoadingProgress(70);
          setRagState('generating');
          
          setTimeout(() => {
            if (thoughtCount >= 3) {
              setAgentThoughts(prev => [...prev, thoughts[2]]);
            }
            
            setLoadingProgress(90);
            
            setTimeout(() => {
              if (thoughtCount >= 4) {
                setAgentThoughts(prev => [...prev, thoughts[3]]);
              }
              
              setGeneratingContent(false);
              setShowResults(true);
              setRagState('complete');
              setLoadingProgress(100);
              
              // If we have a curriculum structure from RAG, potentially use it
              if (responseData.curriculumStructure) {
                // We could use this to populate dynamic curriculum options
                console.log("Curriculum Structure:", responseData.curriculumStructure);
              }
            }, 800);
          }, 800);
        }, 800);
      } else {
        // Fallback if no thoughts are returned
        setAgentThoughts([
          `Analyzing query: "${searchQuery}"`,
          "Retrieving relevant educational content",
          "Generating curriculum recommendations"
        ]);
        setRetrievedDocuments(responseData.documents || []);
        
        setTimeout(() => {
          setGeneratingContent(false);
          setShowResults(true);
          setRagState('complete');
          setLoadingProgress(100);
        }, 1500);
      }
    } catch (error) {
      console.error("Error during discovery:", error);
      setGeneratingContent(false);
      setRagState('error');
      toast({
        title: "Error",
        description: "Failed to process your discovery query",
        variant: "destructive"
      });
    }
  };
  
  const handleCurriculumSelect = (id) => {
    setSelectedCurriculum(id);
  };
  
  const handleContentTypeSelect = (type) => {
    setContentType(type);
  };
  
  const handleModificationSelect = (mode) => {
    setModificationMode(mode);
  };
  
  const resetWorkflow = () => {
    setShowResults(false);
    setSelectedCurriculum(null);
    setContentType(null);
    setModificationMode(null);
    setRagState('idle');
    setAgentThoughts([]);
    setRetrievedDocuments([]);
  };
  
  const generateContent = async (formData) => {
    setGeneratingContent(true);
    setLoadingProgress(0);
    
    try {
      const intervalId = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 5, 95));
      }, 500);
      
      // Use the aiGenerateContent service
      const result = await aiGenerateContent({
        ...formData,
        curriculumId: selectedCurriculum,
        contentType
      });
      
      clearInterval(intervalId);
      setLoadingProgress(100);
      
      // Update recent generations
      fetchRecentGenerations();
      
      toast({
        title: "Success",
        description: "Content generated successfully"
      });
      
      setGeneratingContent(false);
    } catch (error) {
      console.error("Error generating content:", error);
      setGeneratingContent(false);
      toast({
        title: "Error",
        description: "Failed to generate content",
        variant: "destructive"
      });
    }
  };
  
  const modifyContent = async (contentId, modificationData) => {
    setGeneratingContent(true);
    setLoadingProgress(0);
    
    try {
      const intervalId = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 5, 95));
      }, 500);
      
      // Use the aiModifyContent service
      const result = await aiModifyContent({
        contentId,
        modificationType: modificationMode,
        instructions: modificationData.instructions
      });
      
      clearInterval(intervalId);
      setLoadingProgress(100);
      
      toast({
        title: "Success",
        description: "Content modified successfully"
      });
      
      setGeneratingContent(false);
    } catch (error) {
      console.error("Error modifying content:", error);
      setGeneratingContent(false);
      toast({
        title: "Error",
        description: "Failed to modify content",
        variant: "destructive"
      });
    }
  };
  
  const toggleAdvancedFeatures = () => {
    setShowAdvancedFeatures(!showAdvancedFeatures);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-purple-700 font-bold text-xl mr-2">Elice Creator AI</div>
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded">Beta</span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="text-gray-600 hover:text-gray-800" onClick={toggleAdvancedFeatures}>
              <HelpCircle className="h-5 w-5" />
            </button>
            <button className="text-gray-600 hover:text-gray-800">
              <Settings className="h-5 w-5" />
            </button>
            <div className="h-8 w-8 bg-purple-200 rounded-full flex items-center justify-center text-purple-700">
              EA
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Secondary Navigation */}
        <SecondaryNav 
          showAdvancedFeatures={showAdvancedFeatures} 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
        />
        
        {/* Main Tabs */}
        <TabNavigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content Area */}
          {activeTab === 'discovery' && (
            <>
              <DiscoveryContent 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleDiscover={handleDiscover}
                showResults={showResults}
                generatingContent={generatingContent}
                ragState={ragState}
                agentThoughts={agentThoughts}
                retrievedDocuments={retrievedDocuments}
                selectedCurriculum={selectedCurriculum}
                handleCurriculumSelect={handleCurriculumSelect}
                setActiveTab={setActiveTab}
              />
              
              <RagInfoPanel 
                showAdvancedFeatures={showAdvancedFeatures}
                showResults={showResults}
                ragState={ragState}
                retrievedDocuments={retrievedDocuments}
                agentThoughts={agentThoughts}
              />
            </>
          )}
        </div>
        
        {/* Content Generation Tab */}
        {activeTab === 'generation' && (
          <ContentGenerationTab 
            selectedCurriculum={selectedCurriculum}
            contentType={contentType}
            handleContentTypeSelect={handleContentTypeSelect}
            generateContent={generateContent}
            recentGenerations={recentGenerations}
          />
        )}
        
        {/* Content Modification Tab */}
        {activeTab === 'modification' && (
          <ContentModificationTab 
            modificationMode={modificationMode}
            handleModificationSelect={handleModificationSelect}
            selectedContent={selectedContent}
            setSelectedContent={setSelectedContent}
            modifyContent={modifyContent}
          />
        )}
        
        {/* My Content Tab */}
        {activeTab === 'mycontent' && (
          <MyContentTab />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            © 2023 Elice Creator AI. All rights reserved.
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Help</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Privacy</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Terms</a>
          </div>
        </div>
      </footer>

      {/* Loading Modal */}
      {generatingContent && (
        <LoadingModal 
          title={
            activeTab === 'discovery' ? 'Discovering Content' : 
            activeTab === 'generation' ? 'Generating Content' : 'Modifying Content'
          }
          message={
            activeTab === 'discovery' ? 'Our AI is discovering educational content...' :
            activeTab === 'generation' ? 'Our AI is creating your content...' : 
            'Our AI is modifying your content...'
          }
          progress={loadingProgress}
        />
      )}
    </div>
  );
}

export default EliceCreatorAI;
