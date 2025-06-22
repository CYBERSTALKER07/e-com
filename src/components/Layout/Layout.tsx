import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import BottomNavigation from './BottomNavigation';

interface LayoutProps {
  children: React.ReactNode;
  authOnly?: boolean; // 👈 Add this prop
}

const Layout: React.FC<LayoutProps> = ({ children, authOnly = false }) => {
  if (authOnly) {
    return (
      <div className="min-h-screen bg-gray-100">
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="md:pl-[70px]">
        <main>{children}</main>
        <Footer />
      </div>
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
};

export default Layout;
