import { TestBed } from '@angular/core/testing';
import { NgxHymnlistParserModule } from './ngx-hymnlist-parser.module';

import { NgxHymnlistParserService } from './ngx-hymnlist-parser.service';

describe('NgxHymnlistParserService', () => {
  let service: NgxHymnlistParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [NgxHymnlistParserModule] });
    service = TestBed.inject(NgxHymnlistParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('method parseSingleLine', () => {
    it('should...', () => {
      undefined;
    });
  });
  describe('method parseHymnList', () => {
    it('should...', () => {
      undefined;
    });
  });
});
