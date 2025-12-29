import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
import { Plus, Award, Trash2, Edit, MoreHorizontal, X, GripVertical, Calculator, ChevronRight, Link2, Search, Unlink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Routine, Skill, Athlete, InsertRoutine, ConnectionInfo } from "@shared/schema";
import { EVENTS, SKILL_VALUE_MAP, SKILL_GROUPS_BY_EVENT, CR_BY_EVENT, calculateStartValue, calculateConnections, getSkillNumericValue } from "@shared/schema";

function getSkillDisplayValue(skill: Skill): string {
  if (skill.event === "Vault" && skill.vaultValue !== null && skill.vaultValue !== undefined) {
    return skill.vaultValue.toFixed(1);
  }
  return skill.value;
}

const formSchema = z.object({
  name: z.string().min(2, "Routine name is required"),
  athleteId: z.string().min(1, "Athlete is required"),
  event: z.enum(["Vault", "Bars", "Beam", "Floor"]),
  skillIds: z.array(z.string()),
});

type FormData = z.infer<typeof formSchema>;

function StartValueCalculator({ skills, event, disabledConnections = new Set<number>() }: { skills: Skill[]; event: string; disabledConnections?: Set<number> }) {
  const { crFulfilled, topSkills, groupBonus, groupsPresent, crBonus, crTagsPresent, connections, startValue: baseStartValue } = calculateStartValue(skills, event);
  const isVault = event === "Vault";
  const eventGroups = SKILL_GROUPS_BY_EVENT[event] || [];
  const eventCRs = CR_BY_EVENT[event] || [];
  
  // Filter out manually disabled connections
  const activeConnections = connections.filter((c, idx) => c.isConnected && !disabledConnections.has(idx));
  const cvBonus = activeConnections.reduce((sum, c) => sum + c.bonus, 0);

  const difficultyValue = topSkills.reduce((sum, skill) => {
    return sum + getSkillNumericValue(skill);
  }, 0);

  // Calculate adjusted start value with disabled connections considered
  const startValue = isVault ? baseStartValue : Math.round((difficultyValue + groupBonus + crBonus + cvBonus) * 100) / 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Start Value Calculator</h3>
      </div>

      {isVault ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-md bg-primary/10">
            <span className="font-semibold">Vault Start Value</span>
            <span className="text-2xl font-mono font-bold text-primary">
              {startValue.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Vault uses a direct numeric start value.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
            <div className="flex items-center gap-2">
              <span className="text-sm">Difficulty Value (DV)</span>
              <Badge variant="outline" className="text-xs">Top 8 Skills</Badge>
            </div>
            <span className="font-mono font-medium">{difficultyValue.toFixed(1)}</span>
          </div>

          {skills.length > 8 && (
            <p className="text-xs text-muted-foreground">
              Counting top 8 of {skills.length} skills (highest values first)
            </p>
          )}

          <div className="p-3 rounded-md bg-muted/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">Group Bonus</span>
                <Badge variant="secondary" className="text-xs">{groupsPresent.length}/4 Groups</Badge>
              </div>
              <span className="font-mono font-medium">+{groupBonus.toFixed(1)}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {eventGroups.map((group) => (
                <Badge 
                  key={group} 
                  variant={groupsPresent.includes(group) ? "default" : "outline"}
                  className="text-xs"
                >
                  {group}
                </Badge>
              ))}
            </div>
          </div>

          {eventCRs.length > 0 && (
            <div className="p-3 rounded-md bg-muted/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Composition Requirements (CR)</span>
                  {crFulfilled ? (
                    <Badge variant="default" className="text-xs">All 4 CRs</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">{crTagsPresent.length}/4 CRs</Badge>
                  )}
                </div>
                <span className="font-mono font-medium">+{crBonus.toFixed(1)}</span>
              </div>
              <div className="flex flex-col gap-1">
                {eventCRs.map((cr) => (
                  <div key={cr.id} className="flex items-center gap-2">
                    <Badge 
                      variant={crTagsPresent.includes(cr.id) ? "default" : "outline"}
                      className="text-xs shrink-0"
                    >
                      {crTagsPresent.includes(cr.id) ? "Yes" : "No"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{cr.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 rounded-md bg-muted/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">Connection Value (CV)</span>
                <Badge variant="secondary" className="text-xs">{activeConnections.length} connections</Badge>
              </div>
              <span className="font-mono font-medium">+{cvBonus.toFixed(1)}</span>
            </div>
            {activeConnections.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {activeConnections.map((conn, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    <Link2 className="h-2.5 w-2.5 mr-1" />
                    {conn.label}
                  </Badge>
                ))}
              </div>
            )}
            {activeConnections.length === 0 && skills.length >= 2 && (
              <p className="text-xs text-muted-foreground">
                Connect B+ skills to earn CV bonus
              </p>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between p-4 rounded-md bg-primary/10">
            <span className="font-semibold">Start Value</span>
            <span className="text-2xl font-mono font-bold text-primary">
              {startValue.toFixed(2)}
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            DV = Top 8 skills. Group = 0.5/group (max 2.0). CR = 0.5/req (max 2.0). CV = FIG bonuses (D+D=0.1, D+E/E+D=0.2, etc).
          </p>
        </div>
      )}
    </div>
  );
}

function RoutineCard({
  routine,
  athlete,
  skills,
  onEdit,
  onDelete,
}: {
  routine: Routine;
  athlete?: Athlete;
  skills: Skill[];
  onEdit: (routine: Routine) => void;
  onDelete: (id: string) => void;
}) {
  const routineSkills = (routine.skillIds || [])
    .map((id) => skills.find((s) => s.id === id))
    .filter(Boolean) as Skill[];

  return (
    <Card className="hover-elevate" data-testid={`routine-card-${routine.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium">{routine.name}</h3>
              <Badge variant="outline">{routine.event}</Badge>
            </div>
            {athlete && (
              <p className="text-sm text-muted-foreground">{athlete.name}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0" data-testid={`button-routine-actions-${routine.id}`}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(routine)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(routine.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-muted-foreground">
            {routineSkills.length} skills
          </span>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <span className="font-mono text-sm font-semibold text-primary">
            SV: {routine.startValue?.toFixed(2) || "0.00"}
          </span>
        </div>

        {routineSkills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {routineSkills.slice(0, 6).map((skill, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {skill.name} ({getSkillDisplayValue(skill)})
              </Badge>
            ))}
            {routineSkills.length > 6 && (
              <Badge variant="secondary" className="text-xs">
                +{routineSkills.length - 6} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Routines() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [skillSearch, setSkillSearch] = useState("");
  // Track manually disabled connections (indexes where connection is broken)
  const [disabledConnections, setDisabledConnections] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      athleteId: "",
      event: "Vault",
      skillIds: [],
    },
  });

  const selectedEvent = form.watch("event");

  const { data: routines, isLoading: routinesLoading } = useQuery<Routine[]>({
    queryKey: ["/api/routines"],
  });

  const { data: athletes, isLoading: athletesLoading } = useQuery<Athlete[]>({
    queryKey: ["/api/athletes"],
  });

  const { data: skills, isLoading: skillsLoading } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });

  // Filter skills by selected event and search term
  const eventSkills = skills?.filter((s) => {
    if (s.event !== selectedEvent) return false;
    if (skillSearch.trim()) {
      const searchLower = skillSearch.toLowerCase();
      return s.name.toLowerCase().includes(searchLower) || 
             s.value.toLowerCase().includes(searchLower) ||
             (s.skillGroup && s.skillGroup.toLowerCase().includes(searchLower));
    }
    return true;
  }) || [];

  // Get selected skill objects
  const selectedSkills = selectedSkillIds
    .map((id) => skills?.find((s) => s.id === id))
    .filter(Boolean) as Skill[];

  const createMutation = useMutation({
    mutationFn: (data: InsertRoutine) => apiRequest("POST", "/api/routines", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routines"] });
      toast({ title: "Routine created" });
      setIsDialogOpen(false);
      form.reset();
      setSelectedSkillIds([]);
    },
    onError: () => {
      toast({ title: "Failed to create routine", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InsertRoutine }) =>
      apiRequest("PATCH", `/api/routines/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routines"] });
      toast({ title: "Routine updated" });
      setIsDialogOpen(false);
      setEditingRoutine(null);
      form.reset();
      setSelectedSkillIds([]);
    },
    onError: () => {
      toast({ title: "Failed to update routine", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/routines/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routines"] });
      toast({ title: "Routine deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete routine", variant: "destructive" });
    },
  });

  const onSubmit = (data: FormData) => {
    const { crFulfilled, groupBonus, crBonus, topSkills, connections } = calculateStartValue(selectedSkills, data.event);
    
    // Calculate CV bonus respecting disabled connections
    const activeConnections = connections.filter((c, idx) => c.isConnected && !disabledConnections.has(idx));
    const cvBonus = activeConnections.reduce((sum, c) => sum + c.bonus, 0);
    
    // Calculate difficulty value
    const difficultyValue = topSkills.reduce((sum, skill) => sum + getSkillNumericValue(skill), 0);
    
    // Calculate final start value
    const isVault = data.event === "Vault";
    const startValue = isVault 
      ? (selectedSkills[0]?.vaultValue || 0)
      : Math.round((difficultyValue + groupBonus + crBonus + cvBonus) * 100) / 100;
    
    const submitData = {
      ...data,
      skillIds: selectedSkillIds,
      startValue,
      crFulfilled,
      cvBonus: Math.round(cvBonus * 100) / 100,
      groupBonus,
      crBonus,
    };
    if (editingRoutine) {
      updateMutation.mutate({ id: editingRoutine.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (routine: Routine) => {
    setEditingRoutine(routine);
    setSelectedSkillIds(routine.skillIds || []);
    setSkillSearch("");
    setDisabledConnections(new Set());
    form.reset({
      name: routine.name,
      athleteId: routine.athleteId,
      event: routine.event as FormData["event"],
      skillIds: routine.skillIds || [],
    });
    setIsDialogOpen(true);
  };

  const handleOpenDialog = () => {
    setEditingRoutine(null);
    setSelectedSkillIds([]);
    setSkillSearch("");
    setDisabledConnections(new Set());
    form.reset({
      name: "",
      athleteId: athletes?.[0]?.id || "",
      event: "Vault",
      skillIds: [],
    });
    setIsDialogOpen(true);
  };

  const addSkillToRoutine = (skillId: string) => {
    // For Bars, allow adding the same skill multiple times (e.g., for double skills)
    if (selectedEvent === "Bars") {
      setSelectedSkillIds([...selectedSkillIds, skillId]);
    } else {
      // For other events, only add if not already present
      if (!selectedSkillIds.includes(skillId)) {
        setSelectedSkillIds([...selectedSkillIds, skillId]);
      }
    }
  };

  const removeSkillFromRoutine = (index: number) => {
    // Remove skill at specific index (needed for handling duplicates)
    setSelectedSkillIds(selectedSkillIds.filter((_, i) => i !== index));
    // Adjust disabled connections when a skill is removed
    const newDisabled = new Set<number>();
    disabledConnections.forEach(i => {
      if (i < index) newDisabled.add(i);
      else if (i > index) newDisabled.add(i - 1);
    });
    setDisabledConnections(newDisabled);
  };

  const toggleConnection = (index: number) => {
    const newDisabled = new Set(disabledConnections);
    if (newDisabled.has(index)) {
      newDisabled.delete(index);
    } else {
      newDisabled.add(index);
    }
    setDisabledConnections(newDisabled);
  };

  // Count how many times each skill appears in the routine
  const getSkillCount = (skillId: string) => {
    return selectedSkillIds.filter(id => id === skillId).length;
  };

  // Reset selected skills, search, and connections when event changes
  useEffect(() => {
    if (!editingRoutine) {
      setSelectedSkillIds([]);
      setDisabledConnections(new Set());
    }
    setSkillSearch("");
  }, [selectedEvent, editingRoutine]);

  const isLoading = routinesLoading || athletesLoading || skillsLoading;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Routines</h1>
          <p className="text-muted-foreground mt-1">
            Build competitive routines with automatic start value calculation
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleOpenDialog}
              disabled={!athletes?.length || !skills?.length}
              data-testid="button-create-routine"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Routine
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {editingRoutine ? "Edit Routine" : "Create Routine"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col">
                <div className="grid gap-4 sm:grid-cols-3 mb-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Routine Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Competition Routine 2024"
                            {...field}
                            data-testid="input-routine-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="athleteId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Athlete</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-routine-athlete">
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
                    name="event"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-routine-event">
                              <SelectValue placeholder="Select event" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                </div>

                {/* Routine Builder */}
                <div className="flex-1 grid gap-4 lg:grid-cols-3 min-h-0 overflow-hidden">
                  {/* Available Skills */}
                  <Card className="flex flex-col">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-sm">Available Skills</CardTitle>
                      <CardDescription className="text-xs">
                        {selectedEvent} skills ({eventSkills.length})
                      </CardDescription>
                      <div className="relative mt-2">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search skills..."
                          value={skillSearch}
                          onChange={(e) => setSkillSearch(e.target.value)}
                          className="pl-8 h-8 text-sm"
                          data-testid="input-skill-search"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden">
                      <ScrollArea className="h-[250px] px-4 pb-4">
                        {eventSkills.length > 0 ? (
                          <div className="space-y-2">
                            {eventSkills.map((skill) => {
                              const count = getSkillCount(skill.id);
                              const isInRoutine = count > 0;
                              const isDouble = count >= 2;
                              return (
                                <div
                                  key={skill.id}
                                  className={`flex items-center justify-between p-2 rounded-md hover-elevate cursor-pointer ${
                                    isDouble 
                                      ? "bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700" 
                                      : isInRoutine 
                                        ? "bg-primary/10 border border-primary/20" 
                                        : "bg-muted/50"
                                  }`}
                                  onClick={() => addSkillToRoutine(skill.id)}
                                  data-testid={`available-skill-${skill.id}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {getSkillDisplayValue(skill)}
                                    </Badge>
                                    <span className="text-sm">{skill.name}</span>
                                    {isDouble && (
                                      <Badge variant="outline" className="text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 border-amber-400">
                                        x{count}
                                      </Badge>
                                    )}
                                    {isInRoutine && !isDouble && (
                                      <Badge variant="outline" className="text-xs">
                                        In routine
                                      </Badge>
                                    )}
                                  </div>
                                  <Plus className="h-4 w-4 text-muted-foreground" />
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No {selectedEvent} skills in bank
                          </p>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Routine Sequence */}
                  <Card className="flex flex-col">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-sm">Routine Sequence</CardTitle>
                      <CardDescription className="text-xs">
                        {selectedSkillIds.length} skills selected
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden">
                      <ScrollArea className="h-[250px] px-4 pb-4">
                        {selectedSkills.length > 0 ? (
                          <div className="space-y-1">
                            {(() => {
                              const connections = calculateConnections(selectedSkills, selectedEvent);
                              // Track which skills appear multiple times
                              const skillOccurrences: Record<string, number[]> = {};
                              selectedSkillIds.forEach((id, i) => {
                                if (!skillOccurrences[id]) skillOccurrences[id] = [];
                                skillOccurrences[id].push(i);
                              });
                              
                              return selectedSkills.map((skill, idx) => {
                                const isDuplicate = skillOccurrences[skill.id]?.length >= 2;
                                const occurrenceNum = skillOccurrences[skill.id]?.indexOf(idx) + 1;
                                
                                return (
                                <div key={`${skill.id}-${idx}`}>
                                  <div
                                    className={`flex items-center justify-between p-2 rounded-md ${
                                      isDuplicate 
                                        ? "bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700" 
                                        : "bg-primary/5 border border-primary/10"
                                    }`}
                                    data-testid={`selected-skill-${idx}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-xs font-mono text-muted-foreground w-4">
                                        {idx + 1}
                                      </span>
                                      <Badge variant="default" className="text-xs">
                                        {getSkillDisplayValue(skill)}
                                      </Badge>
                                      <span className="text-sm">{skill.name}</span>
                                      {isDuplicate && (
                                        <Badge variant="outline" className="text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 border-amber-400">
                                          #{occurrenceNum}
                                        </Badge>
                                      )}
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => removeSkillFromRoutine(idx)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  {/* Connection indicator between skills - clickable to toggle */}
                                  {idx < selectedSkills.length - 1 && (
                                    <div className="flex items-center justify-center py-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleConnection(idx)}
                                        className="gap-1"
                                        data-testid={`toggle-connection-${idx}`}
                                      >
                                        {connections[idx]?.isConnected && !disabledConnections.has(idx) ? (
                                          <>
                                            <Link2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                                            <span className="text-green-600 dark:text-green-400 font-mono font-medium text-xs">
                                              {connections[idx].label}
                                            </span>
                                          </>
                                        ) : disabledConnections.has(idx) ? (
                                          <>
                                            <Unlink className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-muted-foreground font-mono text-xs">
                                              break
                                            </span>
                                          </>
                                        ) : (
                                          <div className="w-4 h-0.5 bg-muted-foreground/30 rounded" />
                                        )}
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              );
                              });
                            })()}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Click skills to add them
                          </p>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Start Value Calculator */}
                  <Card className="flex flex-col">
                    <CardContent className="p-4 flex-1">
                      <StartValueCalculator skills={selectedSkills} event={selectedEvent} disabledConnections={disabledConnections} />
                    </CardContent>
                  </Card>
                </div>

                <DialogFooter className="mt-4">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending || selectedSkillIds.length === 0}
                    data-testid="button-save-routine"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : editingRoutine
                      ? "Update Routine"
                      : "Create Routine"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {(!athletes?.length || !skills?.length) && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">
              {!athletes?.length ? "Add athletes first" : "Add skills first"}
            </p>
            <p className="text-sm mt-1">
              {!athletes?.length
                ? "Create athlete profiles before building routines"
                : "Add skills to your bank before building routines"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Routines Grid */}
      {athletes && athletes.length > 0 && skills && skills.length > 0 && (
        <>
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24 mb-3" />
                    <Skeleton className="h-3 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : routines && routines.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {routines.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  athlete={athletes.find((a) => a.id === routine.athleteId)}
                  skills={skills}
                  onEdit={handleEdit}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No routines yet</p>
                <p className="text-sm mt-1">Create your first competitive routine</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
