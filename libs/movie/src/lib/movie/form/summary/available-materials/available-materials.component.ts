import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MediaService } from '@blockframes/media/service';
import { StorageFile } from '@blockframes/model';
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

  constructor( private mediaService: MediaService ) { }

  ngOnInit() {
    this.versionLength = Object.keys(this.movie.languages.controls).length;
  }

  get file() {
    return this.movie.get('delivery').get('file').value;
  }

  public async getDownloadUrl(file: StorageFile) {
    const url = await this.mediaService.generateImgIxUrl(file, {});
    window.open(url);
  }
}
