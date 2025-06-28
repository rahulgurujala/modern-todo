import { useState } from 'react';
import { useDueSoonTodos } from '@/hooks/todos';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TodoCard } from '@/components/todos/TodoCard';
import { CreateTodoDialog } from '@/components/todos/CreateTodoDialog';
import { Clock, Plus } from 'lucide-react';
import type { Todo } from '@/lib/types';

export function DueSoonPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const { data: dueSoonTodos, isLoading } = useDueSoonTodos();

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
            <Clock className="mr-3 h-8 w-8 text-yellow-600" />
            Due Soon
          </h1>
          <p className="text-muted-foreground">
            Tasks due within the next 24 hours
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
          <CardTitle className="text-lg text-yellow-600">
            {isLoading ? 'Loading...' : `${dueSoonTodos?.length || 0} Tasks Due Soon`}
          </CardTitle>
          <CardDescription>
            Plan ahead and complete these tasks before their deadlines
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : dueSoonTodos && dueSoonTodos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dueSoonTodos.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onEdit={handleEditTodo}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-16 w-16 mx-auto mb-4 opacity-50 text-green-500" />
              <h3 className="text-lg font-medium mb-2 text-green-600">Nothing urgent!</h3>
              <p className="mb-4">No tasks are due in the next 24 hours. Perfect timing!</p>
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