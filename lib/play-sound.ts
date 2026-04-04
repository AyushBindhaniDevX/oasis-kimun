import { BRAND } from '@/lib/media-assets'

let warned = false

export function playUiSound(kind: 'notify' | 'success' = 'notify') {
  if (typeof window === 'undefined') return
  try {
    const url = kind === 'success' ? BRAND.successSound : BRAND.notifySound
    const a = new Audio(url)
    a.volume = 0.35
    void a.play().catch(() => {
      if (!warned) {
        warned = true
        console.info('Audio autoplay blocked until user gesture; notifications still show.')
      }
    })
  } catch {
    /* ignore */
  }
}
