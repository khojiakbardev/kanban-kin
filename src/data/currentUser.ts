import { User } from '@/types';

export const currentUser: User = {
  id: 'user-1',
  name: 'Alice Johnson',
  role: 'admin', // Change to 'contributor' to test role-based access
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5ab?w=150&h=150&fit=crop&crop=face'
};