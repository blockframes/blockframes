import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';
import { MovieForm } from '../../movie.form';

@Component({
  selector: '[movie] movie-summary-technical-information',
  templateUrl: './technical-information.component.html',
  styleUrls: ['./technical-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryTechnicalInformationComponent implements OnInit {
  @Input() movie: MovieForm;
  @Input() link: string;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.movie.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }

  get hasKeys() {
    return Object.keys(this.movie.controls).length;
  }
}
