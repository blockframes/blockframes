import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link]movie-summary-media-notes',
  templateUrl: 'notes.component.html',
  styleUrls: ['./notes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryMediaNotesComponent implements OnInit {
  @Input() movie: MovieForm;
  @Input() link: string;

  get notes() {
    return this.movie.promotional.get('notes');
  }

  ngOnInit() {
    console.log(this.movie.promotional.get('notes'))
  }
}
