import React, { useState } from 'react';
import { Edit, Save, X, PlayCircle, RotateCw, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ProgrammingExercisePreviewProps {
  title: string;
  description: string;
  instructions: string;
  initialCode: string;
  language: string;
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    description: string;
  }>;
  solution?: string;
  onSave?: (updatedExercise: any) => void;
  readOnly?: boolean;
}

const ProgrammingExercisePreview: React.FC<ProgrammingExercisePreviewProps> = ({
  title,
  description,
  instructions,
  initialCode,
  language,
  testCases = [],
  solution = '',
  onSave,
  readOnly = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);
  const [editedInstructions, setEditedInstructions] = useState(instructions);
  const [editedInitialCode, setEditedInitialCode] = useState(initialCode);
  const [editedLanguage, setEditedLanguage] = useState(language);
  const [editedTestCases, setEditedTestCases] = useState(testCases);
  const [editedSolution, setEditedSolution] = useState(solution);
  
  // For student experience
  const [userCode, setUserCode] = useState(initialCode);
  const [currentTab, setCurrentTab] = useState('instructions');
  const [testResults, setTestResults] = useState<Array<{
    passed: boolean;
    output: string;
    message: string;
  }> | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');

  const handleSave = () => {
    if (onSave) {
      onSave({
        title: editedTitle,
        description: editedDescription,
        instructions: editedInstructions,
        initialCode: editedInitialCode,
        language: editedLanguage,
        testCases: editedTestCases,
        solution: editedSolution
      });
    }
    setIsEditing(false);
    // Update the user-facing code
    setUserCode(editedInitialCode);
  };

  const handleCancel = () => {
    setEditedTitle(title);
    setEditedDescription(description);
    setEditedInstructions(instructions);
    setEditedInitialCode(initialCode);
    setEditedLanguage(language);
    setEditedTestCases(testCases);
    setEditedSolution(solution);
    setIsEditing(false);
  };

  const runCode = () => {
    // Simulated code execution (in a real implementation, this would send the code to a backend service)
    setIsRunning(true);
    setOutput('');
    
    // Simulate processing time
    setTimeout(() => {
      setOutput('// This is a simulated output\n// In a real implementation, the code would be executed on the server\nconsole.log("Hello, world!");\n\n> Hello, world!');
      setIsRunning(false);
    }, 1500);
  };

  const runTests = () => {
    // Simulated test execution
    setIsRunning(true);
    setTestResults(null);
    
    // Simulate processing time
    setTimeout(() => {
      // Generate simulated test results
      const simulatedResults = testCases.map((test, index) => ({
        passed: Math.random() > 0.3, // 70% chance of passing for simulation
        output: `Test output for case ${index + 1}`,
        message: `Test case ${index + 1} ${Math.random() > 0.3 ? 'passed' : 'failed'}`
      }));
      
      setTestResults(simulatedResults);
      setIsRunning(false);
    }, 2000);
  };

  // Helper function to reset the student view
  const resetExercise = () => {
    setUserCode(initialCode);
    setOutput('');
    setTestResults(null);
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <div className="flex justify-between items-center p-3 bg-gray-50 border-b">
        <h3 className="text-md font-medium text-gray-800">
          {isEditing ? 'Edit Programming Exercise' : title}
        </h3>
        {!readOnly && (
          <div>
            {isEditing ? (
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  variant="default"
                  className="h-8"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleCancel}
                  variant="outline"
                  className="h-8"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            ) : (
              <Button 
                size="sm" 
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="h-8"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Content */}
      {isEditing ? (
        <div className="p-4 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Textarea
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Exercise title"
                className="resize-none"
                rows={1}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Brief description of the exercise"
                rows={2}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Instructions (Markdown)</label>
              <Textarea
                value={editedInstructions}
                onChange={(e) => setEditedInstructions(e.target.value)}
                placeholder="Detailed instructions in Markdown format"
                rows={6}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Initial Code</label>
              <Textarea
                value={editedInitialCode}
                onChange={(e) => setEditedInitialCode(e.target.value)}
                placeholder="Starter code for the student"
                className="font-mono"
                rows={10}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Programming Language</label>
              <select
                value={editedLanguage}
                onChange={(e) => setEditedLanguage(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="csharp">C#</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Solution (Optional)</label>
              <Textarea
                value={editedSolution}
                onChange={(e) => setEditedSolution(e.target.value)}
                placeholder="Example solution code"
                className="font-mono"
                rows={10}
              />
            </div>
            
            {/* Test Cases */}
            <div>
              <label className="block text-sm font-medium mb-1">Test Cases</label>
              <div className="space-y-4 mt-2">
                {editedTestCases.map((testCase, index) => (
                  <div key={index} className="border rounded p-3 space-y-2">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium">Test Case {index + 1}</h4>
                      <button
                        onClick={() => {
                          const newTestCases = [...editedTestCases];
                          newTestCases.splice(index, 1);
                          setEditedTestCases(newTestCases);
                        }}
                        className="text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Description</label>
                      <Textarea
                        value={testCase.description}
                        onChange={(e) => {
                          const newTestCases = [...editedTestCases];
                          newTestCases[index].description = e.target.value;
                          setEditedTestCases(newTestCases);
                        }}
                        placeholder="Describe what this test is checking"
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Input</label>
                      <Textarea
                        value={testCase.input}
                        onChange={(e) => {
                          const newTestCases = [...editedTestCases];
                          newTestCases[index].input = e.target.value;
                          setEditedTestCases(newTestCases);
                        }}
                        placeholder="Test input"
                        rows={2}
                        className="text-sm font-mono"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Expected Output</label>
                      <Textarea
                        value={testCase.expectedOutput}
                        onChange={(e) => {
                          const newTestCases = [...editedTestCases];
                          newTestCases[index].expectedOutput = e.target.value;
                          setEditedTestCases(newTestCases);
                        }}
                        placeholder="Expected output"
                        rows={2}
                        className="text-sm font-mono"
                      />
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditedTestCases([
                      ...editedTestCases,
                      {
                        description: '',
                        input: '',
                        expectedOutput: ''
                      }
                    ]);
                  }}
                >
                  Add Test Case
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row h-[70vh]">
          {/* IDE-Style Interface */}
          <Tabs
            value={currentTab}
            onValueChange={setCurrentTab}
            className="w-full md:w-1/2 h-full flex flex-col"
          >
            <div className="border-b">
              <TabsList className="w-full justify-start rounded-none border-b bg-gray-50">
                <TabsTrigger value="instructions" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-purple-500">
                  Instructions
                </TabsTrigger>
                <TabsTrigger value="solution" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-purple-500">
                  Solution
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="instructions" className="flex-1 overflow-auto p-4 m-0">
              <div className="prose max-w-none">
                <h2 className="text-xl font-bold mb-2">{title}</h2>
                <p className="text-gray-600 mb-4">{description}</p>
                <ReactMarkdown>{instructions}</ReactMarkdown>
                
                {testCases.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">Test Cases</h3>
                    <div className="space-y-3">
                      {testCases.map((test, index) => (
                        <div key={index} className="border rounded p-3 bg-gray-50">
                          <p className="font-medium text-sm">{test.description}</p>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <p className="text-xs text-gray-500">Input:</p>
                              <pre className="text-xs bg-gray-100 p-2 rounded mt-1">{test.input}</pre>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Expected Output:</p>
                              <pre className="text-xs bg-gray-100 p-2 rounded mt-1">{test.expectedOutput}</pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="solution" className="flex-1 overflow-auto p-0 m-0">
              {solution ? (
                <SyntaxHighlighter
                  language={language}
                  style={vscDarkPlus}
                  customStyle={{ margin: 0, height: '100%', borderRadius: 0 }}
                  showLineNumbers
                >
                  {solution}
                </SyntaxHighlighter>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <p className="text-gray-500">No solution provided for this exercise</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="w-full md:w-1/2 border-t md:border-t-0 md:border-l flex flex-col h-full">
            {/* Code Editor */}
            <div className="flex-1 overflow-auto">
              <Textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="font-mono text-sm h-full w-full resize-none p-4 focus:ring-0 border-0 rounded-none"
                spellCheck={false}
              />
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-between p-2 bg-gray-50 border-t">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={resetExercise} disabled={isRunning}>
                  <RotateCw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
                <select
                  className="border rounded px-2 py-1 text-sm bg-white"
                  value={language}
                  disabled
                >
                  <option value={language}>{language.charAt(0).toUpperCase() + language.slice(1)}</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={runCode} disabled={isRunning}>
                  <PlayCircle className="h-4 w-4 mr-1" />
                  Run
                </Button>
                <Button variant="default" size="sm" onClick={runTests} disabled={isRunning}>
                  <Check className="h-4 w-4 mr-1" />
                  Run Tests
                </Button>
              </div>
            </div>
            
            {/* Output Console */}
            <div className="h-1/3 border-t bg-gray-900 text-white overflow-auto">
              {isRunning ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span className="ml-2">Running...</span>
                </div>
              ) : testResults ? (
                <div className="p-3 font-mono text-sm">
                  <div className="mb-2 pb-2 border-b border-gray-700">
                    <span className="font-bold">Test Results:</span> {testResults.filter(t => t.passed).length} of {testResults.length} tests passing
                  </div>
                  {testResults.map((result, index) => (
                    <div key={index} className={`mb-2 p-2 rounded ${result.passed ? 'bg-green-900' : 'bg-red-900'}`}>
                      <div className="flex items-center">
                        {result.passed ? (
                          <Check className="h-4 w-4 mr-1 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
                        )}
                        <span className="font-bold">Test {index + 1}:</span>
                        <span className="ml-1">{result.message}</span>
                      </div>
                      <div className="mt-1 text-xs overflow-x-auto whitespace-pre-wrap">
                        {result.output}
                      </div>
                    </div>
                  ))}
                </div>
              ) : output ? (
                <pre className="p-3 font-mono text-sm whitespace-pre-wrap">{output}</pre>
              ) : (
                <div className="p-3 text-gray-500 italic">
                  Output will appear here after you run your code
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgrammingExercisePreview;