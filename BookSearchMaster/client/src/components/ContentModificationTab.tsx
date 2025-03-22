import React, { useState, useEffect } from 'react';
import { Edit, Search, Edit2, MoveVertical, Scissors, Globe, Copy, RefreshCw, Wand2, Maximize, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { getPreviewComponentForType } from '@/components/content';

interface ContentItem {
  id: number;
  name: string;
  type: string;
  created: string;
  content: string;
}

interface ModificationOption {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
}

interface ContentModificationTabProps {
  modificationMode: string | null;
  handleModificationSelect: (mode: string) => void;
  selectedContent: ContentItem | null;
  setSelectedContent: (content: ContentItem | null) => void;
  modifyContent: (contentId: number, modificationData: any) => Promise<void>;
}

const ContentModificationTab: React.FC<ContentModificationTabProps> = ({
  modificationMode,
  handleModificationSelect,
  selectedContent,
  setSelectedContent,
  modifyContent
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [instructions, setInstructions] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();
  
  const modificationOptions: ModificationOption[] = [
    { id: 'refine', name: 'Refine', icon: Edit2, description: 'Improve and refine the content quality' },
    { id: 'expand', name: 'Expand', icon: MoveVertical, description: 'Add more details and examples to the content' },
    { id: 'simplify', name: 'Simplify', icon: Scissors, description: 'Make the content easier to understand' },
    { id: 'adapt', name: 'Adapt', icon: Globe, description: 'Adapt content for different contexts or audiences' },
    { id: 'duplicate', name: 'Duplicate', icon: Copy, description: 'Create a copy with specific changes' },
    { id: 'regenerate', name: 'Regenerate', icon: RefreshCw, description: 'Completely regenerate the content' },
  ];
  
  useEffect(() => {
    fetchContentList();
  }, []);
  
  const fetchContentList = async () => {
    try {
      const response = await apiRequest('GET', '/api/content/list', undefined);
      const data = await response.json();
      
      // Transform the data to match the expected format
      const transformedData = data.map(item => ({
        id: item.id,
        name: item.title,
        type: item.contentType,
        created: new Date(item.createdAt).toLocaleString(),
        content: item.content
      }));
      
      setContentList(transformedData);
      
      if (transformedData.length > 0) {
        setSelectedContent(transformedData[0]);
      }
    } catch (error) {
      console.error("Failed to fetch content list:", error);
      toast({
        title: "Error",
        description: "Failed to fetch content list",
        variant: "destructive"
      });
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const filteredContent = contentList.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleModifyContent = async () => {
    if (!selectedContent) {
      toast({
        title: "Error",
        description: "No content selected",
        variant: "destructive"
      });
      return;
    }
    
    if (!modificationMode) {
      toast({
        title: "Error",
        description: "Please select a modification type",
        variant: "destructive"
      });
      return;
    }
    
    if (!instructions.trim()) {
      toast({
        title: "Error",
        description: "Please provide modification instructions",
        variant: "destructive"
      });
      return;
    }
    
    await modifyContent(selectedContent.id, { instructions });
  };
  
  const sampleContent = `
# Python Data Types

Python has several built-in data types that are essential for working with data:

- **Integers** - Whole numbers without decimal points
- **Floats** - Numbers with decimal points
- **Strings** - Text enclosed in quotes
- **Lists** - Ordered, mutable collections
- **Tuples** - Ordered, immutable collections
- **Dictionaries** - Key-value pairs
- **Sets** - Unordered collections of unique elements
- **Booleans** - True or False values

Let's look at how these are used in practice:

\`\`\`python
# Integer
count = 42

# Float  
pi = 3.14159

# String
name = "Python Data Science"

# List
numbers = [1, 2, 3, 4, 5]

# Tuple  
coordinates = (10.5, 20.8)

# Dictionary
student = {"name": "Alex", "age": 25}

# Set
unique_values = {1, 2, 3, 4}

# Boolean  
is_valid = True
\`\`\`
`;

  return (
    <div className="mt-6 bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4 text-purple-700 flex items-center">
        <Edit className="h-5 w-5 mr-2" /> 
        Content Modification
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Content Selection */}
          <div className="border rounded-lg p-4 mb-4">
            <h3 className="font-medium mb-3">Select Content to Modify</h3>
            
            <div className="mb-4">
              <div className="relative">
                <Input
                  type="text"
                  className="w-full pl-9"
                  placeholder="Search your content..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="border rounded overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContent.map((item) => (
                    <tr 
                      key={item.id}
                      className={selectedContent?.id === item.id ? 'bg-purple-50' : ''}
                    >
                      <td className="px-4 py-2 text-sm">{item.name}</td>
                      <td className="px-4 py-2 text-sm">{item.type}</td>
                      <td className="px-4 py-2 text-sm">{item.created}</td>
                      <td className="px-4 py-2 text-right">
                        <button 
                          className="text-purple-600 hover:text-purple-800"
                          onClick={() => setSelectedContent(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredContent.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-sm text-center text-gray-500">
                        No content found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Modification Options */}
          {selectedContent && (
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Modification Type: <span className="text-purple-700">{selectedContent.name}</span></h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {modificationOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`border ${modificationMode === option.id 
                      ? 'border-2 border-purple-500 bg-purple-50' 
                      : 'hover:border-purple-400 hover:bg-purple-50'} 
                      rounded p-2 flex flex-col items-center cursor-pointer transition-colors`}
                    onClick={() => handleModificationSelect(option.id)}
                    title={option.description}
                  >
                    <option.icon className={`h-5 w-5 mb-1 ${modificationMode === option.id ? 'text-purple-700' : 'text-gray-600'}`} />
                    <span className="text-sm">{option.name}</span>
                  </div>
                ))}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modification Instructions</label>
                <Textarea
                  className="w-full h-20"
                  placeholder="Describe how you want to modify this content..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 h-auto"
                  onClick={handleModifyContent}
                >
                  <Wand2 className="h-4 w-4 mr-1.5" />
                  Apply Modification
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className={`md:col-span-1 ${isFullscreen ? 'fixed inset-4 z-50 bg-white p-4 overflow-auto shadow-2xl' : ''}`}>
          {/* Modification Preview */}
          {selectedContent && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
                <h3 className="font-medium">Content Preview</h3>
                <button 
                  className="text-purple-600 hover:text-purple-800 text-sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  <Maximize className="h-4 w-4 inline mr-1" />
                  {isFullscreen ? 'Collapse' : 'Expand'}
                </button>
              </div>
              
              <div className={isFullscreen ? 'h-full' : 'h-96 overflow-auto'}>
                {(() => {
                  // Dynamically select the appropriate component based on content type
                  const PreviewComponent = getPreviewComponentForType(selectedContent.type);
                  
                  // Different content types need different props
                  switch(selectedContent.type.toLowerCase()) {
                    case 'lesson':
                      return <PreviewComponent content={selectedContent.content} readOnly={true} />;
                    
                    case 'quiz':
                      // Parse the content if it's in JSON format, otherwise use default structure
                      try {
                        const quizData = JSON.parse(selectedContent.content);
                        return (
                          <PreviewComponent 
                            title={selectedContent.name}
                            description={quizData.description || ''}
                            questions={quizData.questions || []}
                            readOnly={true}
                          />
                        );
                      } catch (e) {
                        // Fallback if content is not valid JSON
                        return (
                          <PreviewComponent 
                            title={selectedContent.name}
                            description="Quiz content"
                            questions={[{
                              question: "Sample question",
                              options: ["Option 1", "Option 2", "Option 3"],
                              correctAnswerIndex: 0
                            }]}
                            readOnly={true}
                          />
                        );
                      }
                    
                    case 'exercise':
                    case 'programming exercise':
                      try {
                        const exerciseData = JSON.parse(selectedContent.content);
                        return (
                          <PreviewComponent 
                            title={selectedContent.name}
                            description={exerciseData.description || ''}
                            instructions={exerciseData.instructions || ''}
                            initialCode={exerciseData.initialCode || '# Your code here'}
                            language={exerciseData.language || 'python'}
                            testCases={exerciseData.testCases || []}
                            readOnly={true}
                          />
                        );
                      } catch (e) {
                        // Fallback for text content
                        return (
                          <PreviewComponent 
                            title={selectedContent.name}
                            description="Exercise description"
                            instructions={selectedContent.content}
                            initialCode="# Your code here"
                            language="python"
                            readOnly={true}
                          />
                        );
                      }
                    
                    case 'project':
                      try {
                        const projectData = JSON.parse(selectedContent.content);
                        return (
                          <PreviewComponent 
                            title={selectedContent.name}
                            description={projectData.description || ''}
                            cells={projectData.cells || []}
                            readOnly={true}
                          />
                        );
                      } catch (e) {
                        // Fallback for text content
                        return (
                          <PreviewComponent 
                            title={selectedContent.name}
                            description="Project description"
                            cells={[
                              {
                                id: "1",
                                type: "markdown",
                                content: selectedContent.content
                              }
                            ]}
                            readOnly={true}
                          />
                        );
                      }
                    
                    default:
                      return <PreviewComponent content={selectedContent.content} readOnly={true} />;
                  }
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentModificationTab;
