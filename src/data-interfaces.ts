export interface HymnListItem {
  hymnNumber: string;
  /** 0-based index */
  verses?: number[];
  /** e.g. "1-3, 6" */
  humanReadableVerses?: string;
  /** e.g. Alkuvirsi, kiitosvirsi... */
  hymnType?: string;
}

export interface HymnList {
  hymns: HymnListItem[];
  /** zero-based index of currently viewed hymn */
  currentHymn: number;
}
