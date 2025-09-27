const currentYear = new Date().getFullYear();

export default function SiteFooter() {
  return (
    <footer aria-label="Website footer" className="border-t border-slate-900 bg-slate-950 py-10">
      <div className={`section-container-wide flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between`}>
        <div className="space-y-1 text-sm text-slate-400">
          <p className="font-medium text-slate-100">create-react-creative</p>
          <p className="text-xs">© {currentYear} Tim Ming. Released under the MIT License.</p>
        </div>
        <nav className="flex flex-wrap items-center gap-6 text-sm text-slate-300" aria-label="Footer">
          <a
            href="https://github.com/tim-ming/create-react-creative"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-blue-200"
          >
            GitHub Repository
          </a>
          <a
            href="https://github.com/tim-ming/create-react-creative/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-blue-200"
          >
            License
          </a>
          <a
            href="https://github.com/tim-ming/create-react-creative/blob/main/docs/README.md"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-blue-200"
          >
            Contribution Guide
          </a>
        </nav>
      </div>
    </footer>
  );
}
