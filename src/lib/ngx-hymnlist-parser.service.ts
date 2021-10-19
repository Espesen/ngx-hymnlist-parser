import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HymnList, HymnListItem } from '../data-interfaces';
import { NgxHymnlistParserModule } from './ngx-hymnlist-parser.module';

@Injectable({
  providedIn: NgxHymnlistParserModule,
})
export class NgxHymnlistParserService {
  parseSingleLine: (line: string) => Observable<HymnListItem> = x =>
    of(undefined);
  parseHymnList: (line: string) => Observable<HymnList> = x => of(undefined);
}
