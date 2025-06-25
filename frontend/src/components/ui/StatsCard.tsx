
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  gradient?: 'purple' | 'cyan' | 'orange' | 'green';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  gradient = 'purple'
}) => {
  const gradientClasses = {
    purple: 'bg-gradient-purple',
    cyan: 'bg-gradient-cyan',
    orange: 'bg-gradient-to-br from-orange-400 to-pink-500',
    green: 'bg-gradient-to-br from-green-400 to-emerald-500'
  };

  const changeColors = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-gray-400'
  };

  return (
    <div className="glass-card rounded-xl p-6 hover:bg-white/10 transition-all duration-300 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${gradientClasses[gradient]}`}>
          <Icon className="text-white" size={24} />
        </div>
        {change && (
          <span className={`text-sm font-medium ${changeColors[changeType]}`}>
            {change}
          </span>
        )}
      </div>
      
      <div>
        <h3 className="text-gray-300 text-sm font-medium mb-1">{title}</h3>
        <p className="text-white text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
