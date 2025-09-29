import { useEffect, useState } from "react";
import CTAButtons from "./CTAButtons";

const Hero = () => {
  const [initialDone, setInitialDone] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const initialText = "made for every business.";

  const loopWords = ["startup", "enterprise", "business"];
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
    <section id="herosection" className="pt-30 pb-00 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-4xl lg:text-5xl font-bold text-[#052B45] leading-tight mb-6">
            One app for all your billing needs,{" "}
            <span className="block text-black-600 min-h-[48px]">
              {initialDone ? (
                <>
                  made for every{" "}
                  <span >{dynamicText}</span>
                  <span className="animate-pulse inline-block w-[2px] bg-black ml-1 h-6 align-bottom" />
                </>
              ) : (
                <>
                  {displayedText}
                  <span className="animate-pulse inline-block w-[2px] bg-black ml-1 h-6 align-bottom" />
                </>
              )}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-black/64 max-w-2xl mx-auto mb-8 leading-relaxed">
            Create, manage, and track invoices effortlessly
            <span className="block">whether you're building a startup, or enterprise.</span>
          </p>

          <CTAButtons />
        </div>
      </div>

      {/* <div className="absolute top-20 left-10 opacity-20 animate-bounce-slow [animation-delay:1s]">
        <div className="w-8 h-8 bg-primary/30 rounded-lg"></div>
      </div>
      <div className="absolute top-40 right-20 opacity-20 animate-bounce-slow [animation-delay:2s]">
        <div className="w-6 h-6 bg-accent/30 rounded-full"></div>
      </div>
      <div className="absolute bottom-20 left-20 opacity-20 animate-bounce-slow [animation-delay:3s]">
        <div className="w-4 h-4 bg-primary/40 rounded-sm"></div>
      </div> */}
      
    </section>
  );
};

export default Hero;

