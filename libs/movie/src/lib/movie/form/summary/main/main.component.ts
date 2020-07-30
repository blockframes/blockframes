import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { DirectorForm } from '@blockframes/movie/form/main/main.form';
import { MovieForm } from '../../movie.form';

@Component({
  selector: '[movie] movie-summary-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryMainComponent implements OnInit {
  @Input() movie: MovieForm;
  @Input() link: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.movie.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }

  public directorHasErrorRequired(director: DirectorForm) {
    return director.get('firstName').hasError('required') || director.get('lastName').hasError('required');
  }
}
