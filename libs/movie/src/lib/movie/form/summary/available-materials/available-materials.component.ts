import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: '[movie][link] movie-summary-available-materials',
  templateUrl: './available-materials.component.html',
  styleUrls: ['./available-materials.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryAvailableMaterialsComponent implements OnInit {

  @Input() movie: MovieForm;
  @Input() link: string;
  @Input() @boolean download = false;

  public versionLength: number;

  ngOnInit() {
    this.versionLength = Object.keys(this.movie.languages.controls).length;
  }

  get file() {
    return this.movie.get('delivery').get('file').value;
  }

}
