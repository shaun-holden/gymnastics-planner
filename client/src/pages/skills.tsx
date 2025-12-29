import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Plus, Dumbbell, Search, Trash2, Edit, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Skill, InsertSkill } from "@shared/schema";
import { EVENTS, SKILL_VALUES, SKILL_VALUE_MAP, SKILL_GROUPS_BY_EVENT, CR_BY_EVENT, getSkillNumericValue } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  name: z.string().min(2, "Skill name must be at least 2 characters"),
  value: z.enum(["A", "B", "C", "D", "E", "F", "G", "H", "I"]),
  event: z.enum(["Vault", "Bars", "Beam", "Floor"]),
  description: z.string().optional(),
  vaultValue: z.number().min(0).max(20).optional(),
  skillGroup: z.string().optional(),
  crTags: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

function SkillCard({
  skill,
  onEdit,
  onDelete,
}: {
  skill: Skill;
  onEdit: (skill: Skill) => void;
  onDelete: (id: string) => void;
}) {
  const isVault = skill.event === "Vault";
  const numericValue = getSkillNumericValue(skill);
  const isHighValue = isVault ? numericValue >= 10.0 : numericValue >= 0.4;

  return (
    <Card className="hover-elevate" data-testid={`skill-card-${skill.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{skill.name}</h3>
              <Badge
                variant={isHighValue ? "default" : "secondary"}
                className="shrink-0"
              >
                {isVault ? numericValue.toFixed(1) : skill.value}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {isVault ? `Vault Value: ${numericValue.toFixed(2)}` : `Value: ${numericValue.toFixed(1)}`}
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {skill.skillGroup && (
                <Badge variant="outline" className="text-xs">
                  {skill.skillGroup}
                </Badge>
              )}
              {skill.crTags && skill.crTags.length > 0 && skill.crTags.map((tag) => {
                const crDef = CR_BY_EVENT[skill.event]?.find(cr => cr.id === tag);
                return crDef ? (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    CR
                  </Badge>
                ) : null;
              })}
            </div>
            {skill.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {skill.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0" data-testid={`button-skill-actions-${skill.id}`}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(skill)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(skill.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Skills() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      value: "A",
      event: "Vault",
      description: "",
      vaultValue: 10.0,
      skillGroup: "",
      crTags: [],
    },
  });

  const watchedEvent = form.watch("event");
  const isVaultEvent = watchedEvent === "Vault";

  const { data: skills, isLoading } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });

  // Refresh skills cache on mount to ensure latest skills are loaded
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
  }, []);

  const createMutation = useMutation({
    mutationFn: (data: InsertSkill) => apiRequest("POST", "/api/skills", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      toast({ title: "Skill added to bank" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to add skill", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InsertSkill }) =>
      apiRequest("PATCH", `/api/skills/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      toast({ title: "Skill updated" });
      setIsDialogOpen(false);
      setEditingSkill(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to update skill", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/skills/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      toast({ title: "Skill removed from bank" });
    },
    onError: () => {
      toast({ title: "Failed to remove skill", variant: "destructive" });
    },
  });

  const onSubmit = (data: FormData) => {
    const submitData = {
      ...data,
      description: data.description || null,
      vaultValue: data.event === "Vault" ? (data.vaultValue || 10.0) : null,
      skillGroup: data.event !== "Vault" && data.skillGroup && data.skillGroup !== "none" ? data.skillGroup : null,
      crTags: data.event !== "Vault" ? (data.crTags || []) : null,
    };
    if (editingSkill) {
      updateMutation.mutate({ id: editingSkill.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    form.reset({
      name: skill.name,
      value: skill.value as FormData["value"],
      event: skill.event as FormData["event"],
      description: skill.description || "",
      vaultValue: skill.vaultValue || 10.0,
      skillGroup: skill.skillGroup || "",
      crTags: skill.crTags || [],
    });
    setIsDialogOpen(true);
  };

  const handleOpenDialog = () => {
    setEditingSkill(null);
    form.reset({
      name: "",
      value: "A",
      event: selectedEvent === "all" ? "Vault" : (selectedEvent as FormData["event"]),
      description: "",
      vaultValue: 10.0,
      skillGroup: "",
      crTags: [],
    });
    setIsDialogOpen(true);
  };

  const filteredSkills = skills?.filter((skill) => {
    const numericValue = getSkillNumericValue(skill);
    const matchesSearch =
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      numericValue.toString().includes(searchQuery);
    const matchesEvent = selectedEvent === "all" || skill.event === selectedEvent;
    return matchesSearch && matchesEvent;
  });

  const getSkillsByEvent = (event: string) =>
    filteredSkills?.filter((s) => s.event === event) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Skill Bank</h1>
          <p className="text-muted-foreground mt-1">
            Manage skills for Vault, Bars, Beam, and Floor
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog} data-testid="button-add-skill">
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSkill ? "Edit Skill" : "Add New Skill"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="event"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-skill-event">
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
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Yurchenko, Giant, Back Tuck"
                          {...field}
                          data-testid="input-skill-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {isVaultEvent ? (
                  <FormField
                    control={form.control}
                    name="vaultValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vault Value (Start Value)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="20"
                            placeholder="e.g., 10.0"
                            {...field}
                            value={field.value || 10.0}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-vault-value"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <>
                    <FormField
                      control={form.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skill Value (A-I)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-skill-value">
                                <SelectValue placeholder="Select value" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SKILL_VALUES.map((value) => (
                                <SelectItem key={value} value={value}>
                                  {value} ({SKILL_VALUE_MAP[value].toFixed(1)})
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
                      name="skillGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skill Group</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-skill-group">
                                <SelectValue placeholder="Select group (optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">No Group</SelectItem>
                              {(SKILL_GROUPS_BY_EVENT[watchedEvent] || []).map((group) => (
                                <SelectItem key={group} value={group}>
                                  {group}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {CR_BY_EVENT[watchedEvent] && (
                      <FormField
                        control={form.control}
                        name="crTags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Composition Requirements (CR)</FormLabel>
                            <div className="space-y-2">
                              {CR_BY_EVENT[watchedEvent].map((cr) => (
                                <div key={cr.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={cr.id}
                                    checked={field.value?.includes(cr.id) || false}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      if (checked) {
                                        field.onChange([...current, cr.id]);
                                      } else {
                                        field.onChange(current.filter((id) => id !== cr.id));
                                      }
                                    }}
                                    data-testid={`checkbox-cr-${cr.id}`}
                                  />
                                  <label
                                    htmlFor={cr.id}
                                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {cr.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </>
                )}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add notes about this skill..."
                          className="resize-none"
                          {...field}
                          data-testid="input-skill-description"
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
                    data-testid="button-save-skill"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : editingSkill
                      ? "Update Skill"
                      : "Add Skill"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-skills"
          />
        </div>
      </div>

      {/* Skills by Event Tabs */}
      <Tabs value={selectedEvent} onValueChange={setSelectedEvent}>
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-skills">
            All ({skills?.length || 0})
          </TabsTrigger>
          {EVENTS.map((event) => (
            <TabsTrigger key={event} value={event} data-testid={`tab-${event.toLowerCase()}`}>
              {event} ({getSkillsByEvent(event).length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredSkills && filteredSkills.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredSkills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onEdit={handleEdit}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No skills found</p>
              <p className="text-sm mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "Add skills to your bank to get started"}
              </p>
            </div>
          )}
        </TabsContent>

        {EVENTS.map((event) => (
          <TabsContent key={event} value={event} className="mt-6">
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-16" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : getSkillsByEvent(event).length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {getSkillsByEvent(event).map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    onEdit={handleEdit}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No {event} skills yet</p>
                <p className="text-sm mt-1">Add skills to your {event} bank</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
