import { useState } from 'react';
import { Download, ExternalLink, FileText, Loader2 } from 'lucide-react';

const fileNameFor = (url: string, name?: string) => {
  if (name) return /\.pdf$/i.test(name) ? name : `${name}.pdf`;
  const last = decodeURIComponent(url.split('?')[0].split('/').pop() || '');
  return last || 'procurement.pdf';
};

/**
 * The procurement PDF with "View" (opens in a new tab) and "Download". Download
 * fetches the file so it saves with its name; if the storage bucket blocks
 * cross-origin fetches it falls back to opening the PDF, where the browser's
 * viewer can save it.
 */
export function ProcurementDocumentActions({ url, name }: {url: string;name?: string;}) {
  const [downloading, setDownloading] = useState(false);
  const fileName = fileNameFor(url, name);

  const download = async () => {
    setDownloading(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      const blobUrl = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    } finally {
      setDownloading(false);
    }
  };

  const btn =
  'inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-medium text-ink-800 transition-colors hover:bg-ink-50 disabled:opacity-60';

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-ink-200 bg-ink-50 px-3 py-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
        <FileText className="h-4 w-4" />
      </span>
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink-900" title={fileName}>
        {fileName}
      </p>
      <div className="flex gap-2">
        <a href={url} target="_blank" rel="noopener noreferrer" className={btn}>
          <ExternalLink className="h-3.5 w-3.5" /> View
        </a>
        <button type="button" onClick={download} disabled={downloading} className={btn}>
          {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          Download
        </button>
      </div>
    </div>);

}
