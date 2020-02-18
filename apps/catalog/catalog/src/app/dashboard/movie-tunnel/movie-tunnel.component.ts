// Angular
import { Component, ChangeDetectionStrategy, Host, OnInit } from '@angular/core';
// Blockframes
import { MovieService, MovieQuery } from '@blockframes/movie/movie/+state';
import { MovieForm } from '@blockframes/movie/movie/form/movie.form';
import { MatSnackBar, MatDialog } from '@angular/material';
import { TunnelStep, TunnelRoot, TunnelConfirmComponent } from '@blockframes/ui/tunnel';
import { switchMap, map, tap } from 'rxjs/operators';
import { of, from } from 'rxjs';

const steps: TunnelStep[] = [{
  title: 'Title Information',
  icon: 'document',
  time: 40,
  routes: [{
    path: 'main',
    label: 'Main Informations'
  }, {
    path: 'synopsis',
    label: 'Synopsis'
  }, {
    path: 'credits',
    label: 'Credits'
  }, {
    path: 'budget',
    label: 'Budg., quota, critics',
  }, {
    path: 'technical-info',
    label: 'Technical info.'
  }, {
    path: 'keywords',
    label: 'Keywords'
  }]
}, {
  title: 'Licensed Rights',
  icon: 'map_marker',
  time: 30,
  routes: [{
    path: 'rights',
    label: 'Marketplace Rights'
  }, {
    path: 'deals',
    label: 'Ongoing Deals'
  }]
}, {
  title: 'Uploaded Media',
  icon: 'import',
  time: 30,
  routes: [{
    path: 'images',
    label: 'Images'
  }, {
    path: 'files&links',
    label: 'Files & Links'
  }]
}, {
  title: 'Legal Information',
  icon: 'certificate',
  time: 10,
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
  ) {}

  async ngOnInit() {
    const movie = this.query.getActive();
    this.form.patchAllValue(movie);
  }

  // Should save movie
  public save() {
    const id = this.query.getActiveId();
    const update = this.service.update({ id, ...this.form.value });
    // Return an observable<boolean> for the confirmExit
    return from(update).pipe(
      tap(_ => this.form.markAsPristine()),
      switchMap(_ => this.snackBar.open('Saved', '', { duration: 500 }).afterDismissed()),
      map(_ => true) 
    )
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
