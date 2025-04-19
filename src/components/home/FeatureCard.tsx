
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  delay?: number;
}

export function FeatureCard({ title, description, icon, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div 
      className="p-6 rounded-xl bg-white tech-card hover:tech-glow transition-all duration-300 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      viewport={{ once: true, margin: "-100px" }}
      whileHover={{ y: -5 }}
    >
      <div className="relative mb-6">
        {/* Decorative technical elements */}
        <div className="absolute -top-3 -left-3 w-12 h-12 border-t-2 border-l-2 border-primary/30 rounded-tl-lg"></div>
        <div className="absolute -bottom-3 -right-3 w-12 h-12 border-b-2 border-r-2 border-secondary/30 rounded-br-lg"></div>
        
        {/* Icon container */}
        <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center mx-auto relative">
          <div className="text-primary">{icon}</div>
          
          {/* Circuit-like dots */}
          <div className="absolute -right-1 top-1/2 w-2 h-2 bg-primary rounded-full"></div>
          <div className="absolute left-1/2 -bottom-1 w-2 h-2 bg-secondary rounded-full"></div>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-3 text-center gradient-text">{title}</h3>
      <p className="text-gray-400 text-center">{description}</p>
      
      {/* Tech decoration at bottom */}
      <div className="mt-4 pt-2 border-t border-dashed border-primary/20 flex justify-center">
        <div className="w-8 h-1 bg-secondary/30 rounded-full"></div>
        <div className="w-1 h-1 mx-1 rounded-full bg-primary"></div>
        <div className="w-8 h-1 bg-primary/30 rounded-full"></div>
      </div>
    </motion.div>
  );
}
