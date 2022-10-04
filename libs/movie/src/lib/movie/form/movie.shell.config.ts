
import { Inject, Injectable } from '@angular/core';
import { mergeDeep } from '@blockframes/utils/helpers';
import { FileUploaderService } from '@blockframes/media/file-uploader.service';
import { MovieControl, MovieForm } from './movie.form';
import type { FormShellConfig } from './movie.shell.interfaces'
import { MovieService } from '../service';
import { Movie, MoviePromotionalElements, ProductionStatus, App, getMoviePublishStatus, FormSaveOptions, MovieVideo } from '@blockframes/model';
import { MovieActiveGuard } from '../guards/movie-active.guard';
import { APP } from '@blockframes/utils/routes/utils';

const valueByProdStatus: Record<ProductionStatus, Record<string, string>> = {
  development: {
    'release.status': '',
    'runningTime.status': ''
  },
  shooting: {
    'release.status': '',
    'runningTime.status': ''
  },
  post_production: {
    'release.status': '',
    'runningTime.status': ''
  },
  finished: {
    'release.status': 'confirmed',
    'runningTime.status': 'confirmed'
  },
  released: {
    'release.status': 'confirmed',
    'runningTime.status': 'confirmed'
  }
}

function cleanPromotionalMedia(promotional: MoviePromotionalElements): MoviePromotionalElements {
  return {
    ...promotional,
    still_photo: promotional.still_photo.filter(photo => !!photo.storagePath),
    notes: promotional.notes.filter(note => !!note.storagePath),
    videos: {
      ...promotional.videos,
      otherVideos: promotional.videos.otherVideos.filter(video => !!video.storagePath),
    }
  }
}

@Injectable({ providedIn: 'root' })
export class MovieShellConfig implements FormShellConfig<MovieControl, Movie> {
  form: MovieForm;
  name = 'Title';

  constructor(
    private service: MovieService,
    private uploaderService: FileUploaderService,
    private movieActiveGuard: MovieActiveGuard,
    @Inject(APP) private currentApp: App
  ) { }

  onInit() {
    // Fill Form
    const movie = this.movieActiveGuard.movie;
    if (this.currentApp === 'catalog') movie.productionStatus = 'released';
    this.form = new MovieForm(movie);
    this.fillHiddenMovieInputs(movie.productionStatus);
  }

  // Update form to fill inputs that might be hidden but that are mandatory to submit the movie
  public fillHiddenMovieInputs(status: ProductionStatus) {
    if (!status) return;
    for (const path in valueByProdStatus[status]) {
      const formHasValue = this.form.get(path as any).value;
      const configHasValue = valueByProdStatus[status][path];
      if (configHasValue || !formHasValue) {
        this.form.get(path as any).setValue(valueByProdStatus[status][path]);
      }
    }
  }

  async onSave(options: FormSaveOptions): Promise<void> {
    const movie = this.movie;

    // Specific update if publishing
    if (options.publishing) {
      movie.app[this.currentApp].status = getMoviePublishStatus(this.currentApp);

      if (movie.app[this.currentApp].status === 'accepted') movie.app[this.currentApp].acceptedAt = new Date();
      if (movie.app[this.currentApp].status === 'submitted') movie.app[this.currentApp].submittedAt = new Date();
    }

    // -- Update movie & media -- //
    await this.service.upsert(movie);
    this.uploaderService.upload();
    this.form.markAsPristine();
  }

  get movie() {
    const base = this.movieActiveGuard.movie;
    const movie = mergeDeep(base, this.form.value);

    // -- Post merge operations -- //

    // Remove empty file ref
    movie.promotional = cleanPromotionalMedia(movie.promotional);

    // Specific updates based on production status
    const prodStatus = ['finished', 'released'];
    if (prodStatus.includes(movie.productionStatus)) {
      movie.directors.forEach(director => director.status = 'confirmed');
      movie.cast.forEach(cast => cast.status = 'confirmed');
      movie.crew.forEach(crew => crew.status = 'confirmed');
    }

    // Update fields with dynamic keys
    const dynamicKeyFields = ['languages', 'shooting'];
    dynamicKeyFields.forEach(key => movie[key] = this.form.value[key])

    return movie;
  }

  /**
   * Checks if all video upload areas of a movie are in a correct state
   * Return true if movie document is in a state that allow saving
   */
  public canSave() {
    const isVideoFileValid = (movieVideo: MovieVideo) => !movieVideo.storagePath || !!movieVideo.jwPlayerId;

    const { promotional } = this.movie;
    if (!promotional) return true;

    const { videos } = promotional;
    if (!videos) return true;

    if (!isVideoFileValid(videos.screener)) return false;
    if (!isVideoFileValid(videos.publicScreener)) return false;
    if (!isVideoFileValid(videos.salesPitch)) return false;

    if (videos.otherVideos.length && videos.otherVideos.some(v => !isVideoFileValid(v))) return false;

    return true;
  }

}
