import { Component, ChangeDetectionStrategy, Input, ContentChild, TemplateRef, Directive, Inject} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { startWith, map, debounceTime, switchMap } from 'rxjs/operators';
import { App, Movie, removeAccent } from '@blockframes/model';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { getDeepValue } from '@blockframes/utils/pipes/deep-key.pipe';
import { fadeList } from '@blockframes/utils/animations/fade';
import { APP } from '@blockframes/utils/routes/utils';

@Directive({ selector: '[movieGridTable]' })
export class GridTableDirective { }

@Component({
  selector: 'movie-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  animations: [fadeList('.card')],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieGridComponent {

  @ContentChild(GridTableDirective, { read: TemplateRef }) tableTemplate: GridTableDirective;
  
  private dataSource = new BehaviorSubject<Movie[]>([]);

  /** The content to display in the table */
  @Input() set titles(titles: Movie[]) {
    this.dataSource.next(titles ?? []);
  }

  data$: Observable<Movie[]>;

  search = new UntypedFormControl();

  mode : 'grid' | 'table' = 'table';

  constructor(
    @Inject(APP) public app: App
  ) {
    this.data$ = this.dataSource.asObservable().pipe(
      switchMap(data => this.$filter(data)),
    );
  }

  trackById(entity: { id: string }) {
    return entity.id;
  }

  private $filter(data: Movie[]) {
    const propertiesToFilter = [
      'title.international',
      'title.original',
      // 'directors[].firstName', // TODO #9330
      // 'directors[].lastName'
    ]

    return this.search.valueChanges.pipe(
      debounceTime(200),
      map(value => {
        const input = removeAccent(value.toLowerCase());
        return data.filter(row => {
          return propertiesToFilter.some(prop => {
            const value = getDeepValue<string>(row, prop);
            return value.toLowerCase().includes(input)
          });
        });
      }),
      startWith(data)
    );
  }

  switchView() {
    this.mode = this.mode === 'grid' ? 'table' : 'grid';
  }

}
