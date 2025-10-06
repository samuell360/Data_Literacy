import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { 
  Search, 
  Bell, 
  Menu, 
  X,
  BarChart3,
  BookOpen,
  Beaker,
  TrendingUp,
  Trophy,
  Settings,
  HelpCircle,
  LogOut,
  Home,
  Star,
  Zap
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../ui/sheet";
import apiClient, { progressApi, type User } from "../../services/api";

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  user?: User | null;

  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "learning", label: "Learning", icon: BookOpen },
  { id: "simulations", label: "Simulations", icon: Beaker },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "showcase", label: "Design Showcase", icon: BarChart3 },
];

const adminItems = [
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "admin", label: "Admin", icon: Settings },
];

export function AppLayout({ children, currentPage = "dashboard", user, onNavigate, onLogout }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [me, setMe] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const user = await apiClient.getCurrentUser();
        let progress: any = null;
        try {
          const d = await progressApi.getUserProgress();
          progress = d?.overall_progress ?? null;
        } catch {}
        if (mounted) setMe({ user, progress });
      } catch {
        // ignore when unauthenticated
      }
    })();
    return () => { mounted = false; };
  }, []);

  const allItems = user?.is_admin 
    ? [...navigationItems, ...adminItems]
    : navigationItems;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-sidebar-foreground">StatLearn</h2>
            <p className="caption-sm text-sidebar-foreground/60">Statistics Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {allItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Help */}
      <div className="p-4 border-t border-sidebar-border">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
          <HelpCircle className="w-4 h-4" />
          Help & Support
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 w-64 h-screen bg-sidebar border-r border-sidebar-border hidden lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left: Mobile Menu + Search */}
            <div className="flex items-center gap-4 flex-1">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 bg-sidebar">
                  <SidebarContent />
                </SheetContent>
              </Sheet>

              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search lessons, simulations..."
                  className="pl-10 bg-muted/50 border-none"
                />
              </div>
            </div>

            {/* Right: Level Indicator + Notifications + User Menu */}
            <div className="flex items-center gap-3">
              {/* Level Indicator */}
              <div className="hidden sm:flex items-center gap-2 bg-card border rounded-full px-3 py-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-white" />
                  </div>
                  <span className="caption-lg font-medium text-foreground">
                    Lv {me?.progress?.current_level ?? 1}
                  </span>
                </div>
                <div className="flex items-center gap-1 pl-2 border-l border-border">
                  <Zap className="w-3 h-3 text-primary" />
                  <span className="caption-sm text-muted-foreground">
                    {(me?.progress?.total_xp ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                {/* Notifications badge would go here if we had notifications in the User model */}
              </Button>

              {/* User Menu */}
              {user && (user.full_name || user.username) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 px-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || user.username} />
                        <AvatarFallback className="caption-sm">
                          {(user.full_name || user.username).split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:block text-left">
                        <div className="caption-sm font-medium">{user.full_name || user.username}</div>
                        <div className="caption-sm text-muted-foreground capitalize">
                          {user.is_admin ? 'admin' : 'student'}
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div>
                        <div className="font-medium">{user.full_name || user.username}</div>
                        <div className="caption-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Help & Support
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={onLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
