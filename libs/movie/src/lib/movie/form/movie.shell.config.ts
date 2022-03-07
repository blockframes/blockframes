
import { Inject, Injectable } from '@angular/core';
import { mergeDeep } from "@blockframes/utils/helpers";
import { FileUploaderService } from '@blockframes/media/+state';
import { ProductionStatus } from "@blockframes/utils/static-model";
import { App, getMoviePublishStatus } from "@blockframes/utils/apps";
import { FormSaveOptions } from '@blockframes/utils/common-interfaces';
import { MovieControl, MovieForm } from "./movie.form";
import type { FormShellConfig } from './movie.shell.interfaces'
import { Movie, MoviePromotionalElements, MovieService } from "../+state";
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

    const base = this.movieActiveGuard.movie;
    const movie = mergeDeep(base, this.form.value);

    // -- Post merge operations -- //

    // Remove empty file ref
    movie.promotional = cleanPromotionalMedia(movie.promotional);

    // Specific updates based on production status
    const prodStatus = ['finished', 'released'];
    if (prodStatus.includes(movie.productionStatus)) {
      movie.directors.forEach(director => director.status = 'confirmed')
      movie.cast.forEach(cast => cast.status = 'confirmed')
      movie.crew.forEach(crew => crew.status = 'confirmed'); // TODO #7774 previous value was 'confiremd' =>  migration needed
    }

    // Update fields with dynamic keys
    const dynamicKeyFields = ['languages', 'shooting'];
    dynamicKeyFields.forEach(key => movie[key] = this.form.value[key])

    // Specific update if publishing
    if (options.publishing) {
      movie.app[this.currentApp].status = getMoviePublishStatus(this.currentApp);
      if (this.currentApp === 'festival') movie.app[this.currentApp].acceptedAt = new Date();
    }

    // -- Update movie & media -- //
    await this.service.upsert(movie);
    this.uploaderService.upload();
    this.form.markAsPristine();
  }

}
