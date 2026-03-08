import { Moon, Sun, LogOut, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/Components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/Components/ui/sheet";

interface SidebarProps {
  isMobile?: boolean;
}

export function Sidebar({ isMobile = false }: SidebarProps) {
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    if (window.confirm("Vil du gerne logge ud?")) {
      window.localStorage.removeItem("sidlin_id");
      window.localStorage.removeItem("sidlin_pwd");
      window.location.reload(); // Reload immediately clears memory state and puts the user back at Login
    }
  };

  const NavContent = () => (
    <div
      className={`flex flex-col h-full gap-4 py-4 ${!isMobile && "items-center"}`}
    >
      <div className={`px-3 py-2 ${isMobile ? "w-full" : ""}`}>
        {isMobile && (
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Nice FC
          </h2>
        )}
        <div
          className={`space-y-2 flex flex-col ${!isMobile && "items-center mt-2"}`}
        >
          <Button
            variant="ghost"
            size={isMobile ? "default" : "icon"}
            className={
              isMobile ? "w-full justify-start" : "h-10 w-10 rounded-full"
            }
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            title={theme === "light" ? "Skift til mørk" : "Skift til lys"}
          >
            {theme === "light" ? (
              <Moon className={isMobile ? "mr-2 h-4 w-4" : "h-5 w-5"} />
            ) : (
              <Sun className={isMobile ? "mr-2 h-4 w-4" : "h-5 w-5"} />
            )}
            <span className={!isMobile ? "sr-only" : ""}>
              {theme === "light" ? "Mørk tilstand" : "Lys tilstand"}
            </span>
          </Button>
          <Button
            variant="ghost"
            size={isMobile ? "default" : "icon"}
            className={
              isMobile
                ? "w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                : "h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
            }
            onClick={handleLogout}
            title="Log ud"
          >
            <LogOut className={isMobile ? "mr-2 h-4 w-4" : "h-5 w-5"} />
            <span className={!isMobile ? "sr-only" : ""}>Log ud</span>
          </Button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <NavContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="hidden border-r bg-muted/20 md:flex flex-col items-center w-16 h-full shrink-0">
      <NavContent />
    </div>
  );
}
