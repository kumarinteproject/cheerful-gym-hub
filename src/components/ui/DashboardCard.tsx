
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  icon: ReactNode;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  delay?: number;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  value,
  description,
  trend,
  trendValue,
  className,
  delay = 0
}) => {
  const getTrendStyles = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-muted-foreground bg-secondary/50';
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: delay * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'rounded-xl p-6 bg-white border border-border shadow-sm',
        className
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      
      {trend && trendValue && (
        <div className="mt-4">
          <span className={cn('text-xs px-2 py-1 rounded-full', getTrendStyles())}>
            {trendValue}
          </span>
        </div>
      )}
    </motion.div>
  );
};
