import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function Landing() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" data-testid="loading-container">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold" data-testid="text-app-title">
            Gymnastics Planner
          </CardTitle>
          <CardDescription data-testid="text-app-description">
            Lesson planning and training management for competitive gymnastics programs
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground text-center">
            Sign in as a coach to access your athletes, skills, practice plans, routines, and goals.
          </p>
          <Button 
            asChild 
            className="w-full"
            data-testid="button-login"
          >
            <a href="/api/login">Sign In as Coach</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
