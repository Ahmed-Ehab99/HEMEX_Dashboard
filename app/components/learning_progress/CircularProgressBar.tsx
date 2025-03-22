"use client";

interface CircularProgressBarProps {
  steps: string[];
  currentStep: number;
  onStepChange?: (step: number) => void;
}

const CircularProgressBar = ({
  steps,
  currentStep,
  onStepChange,
}: CircularProgressBarProps) => {
  const handleStepClick = (stepNumber: number) => {
    onStepChange?.(stepNumber);
  };

  return (
    <div className="relative flex items-center justify-between w-full max-w-6xl mx-auto">
      {/* Line connecting the circles */}
      <div className="absolute h-[2px] w-full bg-[#d2d2d2]">
        <div
          className="absolute h-[2px] bg-[#2f006c] transition-all duration-500 ease-in-out"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />
      </div>

      {/* Steps */}
      {steps.map((step, index) => (
        <div key={index} className="relative">
          <button
            onClick={() => handleStepClick(index + 1)}
            className={`
                lg:w-10 lg:h-10 w-8 h-8 rounded-full flex items-center justify-center z-10
                transition-all duration-500 ease-in-out cursor-pointer
                ${
                  index + 1 <= currentStep
                    ? "bg-[#2f006c] text-white"
                    : "bg-[#d2d2d2] hover:bg-gray-400"
                }
                `}
          >
            <span className="lg:text-sm text-xs font-medium">{index + 1}</span>
          </button>
          {/* Step label */}
          <span className="absolute lg:text-sm text-xs font-normal whitespace-nowrap left-1/2 -translate-x-1/2 bottom-full mb-2 uppercase">
            {step}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CircularProgressBar;
