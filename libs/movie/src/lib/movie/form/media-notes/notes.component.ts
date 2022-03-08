// Angular
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Component
import { MovieFormShellComponent } from '../shell/shell.component';

// Blockframes
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MovieService } from '../../+state/movie.service';
import { getDeepValue } from '@blockframes/utils/pipes';
import { getFileMetadata } from '@blockframes/media/+state/static-files';
import { Subscription } from 'rxjs';
import { MovieNote } from '@blockframes/data-model';

@Component({
  selector: 'movie-form-media-notes',
  templateUrl: 'notes.component.html',
  styleUrls: ['./notes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormMediaNotesComponent implements OnInit, OnDestroy {
  movieId = this.route.snapshot.params.movieId;
  form = this.shell.getForm('movie');

  roles = ['producer', 'director', 'other'];

  private sub: Subscription;

  constructor(
    private movie: MovieService,
    private shell: MovieFormShellComponent,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle('Notes');
  }

  ngOnInit() {
    this.sub = this.movie.valueChanges(this.movieId).subscribe(title => {
      const metadata = getFileMetadata('movies', 'notes', this.movieId);
      const mediaArray: Partial<MovieNote>[] = getDeepValue(title, metadata.field);
      this.form.promotional.get('notes').patchValue(mediaArray);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
