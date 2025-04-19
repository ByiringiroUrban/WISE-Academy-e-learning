
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Code, Database, Server, Cpu } from "lucide-react";

export function HeroSection() {
  const [scrolled, setScrolled] = useState(false);
  
  // Add scroll listener for parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section className="relative overflow-hidden min-h-[650px] flex items-center bg-blue-950">
      {/* Background with technical pattern */}
      <div className="absolute inset-0 tech-grid bg-gradient-to-br from-[#f0f9ff] to-[#e6f7ff]"></div>
      
      {/* Hero image - African students learning code */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[45%] h-[80%] overflow-hidden rounded-full shadow-xl hidden lg:block">
        <div className="relative w-full h-full">
          {/* <img 
            src="/assets/african-students-coding.jpg" 
            alt="African students learning to code" 
            className="object-cover w-full h-full tech-glow"
            onError={(e) => {
              // Fallback to a placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = "https://images.squarespace-cdn.com/content/v1/569fe605a12f449e1bf3cc20/1534446721887-OEUP4L47LSGKVLCU77X0/July_WhatIsCoding.jpg?format=2500w";
            }}
          /> */}
          {/* Tech overlay elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/20"></div>
          <svg className="absolute bottom-0 left-0 h-24 w-full" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="rgba(0, 172, 193, 0.2)" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,170.7C960,160,1056,160,1152,149.3C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
          
          {/* Tech pattern overlay */}
          <div className="absolute inset-0 tech-pattern opacity-30"></div>
          
          {/* Code brackets decoration */}
          <div className="absolute top-4 left-4 text-3xl text-white/80 font-mono">{`{`}</div>
          <div className="absolute bottom-4 right-4 text-3xl text-white/80 font-mono">{`}`}</div>
        </div>
      </div>
      
      {/* Animated circuit-like lines */}
      <div className="absolute inset-0 opacity-20">
        <svg viewBox="0 0 1200 800" className="w-full h-full">
          <path 
            d="M0,400 Q300,100 600,400 T1200,400" 
            fill="none" 
            stroke="hsl(var(--primary))" 
            strokeWidth="2"
            className="tech-glow"
          />
          <path 
            d="M0,500 Q300,800 600,500 T1200,500" 
            fill="none" 
            stroke="hsl(var(--secondary))" 
            strokeWidth="2"
            className="tech-glow"
          />
          {/* Circuit nodes */}
          {[...Array(8)].map((_, i) => (
            <circle 
              key={i} 
              cx={150 * (i + 1)} 
              cy={i % 2 ? 500 : 400} 
              r="8" 
              fill={i % 2 ? "hsl(var(--secondary))" : "hsl(var(--primary))"}
              className="tech-glow" 
            />
          ))}
        </svg>
      </div>
      
      {/* Floating tech icons */}
      <div 
        className="absolute inset-0"
        style={{
          transform: scrolled ? "translateY(-10px)" : "translateY(0)",
          transition: "transform 0.5s ease-out",
        }}
      >
        <Cpu 
          className="absolute text-primary/20 top-[20%] left-[10%] w-16 h-16 animate-pulse"
          style={{ animationDuration: '7s' }}
        />
        <Server 
          className="absolute text-secondary/30 top-[15%] right-[15%] w-20 h-20 animate-pulse" 
          style={{ animationDuration: '5s' }}
        />
        <Code 
          className="absolute text-primary/20 bottom-[25%] left-[20%] w-24 h-24 animate-pulse" 
          style={{ animationDuration: '8s' }}
        />
        <Database 
          className="absolute text-secondary/30 bottom-[20%] right-[10%] w-16 h-16 animate-pulse" 
          style={{ animationDuration: '6s' }}
        />
      </div>
      
      {/* Content */}
      <div className="relative container mx-auto px-4 z-10">
        <div className="max-w-3xl lg:max-w-2xl" style={{ animationDelay: '0.5s' }}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="gradient-text ">Technical Learning</span> <br />
            <span className="text-gray-500">For The Digital Age</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed max-w-2xl">
            Access advanced technical education designed for modern professionals. 
            Master cutting-edge skills with expert instructors and industry-standard tools.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/courses">
              <Button size="lg" className="bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:shadow-primary/20">
                Explore Courses
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5 transition-all">
                Join Now
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {[
              { number: "500+", label: "Courses" },
              { number: "50+", label: "Expert Instructors" },
              { number: "10k+", label: "Students" },
              { number: "95%", label: "Success Rate" }
            ].map((stat, index) => (
              <div 
                key={index}
                className="text-center p-4 rounded-lg bg-white/70 backdrop-blur-sm tech-card"
                style={{
                  animation: 'fade-in 0.5s ease-out forwards',
                  animationDelay: `${0.2 + index * 0.1}s`,
                  opacity: 0
                }}
              >
                <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.number}</div>
                <div className="text-gray-600 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
