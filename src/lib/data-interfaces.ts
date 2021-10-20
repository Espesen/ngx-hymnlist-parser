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

export class HymnParseError extends Error {
  constructor(message: string) {
    super(message);
  }
}

type HymnListInputErrorOptions = {
  /** 1-based */
  atLine: number;
  errorMessage: string;
};
export class HymnListInputError extends Error {
  constructor(public data: HymnListInputErrorOptions) {
    super();
  }
}