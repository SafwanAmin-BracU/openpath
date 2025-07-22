export interface INavRoute {
  name: string;
  path: string;
  icon: string;
}
export const NavRoutes: INavRoute[] = [
  {
    name: "Home",
    path: "/",
    icon: "🏠",
  },
  {
    name: "Repositories",
    path: "/repo",
    icon: "📦",
  },
  {
    name: "Issues",
    path: "/issue",
    icon: "🐛",
  },
  {
    name: "Pull Requests",
    path: "/pr",
    icon: "🔄",
  },
  {
    name: "Settings",
    path: "/settings",
    icon: "⚙️",
  },
];
