import { useTodoStats } from '@/hooks/todos';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3,
  CheckSquare,
  Clock,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import type { TodoPriority, TodoStatus } from '@/lib/types';

const priorityColors: Record<TodoPriority, string> = {
  low: 'bg-blue-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

const statusColors: Record<TodoStatus, string> = {
  pending: 'bg-gray-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

export function StatsPage() {
  const { data: stats, isLoading } = useTodoStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  const completionRate = stats?.total_todos 
    ? Math.round((stats.completed_todos / stats.total_todos) * 100) 
    : 0;

  const priorityEntries = Object.entries(stats?.todos_by_priority || {}) as [TodoPriority, number][];
  const statusEntries = Object.entries(stats?.todos_by_status || {}) as [TodoStatus, number][];

  const maxPriorityCount = Math.max(...priorityEntries.map(([, count]) => count), 1);
  const maxStatusCount = Math.max(...statusEntries.map(([, count]) => count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <BarChart3 className="mr-3 h-8 w-8" />
          Statistics
        </h1>
        <p className="text-muted-foreground">
          Insights and analytics about your todo productivity
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Todos</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_todos || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time tasks created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.completed_todos || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Tasks finished
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.pending_todos || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Tasks remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats?.overdue_todos || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Past deadline
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Completion Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Completion Rate
          </CardTitle>
          <CardDescription>
            Your overall task completion percentage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-800">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>By Priority</CardTitle>
            <CardDescription>
              Distribution of todos by priority level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {priorityEntries.length > 0 ? (
                priorityEntries.map(([priority, count]) => (
                  <div key={priority} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 min-w-[100px]">
                      <div className={`w-3 h-3 rounded-full ${priorityColors[priority]}`} />
                      <span className="text-sm font-medium capitalize">{priority}</span>
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-800">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${priorityColors[priority]}`}
                          style={{ width: `${(count / maxPriorityCount) * 100}%` }}
                        />
                      </div>
                    </div>
                    <Badge variant="secondary" className="min-w-[40px] justify-center">
                      {count}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>By Status</CardTitle>
            <CardDescription>
              Distribution of todos by current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusEntries.length > 0 ? (
                statusEntries.map(([status, count]) => (
                  <div key={status} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 min-w-[120px]">
                      <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
                      <span className="text-sm font-medium capitalize">
                        {status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-800">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${statusColors[status]}`}
                          style={{ width: `${(count / maxStatusCount) * 100}%` }}
                        />
                      </div>
                    </div>
                    <Badge variant="secondary" className="min-w-[40px] justify-center">
                      {count}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 