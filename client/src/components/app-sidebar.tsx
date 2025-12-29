import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Dumbbell,
  Award,
  Target,
  BookOpen,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Athletes", url: "/athletes", icon: Users },
  { title: "Curriculum", url: "/curriculum", icon: BookOpen },
  { title: "Practice Plans", url: "/practices", icon: Calendar },
  { title: "Skill Banks", url: "/skills", icon: Dumbbell },
  { title: "Routines", url: "/routines", icon: Award },
  { title: "Goals", url: "/goals", icon: Target },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Award className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">GymnasticsPlanner</span>
            <span className="text-xs text-muted-foreground">Training Management</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(' ', '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground">
          Competitive Systems: USA Gymnastics, NGA, AAU
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
