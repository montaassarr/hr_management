import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  customHeader?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, title, subtitle, customHeader }) => {
  return (
    <div className="min-h-screen bg-gradient-dashboard">
      <Sidebar />
      <div className="ml-64">
        {customHeader ? customHeader : <Header title={title} subtitle={subtitle} />}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
