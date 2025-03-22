"use client";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

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
    <div className="relative flex items-center w-full max-w-6xl mx-auto">
      {/* Line connecting the circles */}
      <div className="absolute lg:bottom-5 bottom-4 h-[2px] w-full bg-[#2f006c]">
        {/* <div
          className="absolute h-[2px] bg-[#2f006c] transition-all duration-500 ease-in-out"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        /> */}
      </div>

      <Swiper
        modules={[Mousewheel]}
        mousewheel={true}
        slidesPerView={3}
        breakpoints={{
          320: { slidesPerView: 1 },
          1024: { slidesPerView: 2 },
          1280: { slidesPerView: 3 },
          1440: { slidesPerView: 4 },
        }}
        className="relative"
      >
        {/* Steps */}
        {steps.map((step, index) => (
          <SwiperSlide
            key={index}
            className="relative flex flex-col items-center"
          >
            {/* Step label */}
            <span className="lg:text-sm text-xs whitespace-nowrap">{step}</span>

            <button
              onClick={() => handleStepClick(index + 1)}
              className={`
              lg:w-10 lg:h-10 w-8 h-8 rounded-full flex items-center justify-center z-10
              transition-all duration-500 ease-in-out cursor-pointer border border-[#2f006c]
              ${
                index + 1 <= currentStep
                  ? "bg-[#2f006c] text-white"
                  : "bg-[#d2d2d2] hover:bg-gray-400"
              }
            `}
            >
              <span className="lg:text-sm text-xs font-medium">
                {index + 1}
              </span>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CircularProgressBar;
