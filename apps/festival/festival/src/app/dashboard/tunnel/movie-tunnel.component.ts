// Angular
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
// Blockframes
import { MovieService, MovieQuery, createMovie } from '@blockframes/movie/+state';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TunnelStep, TunnelRoot, TunnelConfirmComponent } from '@blockframes/ui/tunnel';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

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
  title: 'Summary',
  icon: 'document',
  routes: [{
    path: 'summary',
    label: 'Summary & Submission'
  }]
}];

@Component({
  selector: 'festival-movie-tunnel',
  templateUrl: './movie-tunnel.component.html',
  styleUrls: ['./movie-tunnel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieTunnelComponent implements TunnelRoot, OnInit {
  steps = steps;
  // Have to be initialized in the constructor as children page use it in the constructor too
  public form = new MovieForm(this.query.getActive());

  public exitRoute: string;

  constructor(
    private service: MovieService,
    private query: MovieQuery,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  async ngOnInit() {
    this.exitRoute = `../../../title/${this.query.getActiveId()}`;
  }

  // Should save movie
  public async save() {
    const movie = createMovie({
      ...this.query.getActive(),
      ...this.form.value
    });
    await this.service.update(movie);
    this.form.markAsPristine();
    await this.snackBar.open('Title saved', '', { duration: 500 }).afterDismissed().toPromise();
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
