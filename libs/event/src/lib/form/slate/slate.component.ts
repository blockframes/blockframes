import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { fromOrgAndAccepted, MovieService } from '@blockframes/movie/+state/movie.service';
import { Movie, StorageVideo } from '@blockframes/model';
import { OrganizationService } from '@blockframes/organization/+state';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { EventFormShellComponent } from '../shell/shell.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'event-slate',
  templateUrl: './slate.component.html',
  styleUrls: ['./slate.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlateComponent implements OnInit {

  titles$: Observable<Movie[]>;
  videos$: Observable<StorageVideo>;
  screenerMissing: boolean;
  titleMissing: boolean;
  constructor(
    private movieService: MovieService,
    private orgService: OrganizationService,
    private dynTitle: DynamicTitleService,
    private shell: EventFormShellComponent,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) { }

  get formMeta() {
    return this.shell.form.get('meta');
  }

  get link() {
    return this.shell.link;
  }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Add an event', 'Slate info');

    // will be executed only if "screening" as Observable are lazy
    this.titles$ = this.orgService.currentOrg$.pipe(
      switchMap(org => this.movieService.valueChanges(fromOrgAndAccepted(org.id, 'festival'))),
      map(titles => titles.sort((a, b) => a.title.international.localeCompare(b.title.international)))
    );
    this.videos$ = this.orgService.currentOrg$.pipe(
      switchMap(org => org.documents.videos)
    );

    this.checkTitleAndScreener(this.shell.form.meta.value.titleId);
  }

  copied() {
    this.snackBar.open('Link copied', 'CLOSE', { duration: 4000 });
  }

  async checkTitleAndScreener(titleId: string) {
    if(!titleId) {
      this.titleMissing = true;
    } else {
      const title = await this.movieService.getValue(titleId);
      // Titles in draft are not allowed for screenings
      this.titleMissing = title.app.festival.status === 'draft';
      this.screenerMissing = !title.promotional.videos?.screener?.jwPlayerId;
    }
    this.cdr.markForCheck();
  }
}
