import type { RouteConfig } from "@react-router/dev/routes";

export default [
  {
    path: "/",
    file: "routes/_layout.tsx",
    children: [
      {
        index: true,
        file: "routes/_index.tsx",
      },
      {
        path: "posts",
        file: "routes/posts._index.tsx",
      },
      {
        path: "posts/:slug",
        file: "routes/posts.$slug.tsx",
      }
    ],
  },
] satisfies RouteConfig;
