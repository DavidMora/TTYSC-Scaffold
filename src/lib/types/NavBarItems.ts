export interface BaseNavBarItem {
  text: string;
  path: string;
  icon?: string;
}

export interface NavBarItem {
  text: string;
  path?: string;
  icon?: string;
  subItems?: Array<BaseNavBarItem>;
}
