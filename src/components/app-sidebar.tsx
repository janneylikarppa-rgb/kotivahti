import { useEffect } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LayoutDashboard, Home, Wrench, CalendarDays, Wallet, LogOut, ClipboardList, Send, Shield, FileText } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { getUusienLiidienMaara } from "@/lib/liidit.functions";

const items = [
  { title: "Yleiskuva", url: "/dashboard", icon: LayoutDashboard },
  { title: "Talon tiedot", url: "/talon-tiedot", icon: Home },
  { title: "Huoltohistoria", url: "/huoltohistoria", icon: Wrench },
  { title: "PTS-suunnitelma", url: "/pts", icon: ClipboardList },
  { title: "Vuosikello", url: "/vuosikello", icon: CalendarDays },
  { title: "Kulut", url: "/kulut", icon: Wallet },
  { title: "Pyynnöt", url: "/pyynnot", icon: Send },
  { title: "Myyntiraportti", url: "/myyntiraportti", icon: FileText },
  { title: "Admin", url: "/admin", icon: Shield },

] as const;

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();

  const uusienFn = useServerFn(getUusienLiidienMaara);
  const { data: uudet } = useQuery({
    queryKey: ["uusien-liidien-maara"],
    queryFn: () => uusienFn(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const uusiaCount = uudet?.admin ? (uudet.count ?? 0) : 0;

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [path, isMobile, setOpenMobile]);

  const handleNav = () => {
    if (isMobile) setOpenMobile(false);
  };


  const handleLogout = async () => {
    if (isMobile) setOpenMobile(false);
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 pt-5 pb-3">
        <Link to="/dashboard" className="flex items-center gap-2 px-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-[#152a22] text-white font-serif text-lg">K</div>
          <div className="font-serif text-lg leading-none text-cream">
            Kotivahti<span className="text-primary">.</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="eyebrow">Navigaatio</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const showBadge = item.url === "/admin" && uusiaCount > 0;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={path === item.url}
                      tooltip={item.title}
                      className="data-[active=true]:border-l-2 data-[active=true]:border-primary data-[active=true]:bg-sidebar-accent data-[active=true]:text-cream rounded-l-none"
                    >
                      <Link to={item.url} className="flex items-center gap-2" onClick={handleNav}>
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1">{item.title}</span>
                        {showBadge && (
                          <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
                            {uusiaCount}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Kirjaudu ulos">
              <LogOut className="h-4 w-4" />
              <span>Kirjaudu ulos</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
