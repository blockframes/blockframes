import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ViewComponent } from '../view/view.component';
import { Movie } from '@blockframes/shared/model';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'financiers-marketplace-organization-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleComponent implements OnInit {
  public titles$: Observable<Movie[]>;

  trackById = (i: number, doc: { id: string }) => doc.id;

  constructor(private service: MovieService, private parent: ViewComponent, private dynTitle: DynamicTitleService) {}

  ngOnInit() {
    this.dynTitle.setPageTitle('Sales Agent', 'Line-up');
    this.titles$ = this.parent.org$.pipe(
      switchMap(org => {
        return this.service.valueChanges(ref =>
          ref
            .where('orgIds', 'array-contains', org.id)
            .where('app.financiers.status', '==', 'accepted')
            .where('app.financiers.access', '==', true)
            .orderBy('_meta.createdAt', 'desc')
        );
      }),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    );
  }
}
