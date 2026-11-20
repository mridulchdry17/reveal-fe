/** Share links carry ?src= so the waitlist records which channel brought each person. */
export function shareUrl(origin: string, source: 'wa' | 'link' | 'share'): string {
  return `${origin}/?src=${source}`
}

export function whatsappMessage(college: string, url: string): string {
  return [
    `Someone's building a dating app only for ${college}.`,
    '',
    'No faces at first. You see a line they wrote, a voice note, their branch.',
    'Photo opens only if both say yes.',
    'New people every night at 9.',
    '',
    'Pehle baat, phir photo.',
    '',
    'Waitlist is open (enrollment no. is only for verification, nobody sees it):',
    url,
  ].join('\n')
}
