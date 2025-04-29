"use client";

import { Carousel } from "@/components/ui/carousal-new";
export function CarouselDemo({slides,current,setCurrent,handlePreviousClick,handleNextClick,handleSlideClick}:any) {
  
  return (
    <div className="relative overflow-hidden lg:w-2/3 w-full mx-auto h-full py-16">
      <Carousel slides={slides} current={current} setCurrent={setCurrent} handlePreviousClick={handlePreviousClick} handleNextClick={handleNextClick} handleSlideClick={handleSlideClick} />
    </div>
  );
}
