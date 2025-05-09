import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/lib/utils';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user, logout, showLoginModal, showRegisterModal } = useAuth();

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2 space-x-reverse">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">Q</span>
            </div>
            <span className="text-xl font-bold text-primary">قاسيون إكسترا</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 space-x-reverse">
          <Link href="/" className="text-gray-700 hover:text-primary transition font-cairo">الرئيسية</Link>
          <Link href="/categories" className="text-gray-700 hover:text-primary transition font-cairo">التصنيفات</Link>
          <Link href="/teachers" className="text-gray-700 hover:text-primary transition font-cairo">المدرسين</Link>
          <Link href="/courses" className="text-gray-700 hover:text-primary transition font-cairo">الدورات</Link>
          <Link href="/contact" className="text-gray-700 hover:text-primary transition font-cairo">تواصل معنا</Link>
        </div>
        
        <div className="flex items-center space-x-4 space-x-reverse">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profilePicture} alt={user.fullName} />
                    <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLocation(`/profile`)}>
                  الملف الشخصي
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation(`/dashboard/${user.role}`)}>
                  لوحة التحكم
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="hidden md:block border-primary text-primary hover:bg-primary hover:text-white"
                onClick={showLoginModal}
              >
                تسجيل دخول
              </Button>
              <Button 
                className="hidden md:block bg-primary text-white hover:bg-accent"
                onClick={showRegisterModal}
              >
                إنشاء حساب
              </Button>
            </>
          )}
          
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </Button>
        </div>
      </nav>
      
      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg absolute w-full z-50">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
            <Link href="/" className="text-gray-700 hover:text-primary transition py-2 block" onClick={closeMenu}>الرئيسية</Link>
            <Link href="/categories" className="text-gray-700 hover:text-primary transition py-2 block" onClick={closeMenu}>التصنيفات</Link>
            <Link href="/teachers" className="text-gray-700 hover:text-primary transition py-2 block" onClick={closeMenu}>المدرسين</Link>
            <Link href="/courses" className="text-gray-700 hover:text-primary transition py-2 block" onClick={closeMenu}>الدورات</Link>
            <Link href="/contact" className="text-gray-700 hover:text-primary transition py-2 block" onClick={closeMenu}>تواصل معنا</Link>
            
            {!user && (
              <div className="flex space-x-2 space-x-reverse pt-2 border-t">
                <Button 
                  variant="outline" 
                  className="flex-1 border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => {
                    showLoginModal();
                    closeMenu();
                  }}
                >
                  تسجيل دخول
                </Button>
                <Button 
                  className="flex-1 bg-primary text-white hover:bg-accent"
                  onClick={() => {
                    showRegisterModal();
                    closeMenu();
                  }}
                >
                  إنشاء حساب
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
