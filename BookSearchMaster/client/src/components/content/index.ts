import LessonPreview from './LessonPreview';
import QuizPreview from './QuizPreview';
import ProgrammingExercisePreview from './ProgrammingExercisePreview';
import ProjectPreview from './ProjectPreview';

export {
  LessonPreview,
  QuizPreview,
  ProgrammingExercisePreview,
  ProjectPreview
};

// Helper function to determine which preview component to use based on content type
export const getPreviewComponentForType = (type: string) => {
  switch(type.toLowerCase()) {
    case 'lesson':
      return LessonPreview;
    case 'quiz':
      return QuizPreview;
    case 'exercise':
    case 'programming exercise':
      return ProgrammingExercisePreview;
    case 'project':
      return ProjectPreview;
    default:
      return LessonPreview; // Default to lesson preview
  }
};