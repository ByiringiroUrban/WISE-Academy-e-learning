
import React from 'react';
import { Instagram, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full py-12 bg-primary text-white">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-medium mb-4">Learn More</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm hover:underline">About us</a></li>
              <li><a href="#" className="text-sm hover:underline">Blog</a></li>
              <li><a href="#" className="text-sm hover:underline">FAQ</a></li>
              <li><a href="#" className="text-sm hover:underline">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Get in Touch</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm hover:underline">Contact us</a></li>
              <li><a href="#" className="text-sm hover:underline">Support</a></li>
              <li><a href="#" className="text-sm hover:underline">Partnerships</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Our Newsletter</h3>
            <p className="text-sm mb-3">Sign up to receive updates and resources to help your business grow</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="px-3 py-2 text-black text-sm rounded-l-md w-full focus:outline-none"
              />
              <button className="bg-gray-700 px-3 py-2 rounded-r-md text-sm hover:bg-gray-600">
                GO
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-gray-200">
                <Mail className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-gray-200">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-gray-200">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-700 text-sm text-center">
          <p>© 2023 Posinnove. Tous droits réservés. Made with ❤️ by Posinnove Team.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
