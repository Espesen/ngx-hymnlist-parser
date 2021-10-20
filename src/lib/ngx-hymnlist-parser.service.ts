import { Injectable } from '@angular/core';
import { catchError, concat, map, Observable, of, throwError, toArray } from 'rxjs';
import { allHymns } from './all-hymns';
import { HymnList, HymnListInputError, HymnListItem } from './data-interfaces';
import { NgxHymnlistParserModule } from './ngx-hymnlist-parser.module';
import * as selectionParser from 'range-selection-parser';

@Injectable({
  providedIn: NgxHymnlistParserModule,
})
export class NgxHymnlistParserService {
  parseSingleLine: (line: string) => Observable<HymnListItem> = line => {
    const hymnNumberRegexp = /\b\d{1,3}[abc]?\b/;
    let hymnNumber = (line.match(hymnNumberRegexp) ?? [])[0] ?? '';
    if (allHymns.findIndex(hymn => hymn.number === hymnNumber) === -1) {
      if (allHymns.find(hymn => hymn.number === `${hymnNumber}a`)) {
        hymnNumber += 'a';
      } else {
        return throwError(() => new Error('invalid hymn'));
      }
    }
    const versesRegexp = /\d[abc]?\s?:(.+)$/;
    const remainingString = line.replace(hymnNumberRegexp, '');
    const verseString = (line.match(versesRegexp) ?? [])[1] ?? '';
    const containsHymnType = Boolean(
      remainingString.trim().replace(`:${verseString}`, '').match(/\S+.*/)
    );
    return of({
      hymnNumber,
      ...(containsHymnType
        ? {
            hymnType: remainingString
              .trim()
              .replace(`:${verseString}`, '')
              .trim(),
          }
        : {}),
      ...(verseString
        ? {
            verses: selectionParser
              .parseSelectionString(verseString.replace(/–/g, '-'))
              // make selection 0-based
              .map(x => x - 1),
          }
        : {}),
      ...(verseString ? { humanReadableVerses: verseString } : {}),
    });
  };

  parseHymnList: (hymnList: string) => Observable<HymnList> = hymnList =>
    concat(
      ...hymnList
        .split('\n')
        .filter(line => line.length > 0)
        .map((line, index) =>
          this.parseSingleLine(line).pipe(
            catchError(err =>
              throwError(
                () =>
                  new HymnListInputError({
                    atLine: index + 1,
                    errorMessage: err?.message ?? err ?? 'failed to parse',
                  })
              )
            )
          )
        )
    ).pipe(
      toArray(),
      map(hymns => ({ hymns, currentHymn: 0 }))
    );
}
