import { ReactNode } from 'react';
import {
  Box,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
} from '@mui/material';
import WizardFooter from './Footer';

export interface WizardProps {
  // Core wizard props
  title: string;
  steps: string[];
  activeStep: number;
  onBack: () => void;
  onNext: () => void;
  
  // Step content rendering
  children: ReactNode;
  isInitialized?: boolean;
  loadingContent?: ReactNode;
  
  // Header customization
  titlePrefix?: ReactNode; // Icon or button to show before the title
  headerActions?: ReactNode; // Actions to show on the right side
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  // Footer customization
  backButtonDisabled?: boolean;
  nextButtonDisabled?: boolean;
  showNextButton?: boolean;
  backButtonText?: string;
  nextButtonText?: string;
}

const Wizard = ({
  title,
  steps,
  activeStep,
  onBack,
  onNext,
  children,
  isInitialized = true,
  loadingContent,
  titlePrefix,
  headerActions,
  maxWidth = 'lg',
  backButtonDisabled,
  nextButtonDisabled,
  showNextButton,
  backButtonText,
  nextButtonText,
}: WizardProps) => {
  const defaultLoadingContent = (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <Typography variant="body1">Loading...</Typography>
    </Box>
  );

  return (
    <Container maxWidth={maxWidth} sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {titlePrefix && (
            <Box sx={{ mr: 2 }}>
              {titlePrefix}
            </Box>
          )}
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        
        {headerActions && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {headerActions}
          </Box>
        )}
      </Box>

      {/* Stepper */}
      <Paper elevation={1} sx={{ p: 1, borderRadius: 3, mb: 1 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 1 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <Box sx={{ mb: 1 }}>
        {isInitialized ? children : (loadingContent || defaultLoadingContent)}
      </Box>

      {/* Footer Navigation */}
      <WizardFooter
        activeStep={activeStep}
        totalSteps={steps.length}
        onBack={onBack}
        onNext={onNext}
        backButtonDisabled={backButtonDisabled}
        nextButtonDisabled={nextButtonDisabled}
        showNextButton={showNextButton}
        backButtonText={backButtonText}
        nextButtonText={nextButtonText}
      />
    </Container>
  );
};

export default Wizard;
