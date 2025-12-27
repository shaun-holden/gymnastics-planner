import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";
import {
  Users,
  Dumbbell,
  Calendar,
  Target,
  Award,
  Plus,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import type { Athlete, Skill, Practice, Goal, Routine } from "@shared/schema";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  href,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description: string;
  href: string;
}) {
  return (
    <Card className="hover-elevate">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold font-mono" data-testid={`stat-${title.toLowerCase().replace(' ', '-')}`}>
          {value}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        <Link href={href}>
          <Button variant="ghost" size="sm" className="mt-2 -ml-2" data-testid={`link-${title.toLowerCase().replace(' ', '-')}`}>
            View all <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function AthleteCard({ athlete }: { athlete: Athlete }) {
  const initials = athlete.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3 p-3 rounded-md hover-elevate" data-testid={`athlete-card-${athlete.id}`}>
      <Avatar>
        <AvatarFallback className="bg-primary/10 text-primary font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{athlete.name}</p>
        <p className="text-xs text-muted-foreground">
          Level {athlete.level} - {athlete.competitiveSystem}
        </p>
      </div>
      <Badge variant="secondary" className="shrink-0">{athlete.level}</Badge>
    </div>
  );
}

function GoalItem({ goal }: { goal: Goal }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-md hover-elevate" data-testid={`goal-item-${goal.id}`}>
      <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${goal.completed ? "bg-chart-5" : "bg-chart-3"}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{goal.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs">{goal.timeframe}</Badge>
          <span className="text-xs text-muted-foreground font-mono">{goal.progress}%</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: athletes, isLoading: athletesLoading } = useQuery<Athlete[]>({
    queryKey: ["/api/athletes"],
  });

  const { data: skills, isLoading: skillsLoading } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });

  const { data: practices, isLoading: practicesLoading } = useQuery<Practice[]>({
    queryKey: ["/api/practices"],
  });

  const { data: goals, isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const { data: routines, isLoading: routinesLoading } = useQuery<Routine[]>({
    queryKey: ["/api/routines"],
  });

  const isLoading = athletesLoading || skillsLoading || practicesLoading || goalsLoading || routinesLoading;

  const activeGoals = goals?.filter((g) => !g.completed) || [];
  const completedGoalsCount = goals?.filter((g) => g.completed).length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to your gymnastics training management hub
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/athletes">
            <Button data-testid="button-add-athlete">
              <Plus className="h-4 w-4 mr-2" />
              Add Athlete
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Athletes"
              value={athletes?.length || 0}
              icon={Users}
              description="Total registered athletes"
              href="/athletes"
            />
            <StatCard
              title="Skills"
              value={skills?.length || 0}
              icon={Dumbbell}
              description="Skills in your bank"
              href="/skills"
            />
            <StatCard
              title="Routines"
              value={routines?.length || 0}
              icon={Award}
              description="Built routines"
              href="/routines"
            />
            <StatCard
              title="Active Goals"
              value={activeGoals.length}
              icon={Target}
              description={`${completedGoalsCount} completed`}
              href="/goals"
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Athletes */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">Recent Athletes</CardTitle>
              <CardDescription>Your registered gymnasts</CardDescription>
            </div>
            <Link href="/athletes">
              <Button variant="ghost" size="icon" data-testid="link-athletes-all">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {athletesLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : athletes && athletes.length > 0 ? (
              <div className="px-4 pb-4">
                {athletes.slice(0, 5).map((athlete) => (
                  <AthleteCard key={athlete.id} athlete={athlete} />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No athletes yet</p>
                <Link href="/athletes">
                  <Button variant="outline" size="sm" className="mt-3" data-testid="button-add-first-athlete">
                    <Plus className="h-3 w-3 mr-1" />
                    Add your first athlete
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills by Event */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">Skills by Event</CardTitle>
              <CardDescription>Your skill bank overview</CardDescription>
            </div>
            <Link href="/skills">
              <Button variant="ghost" size="icon" data-testid="link-skills-all">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {skillsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : skills && skills.length > 0 ? (
              <div className="space-y-3">
                {(["Vault", "Bars", "Beam", "Floor"] as const).map((event) => {
                  const eventSkills = skills.filter((s) => s.event === event);
                  const highValueCount = eventSkills.filter(
                    (s) => ["D", "E", "F", "G", "H", "I"].includes(s.value)
                  ).length;
                  return (
                    <div
                      key={event}
                      className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                      data-testid={`event-${event.toLowerCase()}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <Dumbbell className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{event}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{eventSkills.length}</span>
                        {highValueCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {highValueCount} D+
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No skills in bank</p>
                <Link href="/skills">
                  <Button variant="outline" size="sm" className="mt-3" data-testid="button-add-first-skill">
                    <Plus className="h-3 w-3 mr-1" />
                    Add skills
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Goals */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">Active Goals</CardTitle>
              <CardDescription>Track your progress</CardDescription>
            </div>
            <Link href="/goals">
              <Button variant="ghost" size="icon" data-testid="link-goals-all">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {goalsLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-2 w-2 rounded-full mt-2" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-40 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activeGoals.length > 0 ? (
              <div className="px-4 pb-4">
                {activeGoals.slice(0, 5).map((goal) => (
                  <GoalItem key={goal.id} goal={goal} />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No active goals</p>
                <Link href="/goals">
                  <Button variant="outline" size="sm" className="mt-3" data-testid="button-add-first-goal">
                    <Plus className="h-3 w-3 mr-1" />
                    Set a goal
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
