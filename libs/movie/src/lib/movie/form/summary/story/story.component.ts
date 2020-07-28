import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { MovieForm } from '../../movie.form';

@Component({
  selector: '[movie] movie-summary-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryStoryComponent implements OnInit {

  public separatorKeysCodes = [ENTER, COMMA]

  @Input() movie: MovieForm;
  @Input() link: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.movie.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }
}
