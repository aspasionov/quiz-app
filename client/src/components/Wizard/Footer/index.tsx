import { Box, Button } from '@mui/material';

interface WizardFooterProps {
  activeStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  backButtonDisabled?: boolean;
  nextButtonDisabled?: boolean;
  backButtonText?: string;
  nextButtonText?: string;
  showNextButton?: boolean;
}

const WizardFooter = ({
  activeStep,
  totalSteps,
  onBack,
  onNext,
  backButtonDisabled = false,
  nextButtonDisabled = false,
  backButtonText = "Back",
  nextButtonText = "Next",
  showNextButton = true
}: WizardFooterProps) => {
  const isBackDisabled = backButtonDisabled || activeStep === 0;
  const isLastStep = activeStep >= totalSteps - 1;
  const shouldShowNext = showNextButton && !isLastStep;

  return (
    <>
      {/* Add bottom padding to prevent content from being hidden behind fixed buttons */}
      <Box sx={{ pb: 10 }} />
      
      {/* Fixed Navigation Buttons */}
      <Box 
        sx={{ 
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex', 
          justifyContent: 'space-between',
          p: 1,
          backgroundColor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}
      >
        <Button
          disabled={isBackDisabled}
          onClick={onBack}
          variant="outlined"
          size="large"
          sx={{ borderRadius: 2, px: 4, textTransform: 'none' }}
        >
          {backButtonText}
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {shouldShowNext && (
          <Button
            disabled={nextButtonDisabled}
            variant="contained"
            onClick={onNext}
            size="large"
            sx={{ borderRadius: 2, px: 4, textTransform: 'none', fontWeight: 600 }}
          >
            {nextButtonText}
          </Button>
        )}
      </Box>
    </>
  );
};

export default WizardFooter;
