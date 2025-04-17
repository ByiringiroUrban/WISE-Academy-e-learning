
import React from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const Navbar = () => {
  return (
    <header className="w-full px-4 py-3 border-b border-gray-200 relative">
      <div className="container mx-auto flex items-center justify-between">
        <a href="/" className="flex items-center mr-8">
          <div className="text-primary font-bold text-xl">Posinnove</div>
        </a>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <a href="#" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
            Explore Program <Menu className="ml-1 h-4 w-4" />
          </a>
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">About</a>
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Blog</a>
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Login</a>
        </nav>

        <Button variant="outline" className="hidden md:inline-flex border-primary text-primary hover:bg-primary hover:text-white">
          Get Started
        </Button>

        {/* Mobile Menu Button - Positioned Creatively */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden absolute top-1/2 right-4 -translate-y-1/2 z-50">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "rounded-full shadow-lg bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-300",
                "w-12 h-12 flex items-center justify-center hover:scale-105 active:scale-95"
              )}
            >
              <Menu className="h-6 w-6 text-primary" />
              <span className="sr-only">Open navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[80%] sm:w-[385px]">
            <div className="flex flex-col h-full">
              <SheetClose asChild className="absolute top-4 right-4">
                <Button variant="ghost" size="icon">
                  <X className="h-6 w-6" />
                </Button>
              </SheetClose>
              
              <nav className="flex flex-col gap-4 mt-16">
                <a href="#" className="flex items-center text-sm text-gray-600 hover:text-primary">
                  Explore Program <Menu className="ml-1 h-4 w-4" />
                </a>
                <a href="#" className="text-sm text-gray-600 hover:text-primary">About</a>
                <a href="#" className="text-sm text-gray-600 hover:text-primary">Blog</a>
                <a href="#" className="text-sm text-gray-600 hover:text-primary">Login</a>
                
                <Button variant="default" className="mt-4 w-full">
                  Get Started
                </Button>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Navbar;
