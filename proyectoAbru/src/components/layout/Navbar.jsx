   // src/components/layout/Navbar.jsx
   import React, { useState } from 'react';
   import { Link, NavLink } from 'react-router-dom';
   import { Menu, X } from 'lucide-react';

   const Navbar = () => {
     const [isOpen, setIsOpen] = useState(false);

     const navLinks = [
       { to: "/", text: "Home" },
       { to: "/portfolio", text: "Portfolio" },
       { to: "/servicios", text: "Servicios" },
       { to: "/testimonios", text: "Testimonios" }, // NUEVO ENLACE
       { to: "/sobre-mi", text: "Sobre Mí" },
       { to: "/contacto", text: "Contacto" },
     ];

     const activeStyle = "text-accent-script font-semibold border-b-2 border-accent-script pb-1";
     const inactiveStyle = "hover:text-accent-script transition-colors duration-300 pb-1 border-b-2 border-transparent";

     return (
       <nav className="bg-white-off shadow-soft sticky top-0 z-50">
         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-center justify-between h-20">
             <div className="flex-shrink-0">
               <Link to="/" className="script-logo text-3xl md:text-4xl">
                 SeVe Photography
               </Link>
             </div>

             <div className="hidden md:block">
               <div className="ml-10 flex items-baseline space-x-4 lg:space-x-6"> {/* Aumentado un poco el space-x para más items */}
                 {navLinks.map(link => (
                   <NavLink
                     key={link.text}
                     to={link.to}
                     className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
                   >
                     {link.text}
                   </NavLink>
                 ))}
               </div>
             </div>

             <div className="md:hidden flex items-center">
               <button
                 onClick={() => setIsOpen(!isOpen)}
                 type="button"
                 className="inline-flex items-center justify-center p-2 rounded-md text-text-primary hover:text-accent-script focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-script"
                 aria-controls="mobile-menu"
                 aria-expanded={isOpen}
               >
                 <span className="sr-only">Abrir menú principal</span>
                 {isOpen ? <X className="block h-6 w-6" aria-hidden="true" /> : <Menu className="block h-6 w-6" aria-hidden="true" />}
               </button>
             </div>
           </div>
         </div>

         {isOpen && (
           <div className="md:hidden absolute top-full left-0 right-0 bg-white-off shadow-lg z-40 border-t border-beige-light" id="mobile-menu">
             <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
               {navLinks.map(link => (
                 <NavLink
                   key={link.text}
                   to={link.to}
                   className={({ isActive }) =>
                     `${isActive ? 'bg-beige-light text-accent-script' : 'text-text-secondary hover:bg-beige-light hover:text-accent-script'} block px-3 py-2 rounded-md text-base font-medium`
                   }
                   onClick={() => setIsOpen(false)}
                 >
                   {link.text}
                 </NavLink>
               ))}
             </div>
           </div>
         )}
       </nav>
     );
   };

   export default Navbar;
   