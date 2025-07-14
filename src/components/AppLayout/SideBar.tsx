import { NavBarItem } from "@/lib/types/NavBarItems";
import {
  SideNavigation,
  SideNavigationItem,
  SideNavigationSubItem,
} from "@ui5/webcomponents-react";
import { useRouter, usePathname } from "next/navigation";

interface SideBarProps {
  sideNavCollapsed?: boolean;
  navItems: Array<NavBarItem>;
}

export default function SideBarMenu({
  sideNavCollapsed,
  navItems,
}: Readonly<SideBarProps>) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <SideNavigation
      collapsed={sideNavCollapsed}
      onSelectionChange={(event) => {
        const selectedItem = event.detail.item;
        const path = selectedItem.dataset.path;
        if (path) {
          handleNavigation(path);
        }
      }}
    >
      {navItems.map((item) => (
        <SideNavigationItem
          key={item.path || item.text}
          text={item.text}
          icon={item.icon}
          selected={item.path ? pathname === item.path : false}
          data-path={item.path || undefined}
        >
          {item.subItems?.map((subItem) => (
            <SideNavigationSubItem
              key={subItem.path}
              text={subItem.text}
              icon={subItem.icon}
              selected={pathname === subItem.path}
              data-path={subItem.path}
            />
          ))}
        </SideNavigationItem>
      ))}
    </SideNavigation>
  );
}
