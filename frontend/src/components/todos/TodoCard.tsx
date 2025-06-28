import { useState } from 'react';
import { formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import { useToggleTodo, useDeleteTodo } from '@/hooks/todos';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import type { Todo, TodoPriority, TodoStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TodoCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
}

const priorityColors: Record<TodoPriority, string> = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const statusColors: Record<TodoStatus, string> = {
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export function TodoCard({ todo, onEdit }: TodoCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();

  const isOverdue = todo.due_date && 
    isBefore(new Date(todo.due_date), new Date()) && 
    !todo.is_completed;

  const isDueSoon = todo.due_date && 
    isAfter(new Date(todo.due_date), new Date()) &&
    isBefore(new Date(todo.due_date), new Date(Date.now() + 24 * 60 * 60 * 1000));

  const handleToggle = () => {
    toggleTodo.mutate({ id: todo.id, completed: !todo.is_completed });
  };

  const handleDelete = () => {
    deleteTodo.mutate(todo.id);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Card className={cn(
        'transition-all duration-200 hover:shadow-md',
        todo.is_completed && 'opacity-75',
        isOverdue && 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/50'
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <Checkbox
                checked={todo.is_completed}
                onCheckedChange={handleToggle}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  'font-medium text-sm mb-1 break-words',
                  todo.is_completed && 'line-through text-muted-foreground'
                )}>
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className={cn(
                    'text-sm text-muted-foreground mb-2 break-words',
                    todo.is_completed && 'line-through'
                  )}>
                    {todo.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge 
                    variant="secondary" 
                    className={priorityColors[todo.priority]}
                  >
                    {todo.priority}
                  </Badge>
                  <Badge 
                    variant="secondary"
                    className={statusColors[todo.status]}
                  >
                    {todo.status.replace('_', ' ')}
                  </Badge>
                </div>
                {todo.due_date && (
                  <div className={cn(
                    'flex items-center space-x-1 text-xs',
                    isOverdue ? 'text-red-600 dark:text-red-400' :
                    isDueSoon ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-muted-foreground'
                  )}>
                    {isOverdue && <AlertTriangle className="h-3 w-3" />}
                    <Calendar className="h-3 w-3" />
                    <span>
                      Due {formatDistanceToNow(new Date(todo.due_date), { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(todo)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your todo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 