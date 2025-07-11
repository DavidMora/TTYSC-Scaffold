import { NavBarItem } from "../../types/NavBarItems";

export const sideBarItems: NavBarItem[] = [
  {
    text: "Home",
    path: "/",
    icon: "home",
  },
  {
    text: "About",
    path: "/about",
    icon: "information",
  },
  {
    text: "Profile",
    path: "/profile",
    icon: "user-settings",
  },
  {
    text: "Settings",
    path: "/settings",
    icon: "settings",
  },
  {
    text: "More",
    icon: "overflow",
    subItems: [
      {
        text: "Sub Item 1",
        path: "/more/sub-item-1",
      },
      {
        text: "Sub Item 2",
        path: "/more/sub-item-2",
      },
    ],
  },
];
