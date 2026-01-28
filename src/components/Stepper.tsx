import React from 'react';
import { Check } from 'lucide-react';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                index < currentStep
                  ? 'bg-[#1e40af] text-white'
                  : index === currentStep
                  ? 'bg-[#2563eb] text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {index < currentStep ? (
                <Check className="h-5 w-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span className={`mt-2 text-sm ${index <= currentStep ? 'text-[#1e40af]' : 'text-gray-400'}`}>
              {step}
            </span>
          </div>
          
          {index < steps.length - 1 && (
            <div
              className={`w-24 h-0.5 mx-4 mb-6 ${
                index < currentStep ? 'bg-[#1e40af]' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
