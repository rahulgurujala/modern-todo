import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { todoApi } from "@/lib/api";
import type { TodoUpdateRequest, TodoFilterParams } from "@/lib/types";
import { toast } from "sonner";

export const useTodos = (filters?: TodoFilterParams) => {
  return useQuery({
    queryKey: ["todos", filters],
    queryFn: () => todoApi.getTodos(filters),
  });
};

export const useTodo = (id: string) => {
  return useQuery({
    queryKey: ["todos", id],
    queryFn: () => todoApi.getTodo(id),
    enabled: !!id,
  });
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: todoApi.createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["todo-stats"] });
      toast.success("Todo created successfully!");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || "Failed to create todo");
    },
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TodoUpdateRequest }) =>
      todoApi.updateTodo(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["todos", id] });
      queryClient.invalidateQueries({ queryKey: ["todo-stats"] });
      toast.success("Todo updated successfully!");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || "Failed to update todo");
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: todoApi.deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["todo-stats"] });
      toast.success("Todo deleted successfully!");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || "Failed to delete todo");
    },
  });
};

export const useToggleTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      completed ? todoApi.markCompleted(id) : todoApi.markPending(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["todo-stats"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || "Failed to update todo");
    },
  });
};

export const useTodoStats = () => {
  return useQuery({
    queryKey: ["todo-stats"],
    queryFn: todoApi.getStats,
  });
};

export const useOverdueTodos = () => {
  return useQuery({
    queryKey: ["todos", "overdue"],
    queryFn: todoApi.getOverdue,
  });
};

export const useDueSoonTodos = (hours = 24) => {
  return useQuery({
    queryKey: ["todos", "due-soon", hours],
    queryFn: () => todoApi.getDueSoon(hours),
  });
};
