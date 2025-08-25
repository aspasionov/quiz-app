import { ReactNode } from 'react';
import { Control, FieldErrors } from 'react-hook-form';
import { Question } from '@/types';
import { GeneralStep, type QuizInfoFormData } from './steps/GeneralStep';
import { QuestionsStep } from './steps/QuestionsStep';
import { ReviewStep } from './steps/ReviewStep';

export interface StepRendererProps {
  step: number;
  
  // General step props
  control: Control<QuizInfoFormData>;
  errors: FieldErrors<QuizInfoFormData>;
  watchedValues: QuizInfoFormData;
  availableTags: string[];
  isLoadingTags: boolean;
  
  // Questions step props
  questions: Question[];
  expandedAccordion: string | false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onQuestionChange: (index: number, field: keyof Question, value: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onOptionChange: (questionIndex: number, optionIndex: number, field: keyof Question['options'][0], value: any) => void;
  onCorrectAnswerChange: (questionIndex: number, optionIndex: number) => void;
  onAddOption: (questionIndex: number) => void;
  onRemoveOption: (questionIndex: number, optionIndex: number) => void;
  onAddQuestion: () => void;
  onDeleteQuestion: (index: number) => void;
  onAccordionChange: (questionId: string, isExpanded: boolean) => void;
  isQuestionValid: (question: Question) => boolean;
  
  // Review step props
  tags: string[];
  calculateMaxPoints: () => number;
  onSave: () => void;
  saving: boolean;
  isNewQuiz: boolean;
}

export const renderStepContent = (props: StepRendererProps): ReactNode => {
  const {
    step,
    control,
    errors,
    watchedValues,
    availableTags,
    isLoadingTags,
    questions,
    expandedAccordion,
    onQuestionChange,
    onOptionChange,
    onCorrectAnswerChange,
    onAddOption,
    onRemoveOption,
    onAddQuestion,
    onDeleteQuestion,
    onAccordionChange,
    isQuestionValid,
    tags,
    calculateMaxPoints,
    onSave,
    saving,
    isNewQuiz,
  } = props;

  switch (step) {
    case 0:
      return (
        <GeneralStep
          control={control}
          errors={errors}
          watchedValues={watchedValues}
          availableTags={availableTags}
          isLoadingTags={isLoadingTags}
        />
      );

    case 1:
      return (
        <QuestionsStep
          questions={questions}
          expandedAccordion={expandedAccordion}
          onQuestionChange={onQuestionChange}
          onOptionChange={onOptionChange}
          onCorrectAnswerChange={onCorrectAnswerChange}
          onAddOption={onAddOption}
          onRemoveOption={onRemoveOption}
          onAddQuestion={onAddQuestion}
          onDeleteQuestion={onDeleteQuestion}
          onAccordionChange={onAccordionChange}
          isQuestionValid={isQuestionValid}
        />
      );

    case 2:
      return (
        <ReviewStep
          watchedValues={watchedValues}
          tags={tags}
          questions={questions}
          calculateMaxPoints={calculateMaxPoints}
          onSave={onSave}
          saving={saving}
          isNewQuiz={isNewQuiz}
        />
      );

    default:
      return null;
  }
};
