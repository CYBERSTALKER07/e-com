import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNavigation from './BottomNavigation';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-grow">
        <Sidebar />
        <main className="flex-grow pb-16 md:pb-0 md:ml-64 px-4 md:px-8 py-6">
          {children}
        </main>
      </div>
      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default Layout;