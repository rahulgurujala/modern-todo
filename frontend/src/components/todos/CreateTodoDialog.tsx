import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { useCreateTodo, useUpdateTodo } from '@/hooks/todos';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarDays } from 'lucide-react';
import type { Todo, TodoPriority, TodoStatus } from '@/lib/types';

const todoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  due_date: z.string().optional(),
});

type TodoFormData = z.infer<typeof todoSchema>;

interface CreateTodoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todo?: Todo | null;
}

export function CreateTodoDialog({ open, onOpenChange, todo }: CreateTodoDialogProps) {
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const isEditing = !!todo;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      priority: 'medium',
      status: 'pending',
    },
  });

  const priority = watch('priority');
  const status = watch('status');

  useEffect(() => {
    if (todo) {
      reset({
        title: todo.title,
        description: todo.description || '',
        priority: todo.priority,
        status: todo.status,
        due_date: todo.due_date ? format(new Date(todo.due_date), 'yyyy-MM-dd\'T\'HH:mm') : '',
      });
    } else {
      reset({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        due_date: '',
      });
    }
  }, [todo, reset]);

  const onSubmit = (data: TodoFormData) => {
    const payload = {
      title: data.title,
      description: data.description,
      priority: data.priority as TodoPriority,
      due_date: data.due_date || undefined,
      ...(isEditing && { status: data.status as TodoStatus }),
    };

    if (isEditing && todo) {
      updateTodo.mutate({ 
        id: todo.id, 
        data: payload 
      }, {
        onSuccess: () => {
          onOpenChange(false);
          reset();
        }
      });
    } else {
      createTodo.mutate(payload, {
        onSuccess: () => {
          onOpenChange(false);
          reset();
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Todo' : 'Create New Todo'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update your todo details below.'
              : 'Add a new todo to your list. Fill in the details below.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              {...register('title')}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add more details..."
              rows={3}
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(value: TodoPriority) => setValue('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isEditing && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(value: TodoStatus) => setValue('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date (Optional)</Label>
            <div className="relative">
              <Input
                id="due_date"
                type="datetime-local"
                {...register('due_date')}
                className="pl-10"
              />
              <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createTodo.isPending || updateTodo.isPending}
            >
              {createTodo.isPending || updateTodo.isPending 
                ? (isEditing ? 'Updating...' : 'Creating...') 
                : (isEditing ? 'Update Todo' : 'Create Todo')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 