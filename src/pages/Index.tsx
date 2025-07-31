import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, Users, Zap, BarChart3, ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Layers,
      title: 'Kanban Board',
      description: 'Organize issues with drag-and-drop Kanban interface'
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Admin and contributor roles with proper permissions'
    },
    {
      icon: Zap,
      title: 'Real-Time Updates',
      description: 'Live polling and optimistic UI updates'
    },
    {
      icon: BarChart3,
      title: 'Priority Scoring',
      description: 'Smart priority calculation and sorting'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-main">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary mb-6">
            <Layers className="w-4 h-4" />
            <span className="text-sm font-medium">Issue Board</span>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Modern Kanban
            <br />
            <span className="text-primary-glow">Issue Management</span>
          </h1>
          
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Streamline your workflow with our beautiful and powerful issue tracking board. 
            Inspired by Jira and GitHub Projects.
          </p>
          
          <Button 
            size="lg" 
            onClick={() => navigate('/board')}
            className="bg-white text-primary hover:bg-white/90 font-medium px-8 py-3 h-auto text-lg"
          >
            Open Board
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-glow" />
                  </div>
                  <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-white/60 text-sm">
            Built with React, TypeScript, and modern web technologies
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
