
import React from 'react';
import { Button } from "@/components/ui/button";
import { Menu, ChevronDown } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  return (
    <header className="w-full px-4 py-3 border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <a href="/" className="flex items-center mr-8">
            <div className="text-primary font-bold text-xl">Posinnove</div>
          </a>
          
          {/* Mobile Menu Button */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80%] sm:w-[385px]">
              <nav className="flex flex-col gap-4 mt-8">
                <a href="#" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                  Explore Program <ChevronDown className="ml-1 h-4 w-4" />
                </a>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900">About</a>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Blog</a>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Login</a>
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                  Get Started
                </Button>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
              Explore Program <ChevronDown className="ml-1 h-4 w-4" />
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">About</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Blog</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Login</a>
          </nav>
        </div>
        <Button variant="outline" className="hidden md:inline-flex border-primary text-primary hover:bg-primary hover:text-white">
          Get Started
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
