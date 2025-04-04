import React from 'react';
import Header from '@/components/Header';
import { Link } from 'wouter';
import { Scale, MessageSquare, BookOpen } from 'lucide-react';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  to: string;
}

function ModuleCard({ title, description, icon, color, to }: ModuleCardProps) {
  return (
    <Link href={to}>
      <a className={`block p-6 bg-gray-800 rounded-lg border border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] cursor-pointer`}>
        <div className={`rounded-full w-14 h-14 flex items-center justify-center mb-4 ${color}`}>
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
        <p className="text-gray-300">{description}</p>
      </a>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Header />
        
        <div className="max-w-4xl mx-auto py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-white">
            Your Legal AI Assistant
          </h1>
          <p className="text-xl text-center text-gray-300 mb-12">
            Comprehensive legal support powered by artificial intelligence
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ModuleCard 
              title="Legal Assistant" 
              description="Get detailed analysis of legal scenarios with relevant IPC sections and explanations." 
              icon={<Scale className="w-8 h-8 text-blue-400" />}
              color="bg-blue-900/30"
              to="/legal-assistant"
            />
            
            <ModuleCard 
              title="General Chat" 
              description="Ask any general questions about law, procedures, or legal concepts."
              icon={<MessageSquare className="w-8 h-8 text-green-400" />}
              color="bg-green-900/30"
              to="/general-chat"
            />
            
            <ModuleCard 
              title="Case Law Search" 
              description="Find relevant case laws and precedents for specific legal issues."
              icon={<BookOpen className="w-8 h-8 text-purple-400" />}
              color="bg-purple-900/30" 
              to="/case-law"
            />
          </div>
          
          <div className="mt-16 text-center text-gray-400 text-sm">
            <p>This platform is designed for informational purposes only and should not be considered legal advice.</p>
            <p className="mt-1">Always consult with a qualified legal professional for specific legal matters.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
