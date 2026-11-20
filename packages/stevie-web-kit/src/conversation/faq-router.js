/**
 * Static FAQ routing — deterministic, no LLM.
 */
export function routeFaq(message, faqEntries = []) {
  const text = String(message || '').toLowerCase();
  if (!text.trim()) return { matched: false };

  for (const entry of faqEntries) {
    for (const pattern of entry.patterns || []) {
      if (text.includes(String(pattern).toLowerCase())) {
        return {
          matched: true,
          faqId: entry.id,
          answer: entry.answer,
          source: 'static_faq',
        };
      }
    }
  }
  return { matched: false };
}
