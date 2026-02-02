export interface AppSettings {
  navPos: 'side' | 'top';
  dir: 'ltr' | 'rtl';
  theme: 'light' | 'dark';
  color: 'purple' | 'red' | 'teal' | 'orange' | 'amber' | 'green' | 'default';
  showHeader: boolean;
  headerPos: 'fixed' | 'static' | 'above';
  showFooter: boolean;
  footerPos: 'fixed' | 'static';
  showUserPanel: boolean;
  sidenavOpened: boolean;
  sidenavCollapsed: boolean;
  language: string;
}

export const defaults: AppSettings = {
  navPos: 'side',
  dir: 'ltr',
  theme: 'light',
  color: 'default',
  showHeader: true,
  headerPos: 'fixed',
  showFooter: false,
  footerPos: 'static',
  showUserPanel: true,
  sidenavOpened: true,
  sidenavCollapsed: false,
  language: 'pt-BR',
};
