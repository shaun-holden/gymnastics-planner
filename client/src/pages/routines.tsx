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
import { Plus, Award, Trash2, Edit, MoreHorizontal, X, GripVertical, Calculator, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Routine, Skill, Athlete, InsertRoutine } from "@shared/schema";
import { EVENTS, SKILL_VALUE_MAP, calculateStartValue, getSkillNumericValue } from "@shared/schema";

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

function StartValueCalculator({ skills, event }: { skills: Skill[]; event: string }) {
  const { startValue, crFulfilled, cvBonus, topSkills } = calculateStartValue(skills, event);
  const isVault = event === "Vault";

  const difficultyValue = topSkills.reduce((sum, skill) => {
    return sum + getSkillNumericValue(skill);
  }, 0);

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

          <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
            <div className="flex items-center gap-2">
              <span className="text-sm">Composition Requirements (CR)</span>
              {crFulfilled ? (
                <Badge variant="default" className="text-xs">Fulfilled</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">Partial</Badge>
              )}
            </div>
            <span className="font-mono font-medium">{crFulfilled ? "2.0" : "..."}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
            <span className="text-sm">Connection Value (CV)</span>
            <span className="font-mono font-medium">+{cvBonus.toFixed(1)}</span>
          </div>

          <Separator />

          <div className="flex items-center justify-between p-4 rounded-md bg-primary/10">
            <span className="font-semibold">Start Value</span>
            <span className="text-2xl font-mono font-bold text-primary">
              {startValue.toFixed(2)}
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            DV = Top 8 skills (highest first). CR = 2.0 when 4+ different values and 6+ skills. CV = 0.1 per consecutive C+ pair.
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

  // Filter skills by selected event
  const eventSkills = skills?.filter((s) => s.event === selectedEvent) || [];

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
    const { startValue, crFulfilled, cvBonus } = calculateStartValue(selectedSkills);
    const submitData = {
      ...data,
      skillIds: selectedSkillIds,
      startValue,
      crFulfilled,
      cvBonus,
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
    form.reset({
      name: "",
      athleteId: athletes?.[0]?.id || "",
      event: "Vault",
      skillIds: [],
    });
    setIsDialogOpen(true);
  };

  const addSkillToRoutine = (skillId: string) => {
    if (!selectedSkillIds.includes(skillId)) {
      setSelectedSkillIds([...selectedSkillIds, skillId]);
    }
  };

  const removeSkillFromRoutine = (skillId: string) => {
    setSelectedSkillIds(selectedSkillIds.filter((id) => id !== skillId));
  };

  // Reset selected skills when event changes
  useEffect(() => {
    if (!editingRoutine) {
      setSelectedSkillIds([]);
    }
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
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden">
                      <ScrollArea className="h-[250px] px-4 pb-4">
                        {eventSkills.length > 0 ? (
                          <div className="space-y-2">
                            {eventSkills.map((skill) => (
                              <div
                                key={skill.id}
                                className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover-elevate cursor-pointer"
                                onClick={() => addSkillToRoutine(skill.id)}
                                data-testid={`available-skill-${skill.id}`}
                              >
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {getSkillDisplayValue(skill)}
                                  </Badge>
                                  <span className="text-sm">{skill.name}</span>
                                </div>
                                <Plus className="h-4 w-4 text-muted-foreground" />
                              </div>
                            ))}
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
                          <div className="space-y-2">
                            {selectedSkills.map((skill, idx) => (
                              <div
                                key={`${skill.id}-${idx}`}
                                className="flex items-center justify-between p-2 rounded-md bg-primary/5 border border-primary/10"
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
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => removeSkillFromRoutine(skill.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
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
                      <StartValueCalculator skills={selectedSkills} event={selectedEvent} />
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
