import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { ViewComponent } from '../view/view.component';
import { Movie } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Observable } from 'rxjs';
import { where } from 'firebase/firestore';

@Component({
  selector: 'financiers-marketplace-organization-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleComponent implements OnInit {
  public titles$: Observable<Movie[]>;

  trackById = (i: number, doc: { id: string }) => doc.id;

  constructor(
    private service: MovieService,
    private parent: ViewComponent,
    private dynTitle: DynamicTitleService
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Sales Agent', 'Line-up');
    this.titles$ = this.parent.org$.pipe(
      switchMap((org) => {
        return this.service.valueChanges([
          where('orgIds', 'array-contains', org.id),
          where('app.financiers.status', '==', 'accepted'),
          where('app.financiers.access', '==', true),
        ]);
      }),
      map(movies => movies.sort((a, b) => (a._meta.updatedAt || a._meta.createdAt) < (b._meta.updatedAt || b._meta.createdAt) ? 1 : -1)),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    );
  }
}
