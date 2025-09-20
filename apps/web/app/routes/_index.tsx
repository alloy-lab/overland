import type { MetaFunction } from "react-router";
import type { Post, SiteSettings } from "~/lib/payloadClient";

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
  // For now, use default data since CMS collections don't exist yet
  const posts: Post[] = [];
  const siteSettings: SiteSettings = {
    title: "Overland",
    description: "A modern, full-stack web application built with React Router SSR and Payload CMS"
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-6xl font-bold text-gray-900 mb-2">
          <span className="text-gray-900">OVERLAND</span>
          <span className="text-gray-600 text-4xl">.stack</span>
        </h1>
      </div>

      {/* Instructions */}
      <div className="mb-8 max-w-2xl">
        <p className="text-lg text-gray-600 mb-4">
          Get started by exploring our{" "}
          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">/posts</code>{" "}
          section.
        </p>
        <p className="text-lg text-gray-600">
          Save and see your changes instantly.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-12">
        <a
          href="/posts"
          className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg border border-gray-900 hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          Explore Posts
        </a>
        <a
          href="#"
          className="inline-flex items-center px-6 py-3 bg-white text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Read our docs
        </a>
      </div>

      {/* Navigation Links */}
      <div className="flex gap-8 text-sm">
        <a href="/posts" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Learn
        </a>
        <a href="#" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Examples
        </a>
        <a href="#" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
          </svg>
          Go to overland.dev →
        </a>
      </div>
    </div>
  );
}
