import React, { useState } from 'react';
import { Edit, Save, X, Plus, Trash2, ChevronUp, ChevronDown, Code, FileText, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Project cells can be markdown text or code
type CellType = 'markdown' | 'code';

interface ProjectCell {
  id: string;
  type: CellType;
  content: string;
  language?: string; // Only for code cells
  output?: string; // Simulated output for code cells
}

interface ProjectPreviewProps {
  title: string;
  description: string;
  cells: ProjectCell[];
  onSave?: (updatedProject: any) => void;
  readOnly?: boolean;
}

const ProjectPreview: React.FC<ProjectPreviewProps> = ({
  title,
  description,
  cells,
  onSave,
  readOnly = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);
  const [editedCells, setEditedCells] = useState<ProjectCell[]>(cells);
  
  // For executing code (simulated)
  const [executingCell, setExecutingCell] = useState<string | null>(null);

  const handleSave = () => {
    if (onSave) {
      onSave({
        title: editedTitle,
        description: editedDescription,
        cells: editedCells
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(title);
    setEditedDescription(description);
    setEditedCells(cells);
    setIsEditing(false);
  };

  const addCell = (type: CellType, index: number) => {
    const newCell: ProjectCell = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      content: type === 'markdown' ? '## New section' : '# Enter your code here',
      language: type === 'code' ? 'python' : undefined
    };
    
    const newCells = [...editedCells];
    newCells.splice(index + 1, 0, newCell);
    setEditedCells(newCells);
  };

  const removeCell = (id: string) => {
    setEditedCells(editedCells.filter(cell => cell.id !== id));
  };

  const moveCell = (id: string, direction: 'up' | 'down') => {
    const index = editedCells.findIndex(cell => cell.id === id);
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === editedCells.length - 1)
    ) {
      return;
    }
    
    const newCells = [...editedCells];
    const cell = newCells[index];
    newCells.splice(index, 1);
    newCells.splice(direction === 'up' ? index - 1 : index + 1, 0, cell);
    setEditedCells(newCells);
  };

  const updateCellContent = (id: string, content: string) => {
    setEditedCells(
      editedCells.map(cell => 
        cell.id === id ? { ...cell, content } : cell
      )
    );
  };

  const updateCellLanguage = (id: string, language: string) => {
    setEditedCells(
      editedCells.map(cell => 
        cell.id === id ? { ...cell, language } : cell
      )
    );
  };

  const executeCodeCell = (id: string) => {
    setExecutingCell(id);
    
    // Simulate code execution with a delay
    setTimeout(() => {
      setEditedCells(
        editedCells.map(cell => 
          cell.id === id ? { 
            ...cell, 
            output: `# Simulated output for ${cell.language} code\n` +
                   `This is what would appear if the code was actually executed.\n` +
                   `For Python, this might show print statement outputs.\n` +
                   `For data science code, this might include charts and visualizations.`
          } : cell
        )
      );
      setExecutingCell(null);
    }, 1500);
  };

  const clearOutput = (id: string) => {
    setEditedCells(
      editedCells.map(cell => 
        cell.id === id ? { ...cell, output: undefined } : cell
      )
    );
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <div className="flex justify-between items-center p-3 bg-gray-50 border-b">
        <h3 className="text-md font-medium text-gray-800">
          {isEditing ? 'Edit Project' : title}
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
      <div className="p-4">
        {isEditing ? (
          // Edit Mode
          <div className="space-y-6">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Project Title</label>
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Enter project title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Enter project description"
                  rows={2}
                />
              </div>
            </div>
            
            {/* Cells */}
            <div className="space-y-4">
              <h4 className="font-medium">Project Cells</h4>
              
              {editedCells.map((cell, index) => (
                <div key={cell.id} className="border rounded-md overflow-hidden">
                  <div className="flex items-center justify-between bg-gray-50 px-3 py-2 border-b">
                    <div className="flex items-center">
                      {cell.type === 'markdown' ? (
                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                      ) : (
                        <Code className="h-4 w-4 mr-2 text-green-500" />
                      )}
                      <span className="text-sm font-medium">
                        {cell.type === 'markdown' ? 'Text Cell' : 'Code Cell'}
                      </span>
                      
                      {cell.type === 'code' && (
                        <select
                          value={cell.language}
                          onChange={(e) => updateCellLanguage(cell.id, e.target.value)}
                          className="ml-2 text-xs border rounded bg-white px-1 py-0.5"
                        >
                          <option value="python">Python</option>
                          <option value="javascript">JavaScript</option>
                          <option value="r">R</option>
                          <option value="sql">SQL</option>
                        </select>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => moveCell(cell.id, 'up')}
                        disabled={index === 0}
                        className={`p-1 rounded hover:bg-gray-200 ${index === 0 ? 'text-gray-300' : 'text-gray-500'}`}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => moveCell(cell.id, 'down')}
                        disabled={index === editedCells.length - 1}
                        className={`p-1 rounded hover:bg-gray-200 ${index === editedCells.length - 1 ? 'text-gray-300' : 'text-gray-500'}`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeCell(cell.id)}
                        className="p-1 rounded hover:bg-gray-200 text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <Textarea
                      value={cell.content}
                      onChange={(e) => updateCellContent(cell.id, e.target.value)}
                      placeholder={cell.type === 'markdown' ? "Enter markdown text..." : "Enter code..."}
                      rows={6}
                      className={`w-full resize-none ${cell.type === 'code' ? 'font-mono text-sm' : ''}`}
                    />
                  </div>
                </div>
              ))}
              
              {/* Add cell buttons */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addCell('markdown', editedCells.length - 1)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Text Cell
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addCell('code', editedCells.length - 1)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Code Cell
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // View Mode (Jupyter Notebook Style)
          <div className="space-y-6">
            <div className="mb-4">
              <h1 className="text-2xl font-bold mb-2">{title}</h1>
              <p className="text-gray-600">{description}</p>
            </div>
            
            {cells.map((cell) => (
              <div key={cell.id} className="border rounded-md overflow-hidden">
                {cell.type === 'markdown' ? (
                  <div className="p-4 prose max-w-none">
                    <ReactMarkdown>{cell.content}</ReactMarkdown>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center bg-gray-800 px-3 py-1 text-white text-xs">
                      <span>{cell.language}</span>
                      {!readOnly && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => executeCodeCell(cell.id)}
                            disabled={executingCell === cell.id}
                            className="h-6 text-xs text-gray-300 hover:text-white hover:bg-gray-700"
                          >
                            {executingCell === cell.id ? (
                              <div className="flex items-center">
                                <div className="w-3 h-3 mr-1 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                                Running...
                              </div>
                            ) : (
                              <>Run</>
                            )}
                          </Button>
                          {cell.output && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => clearOutput(cell.id)}
                              className="h-6 text-xs text-gray-300 hover:text-white hover:bg-gray-700"
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <SyntaxHighlighter
                      language={cell.language}
                      style={vscDarkPlus}
                      customStyle={{ margin: 0, borderRadius: 0 }}
                      showLineNumbers
                    >
                      {cell.content}
                    </SyntaxHighlighter>
                    
                    {cell.output && (
                      <div className="bg-gray-100 p-3 border-t">
                        <pre className="text-sm whitespace-pre-wrap">{cell.output}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectPreview;