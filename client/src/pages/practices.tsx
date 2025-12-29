import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, Clock, Trash2, Edit, MoreHorizontal, Users, User, Layers } from "lucide-react";
import { ExportDropdown } from "@/components/export-dropdown";
import { exportPractices } from "@/lib/export-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Practice, Athlete, InsertPractice } from "@shared/schema";
import { DAYS_OF_WEEK, EVENTS, PRACTICE_TARGET_TYPES } from "@shared/schema";

const LEVELS = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
  "TOPS", "HOPES 11-12", "HOPES 13-14", "Jr. Elite", "Elite",
  "Xcel Bronze", "Xcel Silver", "Xcel Gold", "Xcel Platinum", "Xcel Diamond", "Xcel Sapphire",
  "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Sapphire"
];

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  targetType: z.enum(["athletes", "level", "group", "all"]),
  athleteIds: z.array(z.string()).optional(),
  levels: z.array(z.string()).optional(),
  groupName: z.string().optional(),
  dayOfWeek: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
  vaultMinutes: z.number().min(0).max(180),
  barsMinutes: z.number().min(0).max(180),
  beamMinutes: z.number().min(0).max(180),
  floorMinutes: z.number().min(0).max(180),
});

type FormData = z.infer<typeof formSchema>;

const EVENT_COLORS: Record<string, string> = {
  Vault: "bg-chart-1",
  Bars: "bg-chart-2",
  Beam: "bg-chart-3",
  Floor: "bg-chart-4",
};

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
}

function getTargetLabel(practice: Practice, athletes?: Athlete[]): string {
  switch (practice.targetType) {
    case "athletes":
      if (practice.athleteIds && practice.athleteIds.length > 0) {
        const names = practice.athleteIds
          .map(id => athletes?.find(a => a.id === id)?.name || "Unknown")
          .join(", ");
        return names;
      }
      return "No athletes";
    case "level":
      if (practice.levels && practice.levels.length > 0) {
        return `Level: ${practice.levels.join(", ")}`;
      }
      return "All levels";
    case "group":
      return practice.groupName || "All groups";
    case "all":
    default:
      return "All Athletes";
  }
}

function PracticeCard({
  practice,
  athletes,
  onEdit,
  onDelete,
}: {
  practice: Practice;
  athletes?: Athlete[];
  onEdit: (practice: Practice) => void;
  onDelete: (id: string) => void;
}) {
  const totalMinutes =
    (practice.vaultMinutes || 0) +
    (practice.barsMinutes || 0) +
    (practice.beamMinutes || 0) +
    (practice.floorMinutes || 0);

  const events = [
    { name: "Vault", minutes: practice.vaultMinutes || 0 },
    { name: "Bars", minutes: practice.barsMinutes || 0 },
    { name: "Beam", minutes: practice.beamMinutes || 0 },
    { name: "Floor", minutes: practice.floorMinutes || 0 },
  ].filter((e) => e.minutes > 0);

  return (
    <Card className="hover-elevate" data-testid={`practice-card-${practice.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="outline">{practice.dayOfWeek}</Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {formatMinutes(totalMinutes)} total
              </span>
            </div>
            <p className="font-medium truncate">{practice.title}</p>
            <p className="text-sm text-muted-foreground truncate">
              {getTargetLabel(practice, athletes)}
            </p>
            {practice.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {practice.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0" data-testid={`button-practice-actions-${practice.id}`}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(practice)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(practice.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.name} className="flex items-center gap-2">
              <span className="text-xs w-12 text-muted-foreground">{event.name}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${EVENT_COLORS[event.name]} rounded-full`}
                  style={{ width: `${(event.minutes / Math.max(totalMinutes, 60)) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono w-12 text-right">{event.minutes}m</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Practices() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPractice, setEditingPractice] = useState<Practice | null>(null);
  const [dayFilter, setDayFilter] = useState<string>("all");
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      targetType: "all",
      athleteIds: [],
      levels: [],
      groupName: "",
      dayOfWeek: "Monday",
      vaultMinutes: 30,
      barsMinutes: 30,
      beamMinutes: 30,
      floorMinutes: 30,
    },
  });

  const targetType = form.watch("targetType");

  const { data: practices, isLoading: practicesLoading } = useQuery<Practice[]>({
    queryKey: ["/api/practices"],
  });

  const { data: athletes, isLoading: athletesLoading } = useQuery<Athlete[]>({
    queryKey: ["/api/athletes"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertPractice) => apiRequest("POST", "/api/practices", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/practices"] });
      toast({ title: "Practice plan created" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create practice plan", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InsertPractice }) =>
      apiRequest("PATCH", `/api/practices/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/practices"] });
      toast({ title: "Practice plan updated" });
      setIsDialogOpen(false);
      setEditingPractice(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to update practice plan", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/practices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/practices"] });
      toast({ title: "Practice plan deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete practice plan", variant: "destructive" });
    },
  });

  const onSubmit = (data: FormData) => {
    const submitData: InsertPractice = {
      title: data.title,
      description: data.description || null,
      targetType: data.targetType,
      athleteIds: data.targetType === "athletes" ? data.athleteIds || null : null,
      levels: data.targetType === "level" ? data.levels || null : null,
      groupName: data.targetType === "group" ? data.groupName || null : null,
      dayOfWeek: data.dayOfWeek,
      vaultMinutes: data.vaultMinutes,
      barsMinutes: data.barsMinutes,
      beamMinutes: data.beamMinutes,
      floorMinutes: data.floorMinutes,
      skillIds: [],
    };
    if (editingPractice) {
      updateMutation.mutate({ id: editingPractice.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (practice: Practice) => {
    setEditingPractice(practice);
    form.reset({
      title: practice.title,
      description: practice.description || "",
      targetType: (practice.targetType as FormData["targetType"]) || "all",
      athleteIds: practice.athleteIds || [],
      levels: practice.levels || [],
      groupName: practice.groupName || "",
      dayOfWeek: practice.dayOfWeek as FormData["dayOfWeek"],
      vaultMinutes: practice.vaultMinutes || 0,
      barsMinutes: practice.barsMinutes || 0,
      beamMinutes: practice.beamMinutes || 0,
      floorMinutes: practice.floorMinutes || 0,
    });
    setIsDialogOpen(true);
  };

  const handleOpenDialog = () => {
    setEditingPractice(null);
    form.reset({
      title: "",
      description: "",
      targetType: "all",
      athleteIds: [],
      levels: [],
      groupName: "",
      dayOfWeek: "Monday",
      vaultMinutes: 30,
      barsMinutes: 30,
      beamMinutes: 30,
      floorMinutes: 30,
    });
    setIsDialogOpen(true);
  };

  const watchedValues = form.watch();
  const totalMinutes =
    watchedValues.vaultMinutes +
    watchedValues.barsMinutes +
    watchedValues.beamMinutes +
    watchedValues.floorMinutes;

  const practicesByDay = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = practices?.filter((p) => p.dayOfWeek === day) || [];
    return acc;
  }, {} as Record<string, Practice[]>);

  const isLoading = practicesLoading || athletesLoading;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Practice Plans</h1>
          <p className="text-muted-foreground mt-1">
            Create and schedule practice plans for athletes, levels, or groups
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={dayFilter} onValueChange={setDayFilter}>
            <SelectTrigger className="w-36" data-testid="select-day-filter">
              <SelectValue placeholder="Filter by day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days</SelectItem>
              {DAYS_OF_WEEK.map((day) => (
                <SelectItem key={day} value={day}>{day}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ExportDropdown
            onExport={(format) => practices && athletes && exportPractices(practices, athletes, format)}
            disabled={!practices?.length}
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog} data-testid="button-add-practice">
                <Plus className="h-4 w-4 mr-2" />
                Create Practice
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPractice ? "Edit Practice Plan" : "Create Practice Plan"}
              </DialogTitle>
              <DialogDescription>
                Create a practice plan for athletes, levels, or groups
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Competition Prep, Skills Work"
                          data-testid="input-practice-title"
                          {...field}
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
                          placeholder="Describe what this practice plan focuses on..."
                          className="resize-none"
                          data-testid="input-practice-description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="targetType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign To</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-practice-target-type">
                              <SelectValue placeholder="Select target" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                All Athletes
                              </div>
                            </SelectItem>
                            <SelectItem value="athletes">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Specific Athletes
                              </div>
                            </SelectItem>
                            <SelectItem value="level">
                              <div className="flex items-center gap-2">
                                <Layers className="h-4 w-4" />
                                By Level
                              </div>
                            </SelectItem>
                            <SelectItem value="group">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                By Group
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dayOfWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day of Week</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-practice-day">
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DAYS_OF_WEEK.map((day) => (
                              <SelectItem key={day} value={day}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {targetType === "athletes" && athletes && athletes.length > 0 && (
                  <FormField
                    control={form.control}
                    name="athleteIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Athletes</FormLabel>
                        <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                          {athletes.map((athlete) => (
                            <div key={athlete.id} className="flex items-center gap-2">
                              <Checkbox
                                id={`athlete-${athlete.id}`}
                                checked={field.value?.includes(athlete.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, athlete.id]);
                                  } else {
                                    field.onChange(current.filter((id) => id !== athlete.id));
                                  }
                                }}
                              />
                              <Label htmlFor={`athlete-${athlete.id}`} className="text-sm cursor-pointer">
                                {athlete.name} ({athlete.level})
                              </Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {targetType === "level" && (
                  <FormField
                    control={form.control}
                    name="levels"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Levels</FormLabel>
                        <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                          {LEVELS.map((level) => (
                            <div key={level} className="flex items-center gap-2">
                              <Checkbox
                                id={`level-${level}`}
                                checked={field.value?.includes(level)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, level]);
                                  } else {
                                    field.onChange(current.filter((l) => l !== level));
                                  }
                                }}
                              />
                              <Label htmlFor={`level-${level}`} className="text-sm cursor-pointer">
                                {level}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {targetType === "group" && (
                  <FormField
                    control={form.control}
                    name="groupName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Team A, Competition Squad"
                            data-testid="input-practice-group"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm font-medium">Event Time Allocation</span>
                    <Badge variant="secondary" className="font-mono">
                      {formatMinutes(totalMinutes)} total
                    </Badge>
                  </div>

                  {EVENTS.map((event) => {
                    const fieldName = `${event.toLowerCase()}Minutes` as keyof FormData;
                    return (
                      <FormField
                        key={event}
                        control={form.control}
                        name={fieldName as "vaultMinutes" | "barsMinutes" | "beamMinutes" | "floorMinutes"}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between mb-2">
                              <FormLabel className="flex items-center gap-2">
                                <div className={`h-3 w-3 rounded-full ${EVENT_COLORS[event]}`} />
                                {event}
                              </FormLabel>
                              <span className="text-sm font-mono text-muted-foreground">
                                {field.value}m
                              </span>
                            </div>
                            <FormControl>
                              <Slider
                                min={0}
                                max={90}
                                step={15}
                                value={[field.value as number]}
                                onValueChange={(values) => field.onChange(values[0])}
                                data-testid={`slider-${event.toLowerCase()}`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    );
                  })}
                </div>

                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-practice"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : editingPractice
                      ? "Update Practice"
                      : "Create Practice"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {(dayFilter === "all" ? DAYS_OF_WEEK : [dayFilter]).map((day) => (
          <div key={day}>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {day}
              {practicesByDay[day].length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {practicesByDay[day].length}
                </Badge>
              )}
            </h3>
            <div className="space-y-3">
              {isLoading ? (
                <Card>
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ) : practicesByDay[day].length > 0 ? (
                practicesByDay[day].map((practice) => (
                  <PracticeCard
                    key={practice.id}
                    practice={practice}
                    athletes={athletes}
                    onEdit={handleEdit}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))
              ) : (
                <Card className="border-dashed">
                  <CardContent className="p-4 text-center text-muted-foreground text-sm">
                    No practices scheduled
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
