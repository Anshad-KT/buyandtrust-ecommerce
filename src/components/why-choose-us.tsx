"use client";

import React, { useState } from "react";
import { CarouselDemo } from "./animated/Carousel";

// --- Reusable CurvedCard component ---
interface CurvedCardProps {
  title: string;
  image: string;
}

const CurvedCard: React.FC<CurvedCardProps> = ({ title, image }) => {
  return (
    <div
      className="relative w-80 h-96 rounded-lg overflow-hidden"
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {/* Front Side */}
      <div
        className="absolute inset-0 w-full h-full bg-red-700 rounded-lg"
        style={{
          backfaceVisibility: "hidden",
        }}
      >
        <div className="p-5 text-white z-10 relative">
          <h2 className="text-xl font-bold leading-tight">{title}</h2>
        </div>
        <div
          className="absolute top-0 right-0 w-2/3 h-full bg-no-repeat bg-center bg-cover"
          style={{
            backgroundImage: `url('${image}')`,
            clipPath: 'path("M 0% 0% H 70% Q 100% 0%, 100% 30% V 100% H 0% Z")',
          }}
        />
      </div>
    </div>
  );
};

// --- WhyChooseUs component ---
interface Card {
  title: string;
  image: string;
}

export default function WhyChooseUs() {
  const cards: Card[] = [
    { title: "Athletic Wear", image: "https://s3-alpha-sig.figma.com/img/f602/ce45/620426807ab515ecafd5f9151be40eef?Expires=1737936000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=b5-yMWmlouj7HPJjez7rmFsdgYncfZEeR2r4cPt1QbzeFnrsFUSFvP4tnmUgvGYN-22RjfFu-FbefOfLbA2rdlUQFy8ACkP6B~Js8W6RN9b6s5xR78O2BL~-LYrAM-Ozm9xDLUHeTRr4L0D-1EUQnn5qWNG4ExCCplHY7UBVcrMiDWycXkik2sW0eIv9nB6mATGUPuvoqHzeI3wmtRHdK-zF6nvfV7IXJyZDZOUOCsLuIO8PbckU161yWiIPZwR~VqXwR6pa2GD~y7-kzuRCnq6d-b9B~5GPI65sa~Il19vB2JMEuhfTCZDPAzGJHxgqYQTxFwb26LQ7ZZ6071Lhfw__" },
    { title: "School Sports Uniforms", image: "https://s3-alpha-sig.figma.com/img/f602/ce45/620426807ab515ecafd5f9151be40eef?Expires=1737936000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=b5-yMWmlouj7HPJjez7rmFsdgYncfZEeR2r4cPt1QbzeFnrsFUSFvP4tnmUgvGYN-22RjfFu-FbefOfLbA2rdlUQFy8ACkP6B~Js8W6RN9b6s5xR78O2BL~-LYrAM-Ozm9xDLUHeTRr4L0D-1EUQnn5qWNG4ExCCplHY7UBVcrMiDWycXkik2sW0eIv9nB6mATGUPuvoqHzeI3wmtRHdK-zF6nvfV7IXJyZDZOUOCsLuIO8PbckU161yWiIPZwR~VqXwR6pa2GD~y7-kzuRCnq6d-b9B~5GPI65sa~Il19vB2JMEuhfTCZDPAzGJHxgqYQTxFwb26LQ7ZZ6071Lhfw__" },
    { title: "Event T-Shirts", image: "https://s3-alpha-sig.figma.com/img/f602/ce45/620426807ab515ecafd5f9151be40eef?Expires=1737936000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=b5-yMWmlouj7HPJjez7rmFsdgYncfZEeR2r4cPt1QbzeFnrsFUSFvP4tnmUgvGYN-22RjfFu-FbefOfLbA2rdlUQFy8ACkP6B~Js8W6RN9b6s5xR78O2BL~-LYrAM-Ozm9xDLUHeTRr4L0D-1EUQnn5qWNG4ExCCplHY7UBVcrMiDWycXkik2sW0eIv9nB6mATGUPuvoqHzeI3wmtRHdK-zF6nvfV7IXJyZDZOUOCsLuIO8PbckU161yWiIPZwR~VqXwR6pa2GD~y7-kzuRCnq6d-b9B~5GPI65sa~Il19vB2JMEuhfTCZDPAzGJHxgqYQTxFwb26LQ7ZZ6071Lhfw__" },
    { title: "Athletic Wear", image: "https://s3-alpha-sig.figma.com/img/f602/ce45/620426807ab515ecafd5f9151be40eef?Expires=1737936000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=b5-yMWmlouj7HPJjez7rmFsdgYncfZEeR2r4cPt1QbzeFnrsFUSFvP4tnmUgvGYN-22RjfFu-FbefOfLbA2rdlUQFy8ACkP6B~Js8W6RN9b6s5xR78O2BL~-LYrAM-Ozm9xDLUHeTRr4L0D-1EUQnn5qWNG4ExCCplHY7UBVcrMiDWycXkik2sW0eIv9nB6mATGUPuvoqHzeI3wmtRHdK-zF6nvfV7IXJyZDZOUOCsLuIO8PbckU161yWiIPZwR~VqXwR6pa2GD~y7-kzuRCnq6d-b9B~5GPI65sa~Il19vB2JMEuhfTCZDPAzGJHxgqYQTxFwb26LQ7ZZ6071Lhfw__" },
    { title: "School Sports Uniforms", image: "https://s3-alpha-sig.figma.com/img/f602/ce45/620426807ab515ecafd5f9151be40eef?Expires=1737936000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=b5-yMWmlouj7HPJjez7rmFsdgYncfZEeR2r4cPt1QbzeFnrsFUSFvP4tnmUgvGYN-22RjfFu-FbefOfLbA2rdlUQFy8ACkP6B~Js8W6RN9b6s5xR78O2BL~-LYrAM-Ozm9xDLUHeTRr4L0D-1EUQnn5qWNG4ExCCplHY7UBVcrMiDWycXkik2sW0eIv9nB6mATGUPuvoqHzeI3wmtRHdK-zF6nvfV7IXJyZDZOUOCsLuIO8PbckU161yWiIPZwR~VqXwR6pa2GD~y7-kzuRCnq6d-b9B~5GPI65sa~Il19vB2JMEuhfTCZDPAzGJHxgqYQTxFwb26LQ7ZZ6071Lhfw__" },
    { title: "Event T-Shirts", image: "https://s3-alpha-sig.figma.com/img/f602/ce45/620426807ab515ecafd5f9151be40eef?Expires=1737936000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=b5-yMWmlouj7HPJjez7rmFsdgYncfZEeR2r4cPt1QbzeFnrsFUSFvP4tnmUgvGYN-22RjfFu-FbefOfLbA2rdlUQFy8ACkP6B~Js8W6RN9b6s5xR78O2BL~-LYrAM-Ozm9xDLUHeTRr4L0D-1EUQnn5qWNG4ExCCplHY7UBVcrMiDWycXkik2sW0eIv9nB6mATGUPuvoqHzeI3wmtRHdK-zF6nvfV7IXJyZDZOUOCsLuIO8PbckU161yWiIPZwR~VqXwR6pa2GD~y7-kzuRCnq6d-b9B~5GPI65sa~Il19vB2JMEuhfTCZDPAzGJHxgqYQTxFwb26LQ7ZZ6071Lhfw__" },
  ];

  const [rotation, setRotation] = useState(0);

  const rotateLeft = () => setRotation((prev) => prev + 60); // Adjust angle as needed
  const rotateRight = () => setRotation((prev) => prev - 60);
  const [current, setCurrent] = useState(1);
  const slideData = [
    {
      title: "School Sports Uniforms",
      button: "Explore Component",
      src: "/cricket.jpeg",
    },
    {
      title: "Event T-Shirts",
      button: "Explore Component",
      src: "/vollyball.jpeg",
    },
    {
      title: "Athletic Wear",
      button: "Explore Component",
      src: "/football.jpeg",
    },
    {
      title: "Corporate T-Shirts",
      button: "Explore Component",
      src: "/1.jpeg",
    },
    {
      title: "Customized Jackets, Tracksuits & Shorts",
      button: "Explore Component",
      src: "/2.jpeg",
    },
    
    {
      title: "Catering Uniforms",
      button: "Explore Component",
      src: "/3.jpeg",
    },
    
     
  ];
  const handlePreviousClick = () => {
    const previous = current - 1;
    setCurrent(previous < 0 ? slideData.length - 1 : previous);
  };

  const handleNextClick = () => {
    const next = current + 1;
    setCurrent(next === slideData.length ? 0 : next);
  };

  const handleSlideClick = (index: number) => {
    if (current !== index) {
      setCurrent(index);
    }
  };
  return (
    <section className="bg-[#222222] px-4 relative  ">
      <div className="container mx-auto">
        <h2 className="text-center text-3xl md:text-5xl font-bold lg:pt-0 pt-12 lg:mb-12">
          <span className="text-white">WHY </span>
          <span className="text-red-600">CHOOSE</span>
          <span className="text-white"> US?</span>
        </h2>
        <CarouselDemo slides={slideData} current={current} setCurrent={setCurrent} handlePreviousClick={handlePreviousClick} handleNextClick={handleNextClick} handleSlideClick={handleSlideClick} />
        
       
      </div>

      {/* Left Button */}
      <img
        src="/left.png"
        width={80}
        className="absolute left-[7%] top-1/2 cursor-pointer"
        onClick={handlePreviousClick}
        alt="Rotate Left"
      />

      {/* Right Button */}
      <img
        src="/right.png"
        width={80}
        className="absolute right-[7%] top-1/2 cursor-pointer z-[1000]"
        onClick={handleNextClick}
        alt="Rotate Right"
      />
    </section>
  );
}
