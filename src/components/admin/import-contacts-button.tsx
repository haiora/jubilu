'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Loader2, CheckCircle2, FileSpreadsheet } from 'lucide-react';

interface Props {
  label: string;
}

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
  message: string;
}

export default function ImportContactsButton({ label }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);

  function reset() {
    setError('');
    setResult(null);
    setFileName('');
    if (inputRef.current) inputRef.current.value = '';
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const csv = await file.text();
      const res = await fetch('/api/admin/crm/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur');
      setResult(data as ImportResult);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => { reset(); setOpen(true); }}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm hover:bg-accent"
      >
        <Upload className="h-4 w-4" /> {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="font-serif text-xl font-semibold">Importer des contacts</h2>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 hover:bg-accent">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <p className="text-sm text-muted-foreground">
                Fichier CSV avec une ligne d&apos;en-tête. Colonnes reconnues :{' '}
                <code className="text-xs">firstName, lastName, email, phone, country, locale, status, source, emailConsent</code>.
                La colonne <strong>email</strong> est obligatoire. Les contacts existants (même email) sont mis à jour.
              </p>

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={loading}
                className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-8 text-sm text-muted-foreground transition-colors hover:bg-accent disabled:opacity-60"
              >
                {loading ? (
                  <><Loader2 className="h-6 w-6 animate-spin" /> Traitement…</>
                ) : (
                  <><FileSpreadsheet className="h-6 w-6" /> {fileName || 'Choisir un fichier CSV'}</>
                )}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFile}
                className="hidden"
              />

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</div>
              )}

              {result && (
                <div className="space-y-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                  <p className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4" /> {result.message}
                  </p>
                  {result.errors.length > 0 && (
                    <ul className="list-disc space-y-0.5 pl-5 text-xs text-amber-700">
                      {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-border px-4 py-2 text-sm hover:bg-accent"
                >
                  {result ? 'Fermer' : 'Annuler'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
