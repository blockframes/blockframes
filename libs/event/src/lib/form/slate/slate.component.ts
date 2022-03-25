import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { fromOrgAndAccepted, MovieService } from '@blockframes/movie/+state/movie.service';
import { OrganizationService } from '@blockframes/organization/+state';
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
export class SlateComponent {

  titles$ = this.orgService.currentOrg$.pipe(
    switchMap(org => this.movieService.valueChanges(fromOrgAndAccepted(org.id, 'festival'))),
    map(titles => titles.sort((a, b) => a.title.international.localeCompare(b.title.international)))
  );
  videos$ = this.orgService.currentOrg$.pipe(
    map(org => org?.documents?.videos || [])
  );

  constructor (
    private movieService: MovieService,
    private orgService: OrganizationService,
    private dynTitle: DynamicTitleService,
    private shell: EventFormShellComponent,
    private snackBar: MatSnackBar,
  ) {
    this.dynTitle.setPageTitle('Add an event', 'Slate info');
  }

  get formMeta() {
    return this.shell.form.get('meta');
  }

  get link() {
    return this.shell.link;
  }

  copied() {
    this.snackBar.open('Link copied', 'CLOSE', { duration: 4000 });
  }

}
