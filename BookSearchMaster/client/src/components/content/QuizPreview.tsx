import React, { useState } from 'react';
import { Edit, Save, X, Circle, CheckCircle, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// This assumes a quiz format with question and multiple choice answers
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

interface QuizPreviewProps {
  title: string;
  description?: string;
  questions: QuizQuestion[];
  onSave?: (updatedQuiz: { title: string, description: string, questions: QuizQuestion[] }) => void;
  readOnly?: boolean;
}

const QuizPreview: React.FC<QuizPreviewProps> = ({
  title,
  description = '',
  questions,
  onSave,
  readOnly = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);
  const [editedQuestions, setEditedQuestions] = useState<QuizQuestion[]>(questions);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [showResults, setShowResults] = useState(false);

  const handleSave = () => {
    if (onSave) {
      onSave({
        title: editedTitle,
        description: editedDescription,
        questions: editedQuestions
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(title);
    setEditedDescription(description);
    setEditedQuestions(questions);
    setIsEditing(false);
  };

  const handleQuestionChange = (index: number, field: keyof QuizQuestion, value: any) => {
    const updatedQuestions = [...editedQuestions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setEditedQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...editedQuestions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setEditedQuestions(updatedQuestions);
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...editedQuestions];
    updatedQuestions[questionIndex].options.push('New option');
    setEditedQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...editedQuestions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    
    // Adjust correct answer index if necessary
    if (updatedQuestions[questionIndex].correctAnswerIndex === optionIndex) {
      updatedQuestions[questionIndex].correctAnswerIndex = 0;
    } else if (updatedQuestions[questionIndex].correctAnswerIndex > optionIndex) {
      updatedQuestions[questionIndex].correctAnswerIndex--;
    }
    
    setEditedQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setEditedQuestions([
      ...editedQuestions,
      {
        question: 'New question',
        options: ['Option 1', 'Option 2', 'Option 3'],
        correctAnswerIndex: 0
      }
    ]);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...editedQuestions];
    updatedQuestions.splice(index, 1);
    setEditedQuestions(updatedQuestions);
  };

  const setCorrectAnswer = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...editedQuestions];
    updatedQuestions[questionIndex].correctAnswerIndex = optionIndex;
    setEditedQuestions(updatedQuestions);
  };

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    if (isEditing || readOnly) return;
    
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[questionIndex] = optionIndex;
    setSelectedAnswers(newSelectedAnswers);
  };

  const checkAnswers = () => {
    setShowResults(true);
  };

  const resetQuiz = () => {
    setSelectedAnswers(new Array(questions.length).fill(-1));
    setShowResults(false);
  };

  const getScore = () => {
    return questions.reduce((score, question, index) => {
      return score + (selectedAnswers[index] === question.correctAnswerIndex ? 1 : 0);
    }, 0);
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <div className="flex justify-between items-center p-3 bg-gray-50 border-b">
        <h3 className="text-md font-medium text-gray-800">
          {isEditing ? 'Edit Quiz' : 'Quiz Preview'}
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
          <div className="space-y-6">
            {/* Quiz Title & Description */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Quiz Title</label>
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Enter quiz title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Enter quiz description"
                  rows={3}
                />
              </div>
            </div>
            
            {/* Questions */}
            <div className="space-y-6">
              <h4 className="font-medium">Questions</h4>
              
              {editedQuestions.map((question, qIndex) => (
                <div key={qIndex} className="border rounded-md p-4 space-y-4 relative">
                  <button 
                    onClick={() => removeQuestion(qIndex)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Question {qIndex + 1}</label>
                    <Textarea
                      value={question.question}
                      onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                      placeholder="Enter question"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium">Options</label>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center space-x-2">
                        <button
                          onClick={() => setCorrectAnswer(qIndex, oIndex)}
                          className="flex-shrink-0"
                        >
                          {question.correctAnswerIndex === oIndex ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-300" />
                          )}
                        </button>
                        <Input
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                          className="flex-grow"
                        />
                        {question.options.length > 2 && (
                          <button 
                            onClick={() => removeOption(qIndex, oIndex)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addOption(qIndex)}
                      className="mt-2"
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Option
                    </Button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Explanation (Optional)</label>
                    <Textarea
                      value={question.explanation || ''}
                      onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                      placeholder="Add explanation for the correct answer"
                    />
                  </div>
                </div>
              ))}
              
              <Button variant="outline" onClick={addQuestion}>
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Question
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quiz Title & Description */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">{title}</h3>
              {description && <p className="text-gray-600">{description}</p>}
            </div>
            
            {/* Questions */}
            <div className="space-y-8">
              {questions.map((question, qIndex) => (
                <div key={qIndex} className="space-y-3 pb-4 border-b last:border-b-0">
                  <h4 className="font-medium">Question {qIndex + 1}: {question.question}</h4>
                  
                  <div className="space-y-2 ml-1">
                    {question.options.map((option, oIndex) => (
                      <div 
                        key={oIndex} 
                        className={`flex items-center p-2 rounded cursor-pointer ${
                          selectedAnswers[qIndex] === oIndex 
                            ? 'bg-purple-50 border border-purple-200' 
                            : 'hover:bg-gray-50'
                        } ${
                          showResults && oIndex === question.correctAnswerIndex
                            ? 'bg-green-50 border border-green-200'
                            : ''
                        } ${
                          showResults && selectedAnswers[qIndex] === oIndex && oIndex !== question.correctAnswerIndex
                            ? 'bg-red-50 border border-red-200'
                            : ''
                        }`}
                        onClick={() => handleSelectAnswer(qIndex, oIndex)}
                      >
                        <div className="mr-2 flex-shrink-0">
                          {selectedAnswers[qIndex] === oIndex ? (
                            <CheckCircle className={`h-5 w-5 ${
                              showResults && oIndex !== question.correctAnswerIndex
                                ? 'text-red-500'
                                : 'text-purple-500'
                            }`} />
                          ) : (
                            showResults && oIndex === question.correctAnswerIndex ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-300" />
                            )
                          )}
                        </div>
                        <span>{option}</span>
                      </div>
                    ))}
                  </div>
                  
                  {showResults && question.explanation && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm">
                      <p className="font-medium">Explanation:</p>
                      <p>{question.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Controls */}
            {!readOnly && !isEditing && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                {showResults ? (
                  <>
                    <div className="text-lg font-medium">
                      Score: {getScore()}/{questions.length} ({Math.round((getScore() / questions.length) * 100)}%)
                    </div>
                    <Button onClick={resetQuiz}>Retry Quiz</Button>
                  </>
                ) : (
                  <>
                    <div className="text-sm text-gray-500">
                      {selectedAnswers.filter(a => a !== -1).length} of {questions.length} questions answered
                    </div>
                    <Button 
                      onClick={checkAnswers}
                      disabled={selectedAnswers.includes(-1)}
                    >
                      Check Answers
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPreview;