export function AssistantSection() {
  return (
    <section className="flex-1 bg-white">
      <div className="mx-auto flex h-full max-w-4xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-secondary-900">Assistant</h2>
        <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
          <svg
            className="h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-4 text-center text-base font-medium text-secondary-900">
            Assistant ready to help
          </p>
          <p className="mt-2 max-w-sm text-center text-sm text-secondary-600">
            Once you upload your CV and job descriptions, you'll be able to ask questions about role
            suitability, relevant experience, skill gaps, and interview preparation.
          </p>
        </div>
      </div>
    </section>
  );
}
