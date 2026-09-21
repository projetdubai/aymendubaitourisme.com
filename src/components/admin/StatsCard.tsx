import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  iconColorClass?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  iconColorClass = "text-gold-500 bg-navy-800/10"
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={cn("p-2 rounded-full", iconColorClass)}>
          <Icon size={20} />
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-navy-900">{value}</span>
        
        {trend && trendValue && (
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            trend === 'up' ? "text-green-700 bg-green-100" :
            trend === 'down' ? "text-red-700 bg-red-100" :
            "text-gray-700 bg-gray-100"
          )}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '-'} {trendValue}
          </span>
        )}
      </div>
    </div>
  );
}
