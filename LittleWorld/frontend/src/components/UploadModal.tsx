import { Camera, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'

interface UploadModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (payload: { file: File; caption: string }) => Promise<void>
  initialCaption?: string
}

export function UploadModal({ open, onClose, onSubmit, initialCaption = '' }: UploadModalProps) {
  const titleId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState(initialCaption)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setCaption(initialCaption)
  }, [open, initialCaption])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, submitting])

  useEffect(() => {
    if (open) return
    setFile(null)
    setCaption('')
    setError(null)
    setSubmitting(false)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }, [open])

  if (!open) return null

  function handleFileChange(next: File | undefined) {
    if (!next) return
    setFile(next)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(next)
    })
    setError(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!file) {
      setError('Choose an image to share.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({ file, caption: caption.trim() })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose()
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="animate-fade-up w-full max-w-md rounded-3xl bg-white p-6 shadow-lg"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="font-display text-xl font-bold text-burgundy">
              Share a moment
            </h2>
            <p className="mt-1 text-sm text-muted">
              Drop a visual — caption optional. Processing happens in the background.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full p-2 text-muted transition hover:bg-milky-pink hover:text-charcoal"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group relative mb-4 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-burgundy/25 bg-milky-pink/60 transition hover:border-burgundy/50"
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-charcoal">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <Camera className="text-burgundy" size={22} />
              </span>
              <span className="text-sm font-medium">Choose an image</span>
            </div>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0])}
        />

        <label className="mb-4 block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
            Caption <span className="font-normal normal-case">(optional)</span>
          </span>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            placeholder="What's on your mind today?"
            className="w-full resize-none rounded-2xl border border-transparent bg-milky-pink/70 px-4 py-3 text-sm outline-none transition focus:border-burgundy/30 focus:bg-white"
          />
        </label>

        {error && (
          <p className="mb-3 rounded-2xl bg-burgundy/10 px-3 py-2 text-sm text-burgundy">{error}</p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-full px-4 py-3 text-sm font-semibold text-charcoal transition hover:bg-milky-pink"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-full bg-burgundy px-4 py-3 text-sm font-bold text-white transition hover:bg-burgundy-dark disabled:opacity-60"
          >
            {submitting ? 'Sharing…' : 'Share'}
          </button>
        </div>
      </form>
    </div>
  )
}
