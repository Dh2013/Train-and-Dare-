/** Best-effort notification, independent from the successful blog persistence. */
export async function requestNetlifyBuild(): Promise<void> {
  const hook = process.env.NETLIFY_BUILD_HOOK?.trim();
  if (!hook) return;

  try {
    const url = new URL(hook);
    if (url.protocol !== 'https:' || url.username || url.password) {
      throw new Error('Invalid build hook configuration');
    }
    const response = await fetch(url, {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(5000),
    });
    // No response data is needed, and it must never reach logs or API responses.
    await response.body?.cancel();
    if (!response.ok) throw new Error('Build hook rejected the request');
    console.info('[Netlify] Build requested successfully');
  } catch {
    // Fetch errors can contain the private hook URL: never log the error object.
    console.warn('[Netlify] Unable to request rebuild');
  }
}
