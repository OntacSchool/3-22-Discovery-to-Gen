import React, { useState } from 'react';
import { FileText, BookOpen, MessageSquare, Code, FolderOpen, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ContentGenerationTabProps {
  selectedCurriculum: number | null;
  contentType: string | null;
  handleContentTypeSelect: (type: string) => void;
  generateContent: (formData: any) => Promise<void>;
  recentGenerations: any[];
}

const ContentGenerationTab: React.FC<ContentGenerationTabProps> = ({
  selectedCurriculum,
  contentType,
  handleContentTypeSelect,
  generateContent,
  recentGenerations
}) => {
  const [title, setTitle] = useState("Introduction to Python Data Types");
  const [difficulty, setDifficulty] = useState("beginner");
  const [duration, setDuration] = useState("30");
  const [objectives, setObjectives] = useState("Understand Python basic data types");
  const [instructions, setInstructions] = useState("Include examples for each data type and how they're used in data science context.");
  const [model, setModel] = useState("gemini-1.5-pro");
  const [style, setStyle] = useState("comprehensive");
  const [format, setFormat] = useState("markdown");
  const [includeCode, setIncludeCode] = useState(true);
  const [includeVisuals, setIncludeVisuals] = useState(true);
  const [includeChecks, setIncludeChecks] = useState(false);
  
  const curriculumTitles = [
    "N/A",
    "Python Data Science Foundations",
    "Data Analysis with Python",
    "Python Programming Essentials",
    "Intro to Machine Learning with Python"
  ];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contentType) {
      alert("Please select a content type");
      return;
    }
    
    const formData = {
      title,
      difficulty,
      duration,
      objectives,
      instructions,
      generationOptions: {
        model,
        style,
        format,
        includeCode,
        includeVisuals,
        includeChecks
      }
    };
    
    generateContent(formData);
  };

  return (
    <div className="mt-6 bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4 text-purple-700 flex items-center">
        <FileText className="h-5 w-5 mr-2" /> 
        Content Generation
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Content Configuration */}
          <form onSubmit={handleSubmit} className="border rounded-lg p-4 mb-4">
            <h3 className="font-medium mb-3">Selected Curriculum: <span className="text-purple-700">
              {selectedCurriculum ? curriculumTitles[selectedCurriculum] : 'None selected'}
            </span></h3>
            
            <div className="mb-4">
              <Label className="block text-sm font-medium text-gray-700 mb-1">Content Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div 
                  className={`border ${contentType === 'lesson' 
                    ? 'border-2 border-purple-500 bg-purple-50' 
                    : 'hover:border-purple-400 hover:bg-purple-50'} 
                    rounded p-2 flex flex-col items-center cursor-pointer transition-colors`}
                  onClick={() => handleContentTypeSelect('lesson')}
                >
                  <BookOpen className={`h-5 w-5 mb-1 ${contentType === 'lesson' ? 'text-purple-700' : 'text-gray-600'}`} />
                  <span className="text-sm">Lesson</span>
                </div>
                <div 
                  className={`border ${contentType === 'quiz' 
                    ? 'border-2 border-purple-500 bg-purple-50' 
                    : 'hover:border-purple-400 hover:bg-purple-50'} 
                    rounded p-2 flex flex-col items-center cursor-pointer transition-colors`}
                  onClick={() => handleContentTypeSelect('quiz')}
                >
                  <MessageSquare className={`h-5 w-5 mb-1 ${contentType === 'quiz' ? 'text-purple-700' : 'text-gray-600'}`} />
                  <span className="text-sm">Quiz</span>
                </div>
                <div 
                  className={`border ${contentType === 'exercise' 
                    ? 'border-2 border-purple-500 bg-purple-50' 
                    : 'hover:border-purple-400 hover:bg-purple-50'} 
                    rounded p-2 flex flex-col items-center cursor-pointer transition-colors`}
                  onClick={() => handleContentTypeSelect('exercise')}
                >
                  <Code className={`h-5 w-5 mb-1 ${contentType === 'exercise' ? 'text-purple-700' : 'text-gray-600'}`} />
                  <span className="text-sm">Exercise</span>
                </div>
                <div 
                  className={`border ${contentType === 'project' 
                    ? 'border-2 border-purple-500 bg-purple-50' 
                    : 'hover:border-purple-400 hover:bg-purple-50'} 
                    rounded p-2 flex flex-col items-center cursor-pointer transition-colors`}
                  onClick={() => handleContentTypeSelect('project')}
                >
                  <FolderOpen className={`h-5 w-5 mb-1 ${contentType === 'project' ? 'text-purple-700' : 'text-gray-600'}`} />
                  <span className="text-sm">Project</span>
                </div>
              </div>
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Content Parameters</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="block text-xs text-gray-500 mb-1">Title</Label>
                  <Input 
                    type="text" 
                    className="w-full" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label className="block text-xs text-gray-500 mb-1">Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="block text-xs text-gray-500 mb-1">Estimated Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="block text-xs text-gray-500 mb-1">Learning Objectives</Label>
                  <Input 
                    type="text" 
                    className="w-full" 
                    value={objectives}
                    onChange={(e) => setObjectives(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Label className="block text-sm font-medium text-gray-700 mb-1">Additional Instructions</Label>
              <Textarea 
                className="w-full h-20"
                placeholder="Add any specific instructions for content generation..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button 
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 h-auto"
              >
                <Wand2 className="h-4 w-4 mr-1.5" />
                Generate Content
              </Button>
            </div>
          </form>
        </div>
        
        <div className="md:col-span-1">
          {/* Generation Options */}
          <div className="border rounded-lg p-4 mb-4">
            <h3 className="font-medium mb-3">Generation Options</h3>
            
            <div className="space-y-3">
              <div>
                <Label className="block text-xs text-gray-500 mb-1">Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                    <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="block text-xs text-gray-500 mb-1">Generation Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="interactive">Interactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="block text-xs text-gray-500 mb-1">Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeCode"
                    checked={includeCode}
                    onCheckedChange={(checked) => setIncludeCode(checked === true)}
                  />
                  <Label 
                    htmlFor="includeCode"
                    className="text-sm font-normal"
                  >
                    Include code examples
                  </Label>
                </div>
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeVisuals"
                    checked={includeVisuals}
                    onCheckedChange={(checked) => setIncludeVisuals(checked === true)}
                  />
                  <Label 
                    htmlFor="includeVisuals"
                    className="text-sm font-normal"
                  >
                    Include visual elements
                  </Label>
                </div>
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeChecks"
                    checked={includeChecks}
                    onCheckedChange={(checked) => setIncludeChecks(checked === true)}
                  />
                  <Label 
                    htmlFor="includeChecks"
                    className="text-sm font-normal"
                  >
                    Add knowledge checks
                  </Label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Generations */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3">Recent Generations</h3>
            
            <div className="space-y-2">
              {recentGenerations.length > 0 ? (
                recentGenerations.map((gen, index) => (
                  <div key={index} className="border rounded p-2 text-xs bg-gray-50">
                    <div className="font-medium">{gen.title}</div>
                    <div className="text-gray-500 mt-1">{gen.timeAgo} • {gen.type}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 italic">No recent generations</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentGenerationTab;
