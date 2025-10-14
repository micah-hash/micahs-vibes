'use client';

import { useState, useEffect, useRef } from 'react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: '👋 Welcome to Automated Testing!',
    description: 'This droplet helps you automatically test your critical business flows in Fluid. Let\'s get you set up in just a few steps!',
    target: 'body',
    position: 'bottom',
  },
  {
    id: 'enable-tests',
    title: '✅ Step 1: Enable Tests',
    description: 'Start by checking the boxes next to the tests you want to run. Each test monitors a specific flow like purchases, subscriptions, or authentication.',
    target: '[data-tour="test-card"]',
    position: 'top',
  },
  {
    id: 'configure-settings',
    title: '⚙️ Step 2: Configure Test Settings',
    description: 'Click "Configure Test Settings" to select which products to test. For subscriptions, you can also choose the billing interval.',
    target: '[data-tour="settings-button"]',
    position: 'top',
  },
  {
    id: 'set-schedule',
    title: '⏰ Step 3: Set Your Schedule',
    description: 'Choose how often you want the tests to run - every 30 minutes, hourly, daily, or every other day. Tests will run automatically in the background.',
    target: '[data-tour="schedule-selector"]',
    position: 'top',
  },
  {
    id: 'email-notifications',
    title: '📧 Step 4: Add Email Recipients',
    description: 'Enter email addresses to receive notifications when tests complete. You\'ll get detailed reports with pass/fail results.',
    target: '[data-tour="email-input"]',
    position: 'bottom',
  },
  {
    id: 'save-and-run',
    title: '🚀 Step 5: Save & Start Testing',
    description: 'Click "Save Configuration" to schedule your tests. You can also click "Run Now" to test immediately. View results in the "Test Results" tab!',
    target: '[data-tour="save-button"]',
    position: 'bottom',
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
  onStepChange?: (stepId: string) => void;
}

export default function OnboardingTour({ onComplete, onSkip, onStepChange }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isCalculating, setIsCalculating] = useState(true);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    return () => window.removeEventListener('resize', calculatePosition);
  }, [currentStep]);

  useEffect(() => {
    // Notify parent of initial step when tour first loads
    if (onStepChange && currentStep === 0) {
      onStepChange('welcome');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  useEffect(() => {
    // Disable scrolling when tour is active
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Re-enable scrolling when tour unmounts
      document.body.style.overflow = '';
    };
  }, []);

  const calculatePosition = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const targetElement = document.querySelector(step.target);
      if (!targetElement || !tooltipRef.current) {
        // Fallback to center of screen
        setTooltipPosition({
          top: window.innerHeight / 2 - 100,
          left: window.innerWidth / 2 - 200,
        });
        setIsCalculating(false);
        return;
      }

      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      let top = 0;
      let left = 0;
      const spacing = 30; // Increased spacing to prevent overlap

      switch (step.position) {
        case 'top':
          top = targetRect.top - tooltipRect.height - spacing;
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
          break;
        case 'bottom':
          top = targetRect.bottom + spacing;
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
          break;
        case 'left':
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
          left = targetRect.left - tooltipRect.width - spacing;
          break;
        case 'right':
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
          left = targetRect.right + spacing;
          break;
      }

      // Keep tooltip within viewport
      const padding = 20;
      top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));

      setTooltipPosition({ top, left });
      setIsCalculating(false);
    }, 100);
  };

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      const nextStepId = TOUR_STEPS[currentStep + 1].id;
      // Notify parent to prepare UI for next step
      if (onStepChange) {
        onStepChange(nextStepId);
      }
      // Give UI time to update before transitioning
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 400);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStepId = TOUR_STEPS[currentStep - 1].id;
      // Notify parent to prepare UI for previous step
      if (onStepChange) {
        onStepChange(prevStepId);
      }
      // Give UI time to update before transitioning
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
      }, 400);
    }
  };

  const getHighlightElement = () => {
    if (step.target === 'body') return null;
    const element = document.querySelector(step.target);
    if (!element) return null;
    return element.getBoundingClientRect();
  };

  const highlightRect = getHighlightElement();

  return (
    <>
      {/* Dark Overlay with Spotlight */}
      <div className="fixed inset-0 z-[9998]">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {highlightRect && (
                <rect
                  x={highlightRect.left - 8}
                  y={highlightRect.top - 8}
                  width={highlightRect.width + 16}
                  height={highlightRect.height + 16}
                  rx="16"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Highlight Border */}
        {highlightRect && (
          <div
            className="absolute border-4 border-blue-500 rounded-2xl pointer-events-none transition-all duration-500 shadow-[0_0_0_4px_rgba(59,130,246,0.3)]"
            style={{
              top: highlightRect.top - 8,
              left: highlightRect.left - 8,
              width: highlightRect.width + 16,
              height: highlightRect.height + 16,
            }}
          />
        )}
      </div>

      {/* Floating Tooltip */}
      <div
        ref={tooltipRef}
        className={`fixed z-[9999] transition-all duration-500 ${isCalculating ? 'opacity-0' : 'opacity-100'}`}
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        }}
      >
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-blue-200/50 p-6 max-w-md">
          {/* Decorative gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent rounded-3xl pointer-events-none"></div>

          {/* Content */}
          <div className="relative">
            {/* Step Counter */}
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Step {currentStep + 1} of {TOUR_STEPS.length}
              </div>
              <button
                onClick={onSkip}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold transition-colors"
              >
                Skip Tour
              </button>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {step.title}
            </h3>

            {/* Description */}
            <p className="text-gray-700 mb-6 leading-relaxed">
              {step.description}
            </p>

            {/* Progress Dots */}
            <div className="flex items-center gap-2 mb-6">
              {TOUR_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-500'
                      : index < currentStep
                      ? 'w-2 bg-blue-300'
                      : 'w-2 bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="px-4 py-2 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-0 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <button
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
              >
                {isLastStep ? '🎉 Start Testing!' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

