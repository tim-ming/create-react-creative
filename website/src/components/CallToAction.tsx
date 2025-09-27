import { useEffect, useState } from 'react';
import { useCopyToClipboard } from '@/hooks';
import GithubIcon from '@/assets/github.svg?react';
import { CopyIcon, CheckIcon } from 'lucide-react';

export default function CallToAction() {
  const [copied, copy] = useCopyToClipboard();
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const copyCommand = 'npm create react-creative@latest';

  useEffect(() => {
    if (copied !== copyCommand) {
      return;
    }

    setShowCopyFeedback(true);
    const timeoutId = window.setTimeout(() => {
      setShowCopyFeedback(false);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [copied, copyCommand]);

  const handleCopy = () => {
    copy(copyCommand).catch((error) => {
      console.error('Failed to copy!', error);
    });
  };

  return (
    <section id="get-started" aria-labelledby="cta-heading" className="bg-slate-950 py-16">
      <div
        className={`section-container-narrow rounded-3xl border border-slate-800/70 bg-gradient-to-br from-slate-900 via-slate-900/95 to-blue-950/40 py-16 text-center shadow-[0_45px_90px_-40px_rgba(14,165,233,0.5)]`}
      >
        <h2 id="cta-heading" className="text-3xl font-medium text-slate-100 sm:text-4xl">
          Get creative.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
          Run{' '}
          <code className="rounded bg-slate-950 px-2 py-1 text-sm text-blue-200">npm create react-creative@latest</code>{' '}
          and start creative coding fast.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={handleCopy}
            className="group flex h-12 items-center justify-center rounded-xl bg-blue-600 px-6 text-base font-medium text-white transition hover:bg-blue-500"
          >
            <span className="flex items-center gap-2" role="status" aria-live="polite">
              {showCopyFeedback ? (
                <>
                  <CheckIcon className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <CopyIcon className="h-4 w-4" />
                  Copy command
                </>
              )}
            </span>
          </button>

          <a
            href="https://github.com/tim-ming/create-react-creative"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border px-6 py-3 text-base font-medium text-slate-300 backdrop-blur-sm transition hover:bg-white/40"
          >
            <GithubIcon className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
