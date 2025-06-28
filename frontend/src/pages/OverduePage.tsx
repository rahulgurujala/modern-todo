import { useState } from 'react';
import { useOverdueTodos } from '@/hooks/todos';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TodoCard } from '@/components/todos/TodoCard';
import { CreateTodoDialog } from '@/components/todos/CreateTodoDialog';
import { AlertTriangle, Plus } from 'lucide-react';
import type { Todo } from '@/lib/types';

export function OverduePage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const { data: overdueTodos, isLoading } = useOverdueTodos();

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setCreateDialogOpen(true);
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
    setEditingTodo(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <AlertTriangle className="mr-3 h-8 w-8 text-destructive" />
            Overdue Todos
          </h1>
          <p className="text-muted-foreground">
            These tasks are past their deadline and need immediate attention
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Todo
        </Button>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-destructive">
            {isLoading ? 'Loading...' : `${overdueTodos?.length || 0} Overdue Tasks`}
          </CardTitle>
          <CardDescription>
            Complete these tasks as soon as possible to stay on track
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : overdueTodos && overdueTodos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overdueTodos.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onEdit={handleEditTodo}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="h-16 w-16 mx-auto mb-4 opacity-50 text-green-500" />
              <h3 className="text-lg font-medium mb-2 text-green-600">All caught up!</h3>
              <p className="mb-4">You have no overdue tasks. Great job staying on track!</p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Todo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateTodoDialog
        open={createDialogOpen}
        onOpenChange={handleCreateDialogClose}
        todo={editingTodo}
      />
    </div>
  );
} 