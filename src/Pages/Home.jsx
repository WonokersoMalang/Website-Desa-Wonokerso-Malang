import React, { useState, useEffect, useCallback, memo } from "react";
import { Github, Linkedin, Mail, ExternalLink, Instagram, Sparkles } from "lucide-react";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Memoized Components
const StatusBadge = memo(() => (
    <div className="flex items-center text-sm md:text-base font-medium bg-gradient-to-r from-blue-100 to-purple-100 bg-clip-text text-transparent">
      <Sparkles className="sm:w-4 sm:h-4 w-3 h-3 mr-2 text-blue-600" />
      Ready to Innovate
    </div>
));

const MainTitle = memo(() => (
    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
      Desa Wonokerso
    </h1>
));

const TechStack = memo(({ tech }) => (
    <span className="px-3 py-1 text-sm md:text-base rounded-full bg-white/50 backdrop-blur-sm border border-gray-200/50 text-gray-600">
    {tech}
  </span>
));

const CTAButton = memo(({ href, text, icon: Icon }) => (
    <a href={href} className="group relative w-[160px]">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4f52c9] to-[#8644c5] rounded-xl opacity-30 blur-md group-hover:opacity-70 transition-all duration-700"></div>
      <div className="relative h-11 bg-gray-100 backdrop-blur-xl rounded-lg border border-gray-200/50 leading-none overflow-hidden">
        <div className="absolute inset-0 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 bg-gradient-to-r from-[#4f52c9]/10 to-[#8644c5]/10"></div>
        <span className="absolute inset-0 flex items-center justify-center gap-2 text-sm group-hover:gap-3 transition-all duration-300">
        <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent font-medium z-10">
          {text}
        </span>
        <Icon className={`w-4 h-4 text-gray-600 ${text === 'Contact' ? 'group-hover:translate-x-1' : 'group-hover:rotate-45'} transition-all duration-300 z-10`} />
      </span>
      </div>
    </a>
));

const SocialLink = memo(({ icon: Icon, link }) => (
    <a href={link} className="group relative p-3">
      <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl blur opacity-10 group-hover:opacity-30 transition duration-300"></div>
      <div className="relative rounded-xl bg-white/50 backdrop-blur-xl p-2 flex items-center justify-center border border-gray-200/50 group-hover:border-gray-300/50 transition-all duration-300">
        <Icon className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
      </div>
    </a>
));

// Constants
const TYPING_SPEED = 100;
const ERASING_SPEED = 50;
const PAUSE_DURATION = 2000;
const WORDS = ["Network & Telecom Student", "Tech Enthusiast"];
const TECH_STACK = ["React", "Javascript", "Node.js", "Tailwind"];
const SOCIAL_LINKS = [
  { icon: Github, link: "https://github.com/EkiZR" },
  { icon: Linkedin, link: "https://www.linkedin.com/in/ekizr/" },
  { icon: Instagram, link: "https://www.instagram.com/ekizr_/?hl=id" }
];

const Home = () => {
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Optimize AOS initialization
  useEffect(() => {
    const initAOS = () => {
      AOS.init({
        once: true,
        offset: 10,
      });
    };

    initAOS();
    window.addEventListener('resize', initAOS);
    return () => window.removeEventListener('resize', initAOS);
  }, []);

  useEffect(() => {
    setIsLoaded(true);
    return () => setIsLoaded(false);
  }, []);

  // Optimize typing effect
  const handleTyping = useCallback(() => {
    if (isTyping) {
      if (charIndex < WORDS[wordIndex].length) {
        setText(prev => prev + WORDS[wordIndex][charIndex]);
        setCharIndex(prev => prev + 1);
      } else {
        setTimeout(() => setIsTyping(false), PAUSE_DURATION);
      }
    } else {
      if (charIndex > 0) {
        setText(prev => prev.slice(0, -1));
        setCharIndex(prev => prev - 1);
      } else {
        setWordIndex(prev => (prev + 1) % WORDS.length);
        setIsTyping(true);
      }
    }
  }, [charIndex, isTyping, wordIndex]);

  useEffect(() => {
    const timeout = setTimeout(
        handleTyping,
        isTyping ? TYPING_SPEED : ERASING_SPEED
    );
    return () => clearTimeout(timeout);
  }, [handleTyping]);

  // Lottie configuration
  const lottieOptions = {
    src: "https://lottie.host/58753882-bb6a-49f5-a2c0-950eda1e135a/NLbpVqGegK.lottie",
    loop: true,
    autoplay: true,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
      progressiveLoad: true,
    },
    style: { width: "100%", height: "100%" },
    className: `w-full h-full transition-all duration-500 ${
        isHovering
            ? "scale-[180%] sm:scale-[160%] md:scale-[150%] lg:scale-[145%] rotate-2"
            : "scale-[175%] sm:scale-[155%] md:scale-[145%] lg:scale-[140%]"
    }`
  };

  return (
      <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        {/* Left Column */}
        <div className="flex-1 max-w-2xl space-y-6 sm:space-y-8">
          <div data-aos="fade-up" data-aos-delay="600">
            <StatusBadge />
          </div>
          <div data-aos="fade-up" data-aos-delay="700">
            <MainTitle />
          </div>
          {/* Typing Effect */}
          <div className="h-8 flex items-center" data-aos="fade-up" data-aos-delay="800">
          <span className="text-xl md:text-2xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent font-light">
            {text}
          </span>
            <span className="w-[3px] h-6 bg-gradient-to-t from-[#6366f1] to-[#a855f7] ml-1 animate-blink"></span>
          </div>
          {/* Description */}
          <p
              className="text-base md:text-lg text-gray-600 max-w-xl leading-relaxed font-light"
              data-aos="fade-up"
              data-aos-delay="1000"
          >
            Menciptakan Website Yang Inovatif, Fungsional, dan User-Friendly untuk Solusi Digital.
          </p>
          {/* Tech Stack */}
          <div className="flex flex-wrap gap-3 justify-start" data-aos="fade-up" data-aos-delay="1200">
            {TECH_STACK.map((tech, index) => (
                <TechStack key={index} tech={tech} />
            ))}
          </div>
          {/* CTA Buttons */}
          <div className="flex flex-row gap-3 w-full justify-start" data-aos="fade-up" data-aos-delay="1400">
            <CTAButton href="#Portofolio" text="Projects" icon={ExternalLink} />
            <CTAButton href="#Contact" text="Contact" icon={Mail} />
          </div>
          {/* Social Links */}
          <div className="hidden sm:flex gap-4 justify-start" data-aos="fade-up" data-aos-delay="1600">
            {SOCIAL_LINKS.map((social, index) => (
                <SocialLink key={index} {...social} />
            ))}
          </div>
        </div>
        {/* Right Column - Optimized Lottie Animation */}
        <div
            className="flex-1 max-w-md lg:max-w-lg mt-10 lg:mt-0"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            data-aos="fade-left"
            data-aos-delay="600"
        >
          <DotLottieReact {...lottieOptions} />
        </div>
      </div>
  );
};

export default memo(Home);