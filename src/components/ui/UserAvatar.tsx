
import { User } from '@/types';
import { User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user: Partial<User>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };

  const getFallbackInitials = () => {
    if (!user.name) return '';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {user.profileImage ? (
        <AvatarImage src={user.profileImage} alt={user.name || 'User'} />
      ) : (
        <AvatarFallback className="bg-primary/10 text-primary">
          {getFallbackInitials() || <UserIcon className="h-4 w-4" />}
        </AvatarFallback>
      )}
    </Avatar>
  );
};
