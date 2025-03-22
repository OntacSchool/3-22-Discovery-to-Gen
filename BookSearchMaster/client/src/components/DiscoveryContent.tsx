import React, { useState } from 'react';
import { Search, ArrowRight, Brain, Database, FileUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FileUploader from '@/components/FileUploader';

interface DiscoveryContentProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleDiscover: () => void;
  showResults: boolean;
  generatingContent: boolean;
  ragState: string;
  agentThoughts: string[];
  retrievedDocuments: any[];
  selectedCurriculum: number | null;
  handleCurriculumSelect: (id: number) => void;
  setActiveTab: (tab: string) => void;
  onFilesUploaded?: (files: File[]) => void;
}

const DiscoveryContent: React.FC<DiscoveryContentProps> = ({
  searchQuery,
  setSearchQuery,
  handleDiscover,
  showResults,
  generatingContent,
  ragState,
  agentThoughts,
  retrievedDocuments,
  selectedCurriculum,
  handleCurriculumSelect,
  setActiveTab,
  onFilesUploaded
}) => {
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const trendingKeywords = ['Python Basics', 'Data Science', 'Web Development', 'Machine Learning'];
  
  const handleFilesUploaded = (files: File[]) => {
    setUploadedFiles(files);
    if (onFilesUploaded) {
      onFilesUploaded(files);
    }
  };
  
  const curriculumOptions = [
    {
      id: 1,
      title: 'Python Data Science Foundations',
      description: 'A comprehensive curriculum for beginners to learn Python basics and fundamental data science concepts.',
      lessons: 10,
      quizzes: 5,
      exercises: 8,
      projects: 2,
      recommended: true
    },
    {
      id: 2,
      title: 'Data Analysis with Python',
      description: 'Focus on data manipulation, visualization, and analysis using pandas and matplotlib.',
      lessons: 8,
      quizzes: 4,
      exercises: 6,
      projects: 3,
      recommended: false
    },
    {
      id: 3,
      title: 'Python Programming Essentials',
      description: 'Core Python programming concepts with a focus on data structures and algorithms.',
      lessons: 12,
      quizzes: 6,
      exercises: 10,
      projects: 1,
      recommended: false
    },
    {
      id: 4,
      title: 'Intro to Machine Learning with Python',
      description: 'Gentle introduction to ML concepts with scikit-learn and basic algorithms.',
      lessons: 9,
      quizzes: 3,
      exercises: 5,
      projects: 2,
      recommended: false
    }
  ];

  return (
    <div className="md:col-span-2">
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-lg font-semibold mb-3 text-purple-700 flex items-center">
          Content Discovery 
          <ArrowRight className="h-4 w-4 mx-2" /> 
          Curriculum, Pathways
        </h2>
        
        {!showResults ? (
          <>
            {/* Search and Prompt Bar */}
            <div className="flex items-center border rounded-md p-2 mb-4">
              <Input
                type="text"
                placeholder="Enter your content discovery prompt here..."
                className="flex-1 outline-none text-sm border-0 shadow-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="flex space-x-2 ml-2">
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm py-1 px-3 h-8"
                  onClick={handleDiscover}
                  disabled={generatingContent}
                >
                  Discover
                </Button>
                <Button 
                  variant="outline"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-1 px-3 h-8 border-gray-200"
                >
                  Generate
                </Button>
              </div>
            </div>
            
            {/* Trending and Navigation */}
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Trending Hashtags</div>
              <div className="flex flex-wrap gap-2">
                {trendingKeywords.map((keyword) => (
                  <div 
                    key={keyword} 
                    className="bg-gray-100 rounded-md px-3 py-1 text-sm cursor-pointer hover:bg-purple-100 hover:text-purple-700 transition-colors"
                    onClick={() => setSearchQuery(keyword)}
                  >
                    <span className="text-gray-700">{keyword}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* File Upload Toggle Button */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowFileUploader(!showFileUploader)}
                className="flex items-center text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                <FileUp className="h-4 w-4 mr-1.5" />
                {showFileUploader ? 'Hide File Uploader' : 'Upload Files for More Accurate Results'}
              </button>
              
              {showFileUploader && (
                <div className="mt-3 border rounded-lg p-4 bg-gray-50">
                  <h3 className="text-sm font-medium mb-2">Upload Your Context Files</h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Upload syllabi, course materials, or documents to help tailor the AI's outputs to your specific needs.
                  </p>
                  
                  <FileUploader 
                    onFilesUploaded={handleFilesUploaded}
                    maxFiles={5}
                    acceptedTypes=".pdf,.txt,.docx,.md,.ppt,.pptx"
                    maxSizeMB={15}
                  />
                  
                  {uploadedFiles.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      {uploadedFiles.length} file(s) will be used to enhance your discovery results
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-center mt-6">
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 h-10"
                onClick={handleDiscover}
                disabled={generatingContent}
              >
                <Search className="h-4 w-4 mr-2" />
                Discover Content
              </Button>
            </div>
          </>
        ) : generatingContent ? (
          <div className="flex flex-col py-6">
            <div className="mb-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mr-3"></div>
              <div className="text-lg font-medium text-purple-700">
                {ragState === 'processing' && 'Processing Query...'}
                {ragState === 'retrieving' && 'Retrieving Content...'}
                {ragState === 'generating' && 'Generating Curriculum...'}
              </div>
            </div>
            
            <div className="border rounded-lg p-3 bg-gray-50 mb-4">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Brain className="h-4 w-4 mr-1 text-purple-600" />
                AI Agent Thoughts
              </h3>
              <div className="space-y-2">
                {agentThoughts.map((thought, index) => (
                  <div key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span>{thought}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {retrievedDocuments.length > 0 && (
              <div className="border rounded-lg p-3 bg-gray-50">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Database className="h-4 w-4 mr-1 text-purple-600" />
                  Retrieved Documents
                </h3>
                <div className="space-y-2">
                  {retrievedDocuments.map((doc, index) => (
                    <div key={index} className="border rounded p-2 bg-white">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm">{doc.title}</span>
                        <span className="text-xs bg-purple-100 text-purple-800 rounded px-1.5 py-0.5">
                          {Math.round(doc.similarity * 100)}% Match
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mb-1">{doc.type}</div>
                      <p className="text-xs text-gray-700">{doc.snippet}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-medium text-center mb-4">Recommended Curriculum</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {curriculumOptions.map((curriculum) => (
                <div
                  key={curriculum.id}
                  className={`${
                    selectedCurriculum === curriculum.id 
                    ? 'border-2 border-purple-500 bg-purple-50' 
                    : 'border border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                  } rounded-lg p-3 cursor-pointer transition-colors`}
                  onClick={() => handleCurriculumSelect(curriculum.id)}
                >
                  <div className="font-medium mb-2 flex justify-between">
                    <span>{curriculum.title}</span>
                    {curriculum.recommended && (
                      <span className="text-xs bg-purple-200 text-purple-800 rounded px-1.5 py-0.5">Recommended</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{curriculum.description}</p>
                  <div className="flex space-x-2">
                    <div className="border rounded px-2 py-1 text-xs bg-gray-100" title={`${curriculum.lessons} Lessons`}>
                      {curriculum.lessons} LN
                    </div>
                    <div className="border rounded px-2 py-1 text-xs bg-gray-100" title={`${curriculum.quizzes} Quizzes`}>
                      {curriculum.quizzes} Qz
                    </div>
                    <div className="border rounded px-2 py-1 text-xs bg-gray-100" title={`${curriculum.exercises} Exercises`}>
                      {curriculum.exercises} Ex
                    </div>
                    <div className="border rounded px-2 py-1 text-xs bg-gray-100" title={`${curriculum.projects} Projects`}>
                      {curriculum.projects} Pr
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedCurriculum && (
              <div className="flex justify-center">
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 h-10"
                  onClick={() => setActiveTab('generation')}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Proceed to Content Generation
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoveryContent;
