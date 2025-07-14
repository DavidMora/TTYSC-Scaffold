import { NavBarItem } from "../../types/NavBarItems";
import {
  HOME,
  ABOUT,
  MORE_SUB_ITEM_1,
  MORE_SUB_ITEM_2,
  PROFILE,
  SETTINGS,
} from "@/lib/constants/routes/Dashboard";

export const sideBarItems: NavBarItem[] = [
  {
    text: "Home",
    path: HOME,
    icon: "home",
  },
  {
    text: "About",
    path: ABOUT,
    icon: "information",
  },
  {
    text: "Profile",
    path: PROFILE,
    icon: "user-settings",
  },
  {
    text: "Settings",
    path: SETTINGS,
    icon: "settings",
  },
  {
    text: "More",
    icon: "overflow",
    subItems: [
      {
        text: "Sub Item 1",
        path: MORE_SUB_ITEM_1,
      },
      {
        text: "Sub Item 2",
        path: MORE_SUB_ITEM_2,
      },
    ],
  },
];
