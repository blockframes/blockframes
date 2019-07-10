import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import {  MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Movie } from '../../../+state/movie.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'movie-import-preview-movie',
  templateUrl: './preview-movie.component.html',
  styleUrls: ['./preview-movie.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewMovieComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public movie$: Observable<Movie>,
  ) { }
}
