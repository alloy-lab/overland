import { useEffect, useState } from "react";
import type { MetaFunction } from "react-router";
import type { Post } from "~/lib/payloadClient";

export const meta: MetaFunction = () => {
  return [
    { title: "Posts - Overland Stack" },
    {
      name: "description",
      content: "Discover our latest articles and insights",
    },
  ];
};

export default function PostsIndex() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/posts?limit=10&page=${page}&status=published`
        );
        const data = await response.json();

        if (page === 1) {
          setPosts(data.docs || []);
        } else {
          setPosts((prev) => [...prev, ...(data.docs || [])]);
        }

        setHasMore(data.hasNextPage || false);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">All Posts</h1>
        <p className="mt-2 text-lg text-gray-600">
          Discover our latest articles and insights
        </p>
      </div>

      {loading && page === 1 ? (
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
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
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    <a
                      href={`/posts/${post.slug}`}
                      className="hover:text-blue-600"
                    >
                      {post.title}
                    </a>
                  </h2>
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

          {hasMore && (
            <div className="text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  "Load More Posts"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
