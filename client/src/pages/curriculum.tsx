import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  BookOpen,
  Trash2,
  Edit,
  MoreHorizontal,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  StickyNote,
} from "lucide-react";
import type { Curriculum, Skill, InsertCurriculum, Athlete } from "@shared/schema";
import { EVENTS, CURRICULUM_STATUSES } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, User } from "lucide-react";

const PROGRAMS = ["Competitive", "Recreational", "TOPS", "Xcel"] as const;
const LEVELS = [
  "Level 1", "Level 2", "Level 3", "Level 4", "Level 5",
  "Level 6", "Level 7", "Level 8", "Level 9", "Level 10",
  "Elite", "Bronze", "Silver", "Gold", "Platinum", "Diamond"
] as const;

const formSchema = z.object({
  program: z.string().min(1, "Program is required"),
  level: z.string().min(1, "Level is required"),
  event: z.string().min(1, "Event is required"),
  skillId: z.string().min(1, "Skill is required"),
  athleteIds: z.array(z.string()).optional(),
  introDate: z.string().optional(),
  checkpointDate: z.string().optional(),
  masteryTargetDate: z.string().optional(),
  status: z.string().default("Not Started"),
  progress: z.number().min(0).max(100).default(0),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const ASSIGNMENT_FILTERS = ["all", "unassigned", "individual"] as const;
type AssignmentFilter = typeof ASSIGNMENT_FILTERS[number];

function getStatusIcon(status: string) {
  switch (status) {
    case "Mastered":
      return <CheckCircle2 className="h-4 w-4 text-chart-5" />;
    case "Checkpoint":
      return <AlertCircle className="h-4 w-4 text-chart-4" />;
    case "In Progress":
      return <Clock className="h-4 w-4 text-chart-3" />;
    case "Introduced":
      return <ChevronRight className="h-4 w-4 text-chart-2" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function getStatusColor(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "Mastered":
      return "default";
    case "Checkpoint":
    case "In Progress":
      return "secondary";
    default:
      return "outline";
  }
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
}

function isOverdue(targetDate: string | null | undefined, status: string): boolean {
  if (!targetDate || status === "Mastered") return false;
  try {
    return new Date(targetDate) < new Date();
  } catch {
    return false;
  }
}

function CurriculumItemCard({
  item,
  skill,
  athletes,
  onEdit,
  onDelete,
  onUpdateProgress,
}: {
  item: Curriculum;
  skill?: Skill;
  athletes?: Athlete[];
  onEdit: (item: Curriculum) => void;
  onDelete: (id: string) => void;
  onUpdateProgress: (id: string, progress: number) => void;
}) {
  const overdue = isOverdue(item.masteryTargetDate, item.status || "Not Started");
  
  const assignedAthletes = useMemo(() => {
    if (!item.athleteIds || item.athleteIds.length === 0 || !athletes) return null;
    return item.athleteIds
      .map((id) => athletes.find((a) => a.id === id))
      .filter(Boolean) as Athlete[];
  }, [item.athleteIds, athletes]);

  return (
    <Card
      className={`hover-elevate ${overdue ? "border-destructive/50" : ""}`}
      data-testid={`curriculum-item-${item.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            {getStatusIcon(item.status || "Not Started")}
            <div className="min-w-0">
              <h4 className="font-medium truncate">{skill?.name || "Unknown Skill"}</h4>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {skill?.value || "?"}
                </Badge>
                {skill?.skillGroup && (
                  <span className="text-xs text-muted-foreground">{skill.skillGroup}</span>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0" data-testid={`button-curriculum-actions-${item.id}`}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs mb-3">
          <div>
            <span className="text-muted-foreground block">Intro</span>
            <span className="font-mono">{formatDate(item.introDate)}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Check</span>
            <span className="font-mono">{formatDate(item.checkpointDate)}</span>
          </div>
          <div>
            <span className={`block ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
              Mastery
            </span>
            <span className={`font-mono ${overdue ? "text-destructive" : ""}`}>
              {formatDate(item.masteryTargetDate)}
            </span>
          </div>
        </div>

        {assignedAthletes && assignedAthletes.length > 0 && (
          <div className="flex items-center gap-1 mb-2 flex-wrap">
            <User className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground truncate">
              {assignedAthletes.map(a => a.name).join(", ")}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={getStatusColor(item.status || "Not Started")}>
            {item.status || "Not Started"}
          </Badge>
          {(!item.athleteIds || item.athleteIds.length === 0) && (
            <Badge variant="outline" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Group
            </Badge>
          )}
          <span className="text-xs font-mono ml-auto">{item.progress || 0}%</span>
        </div>

        <Progress value={item.progress || 0} className="h-1.5 mb-2" />

        <Slider
          value={[item.progress || 0]}
          min={0}
          max={100}
          step={5}
          onValueChange={(values) => onUpdateProgress(item.id, values[0])}
          data-testid={`slider-curriculum-progress-${item.id}`}
        />

        {item.notes && (
          <div className="mt-3 pt-3 border-t flex items-start gap-2">
            <StickyNote className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground line-clamp-2">{item.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CurriculumPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Curriculum | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>("all");
  const [selectedAthleteFilter, setSelectedAthleteFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"hierarchy" | "timeline">("hierarchy");
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      program: "",
      level: "",
      event: "",
      skillId: "",
      athleteIds: [],
      introDate: "",
      checkpointDate: "",
      masteryTargetDate: "",
      status: "Not Started",
      progress: 0,
      notes: "",
    },
  });

  const selectedEvent = form.watch("event");

  const { data: curriculumItems, isLoading: curriculumLoading } = useQuery<Curriculum[]>({
    queryKey: ["/api/curriculum"],
  });

  const { data: skills, isLoading: skillsLoading } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });

  const { data: athletes, isLoading: athletesLoading } = useQuery<Athlete[]>({
    queryKey: ["/api/athletes"],
  });

  // Refresh skills cache on mount to ensure latest skills are loaded
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
  }, []);

  const createMutation = useMutation({
    mutationFn: (data: InsertCurriculum) => apiRequest("POST", "/api/curriculum", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/curriculum"] });
      toast({ title: "Curriculum item added" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to add curriculum item", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertCurriculum> }) =>
      apiRequest("PATCH", `/api/curriculum/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/curriculum"] });
      toast({ title: "Curriculum item updated" });
      setIsDialogOpen(false);
      setEditingItem(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to update curriculum item", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/curriculum/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/curriculum"] });
      toast({ title: "Curriculum item deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete curriculum item", variant: "destructive" });
    },
  });

  const onSubmit = (data: FormData) => {
    const submitData = {
      ...data,
      athleteIds: data.athleteIds && data.athleteIds.length > 0 ? data.athleteIds : null,
      introDate: data.introDate || null,
      checkpointDate: data.checkpointDate || null,
      masteryTargetDate: data.masteryTargetDate || null,
      notes: data.notes || null,
    };
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (item: Curriculum) => {
    setEditingItem(item);
    form.reset({
      program: item.program,
      level: item.level,
      event: item.event,
      skillId: item.skillId,
      athleteIds: item.athleteIds || [],
      introDate: item.introDate || "",
      checkpointDate: item.checkpointDate || "",
      masteryTargetDate: item.masteryTargetDate || "",
      status: item.status || "Not Started",
      progress: item.progress || 0,
      notes: item.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleOpenDialog = () => {
    setEditingItem(null);
    form.reset({
      program: selectedProgram !== "all" ? selectedProgram : "",
      level: selectedLevel !== "all" ? selectedLevel : "",
      event: "",
      skillId: "",
      athleteIds: [],
      introDate: "",
      checkpointDate: "",
      masteryTargetDate: "",
      status: "Not Started",
      progress: 0,
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const handleUpdateProgress = (id: string, progress: number) => {
    const newStatus = progress >= 100 ? "Mastered" : progress >= 50 ? "In Progress" : progress > 0 ? "Introduced" : "Not Started";
    updateMutation.mutate({ id, data: { progress, status: newStatus } });
  };

  const filteredSkills = useMemo(() => {
    if (!skills || !selectedEvent) return [];
    return skills.filter((s) => s.event === selectedEvent);
  }, [skills, selectedEvent]);

  const filteredItems = useMemo(() => {
    if (!curriculumItems) return [];
    return curriculumItems.filter((item) => {
      if (selectedProgram !== "all" && item.program !== selectedProgram) return false;
      if (selectedLevel !== "all" && item.level !== selectedLevel) return false;
      if (assignmentFilter === "unassigned") {
        if (item.athleteIds && item.athleteIds.length > 0) return false;
      } else if (assignmentFilter === "individual") {
        if (!item.athleteIds || item.athleteIds.length === 0) return false;
        if (selectedAthleteFilter !== "all" && !item.athleteIds.includes(selectedAthleteFilter)) return false;
      }
      return true;
    });
  }, [curriculumItems, selectedProgram, selectedLevel, assignmentFilter, selectedAthleteFilter]);

  const hierarchyData = useMemo(() => {
    const hierarchy: Record<string, Record<string, Record<string, Curriculum[]>>> = {};
    filteredItems.forEach((item) => {
      if (!hierarchy[item.program]) hierarchy[item.program] = {};
      if (!hierarchy[item.program][item.level]) hierarchy[item.program][item.level] = {};
      if (!hierarchy[item.program][item.level][item.event]) hierarchy[item.program][item.level][item.event] = [];
      hierarchy[item.program][item.level][item.event].push(item);
    });
    return hierarchy;
  }, [filteredItems]);

  const timelineSortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const dateA = a.masteryTargetDate || a.checkpointDate || a.introDate || "";
      const dateB = b.masteryTargetDate || b.checkpointDate || b.introDate || "";
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });
  }, [filteredItems]);

  const programs = useMemo(() => {
    const set = new Set(curriculumItems?.map((i) => i.program) || []);
    return Array.from(set);
  }, [curriculumItems]);

  const levels = useMemo(() => {
    const set = new Set(curriculumItems?.map((i) => i.level) || []);
    return Array.from(set);
  }, [curriculumItems]);

  const stats = useMemo(() => {
    const items = filteredItems;
    const mastered = items.filter((i) => i.status === "Mastered").length;
    const inProgress = items.filter((i) => i.status === "In Progress" || i.status === "Introduced").length;
    const notStarted = items.filter((i) => !i.status || i.status === "Not Started").length;
    const overdue = items.filter((i) => isOverdue(i.masteryTargetDate, i.status || "Not Started")).length;
    return { total: items.length, mastered, inProgress, notStarted, overdue };
  }, [filteredItems]);

  const isLoading = curriculumLoading || skillsLoading || athletesLoading;

  const getAthleteNames = (athleteIds: string[] | null | undefined): string => {
    if (!athleteIds || athleteIds.length === 0 || !athletes) return "";
    const names = athleteIds
      .map((id) => athletes.find((a) => a.id === id)?.name)
      .filter(Boolean);
    return names.join(", ");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Curriculum</h1>
          <p className="text-muted-foreground mt-1">
            Plan and track skill progression by program, level, and event
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog} data-testid="button-add-curriculum">
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Curriculum Item" : "Add Skill to Curriculum"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="program"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Program</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-curriculum-program">
                              <SelectValue placeholder="Select program" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PROGRAMS.map((p) => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Level</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-curriculum-level">
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LEVELS.map((l) => (
                              <SelectItem key={l} value={l}>{l}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="event"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-curriculum-event">
                              <SelectValue placeholder="Select event" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EVENTS.map((e) => (
                              <SelectItem key={e} value={e}>{e}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="skillId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skill</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedEvent}>
                          <FormControl>
                            <SelectTrigger data-testid="select-curriculum-skill">
                              <SelectValue placeholder={selectedEvent ? "Select skill" : "Select event first"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredSkills.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name} ({s.value})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="athleteIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign to Athletes (Optional)</FormLabel>
                      <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                        {athletes && athletes.length > 0 ? (
                          athletes.map((athlete) => (
                            <div key={athlete.id} className="flex items-center gap-2">
                              <Checkbox
                                id={`athlete-${athlete.id}`}
                                checked={field.value?.includes(athlete.id) || false}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, athlete.id]);
                                  } else {
                                    field.onChange(current.filter((id) => id !== athlete.id));
                                  }
                                }}
                                data-testid={`checkbox-athlete-${athlete.id}`}
                              />
                              <label
                                htmlFor={`athlete-${athlete.id}`}
                                className="text-sm cursor-pointer"
                              >
                                {athlete.name} - {athlete.level}
                              </label>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No athletes available. Add athletes first.</p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Leave empty to apply to all athletes (group assignment)
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="introDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intro Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-curriculum-intro-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="checkpointDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Checkpoint</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-curriculum-checkpoint-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="masteryTargetDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mastery Target</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-curriculum-mastery-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-curriculum-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CURRICULUM_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            data-testid="slider-curriculum-form-progress"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Training notes, tips, or observations..."
                          className="resize-none"
                          {...field}
                          data-testid="input-curriculum-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-curriculum"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : editingItem
                      ? "Update"
                      : "Add to Curriculum"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Skills</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-md bg-chart-5/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-chart-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">{stats.mastered}</p>
              <p className="text-xs text-muted-foreground">Mastered</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-md bg-chart-3/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">{stats.inProgress}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-md bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">{stats.overdue}</p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <Select value={selectedProgram} onValueChange={setSelectedProgram}>
          <SelectTrigger className="w-40" data-testid="filter-program">
            <SelectValue placeholder="All Programs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            {programs.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-40" data-testid="filter-level">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {levels.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={assignmentFilter} onValueChange={(v) => {
          setAssignmentFilter(v as AssignmentFilter);
          if (v !== "individual") setSelectedAthleteFilter("all");
        }}>
          <SelectTrigger className="w-44" data-testid="filter-assignment">
            <SelectValue placeholder="All Assignments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                All Assignments
              </span>
            </SelectItem>
            <SelectItem value="unassigned">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Group (Unassigned)
              </span>
            </SelectItem>
            <SelectItem value="individual">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Individual
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        {assignmentFilter === "individual" && (
          <Select value={selectedAthleteFilter} onValueChange={setSelectedAthleteFilter}>
            <SelectTrigger className="w-44" data-testid="filter-athlete">
              <SelectValue placeholder="All Athletes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Athletes</SelectItem>
              {athletes?.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="ml-auto">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "hierarchy" | "timeline")}>
            <TabsList>
              <TabsTrigger value="hierarchy" data-testid="view-hierarchy">
                <BookOpen className="h-4 w-4 mr-2" />
                Hierarchy
              </TabsTrigger>
              <TabsTrigger value="timeline" data-testid="view-timeline">
                <Calendar className="h-4 w-4 mr-2" />
                Timeline
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : viewMode === "hierarchy" ? (
        Object.keys(hierarchyData).length > 0 ? (
          <Accordion type="multiple" defaultValue={Object.keys(hierarchyData)} className="space-y-4">
            {Object.entries(hierarchyData).map(([program, levels]) => (
              <AccordionItem key={program} value={program} className="border rounded-md px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{program}</span>
                    <Badge variant="secondary" className="ml-2">
                      {Object.values(levels).flat().flat().length} skills
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <Accordion type="multiple" defaultValue={Object.keys(levels)} className="space-y-2">
                    {Object.entries(levels).map(([level, events]) => (
                      <AccordionItem key={level} value={level} className="border rounded-md px-3">
                        <AccordionTrigger className="hover:no-underline py-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{level}</span>
                            <Badge variant="outline" className="ml-2">
                              {Object.values(events).flat().length} skills
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-3">
                          <Tabs defaultValue={Object.keys(events)[0]} className="w-full">
                            <TabsList className="mb-4">
                              {Object.keys(events).map((event) => (
                                <TabsTrigger key={event} value={event}>
                                  {event} ({events[event].length})
                                </TabsTrigger>
                              ))}
                            </TabsList>
                            {Object.entries(events).map(([event, items]) => (
                              <TabsContent key={event} value={event}>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                  {items.map((item) => (
                                    <CurriculumItemCard
                                      key={item.id}
                                      item={item}
                                      skill={skills?.find((s) => s.id === item.skillId)}
                                      athletes={athletes}
                                      onEdit={handleEdit}
                                      onDelete={(id) => deleteMutation.mutate(id)}
                                      onUpdateProgress={handleUpdateProgress}
                                    />
                                  ))}
                                </div>
                              </TabsContent>
                            ))}
                          </Tabs>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No curriculum items found</p>
              <p className="text-sm mt-1">Add skills to your curriculum to start tracking progress</p>
            </CardContent>
          </Card>
        )
      ) : (
        timelineSortedItems.length > 0 ? (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {timelineSortedItems.map((item) => (
                    <CurriculumItemCard
                      key={item.id}
                      item={item}
                      skill={skills?.find((s) => s.id === item.skillId)}
                      athletes={athletes}
                      onEdit={handleEdit}
                      onDelete={(id) => deleteMutation.mutate(id)}
                      onUpdateProgress={handleUpdateProgress}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No curriculum items found</p>
              <p className="text-sm mt-1">Add skills with timeline dates to see them here</p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
