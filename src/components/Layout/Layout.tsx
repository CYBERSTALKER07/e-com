import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import BottomNavigation from './BottomNavigation';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Sidebar />
      <div className="pl-[70px]"> {/* Adjusted padding to match sidebar width */}
        <main>
          {children}
        </main>
        <Footer />
      </div>
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
};

export default Layout;