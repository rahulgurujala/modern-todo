import { useState } from "react";
import { useTodos } from "@/hooks/todos";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TodoCard } from "@/components/todos/TodoCard";
import { CreateTodoDialog } from "@/components/todos/CreateTodoDialog";
import { Plus, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import type {
  Todo,
  TodoFilterParams,
  TodoStatus,
  TodoPriority,
} from "@/lib/types";

export function TodosPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filters, setFilters] = useState<TodoFilterParams>({
    page: 1,
    per_page: 12,
  });

  const { data: todosData, isLoading } = useTodos(filters);

  const handleFilterChange = (
    key: keyof TodoFilterParams,
    value: string | number | boolean | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      per_page: 12,
    });
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setCreateDialogOpen(true);
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
    setEditingTodo(null);
  };

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.priority ||
    filters.is_completed !== undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Todos</h1>
          <p className="text-muted-foreground">
            Manage and organize your tasks
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Todo
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search todos..."
                  value={filters.search || ""}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "status",
                    value === "all" ? undefined : (value as TodoStatus)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={filters.priority || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "priority",
                    value === "all" ? undefined : (value as TodoPriority)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Completion</Label>
              <Select
                value={
                  filters.is_completed === undefined
                    ? "all"
                    : filters.is_completed
                    ? "completed"
                    : "incomplete"
                }
                onValueChange={(value) => {
                  const completed =
                    value === "all" ? undefined : value === "completed";
                  handleFilterChange("is_completed", completed);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Active filters:
                </span>
                {filters.search && (
                  <Badge variant="secondary">Search: {filters.search}</Badge>
                )}
                {filters.status && (
                  <Badge variant="secondary">Status: {filters.status}</Badge>
                )}
                {filters.priority && (
                  <Badge variant="secondary">
                    Priority: {filters.priority}
                  </Badge>
                )}
                {filters.is_completed !== undefined && (
                  <Badge variant="secondary">
                    {filters.is_completed ? "Completed" : "Incomplete"}
                  </Badge>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {isLoading ? "Loading..." : `${todosData?.total || 0} Todos`}
              </CardTitle>
              {todosData && (
                <CardDescription>
                  Showing {(todosData.page - 1) * todosData.per_page + 1} to{" "}
                  {Math.min(
                    todosData.page * todosData.per_page,
                    todosData.total
                  )}{" "}
                  of {todosData.total} results
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : todosData && todosData.todos.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todosData.todos.map((todo) => (
                  <TodoCard key={todo.id} todo={todo} onEdit={handleEditTodo} />
                ))}
              </div>

              {/* Pagination */}
              {todosData.total > todosData.per_page && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {todosData.page} of{" "}
                    {Math.ceil(todosData.total / todosData.per_page)}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(todosData.page - 1)}
                      disabled={!todosData.has_prev}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(todosData.page + 1)}
                      disabled={!todosData.has_next}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No todos found</h3>
              <p className="mb-4">
                {hasActiveFilters
                  ? "Try adjusting your filters or create a new todo"
                  : "Get started by creating your first todo"}
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Todo
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
