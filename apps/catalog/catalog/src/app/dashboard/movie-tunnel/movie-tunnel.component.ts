// Angular
import { Component, ChangeDetectionStrategy, Host, OnInit } from '@angular/core';
// Blockframes
import { MovieService, MovieQuery, createMovie } from '@blockframes/movie/movie/+state';
import { MovieForm } from '@blockframes/movie/movie/form/movie.form';
import { MatSnackBar, MatDialog } from '@angular/material';
import { TunnelStep, TunnelRoot, TunnelConfirmComponent } from '@blockframes/ui/tunnel';
import { switchMap, map, tap } from 'rxjs/operators';
import { of, from } from 'rxjs';

const steps: TunnelStep[] = [{
  title: 'Title Information',
  icon: 'document',
  time: 15,
  routes: [{
    path: 'main',
    label: 'Main Information'
  }, {
    path: 'synopsis',
    label: 'Storyline Elements'
  }, {
    path: 'credits',
    label: 'Credits'
  }, {
    path: 'budget',
    label: 'Budget, Quotas, Critics',
  }]
}, {
  title: 'Media',
  icon: 'import',
  time: 10,
  routes: [{
    path: 'technical-info',
    label: 'Technical Info.'
  }, {
    path: 'images',
    label: 'Promotional Images'
  }, {
    path: 'files&links',
    label: 'Files & Links'
  }]
}, {
  title: 'Legal Information',
  icon: 'certificate',
  time: 5,
  routes: [{
    path: 'chain',
    label: 'Chain of Titles'
  }, {
    path: 'evaluation',
    label: 'Marketplace Eval.'
  }]
}, {
  title: 'Summary',
  icon: 'document',
  routes: [{
    path: 'summary',
    label: 'Summary & Sumbit'
  }]
}];

@Component({
  selector: 'catalog-movie-tunnel',
  templateUrl: './movie-tunnel.component.html',
  styleUrls: ['./movie-tunnel.component.scss'],
  providers: [MovieForm],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieTunnelComponent implements OnInit, TunnelRoot {
  steps = steps;

  constructor(
    @Host() private form: MovieForm,
    private service: MovieService,
    private query: MovieQuery,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  async ngOnInit() {
    const movie = this.query.getActive();
    this.form.patchAllValue(movie);
  }

  // Should save movie
  public async save() {
    const id = this.query.getActiveId();
    const movie = createMovie({ id, ...this.form.value });
    await this.service.update(movie);
    this.form.markAsPristine();
    await this.snackBar.open('Saved', '', { duration: 500 }).afterDismissed().toPromise();
    return true;
  }

  confirmExit() {
    if (this.form.pristine) {
      return of(true);
    }
    const dialogRef = this.dialog.open(TunnelConfirmComponent, {
      width: '80%',
      data: {
        title: 'You are going to leave the Movie Form.',
        subtitle: 'Pay attention, if you leave now your changes will not be saved.'
      }
    });
    return dialogRef.afterClosed().pipe(
      switchMap(shouldSave => shouldSave ? this.save() : of(false))
    );
  }
}
