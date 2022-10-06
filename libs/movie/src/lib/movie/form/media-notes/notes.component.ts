// Angular
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Component
import { MovieFormShellComponent } from '../shell/shell.component';

// Blockframes
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MovieService } from '../../service';
import { getDeepValue } from '@blockframes/utils/pipes';
import { getFileMetadata, getFileStoragePath } from '@blockframes/media/utils';
import { MovieNote } from '@blockframes/model';
import { FileUploaderService } from '@blockframes/media/file-uploader.service';
import { getFileListIndex } from '@blockframes/media/file/pipes/file-list.pipe';

@Component({
  selector: 'movie-form-media-notes',
  templateUrl: 'notes.component.html',
  styleUrls: ['./notes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormMediaNotesComponent implements OnInit {
  movieId = this.route.snapshot.params.movieId;
  form = this.shell.getForm('movie');

  constructor(
    private movie: MovieService,
    private shell: MovieFormShellComponent,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService,
    private uploaderService: FileUploaderService
  ) {
    this.dynTitle.setPageTitle('Notes');
  }

  ngOnInit() {
    const sub = this.movie.valueChanges(this.movieId).subscribe((title) => {
      const metadata = getFileMetadata('movies', 'notes', this.movieId);
      const mediaArray: Partial<MovieNote>[] = getDeepValue(title, metadata.field);
      this.form.promotional.get('notes').patchValue(mediaArray);
    });

    this.shell.addSubToStack(sub);
  }

  removeFromQueue(index: number) {
    const title = this.form.value;
    const storagePath = getFileStoragePath('movies', 'notes', this.movieId);
    const queueIndex = getFileListIndex(index, title.promotional.notes);
    this.uploaderService.removeFromQueue(storagePath, queueIndex);
  }
}
