export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-secondary-900">Career Intelligence Assistant</h1>
        <p className="mt-2 text-base text-secondary-600">
          Understand how your professional experience aligns with job opportunities. Upload your CV
          and job descriptions, then ask natural-language questions about role suitability, relevant
          experience, and interview preparation.
        </p>
      </div>
    </header>
  );
}
