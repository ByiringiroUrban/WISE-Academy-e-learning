
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Code, Database, Terminal, Server, Cpu, FileCode, Globe, Lock, LineChart, PenTool } from "lucide-react";

interface CategorySectionProps {
  categories: any[];
  isLoading: boolean;
}

export function CategorySection({ categories, isLoading }: CategorySectionProps) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // Map of category icons by name (assuming categories have title property)
  const getCategoryIcon = (title: string) => {
    const iconMap: {[key: string]: JSX.Element} = {
      'Programming': <Code className="w-6 h-6" />,
      'Web Development': <Globe className="w-6 h-6" />,
      'Databases': <Database className="w-6 h-6" />,
      'DevOps': <Server className="w-6 h-6" />,
      'Cloud Computing': <Cpu className="w-6 h-6" />,
      'Mobile Development': <FileCode className="w-6 h-6" />,
      'Data Science': <LineChart className="w-6 h-6" />,
      'Cybersecurity': <Lock className="w-6 h-6" />,
      'Design': <PenTool className="w-6 h-6" />,
      'Terminal': <Terminal className="w-6 h-6" />
    };
    
    return iconMap[title] || <Code className="w-6 h-6" />;
  };

  return (
    <section className="py-20 tech-pattern">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 gradient-text">Browse by Category</h2>
          <div className="w-20 h-1 bg-primary/50 mx-auto mb-6 tech-glow rounded-full"></div>
          <p className="text-gray-200 max-w-2xl mx-auto">
            Discover specialized technical courses and find the perfect match for your career goals
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-lg shadow-sm max-w-xl mx-auto tech-card">
            <p className="text-gray-200">No categories available yet.</p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {categories.map((category: any) => (
              <motion.div 
                key={category._id} 
                variants={itemVariants}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              >
                <Link to={`/courses?category=${category._id}`} className="block">
                  <div className="group h-full p-6 rounded-xl text-center bg-blue-950 backdrop-blur-sm border border-primary/10 hover:tech-glow transition-all duration-300">
                    <div className="w-14 h-14 bg-blue-300 rounded-lg flex items-center justify-center mx-auto mb-4 text-primary relative overflow-hidden group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      {getCategoryIcon(category.title)}
                      
                      {/* Technical decorative elements */}
                      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/30"></div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/30"></div>
                    </div>
                    <h3 className="font-medium group-hover:gradient-text text-white transition-colors duration-300">{category.title}</h3>
                    
                    {/* Animated underscore on hover */}
                    <div className="mt-2 mx-auto w-0 h-0.5 bg-primary/50 group-hover:w-16 transition-all duration-300"></div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
