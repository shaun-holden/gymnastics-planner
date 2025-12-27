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
import { Progress } from "@/components/ui/progress";
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
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, Clock, Trash2, Edit, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Practice, Athlete, InsertPractice } from "@shared/schema";
import { DAYS_OF_WEEK, EVENTS } from "@shared/schema";

const formSchema = z.object({
  athleteId: z.string().min(1, "Athlete is required"),
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

function PracticeCard({
  practice,
  athlete,
  onEdit,
  onDelete,
}: {
  practice: Practice;
  athlete?: Athlete;
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
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline">{practice.dayOfWeek}</Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {formatMinutes(totalMinutes)} total
              </span>
            </div>
            {athlete && (
              <p className="font-medium">{athlete.name}</p>
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

        {/* Time Allocation Bars */}
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
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      athleteId: "",
      dayOfWeek: "Monday",
      vaultMinutes: 30,
      barsMinutes: 30,
      beamMinutes: 30,
      floorMinutes: 30,
    },
  });

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
    const submitData = {
      ...data,
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
      athleteId: practice.athleteId,
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
      athleteId: athletes?.[0]?.id || "",
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

  // Group practices by day
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
            Schedule practice time by event for each athlete
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog} disabled={!athletes?.length} data-testid="button-add-practice">
              <Plus className="h-4 w-4 mr-2" />
              Create Practice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingPractice ? "Edit Practice Plan" : "Create Practice Plan"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="athleteId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Athlete</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-practice-athlete">
                              <SelectValue placeholder="Select athlete" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {athletes?.map((athlete) => (
                              <SelectItem key={athlete.id} value={athlete.id}>
                                {athlete.name}
                              </SelectItem>
                            ))}
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

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
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

      {!athletes?.length && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Add athletes first</p>
            <p className="text-sm mt-1">Create athlete profiles before scheduling practices</p>
          </CardContent>
        </Card>
      )}

      {/* Weekly Schedule Grid */}
      {athletes && athletes.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {DAYS_OF_WEEK.map((day) => (
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
                      athlete={athletes.find((a) => a.id === practice.athleteId)}
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
      )}
    </div>
  );
}
