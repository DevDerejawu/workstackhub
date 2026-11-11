import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { Button } from '../ui'; 

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(()=>{
    const curTheme = localStorage.getItem('theme');
    if(!curTheme){
      return 'light';
    }
    if(curTheme === 'dark') return 'dark';
    return 'light';
  });
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  useEffect(()=>{
    const body = document.body;
    if(theme==='dark'){
      body.classList.remove('light');
    }else{
      body.classList.remove('dark'); 
    }
    body.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme])

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'FAQ', href: '/faq' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0" onClick={closeMobileMenu}>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              WorkStackHub
            </span>
          </Link>

          {/* ===== DESKTOP NAV ===== */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-foreground hover:bg-secondary hover:text-secondary-foreground px-3 py-2 rounded-lg transition-all duration-200"
              >
                {link.name}
              </Link>
            ))}

            <div className="h-6 w-px bg-border" />

            {/* Theme Toggle (Desktop)*/}
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setTheme(pre=> {
                  if(pre === 'light'){
                    return 'dark'
                  }
                  return 'light'
                })}
                className={`p-1.5 ${theme === 'light' ? 'bg-background shadow-sm' : ''}`}
                aria-label="Light theme"
              >
               {theme === 'dark'? <Sun className="w-4 h-4" />: <Moon className="w-4 h-4" /> }
              </Button>
            </div>

            <div className="h-6 w-px bg-border" />

            {/* Auth Buttons  */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={closeMobileMenu}
                asChild
              >
                <Link to="/auth/register">Register</Link>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={closeMobileMenu}
                asChild
              >
                <Link to="auth/login">Login</Link>
              </Button>
            </div>
          </div>

          {/* ===== MOBILE HEADER ===== */}
          <div className="flex items-center gap-3 md:hidden">

            {/* Mobile Theme*/}
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setTheme(pre=> {
                  if(pre === 'light'){
                    return 'dark'
                  }
                  return 'light'
                })}
                className={`p-1.5 ${theme === 'light' ? 'bg-background shadow-sm' : ''}`}
                aria-label="Light theme"
              >
               {theme === 'dark'? <Sun className="w-4 h-4" />: <Moon className="w-4 h-4" /> }
              </Button>
            </div>

            {/* Hamburger Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* ===== MOBILE MENU ===== */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 border-t border-border mt-2">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block px-4 py-3 rounded-lg text-foreground hover:bg-secondary transition-all duration-200"
                  onClick={closeMobileMenu}
                >
                  {link.name}
                </Link>
              ))}

              <div className="border-t border-border my-2 pt-2" />

              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={closeMobileMenu}
                asChild
              >
                <Link to="/auth/register">Register</Link>
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={closeMobileMenu}
                asChild
              >
                <Link to="/auth/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;