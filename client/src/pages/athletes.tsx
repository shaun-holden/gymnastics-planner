import { useState } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, Search, Trash2, Edit, MoreHorizontal, Layers, FolderOpen } from "lucide-react";
import { ExportDropdown } from "@/components/export-dropdown";
import { exportAthletes } from "@/lib/export-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Athlete, InsertAthlete, Level, InsertLevel, Group, InsertGroup } from "@shared/schema";
import { COMPETITIVE_SYSTEMS } from "@shared/schema";

const athleteFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  level: z.string().min(1, "Level is required"),
  competitiveSystem: z.enum(["USA Gymnastics", "NGA", "AAU"]),
  groupId: z.string().optional(),
});

const levelFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  competitiveSystem: z.string().optional(),
  order: z.number().optional(),
});

const groupFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
});

type AthleteFormData = z.infer<typeof athleteFormSchema>;
type LevelFormData = z.infer<typeof levelFormSchema>;
type GroupFormData = z.infer<typeof groupFormSchema>;

const LEVELS_BY_SYSTEM: Record<string, string[]> = {
  "USA Gymnastics": [
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
    "TOPS", "HOPES 11-12", "HOPES 13-14", "Jr. Elite", "Elite",
    "Xcel Bronze", "Xcel Silver", "Xcel Gold", "Xcel Platinum", "Xcel Diamond", "Xcel Sapphire"
  ],
  "NGA": [
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
    "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Sapphire"
  ],
  "AAU": [
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
    "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Sapphire"
  ],
};

const GROUP_COLORS = [
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "green", label: "Green", class: "bg-green-500" },
  { value: "purple", label: "Purple", class: "bg-purple-500" },
  { value: "orange", label: "Orange", class: "bg-orange-500" },
  { value: "pink", label: "Pink", class: "bg-pink-500" },
  { value: "yellow", label: "Yellow", class: "bg-yellow-500" },
  { value: "red", label: "Red", class: "bg-red-500" },
  { value: "teal", label: "Teal", class: "bg-teal-500" },
];

function formatLevel(level: string): string {
  const numericLevels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  if (numericLevels.includes(level)) {
    return `Level ${level}`;
  }
  return level;
}

function getGroupColorClass(color: string | null | undefined): string {
  const found = GROUP_COLORS.find((c) => c.value === color);
  return found?.class || "bg-muted";
}

export default function Athletes() {
  const [isAthleteDialogOpen, setIsAthleteDialogOpen] = useState(false);
  const [isLevelDialogOpen, setIsLevelDialogOpen] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const athleteForm = useForm<AthleteFormData>({
    resolver: zodResolver(athleteFormSchema),
    defaultValues: {
      name: "",
      level: "",
      competitiveSystem: "USA Gymnastics",
      groupId: undefined,
    },
  });

  const levelForm = useForm<LevelFormData>({
    resolver: zodResolver(levelFormSchema),
    defaultValues: {
      name: "",
      competitiveSystem: undefined,
      order: 0,
    },
  });

  const groupForm = useForm<GroupFormData>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "blue",
    },
  });

  const watchedSystem = athleteForm.watch("competitiveSystem");
  
  const { data: athletes, isLoading: isLoadingAthletes } = useQuery<Athlete[]>({
    queryKey: ["/api/athletes"],
  });

  const { data: levels, isLoading: isLoadingLevels } = useQuery<Level[]>({
    queryKey: ["/api/levels"],
  });

  const { data: groups, isLoading: isLoadingGroups } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
  });

  const customLevels = levels?.filter(
    (l) => !l.competitiveSystem || l.competitiveSystem === watchedSystem
  ) || [];

  const systemLevels = LEVELS_BY_SYSTEM[watchedSystem] || [];
  const allLevels = [...systemLevels, ...customLevels.map((l) => l.name)];

  const createAthleteMutation = useMutation({
    mutationFn: (data: InsertAthlete) => apiRequest("POST", "/api/athletes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/athletes"] });
      toast({ title: "Athlete added successfully" });
      setIsAthleteDialogOpen(false);
      athleteForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to add athlete", variant: "destructive" });
    },
  });

  const updateAthleteMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InsertAthlete }) =>
      apiRequest("PATCH", `/api/athletes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/athletes"] });
      toast({ title: "Athlete updated successfully" });
      setIsAthleteDialogOpen(false);
      setEditingAthlete(null);
      athleteForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to update athlete", variant: "destructive" });
    },
  });

  const deleteAthleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/athletes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/athletes"] });
      toast({ title: "Athlete removed" });
    },
    onError: () => {
      toast({ title: "Failed to remove athlete", variant: "destructive" });
    },
  });

  const createLevelMutation = useMutation({
    mutationFn: (data: InsertLevel) => apiRequest("POST", "/api/levels", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/levels"] });
      toast({ title: "Level created successfully" });
      setIsLevelDialogOpen(false);
      levelForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to create level", variant: "destructive" });
    },
  });

  const updateLevelMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertLevel> }) =>
      apiRequest("PATCH", `/api/levels/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/levels"] });
      toast({ title: "Level updated successfully" });
      setIsLevelDialogOpen(false);
      setEditingLevel(null);
      levelForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to update level", variant: "destructive" });
    },
  });

  const deleteLevelMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/levels/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/levels"] });
      toast({ title: "Level deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete level", variant: "destructive" });
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: (data: InsertGroup) => apiRequest("POST", "/api/groups", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: "Group created successfully" });
      setIsGroupDialogOpen(false);
      groupForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to create group", variant: "destructive" });
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertGroup> }) =>
      apiRequest("PATCH", `/api/groups/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: "Group updated successfully" });
      setIsGroupDialogOpen(false);
      setEditingGroup(null);
      groupForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to update group", variant: "destructive" });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/groups/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: "Group deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete group", variant: "destructive" });
    },
  });

  const onSubmitAthlete = (data: AthleteFormData) => {
    const submitData = {
      name: data.name,
      level: data.level,
      competitiveSystem: data.competitiveSystem,
      groupId: data.groupId && data.groupId !== "" ? data.groupId : null,
    };
    if (editingAthlete) {
      updateAthleteMutation.mutate({ id: editingAthlete.id, data: submitData });
    } else {
      createAthleteMutation.mutate(submitData);
    }
  };

  const onSubmitLevel = (data: LevelFormData) => {
    const submitData = {
      name: data.name,
      competitiveSystem: data.competitiveSystem && data.competitiveSystem !== "" ? data.competitiveSystem : null,
      order: data.order || 0,
    };
    if (editingLevel) {
      updateLevelMutation.mutate({ id: editingLevel.id, data: submitData });
    } else {
      createLevelMutation.mutate(submitData);
    }
  };

  const onSubmitGroup = (data: GroupFormData) => {
    const submitData = {
      name: data.name,
      description: data.description || null,
      color: data.color || null,
    };
    if (editingGroup) {
      updateGroupMutation.mutate({ id: editingGroup.id, data: submitData });
    } else {
      createGroupMutation.mutate(submitData);
    }
  };

  const handleEditAthlete = (athlete: Athlete) => {
    setEditingAthlete(athlete);
    athleteForm.reset({
      name: athlete.name,
      level: athlete.level,
      competitiveSystem: athlete.competitiveSystem as AthleteFormData["competitiveSystem"],
      groupId: athlete.groupId || undefined,
    });
    setIsAthleteDialogOpen(true);
  };

  const handleOpenAthleteDialog = () => {
    setEditingAthlete(null);
    athleteForm.reset({
      name: "",
      level: "",
      competitiveSystem: "USA Gymnastics",
      groupId: undefined,
    });
    setIsAthleteDialogOpen(true);
  };

  const handleEditLevel = (level: Level) => {
    setEditingLevel(level);
    levelForm.reset({
      name: level.name,
      competitiveSystem: level.competitiveSystem || undefined,
      order: level.order || 0,
    });
    setIsLevelDialogOpen(true);
  };

  const handleOpenLevelDialog = () => {
    setEditingLevel(null);
    levelForm.reset({
      name: "",
      competitiveSystem: undefined,
      order: 0,
    });
    setIsLevelDialogOpen(true);
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    groupForm.reset({
      name: group.name,
      description: group.description || "",
      color: group.color || "blue",
    });
    setIsGroupDialogOpen(true);
  };

  const handleOpenGroupDialog = () => {
    setEditingGroup(null);
    groupForm.reset({
      name: "",
      description: "",
      color: "blue",
    });
    setIsGroupDialogOpen(true);
  };

  const filteredAthletes = athletes?.filter((athlete) =>
    athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    athlete.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
    athlete.competitiveSystem.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getGroupName = (groupId: string | null) => {
    if (!groupId) return null;
    const group = groups?.find((g) => g.id === groupId);
    return group?.name || null;
  };

  const getGroupColor = (groupId: string | null) => {
    if (!groupId) return null;
    const group = groups?.find((g) => g.id === groupId);
    return group?.color || null;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Athletes</h1>
          <p className="text-muted-foreground mt-1">
            Manage your gymnastics athletes, custom levels, and training groups
          </p>
        </div>
      </div>

      <Tabs defaultValue="athletes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="athletes" data-testid="tab-athletes">
            <Users className="h-4 w-4 mr-2" />
            Athletes
          </TabsTrigger>
          <TabsTrigger value="levels" data-testid="tab-levels">
            <Layers className="h-4 w-4 mr-2" />
            Custom Levels
          </TabsTrigger>
          <TabsTrigger value="groups" data-testid="tab-groups">
            <FolderOpen className="h-4 w-4 mr-2" />
            Groups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="athletes" className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search athletes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-athletes"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <ExportDropdown
                onExport={(format) => athletes && exportAthletes(athletes, format)}
                disabled={!athletes?.length}
              />
              <Dialog open={isAthleteDialogOpen} onOpenChange={setIsAthleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleOpenAthleteDialog} data-testid="button-add-athlete">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Athlete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingAthlete ? "Edit Athlete" : "Add New Athlete"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...athleteForm}>
                    <form onSubmit={athleteForm.handleSubmit(onSubmitAthlete)} className="space-y-4">
                      <FormField
                        control={athleteForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter athlete's full name"
                                {...field}
                                data-testid="input-athlete-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={athleteForm.control}
                        name="competitiveSystem"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Competitive System</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-competitive-system">
                                  <SelectValue placeholder="Select system" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {COMPETITIVE_SYSTEMS.map((system) => (
                                  <SelectItem key={system} value={system}>
                                    {system}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={athleteForm.control}
                        name="level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Level</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-level">
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {allLevels.map((level) => (
                                  <SelectItem key={level} value={level}>
                                    {formatLevel(level)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={athleteForm.control}
                        name="groupId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Training Group (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger data-testid="select-group">
                                  <SelectValue placeholder="No group assigned" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">No group</SelectItem>
                                {groups?.map((group) => (
                                  <SelectItem key={group.id} value={group.id}>
                                    <div className="flex items-center gap-2">
                                      <div className={`h-3 w-3 rounded-full ${getGroupColorClass(group.color)}`} />
                                      {group.name}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button
                          type="submit"
                          disabled={createAthleteMutation.isPending || updateAthleteMutation.isPending}
                          data-testid="button-save-athlete"
                        >
                          {createAthleteMutation.isPending || updateAthleteMutation.isPending
                            ? "Saving..."
                            : editingAthlete
                            ? "Update Athlete"
                            : "Add Athlete"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Athlete Roster</CardTitle>
              <CardDescription>
                {filteredAthletes?.length || 0} athletes registered
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAthletes ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </div>
                  ))}
                </div>
              ) : filteredAthletes && filteredAthletes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Athlete</TableHead>
                      <TableHead>System</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAthletes.map((athlete) => (
                      <TableRow key={athlete.id} data-testid={`row-athlete-${athlete.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {getInitials(athlete.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{athlete.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{athlete.competitiveSystem}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono">{formatLevel(athlete.level)}</span>
                        </TableCell>
                        <TableCell>
                          {athlete.groupId ? (
                            <div className="flex items-center gap-2">
                              <div className={`h-3 w-3 rounded-full ${getGroupColorClass(getGroupColor(athlete.groupId))}`} />
                              <span className="text-sm">{getGroupName(athlete.groupId)}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-actions-${athlete.id}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditAthlete(athlete)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteAthleteMutation.mutate(athlete.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No athletes found</p>
                  <p className="text-sm mt-1">
                    {searchQuery
                      ? "Try a different search term"
                      : "Add your first athlete to get started"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="levels" className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-muted-foreground">
              Create custom levels in addition to the standard competitive system levels.
            </p>
            <Dialog open={isLevelDialogOpen} onOpenChange={setIsLevelDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenLevelDialog} data-testid="button-add-level">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Level
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingLevel ? "Edit Level" : "Add Custom Level"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...levelForm}>
                  <form onSubmit={levelForm.handleSubmit(onSubmitLevel)} className="space-y-4">
                    <FormField
                      control={levelForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Level Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Pre-Team, Developmental"
                              {...field}
                              data-testid="input-level-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={levelForm.control}
                      name="competitiveSystem"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Competitive System (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-level-system">
                                <SelectValue placeholder="Available for all systems" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">All Systems</SelectItem>
                              {COMPETITIVE_SYSTEMS.map((system) => (
                                <SelectItem key={system} value={system}>
                                  {system}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={createLevelMutation.isPending || updateLevelMutation.isPending}
                        data-testid="button-save-level"
                      >
                        {createLevelMutation.isPending || updateLevelMutation.isPending
                          ? "Saving..."
                          : editingLevel
                          ? "Update Level"
                          : "Add Level"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Custom Levels</CardTitle>
              <CardDescription>
                {levels?.length || 0} custom levels created
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLevels ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : levels && levels.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Level Name</TableHead>
                      <TableHead>System</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {levels.map((level) => (
                      <TableRow key={level.id} data-testid={`row-level-${level.id}`}>
                        <TableCell className="font-medium">{level.name}</TableCell>
                        <TableCell>
                          {level.competitiveSystem ? (
                            <Badge variant="outline">{level.competitiveSystem}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">All systems</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-level-actions-${level.id}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditLevel(level)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteLevelMutation.mutate(level.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No custom levels</p>
                  <p className="text-sm mt-1">
                    Create custom levels for special programs or developmental stages
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-muted-foreground">
              Create training groups to organize athletes (e.g., Team A, Morning Practice).
            </p>
            <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenGroupDialog} data-testid="button-add-group">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingGroup ? "Edit Group" : "Add Group"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...groupForm}>
                  <form onSubmit={groupForm.handleSubmit(onSubmitGroup)} className="space-y-4">
                    <FormField
                      control={groupForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Team A, Morning Practice"
                              {...field}
                              data-testid="input-group-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={groupForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Brief description of this group"
                              {...field}
                              data-testid="input-group-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={groupForm.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {GROUP_COLORS.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() => field.onChange(color.value)}
                                className={`h-8 w-8 rounded-full ${color.class} ${
                                  field.value === color.value
                                    ? "ring-2 ring-offset-2 ring-primary"
                                    : ""
                                }`}
                                title={color.label}
                                data-testid={`color-${color.value}`}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={createGroupMutation.isPending || updateGroupMutation.isPending}
                        data-testid="button-save-group"
                      >
                        {createGroupMutation.isPending || updateGroupMutation.isPending
                          ? "Saving..."
                          : editingGroup
                          ? "Update Group"
                          : "Add Group"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Training Groups</CardTitle>
              <CardDescription>
                {groups?.length || 0} groups created
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingGroups ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : groups && groups.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Group</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Athletes</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groups.map((group) => {
                      const athleteCount = athletes?.filter((a) => a.groupId === group.id).length || 0;
                      return (
                        <TableRow key={group.id} data-testid={`row-group-${group.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`h-4 w-4 rounded-full ${getGroupColorClass(group.color)}`} />
                              <span className="font-medium">{group.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {group.description || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{athleteCount}</Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" data-testid={`button-group-actions-${group.id}`}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditGroup(group)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => deleteGroupMutation.mutate(group.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No groups created</p>
                  <p className="text-sm mt-1">
                    Create groups to organize athletes by team, schedule, or any criteria
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
