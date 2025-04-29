"use client";

import   { useState } from "react";

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

// --- WhyChooseUsMobile component ---
interface Card {
  title: string;
  image: string;
}

export default function WhyChooseUsMobile() {
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

  return (
    <section className="bg-[#222222] px-4 relative lg:hidden block ">
      <div className="container mx-auto ">
        <h2 className="text-center text-3xl md:text-5xl font-bold pt-12 pb-24">
          <span className="text-white">WHY </span>
          <span className="text-red-600">CHOOSE</span>
          <span className="text-white"> US?</span>
        </h2>

        <div
          className="relative mt-20 flex justify-center items-center w-full md:w-96 h-64 md:h-[28rem] mx-auto"
          style={{
            perspective: "3000px",
            perspectiveOrigin: "center",
            transform: "rotateX(-20deg)",
            transformStyle: "preserve-3d",
            transformOrigin: "center center",
          }}
        >
       <div
  className="w-[250px]  h-[250px] transition-transform duration-500"
  style={{
    transformStyle: "preserve-3d",
    transform: `rotateY(${rotation}deg) translateZ(0)`,
    transformOrigin: "center center",
  }}
>
            {cards.map((card, index) => {
              const angle = (360 / cards.length) * index;
              return (
                <div
                  key={index}
                  className="absolute  top-0 left-0 w-48 md:w-64 lg:w-[250px] h-48 md:h-64 lg:h-[253px] overflow-hidden shadow-lg"
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(${
                     180
                    }px)`,
                    backfaceVisibility: "hidden",
                    transformOrigin: "center center", // explicitly set the origin
                  }}
                >
                  <CurvedCard title={card.title} image={card.image} />
                </div>
              );
            })}
          </div>
         
        </div>
        <img
        src="/card.png"
       
        className="absolute left-[0] lg:left-[75%]  lg:w-[780.2px] top-44 cursor-pointer"
        // onClick={rotateLeft}
        alt="Rotate Left"
      />
      </div>

      <img
        src="/left.png"
        className="absolute left-[35%] top-1/4 w-12 md:w-20 cursor-pointer"
        onClick={rotateLeft}
        alt="Rotate Left"
      />

      <img
        src="/right.png"
        className="absolute right-[35%] top-1/4 w-12 md:w-20 cursor-pointer z-[1000]"
        onClick={rotateRight}
        alt="Rotate Right"
      />
    </section>
  );
}
 