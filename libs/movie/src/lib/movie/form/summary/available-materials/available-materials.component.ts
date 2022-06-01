import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
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
export class SummaryAvailableMaterialsComponent {

  @Input() movie: MovieForm;
  @Input() link: string;
  @Input() @boolean download = false;

  constructor(private mediaService: MediaService) { }

  get file(): StorageFile {
    return this.movie.get('delivery').get('file').value;
  }

  public async downloadFile() {
    const url = await this.mediaService.generateImgIxUrl(this.file);
    window.open(url);
  }
}
