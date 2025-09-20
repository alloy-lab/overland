import { useEffect, useState } from "react";
import type { MetaFunction } from "react-router";
import type { Book } from "~/lib/payloadClient";

export const meta: MetaFunction = () => {
  return [
    { title: "Books - Overland Stack" },
    {
      name: "description",
      content: "Explore our collection of books and chapters",
    },
  ];
};

export default function BooksIndex() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/books?limit=10&page=${page}&status=published`
        );
        const data = await response.json();

        if (page === 1) {
          setBooks(data.docs || []);
        } else {
          setBooks((prev) => [...prev, ...(data.docs || [])]);
        }

        setHasMore(data.hasNextPage || false);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [page]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">All Books</h1>
        <p className="mt-2 text-lg text-gray-600">
          Explore our collection of books and chapters
        </p>
      </div>

      {loading && page === 1 ? (
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
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
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    <a
                      href={`/books/${book.slug}`}
                      className="hover:text-blue-600"
                    >
                      {book.title}
                    </a>
                  </h2>
                  <p className="text-gray-600 mb-2">by {book.author}</p>

                  {book.publishedDate && (
                    <p className="text-sm text-gray-500 mb-2">
                      Published{" "}
                      {new Date(book.publishedDate).toLocaleDateString()}
                    </p>
                  )}

                  {book.pages && (
                    <p className="text-sm text-gray-500 mb-2">
                      {book.pages} pages
                    </p>
                  )}

                  {book.isbn && (
                    <p className="text-sm text-gray-500 mb-2">
                      ISBN: {book.isbn}
                    </p>
                  )}

                  {book.chapters && book.chapters.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        {book.chapters.length} chapter
                        {book.chapters.length !== 1 ? "s" : ""}
                      </p>
                      <div className="space-y-1">
                        {book.chapters.slice(0, 3).map((chapter) => (
                          <div key={chapter.id} className="text-sm">
                            <a
                              href={`/books/${book.slug}/${chapter.slug}`}
                              className="text-blue-600 hover:text-blue-500"
                            >
                              Chapter {chapter.chapterNumber}: {chapter.title}
                            </a>
                          </div>
                        ))}
                        {book.chapters.length > 3 && (
                          <p className="text-sm text-gray-500">
                            +{book.chapters.length - 3} more chapters
                          </p>
                        )}
                      </div>
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
                  "Load More Books"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
