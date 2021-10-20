import { TestBed } from '@angular/core/testing';
import { catchError, concat, firstValueFrom, mapTo, Observable, of, tap } from 'rxjs';
import { HymnList, HymnListInputError, HymnListItem, HymnParseError } from './data-interfaces';
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
  })
  describe('method parseSingleLine', () => {
    const succesfulTestInputs: { input: string; result: HymnListItem }[] = [
      { input: '228a', result: { hymnNumber: '228a' } },
      {
        input: 'Kiitosvirsi 130',
        result: { hymnType: 'Kiitosvirsi', hymnNumber: '130' },
      },
      {
        input: 'Päivän virsi 13',
        result: { hymnType: 'Päivän virsi', hymnNumber: '13' },
      },
      {
        input: '228:1-3',
        result: {
          hymnNumber: '228a',
          verses: [0, 1, 2],
          humanReadableVerses: '1-3',
        },
      },
      {
        input: '228:2–4', // this line contains en dash
        result: {
          hymnNumber: '228a',
          verses: [1, 2, 3],
          humanReadableVerses: '2–4',
        },
      },
      {
        input: 'Päivän virsi 444:1-3,6',
        result: {
          hymnNumber: '444',
          verses: [0, 1, 2, 5],
          hymnType: 'Päivän virsi',
          humanReadableVerses: '1-3,6',
        },
      },
    ];

    const erroneousTestInputs: { input: string; error: HymnParseError }[] = [
      { input: '633', error: new HymnParseError('invalid hymn') },
      { input: '3333', error: new HymnParseError('invalid hymn') },
    ];

    it('should successfully parse', async () => {
      const testFn = (result: HymnListItem, index: number): boolean =>
        expect(result)
          .withContext(`test input ${succesfulTestInputs[index].input}`)
          .toEqual(succesfulTestInputs[index].result);

      await firstValueFrom(concat(
        ...succesfulTestInputs.map((test, index) =>
          service.parseSingleLine(test.input).pipe(
            tap(result => testFn(result, index)),
            catchError(err =>
              of(
                fail(
                  `Failed at test input ${test.input}: ${
                    (err as Error).message ?? err
                  }`
                )
              )
            )
          )
        )
      ));
    });

    it('should throw errors', async () => {
      const errors = await Promise.all(
        erroneousTestInputs.map(test =>
          firstValueFrom(service.parseSingleLine(test.input)).catch(
            (err: HymnParseError) => err
          )
        )
      );
      expect(
        errors.map(
          (error, index) =>
            ({
              input: erroneousTestInputs[index].input,
              error,
            } as typeof erroneousTestInputs[0])
        )
      ).toEqual(erroneousTestInputs);
    });
  });

  describe('method parseHymnList', () => {
    type Test = {
      testInput: string;
      expected: HymnList;
    };

    const tests: Test[] = [
      {
        testInput: 'Av 341\nKv 130\nPv 577:1,5-7',
        expected: {
          hymns: [
            { hymnNumber: '341a', hymnType: 'Av' },
            { hymnNumber: '130', hymnType: 'Kv' },
            {
              hymnNumber: '577',
              hymnType: 'Pv',
              verses: [0, 4, 5, 6],
              humanReadableVerses: '1,5-7',
            },
          ],
        },
      },
      {
        testInput: 'Av 341\n\nKv 130\nPv 577:1,5-7',
        expected: {
          hymns: [
            { hymnNumber: '341a', hymnType: 'Av' },
            { hymnNumber: '130', hymnType: 'Kv' },
            {
              hymnNumber: '577',
              hymnType: 'Pv',
              verses: [0, 4, 5, 6],
              humanReadableVerses: '1,5-7',
            },
          ],
        },
      },
    ].map(i => ({
      ...i,
      expected: {
        ...i.expected,
        currentHymn: 0,
      },
    }));

    it('should successfully parse hymnlist', async () => {
      const runTest: (test: Test) => Observable<void> = test =>
        service.parseHymnList(test.testInput).pipe(
          tap(result =>
            expect(result)
              .withContext(`testInput was ${test.testInput}`)
              .toEqual(test.expected)
          ),
          mapTo(undefined)
        );
      await firstValueFrom(concat(...tests.map(runTest)));
    });

    it('should throw a hymnlistinputerror', async () => {
      await firstValueFrom(service
        .parseHymnList('foo\n555')
        .pipe(
          tap(() => fail('should have thrown')),
          catchError(err => {
            expect(err instanceof HymnListInputError)
              .withContext('error should be a HymnListInputError')
              .toBe(true);
            return of(undefined);
          })
        ))
    });
  });
});
