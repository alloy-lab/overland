import { useEffect, useState } from "react";
import type { MetaFunction } from "react-router";
import { useParams } from "react-router";
import type { Chapter } from "~/lib/payloadClient";

export const meta: MetaFunction = () => {
  return [
    { title: "Chapter - Overland Stack" },
    { name: "description", content: "Read this chapter" },
  ];
};

export default function ChapterPage() {
  const { bookSlug, chapterSlug } = useParams<{
    bookSlug: string;
    chapterSlug: string;
  }>();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookSlug || !chapterSlug) return;

    const fetchChapter = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `/api/books/${bookSlug}/chapters/${chapterSlug}`
        );

        if (!response.ok) {
          throw new Error("Chapter not found");
        }

        const data = await response.json();
        setChapter(data);
      } catch (error) {
        console.error("Error fetching chapter:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load chapter"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [bookSlug, chapterSlug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Chapter Not Found
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {error || "The chapter you are looking for does not exist."}
        </p>
        <a
          href="/books"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          ← Back to Books
        </a>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto">
      <header className="mb-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/books" className="hover:text-gray-700">
            Books
          </a>
          <span className="mx-2">/</span>
          <a
            href={`/books/${chapter.book.slug}`}
            className="hover:text-gray-700"
          >
            {chapter.book.title}
          </a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Chapter {chapter.chapterNumber}</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Chapter {chapter.chapterNumber}: {chapter.title}
        </h1>

        <div className="text-sm text-gray-500 mb-4">
          From:{" "}
          <a
            href={`/books/${chapter.book.slug}`}
            className="text-blue-600 hover:text-blue-500"
          >
            {chapter.book.title}
          </a>
        </div>
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
            href={`/books/${chapter.book.slug}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-500"
          >
            ← Back to {chapter.book.title}
          </a>

          <div className="text-sm text-gray-500">
            Last updated: {new Date(chapter.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </footer>
    </article>
  );
}
