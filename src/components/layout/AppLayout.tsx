
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Clock, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, active, onClick }) => {
  return (
    <Link to={href} onClick={onClick} className="w-full">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2",
          active ? "bg-accent text-accent-foreground" : "hover:bg-muted"
        )}
      >
        {icon}
        <span>{label}</span>
      </Button>
    </Link>
  );
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { doctor } = useApp();
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  const routes = [
    { href: "/", icon: <Home size={20} />, label: "Home" },
    { href: "/my-appointment", icon: <Calendar size={20} />, label: "My Appointment" },
    { href: "/history", icon: <Clock size={20} />, label: "Appointment History" },
  ];

  const Navigation = () => (
    <div className="space-y-2 w-full">
      {routes.map((route) => (
        <NavItem
          key={route.href}
          href={route.href}
          icon={route.icon}
          label={route.label}
          active={location.pathname === route.href}
          onClick={isMobile ? () => setOpen(false) : undefined}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b h-14 flex items-center px-4 shadow-sm">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu size={20} />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 pt-10">
                  <div className="flex flex-col h-full">
                    <div className="mb-6 text-center">
                      <h2 className="font-semibold">{doctor.clinic}</h2>
                      <p className="text-sm text-muted-foreground">{doctor.name}</p>
                    </div>
                    <Navigation />
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <div className="font-semibold text-lg text-primary">ORD</div>
          </div>
          <div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/doctor-settings">Doctor Settings</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Only on desktop */}
        {!isMobile && (
          <aside className="w-64 border-r bg-card p-4 hidden md:block">
            <div className="mb-6 text-center">
              <h2 className="font-semibold">{doctor.clinic}</h2>
              <p className="text-sm text-muted-foreground">{doctor.name}</p>
            </div>
            <Navigation />
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
