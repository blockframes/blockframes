
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { filter, startWith, switchMap, tap } from "rxjs/operators";
import { mergeDeep } from "@blockframes/utils/helpers";
import { FileUploaderService } from '@blockframes/media/+state';
import { ProductionStatus } from "@blockframes/utils/static-model";
import { getMoviePublishStatus } from "@blockframes/utils/apps";
import { FormSaveOptions } from '@blockframes/utils/common-interfaces';
import { MovieControl, MovieForm } from "./movie.form";
import type { FormShellConfig } from './movie.shell.interfaces'
import { Movie, MoviePromotionalElements, MovieService } from "../+state";
import { MovieActiveGuard } from '../guards/movie-active.guard';
import { AppGuard } from '@blockframes/utils/routes/app.guard';

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
  form = new MovieForm(this.movieActiveGuard.movie); // TODO #7255
  name = 'Title';
  private currentApp = this.appGuard.currentApp;

  constructor(
    private appGuard: AppGuard,
    private routerQuery: RouterQuery,
    private service: MovieService,
    private uploaderService: FileUploaderService,
    private movieActiveGuard: MovieActiveGuard,
  ) { }

  onInit(): Observable<unknown>[] {
    // Update form on change
    const onMovieChanges = this.routerQuery.selectParams('movieId').pipe(
      switchMap((id: string) => this.service.getValue(id)),
      tap(movie => {
        if (this.currentApp === 'catalog') movie.productionStatus = 'released';
        this.form.reset();
        this.form.setAllValue(movie);
        if (movie.productionStatus) this.fillHiddenMovieInputs(movie.productionStatus);
      })
    );

    // Update form on status change
    const onStatusChanges = this.form.productionStatus.valueChanges.pipe(
      startWith(this.form.productionStatus.value),
      filter(status => !!status),
      tap((status: ProductionStatus) => this.fillHiddenMovieInputs(status))
    );
    return [onMovieChanges, onStatusChanges];
  }

  // Update form to fill inputs that might be hidden but that are mandatory to submit the movie
  private fillHiddenMovieInputs(status: ProductionStatus) {
    for (const path in valueByProdStatus[status]) {
      const formHasValue = this.form.get(path as any).value;
      const configHasValue = valueByProdStatus[status][path];
      if (configHasValue || !formHasValue) {
        this.form.get(path as any).setValue(valueByProdStatus[status][path]);
      }
    }
  }

  // TODO issue#4002
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
