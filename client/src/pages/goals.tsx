import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Target, Trash2, Edit, MoreHorizontal, Check, Circle, Calendar } from "lucide-react";
import { ExportDropdown } from "@/components/export-dropdown";
import { exportGoals } from "@/lib/export-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Goal, Athlete, InsertGoal } from "@shared/schema";
import { GOAL_TIMEFRAMES, EVENTS } from "@shared/schema";

const formSchema = z.object({
  title: z.string().min(2, "Goal title is required"),
  description: z.string().optional(),
  athleteId: z.string().optional(),
  timeframe: z.enum(["Daily", "Weekly", "Monthly", "Quarterly", "Yearly", "Custom"]),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  linkedEvent: z.string().optional(),
  progress: z.number().min(0).max(100),
}).refine((data) => {
  if (data.timeframe === "Custom") {
    return data.startDate && data.targetDate;
  }
  return true;
}, {
  message: "Start date and target date are required for custom timeframe",
  path: ["targetDate"],
});

type FormData = z.infer<typeof formSchema>;

function formatDateRange(startDate: string | null | undefined, targetDate: string | null | undefined): string {
  if (!startDate || !targetDate) return "";
  const start = new Date(startDate);
  const end = new Date(targetDate);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${start.toLocaleDateString(undefined, options)} - ${end.toLocaleDateString(undefined, options)}`;
}

function GoalCard({
  goal,
  athlete,
  onEdit,
  onDelete,
  onToggleComplete,
  onUpdateProgress,
}: {
  goal: Goal;
  athlete?: Athlete;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onUpdateProgress: (id: string, progress: number) => void;
}) {
  return (
    <Card
      className={`hover-elevate ${goal.completed ? "opacity-75" : ""}`}
      data-testid={`goal-card-${goal.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 mt-0.5"
            onClick={() => onToggleComplete(goal.id, !goal.completed)}
            data-testid={`button-toggle-goal-${goal.id}`}
          >
            {goal.completed ? (
              <Check className="h-5 w-5 text-chart-5" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3
                  className={`font-medium ${goal.completed ? "line-through text-muted-foreground" : ""}`}
                >
                  {goal.title}
                </h3>
                {athlete && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {athlete.name}
                  </p>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0" data-testid={`button-goal-actions-${goal.id}`}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(goal)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(goal.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {goal.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {goal.description}
              </p>
            )}

            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge variant="outline">{goal.timeframe}</Badge>
              {goal.timeframe === "Custom" && goal.startDate && goal.targetDate && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDateRange(goal.startDate, goal.targetDate)}
                </span>
              )}
              {goal.linkedEvent && (
                <Badge variant="secondary">{goal.linkedEvent}</Badge>
              )}
              {!goal.athleteId && (
                <Badge variant="default" className="text-xs">Team Goal</Badge>
              )}
            </div>

            {!goal.completed && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-mono">{goal.progress || 0}%</span>
                </div>
                <Progress value={goal.progress || 0} className="h-2" />
                <Slider
                  value={[goal.progress || 0]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(values) => onUpdateProgress(goal.id, values[0])}
                  data-testid={`slider-progress-${goal.id}`}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Goals() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("all");
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      athleteId: "",
      timeframe: "Weekly",
      startDate: "",
      targetDate: "",
      linkedEvent: "",
      progress: 0,
    },
  });

  const watchTimeframe = form.watch("timeframe");

  const { data: goals, isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const { data: athletes, isLoading: athletesLoading } = useQuery<Athlete[]>({
    queryKey: ["/api/athletes"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertGoal) => apiRequest("POST", "/api/goals", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal created" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create goal", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertGoal> }) =>
      apiRequest("PATCH", `/api/goals/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal updated" });
      setIsDialogOpen(false);
      setEditingGoal(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to update goal", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/goals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete goal", variant: "destructive" });
    },
  });

  const onSubmit = (data: FormData) => {
    const submitData = {
      ...data,
      athleteId: data.athleteId === "team" || !data.athleteId ? null : data.athleteId,
      description: data.description || null,
      startDate: data.timeframe === "Custom" ? data.startDate : null,
      targetDate: data.timeframe === "Custom" ? data.targetDate : null,
      linkedEvent: data.linkedEvent === "none" || !data.linkedEvent ? null : data.linkedEvent,
      linkedSkillIds: [],
      completed: false,
    };
    if (editingGoal) {
      updateMutation.mutate({ id: editingGoal.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    form.reset({
      title: goal.title,
      description: goal.description || "",
      athleteId: goal.athleteId || "team",
      timeframe: (goal.timeframe as FormData["timeframe"]) || "Weekly",
      startDate: goal.startDate || "",
      targetDate: goal.targetDate || "",
      linkedEvent: goal.linkedEvent || "none",
      progress: goal.progress || 0,
    });
    setIsDialogOpen(true);
  };

  const handleOpenDialog = () => {
    setEditingGoal(null);
    form.reset({
      title: "",
      description: "",
      athleteId: "team",
      timeframe: "Weekly",
      startDate: "",
      targetDate: "",
      linkedEvent: "none",
      progress: 0,
    });
    setIsDialogOpen(true);
  };

  const handleToggleComplete = (id: string, completed: boolean) => {
    updateMutation.mutate({
      id,
      data: { completed, progress: completed ? 100 : undefined },
    });
  };

  const handleUpdateProgress = (id: string, progress: number) => {
    updateMutation.mutate({ id, data: { progress } });
  };

  const filteredGoals = goals?.filter((goal) => {
    if (selectedTimeframe === "all") return true;
    if (selectedTimeframe === "completed") return goal.completed;
    if (selectedTimeframe === "active") return !goal.completed;
    return goal.timeframe === selectedTimeframe;
  });

  const activeGoals = goals?.filter((g) => !g.completed) || [];
  const completedGoals = goals?.filter((g) => g.completed) || [];

  const isLoading = goalsLoading || athletesLoading;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Goals</h1>
          <p className="text-muted-foreground mt-1">
            Set and track goals for individual athletes or the whole team
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ExportDropdown
            onExport={(format) => goals && athletes && exportGoals(goals, athletes, format)}
            disabled={!goals?.length}
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog} data-testid="button-add-goal">
                <Plus className="h-4 w-4 mr-2" />
                Set Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? "Edit Goal" : "Set New Goal"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Master back handspring on beam"
                          {...field}
                          data-testid="input-goal-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add details about this goal..."
                          className="resize-none"
                          {...field}
                          data-testid="input-goal-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="athleteId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Athlete (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-goal-athlete">
                              <SelectValue placeholder="Team goal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="team">Team Goal</SelectItem>
                            {athletes?.map((athlete) => (
                              <SelectItem key={athlete.id} value={athlete.id}>
                                {athlete.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">
                          Leave empty for team-wide goal
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="timeframe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timeframe</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-goal-timeframe">
                              <SelectValue placeholder="Select timeframe" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {GOAL_TIMEFRAMES.map((tf) => (
                              <SelectItem key={tf} value={tf}>
                                {tf}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {watchTimeframe === "Custom" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              data-testid="input-goal-start-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="targetDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              data-testid="input-goal-target-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                <FormField
                  control={form.control}
                  name="linkedEvent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Linked Event (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-goal-event">
                            <SelectValue placeholder="No specific event" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No specific event</SelectItem>
                          {EVENTS.map((event) => (
                            <SelectItem key={event} value={event}>
                              {event}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {editingGoal && (
                  <FormField
                    control={form.control}
                    name="progress"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Progress</FormLabel>
                          <span className="text-sm font-mono">{field.value}%</span>
                        </div>
                        <FormControl>
                          <Slider
                            value={[field.value]}
                            min={0}
                            max={100}
                            step={5}
                            onValueChange={(values) => field.onChange(values[0])}
                            data-testid="slider-goal-progress"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-goal"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : editingGoal
                      ? "Update Goal"
                      : "Create Goal"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-md bg-chart-3/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">{activeGoals.length}</p>
              <p className="text-xs text-muted-foreground">Active Goals</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-md bg-chart-5/10 flex items-center justify-center">
              <Check className="h-6 w-6 text-chart-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">{completedGoals.length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">
                {goals?.length ? Math.round(
                  (goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length)
                ) : 0}%
              </p>
              <p className="text-xs text-muted-foreground">Avg Progress</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Tabs */}
      <Tabs value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all" data-testid="tab-all-goals">
            All ({goals?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="active" data-testid="tab-active-goals">
            Active ({activeGoals.length})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed-goals">
            Completed ({completedGoals.length})
          </TabsTrigger>
          {GOAL_TIMEFRAMES.map((tf) => (
            <TabsTrigger key={tf} value={tf} data-testid={`tab-${tf.toLowerCase()}`}>
              {tf}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedTimeframe} className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-32 mb-3" />
                    <Skeleton className="h-2 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredGoals && filteredGoals.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  athlete={athletes?.find((a) => a.id === goal.athleteId)}
                  onEdit={handleEdit}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  onToggleComplete={handleToggleComplete}
                  onUpdateProgress={handleUpdateProgress}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No goals found</p>
                <p className="text-sm mt-1">
                  {selectedTimeframe !== "all"
                    ? `No ${selectedTimeframe.toLowerCase()} goals yet`
                    : "Set your first goal to start tracking progress"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
