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
];
