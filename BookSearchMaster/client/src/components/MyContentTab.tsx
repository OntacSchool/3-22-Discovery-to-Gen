import React, { useState, useEffect } from 'react';
import { Folder, Search, FileText, Code, BookOpen, PenTool, Eye, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ContentItem {
  id: number;
  title: string;
  type: string;
  timeAgo: string;
  content: string;
}

interface MyContentTabProps {
  // Add any needed props
}

const MyContentTab: React.FC<MyContentTabProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchContentList();
  }, []);
  
  const fetchContentList = async () => {
    try {
      const response = await apiRequest('GET', '/api/content/list', undefined);
      const data = await response.json();
      
      // Transform the data
      const transformedData = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        type: item.contentType,
        timeAgo: new Date(item.createdAt).toLocaleString(),
        content: item.content
      }));
      
      setContentList(transformedData);
      
      if (transformedData.length > 0 && !selectedContent) {
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
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleExport = (content: ContentItem) => {
    // Create a blob with the content
    const blob = new Blob([content.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Content exported successfully"
    });
  };
  
  // Get icon based on content type
  const getContentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'lesson':
        return <BookOpen className="h-4 w-4" />;
      case 'quiz':
        return <FileText className="h-4 w-4" />;
      case 'exercise':
        return <Code className="h-4 w-4" />;
      case 'project':
        return <PenTool className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="mt-6 bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4 text-purple-700 flex items-center">
        <Folder className="h-5 w-5 mr-2" /> 
        My Content Library
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          {/* Content Selection */}
          <div className="border rounded-lg p-4 mb-4">
            <h3 className="font-medium mb-3">My Content</h3>
            
            <div className="mb-4">
              <div className="relative">
                <Input
                  type="text"
                  className="w-full pl-9"
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="border rounded h-[calc(100vh-360px)] overflow-y-auto">
              {filteredContent.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {filteredContent.map((item) => (
                    <li 
                      key={item.id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer ${selectedContent?.id === item.id ? 'bg-purple-50' : ''}`}
                      onClick={() => setSelectedContent(item)}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          {getContentIcon(item.type)}
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                          <div className="flex justify-between">
                            <p className="text-xs text-gray-500">{item.type}</p>
                            <p className="text-xs text-gray-500">{item.timeAgo}</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                  <FileText className="h-10 w-10 mb-2 text-gray-300" />
                  <p className="text-sm">No content found</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          {/* Content Preview */}
          {selectedContent ? (
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium flex items-center">
                  {getContentIcon(selectedContent.type)}
                  <span className="ml-2">{selectedContent.title}</span>
                  <span className="ml-2 text-xs text-gray-500 font-normal">({selectedContent.type})</span>
                </h3>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="px-2 py-1 h-8"
                    onClick={() => handleExport(selectedContent)}
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
              
              <div className="border rounded bg-gray-50 p-4 h-[calc(100vh-300px)] overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap">{selectedContent.content}</pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-8 flex flex-col items-center justify-center h-[calc(100vh-300px)] text-gray-500">
              <Eye className="h-12 w-12 mb-3 text-gray-300" />
              <p className="text-lg mb-1">No content selected</p>
              <p className="text-sm text-center">Select content from the list to view it here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyContentTab;