// Angular
import { Component, ChangeDetectionStrategy, Host, OnInit } from '@angular/core';
// Blockframes
import { MovieService, MovieQuery } from '@blockframes/movie/movie/+state';
import { MovieForm } from '@blockframes/movie/movie/form/movie.form';
import { MatSnackBar } from '@angular/material';


const steps = [{
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
}];

@Component({
  selector: 'catalog-movie-tunnel',
  templateUrl: './movie-tunnel.component.html',
  styleUrls: ['./movie-tunnel.component.scss'],
  providers: [MovieForm],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieTunnelComponent implements OnInit {
  steps = steps;

  constructor(
    @Host() private form: MovieForm,
    private service: MovieService,
    private query: MovieQuery,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    const movie = this.query.getActive();
    this.form.patchAllValue(movie);
  }

  // Should save movie
  public async save() {
    const id = this.query.getActiveId();
    await this.service.update({ id, ...this.form.value });
    this.snackBar.open('Saved', 'close', { duration: 500 });
  }

}
