import { useEffect, useState } from "react";
import CTAButtons from "./CTAButtons";

const Hero = () => {
  const [initialDone, setInitialDone] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const initialText = "made for every business.";

  const loopWords = ["freelancer", "startup", "enterprise", "business"];
  const [loopIndex, setLoopIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dynamicText, setDynamicText] = useState("");

  // Typing out initial line
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(initialText.slice(0, index + 1));
      index++;
      if (index === initialText.length) {
        clearInterval(interval);
        setTimeout(() => setInitialDone(true), 600);
      }
    }, 70);
    return () => clearInterval(interval);
  }, []);

  // After initial animation, start loop
  useEffect(() => {
    if (!initialDone) return;

    const currentWord = loopWords[wordIndex];
    let timeout: NodeJS.Timeout;

    if (isDeleting) {
      timeout = setTimeout(() => {
        setDynamicText(currentWord.substring(0, loopIndex - 1));
        setLoopIndex(loopIndex - 1);
      }, 80);
    } else {
      timeout = setTimeout(() => {
        setDynamicText(currentWord.substring(0, loopIndex + 1));
        setLoopIndex(loopIndex + 1);
      }, 100);
    }

    if (!isDeleting && loopIndex === currentWord.length) {
      setTimeout(() => setIsDeleting(true), 1200);
    } else if (isDeleting && loopIndex === 0) {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % loopWords.length);
    }

    return () => clearTimeout(timeout);
  }, [loopIndex, isDeleting, wordIndex, initialDone]);

  return (
    <section id="herosection" className="pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-8 sm:pb-12 md:pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#052B45] leading-tight mb-4 sm:mb-6 md:mb-8">
            One app for all your billing needs,{" "}
            <span className="block text-black-600 min-h-[32px] sm:min-h-[40px] md:min-h-[48px] lg:min-h-[56px] xl:min-h-[64px]">
              {initialDone ? (
                <>
                  made for every{" "}
                  <span className="text-primary">{dynamicText}</span>
                  <span className="animate-pulse inline-block w-[2px] bg-black ml-1 h-4 sm:h-5 md:h-6 lg:h-7 xl:h-8 align-bottom" />
                </>
              ) : (
                <>
                  {displayedText}
                  <span className="animate-pulse inline-block w-[2px] bg-black ml-1 h-4 sm:h-5 md:h-6 lg:h-7 xl:h-8 align-bottom" />
                </>
              )}
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-black/64 max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 leading-relaxed px-4 sm:px-0">
            Create, manage, and track invoices effortlessly—
            <span className="block mt-1 sm:mt-2">whether you're a freelancer, startup, or enterprise.</span>
          </p>

          <div className="px-4 sm:px-0">
            <CTAButtons />
          </div>
        </div>
      </div>

      {/* Responsive floating elements */}
      <div className="absolute top-16 sm:top-20 left-4 sm:left-10 opacity-20 animate-bounce-slow [animation-delay:1s] hidden sm:block">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/30 rounded-lg"></div>
      </div>
      <div className="absolute top-32 sm:top-40 right-4 sm:right-20 opacity-20 animate-bounce-slow [animation-delay:2s] hidden sm:block">
        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-accent/30 rounded-full"></div>
      </div>
      <div className="absolute bottom-16 sm:bottom-20 left-4 sm:left-20 opacity-20 animate-bounce-slow [animation-delay:3s] hidden sm:block">
        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-primary/40 rounded-sm"></div>
      </div>
    </section>
  );
};

export default Hero;

