import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Edit, Eye, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface LessonPreviewProps {
  content: string;
  onSave?: (newContent: string) => void;
  readOnly?: boolean;
}

const LessonPreview: React.FC<LessonPreviewProps> = ({ 
  content, 
  onSave,
  readOnly = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleSave = () => {
    if (onSave) {
      onSave(editedContent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Preview/Edit Header */}
      <div className="flex justify-between items-center p-3 bg-gray-50 border-b">
        <h3 className="text-md font-medium text-gray-800">
          {isEditing ? 'Edit Lesson Content' : 'Lesson Preview'}
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
      
      {/* Content Display/Edit */}
      <div className="p-4">
        {isEditing ? (
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[400px] font-mono text-sm"
          />
        ) : (
          <div className="prose max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonPreview;