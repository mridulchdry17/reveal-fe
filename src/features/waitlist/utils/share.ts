/** Share links carry ?src= so the waitlist records which channel brought each person. */
export function shareUrl(origin: string, source: 'wa' | 'link' | 'share'): string {
  return `${origin}/?src=${source}`
}

export function whatsappMessage(college: string, url: string): string {
  return [
    `Someone's building a dating app only for ${college}.`,
    '',
    'No swiping. You guess their little answers and their photo sharpens.',
    'Full photo only if you both say yes.',
    'A few new people every night at 9.',
    '',
    'Pehle baat, phir photo.',
    '',
    'Waitlist is open (enrollment no. is only for verification, nobody sees it):',
    url,
  ].join('\n')
}
