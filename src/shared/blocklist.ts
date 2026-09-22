/**
 * Conservative blocklist for the notes wall. Matched on whole words after
 * NFKC normalisation, leet folding and repeat collapsing. Moderation in the
 * admin page is the real control; this only stops the obvious.
 *
 * Hindi and Hinglish terms are pending from Vaibhav (20 to 40 words).
 */
export const BLOCKLIST: string[] = [
  "fuck", "fucker", "fucking", "motherfucker",
  "shit", "bullshit",
  "bitch", "bitches",
  "asshole", "arsehole",
  "cunt",
  "dick", "dickhead",
  "pussy",
  "whore", "slut",
  "faggot", "fag",
  "nigger", "nigga",
  "retard", "retarded",
  "rape", "rapist",
  "nazi",
  "kys",
];
