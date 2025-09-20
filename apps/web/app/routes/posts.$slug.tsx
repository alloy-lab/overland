import { useEffect, useState } from "react";
import type { MetaFunction } from "react-router";
import { useParams } from "react-router";
import type { Post } from "~/lib/payloadClient";

export const meta: MetaFunction = () => {
  return [
    { title: "Post - Overland Stack" },
    { name: "description", content: "Read our latest post" },
  ];
};

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/posts/${slug}`);

        if (!response.ok) {
          throw new Error("Post not found");
        }

        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error("Error fetching post:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load post"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Post Not Found
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {error || "The post you are looking for does not exist."}
        </p>
        <a
          href="/posts"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          ← Back to Posts
        </a>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto">
      <header className="mb-8">
        {post.featuredImage && (
          <img
            src={post.featuredImage.url}
            alt={post.featuredImage.alt || post.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg mb-6"
          />
        )}

        <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

        <div className="flex items-center text-sm text-gray-500 mb-4">
          <time dateTime={post.publishedDate}>
            {new Date(post.publishedDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span className="mx-2">•</span>
          <span>by {post.author.name}</span>
        </div>

        {post.excerpt && (
          <p className="text-xl text-gray-600 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="prose prose-lg max-w-none">
        {/* Note: In a real implementation, you would render the rich text content here */}
        {/* For now, we'll just show a placeholder */}
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-gray-600">
            Rich text content would be rendered here. This requires a rich text
            renderer that can handle the Lexical editor output from Payload CMS.
          </p>
        </div>
      </div>

      <footer className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <a
            href="/posts"
            className="inline-flex items-center text-blue-600 hover:text-blue-500"
          >
            ← Back to Posts
          </a>

          <div className="text-sm text-gray-500">
            Last updated: {new Date(post.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </footer>
    </article>
  );
}
