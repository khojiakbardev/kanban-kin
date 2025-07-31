import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Issue } from '@/types';
import { api } from '@/services/api';
import { currentUser } from '@/data/currentUser';
import { addToRecentlyAccessed } from '@/utils/localStorage';
import { calculatePriorityScore } from '@/utils/priorityScore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

export default function IssueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (id) {
      loadIssue(id);
    }
  }, [id]);

  const loadIssue = async (issueId: string) => {
    try {
      setLoading(true);
      const data = await api.getIssue(issueId);
      if (data) {
        setIssue(data);
        addToRecentlyAccessed(data);
      } else {
        toast({
          title: "Issue not found",
          description: "The issue you're looking for doesn't exist.",
          variant: "destructive"
        });
        navigate('/board');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load issue details.",
        variant: "destructive"
      });
      navigate('/board');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsResolved = async () => {
    if (!issue) return;

    if (currentUser.role !== 'admin') {
      toast({
        title: "Permission Denied",
        description: "Only admins can resolve issues.",
        variant: "destructive"
      });
      return;
    }

    try {
      setResolving(true);
      await api.updateIssueStatus(issue.id, 'done');
      setIssue({ ...issue, status: 'done' });
      toast({
        title: "Issue Resolved",
        description: "Issue has been marked as resolved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve issue.",
        variant: "destructive"
      });
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading issue...</p>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <X className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Issue Not Found</h1>
          <p className="text-muted-foreground mb-4">The issue you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/board')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Board
          </Button>
        </div>
      </div>
    );
  }

  const priorityScore = calculatePriorityScore(issue);
  const createdDate = new Date(issue.createdAt);
  const updatedDate = new Date(issue.updatedAt);
  const daysSinceCreated = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

  const severityLabels = {
    1: 'Minimal',
    2: 'Minor',
    3: 'Moderate', 
    4: 'Major',
    5: 'Critical'
  };

  const statusColors = {
    backlog: 'hsl(var(--backlog))',
    'in-progress': 'hsl(var(--in-progress))',
    done: 'hsl(var(--done))'
  };

  const priorityColors = {
    low: 'hsl(var(--success))',
    medium: 'hsl(var(--warning))',
    high: 'hsl(var(--destructive))',
    critical: 'hsl(var(--destructive))'
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/board')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Board
          </Button>

          {issue.status !== 'done' && currentUser.role === 'admin' && (
            <Button 
              onClick={handleMarkAsResolved}
              disabled={resolving}
              className="bg-success hover:bg-success/80"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {resolving ? 'Resolving...' : 'Mark as Resolved'}
            </Button>
          )}
        </div>

        {/* Issue Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{issue.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        ID: {issue.id}
                      </Badge>
                      <Badge 
                        style={{ 
                          backgroundColor: statusColors[issue.status],
                          color: 'white'
                        }}
                        className="text-xs"
                      >
                        {issue.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <Badge 
                    variant="outline"
                    style={{ 
                      borderColor: priorityColors[issue.priority],
                      color: priorityColors[issue.priority]
                    }}
                    className="font-medium"
                  >
                    {issue.priority.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground leading-relaxed">
                    {issue.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {issue.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {issue.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Issue Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Assignee */}
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Assignee</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {issue.assignee.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{issue.assignee}</span>
                    </div>
                  </div>
                </div>

                {/* Severity */}
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Severity</p>
                    <p className="text-sm text-muted-foreground">
                      {issue.severity} - {severityLabels[issue.severity]}
                    </p>
                  </div>
                </div>

                {/* Priority Score */}
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    #
                  </div>
                  <div>
                    <p className="text-sm font-medium">Priority Score</p>
                    <p className="text-sm text-muted-foreground">{priorityScore}</p>
                  </div>
                </div>

                {/* Created Date */}
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {createdDate.toLocaleDateString()} ({daysSinceCreated} days ago)
                    </p>
                  </div>
                </div>

                {/* Updated Date */}
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">
                      {updatedDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Role Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Access Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant={currentUser.role === 'admin' ? 'default' : 'secondary'}>
                    {currentUser.role}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {currentUser.name}
                  </span>
                </div>
                {currentUser.role === 'contributor' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Read-only access. Contact an admin to make changes.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}