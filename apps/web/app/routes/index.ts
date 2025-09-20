import { createBrowserRouter, createMemoryRouter } from "react-router-dom";
import { Layout } from "./_layout";
import { HomePage } from "./index";
import { PostsIndex } from "./posts._index";
import { PostPage } from "./posts.$slug";
import { BooksIndex } from "./books._index";
import { ChapterPage } from "./books.$bookSlug.$chapterSlug";

export const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "posts",
        children: [
          {
            index: true,
            element: <PostsIndex />,
          },
          {
            path: ":slug",
            element: <PostPage />,
          },
        ],
      },
      {
        path: "books",
        children: [
          {
            index: true,
            element: <BooksIndex />,
          },
          {
            path: ":bookSlug/:chapterSlug",
            element: <ChapterPage />,
          },
        ],
      },
    ],
  },
];

export function createRouter(initialEntries?: string[]) {
  if (initialEntries) {
    return createMemoryRouter(routes, { initialEntries });
  }
  return createBrowserRouter(routes);
}
