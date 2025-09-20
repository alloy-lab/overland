import { useEffect, useState } from "react";
import type { MetaFunction } from "react-router";
import type { Book, Post, SiteSettings } from "~/lib/payloadClient";

export const meta: MetaFunction = () => {
  return [
    { title: "Overland Stack" },
    {
      name: "description",
      content:
        "A modern web application built with React Router SSR and Payload CMS",
    },
  ];
};

export default function Index() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, booksRes, siteRes] = await Promise.all([
          fetch("/api/posts?limit=3&status=published"),
          fetch("/api/books?limit=3&status=published"),
          fetch("/api/site"),
        ]);

        const [postsData, booksData, siteData] = await Promise.all([
          postsRes.json(),
          booksRes.json(),
          siteRes.json(),
        ]);

        setPosts(postsData.docs || []);
        setBooks(booksData.docs || []);
        setSiteSettings(siteData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          Welcome to {siteSettings?.title || "Overland Stack"}
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          {siteSettings?.description ||
            "A modern web application built with React Router SSR and Payload CMS"}
        </p>
      </div>

      {/* Recent Posts */}
      {posts.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Recent Posts</h2>
            <a
              href="/posts"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              View all posts →
            </a>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {post.featuredImage && (
                  <img
                    src={post.featuredImage.url}
                    alt={post.featuredImage.alt || post.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <time dateTime={post.publishedDate}>
                      {new Date(post.publishedDate).toLocaleDateString()}
                    </time>
                    <span className="mx-2">•</span>
                    <span>{post.author.name}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    <a
                      href={`/posts/${post.slug}`}
                      className="hover:text-blue-600"
                    >
                      {post.title}
                    </a>
                  </h3>
                  {post.excerpt && (
                    <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Recent Books */}
      {books.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Recent Books</h2>
            <a
              href="/books"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              View all books →
            </a>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <article
                key={book.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {book.coverImage && (
                  <img
                    src={book.coverImage.url}
                    alt={book.coverImage.alt || book.title}
                    className="w-full h-64 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    <a
                      href={`/books/${book.slug}`}
                      className="hover:text-blue-600"
                    >
                      {book.title}
                    </a>
                  </h3>
                  <p className="text-gray-600 mb-2">by {book.author}</p>
                  {book.publishedDate && (
                    <p className="text-sm text-gray-500">
                      Published{" "}
                      {new Date(book.publishedDate).toLocaleDateString()}
                    </p>
                  )}
                  {book.chapters && book.chapters.length > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      {book.chapters.length} chapter
                      {book.chapters.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}


