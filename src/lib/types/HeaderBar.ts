export type MenuItemKey =
  | 'RETRY'
  | 'SETTINGS'
  | 'PRINT'
  | 'RECORD_SCREENCAST'
  | 'ABOUT';

export type MenuItem = {
  key: MenuItemKey;
  icon: string;
  label: string;
};

export type HeaderBarConfig = {
  title: string;
  subtitle: string;
  actions: MenuItemKey[];
};
