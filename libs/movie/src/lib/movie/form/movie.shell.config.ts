
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { filter, startWith, switchMap, tap } from "rxjs/operators";
import { mergeDeep } from "@blockframes/utils/helpers";
import { FileUploaderService } from '@blockframes/media/+state';
import { ProductionStatus } from "@blockframes/utils/static-model";
import { App, getCurrentApp, getMoviePublishStatus } from "@blockframes/utils/apps";
import { FormSaveOptions } from '@blockframes/utils/common-interfaces';
import { MovieControl, MovieForm } from "./movie.form";
import type { FormShellConfig } from './movie.shell.interfaces'
import { Movie, MoviePromotionalElements, MovieQuery, MovieService } from "../+state";

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
  form = new MovieForm(this.query.getActive()); // TODO #7282 check #7255
  name = 'Title';
  private currentApp = getCurrentApp(this.route);

  constructor(
    private query: MovieQuery,
    private route: RouterQuery,
    private service: MovieService,
    private uploaderService: FileUploaderService,
  ) { }

  onInit(): Observable<unknown>[] {
    // Update form on change
    const onMovieChanges = this.route.selectParams('movieId').pipe(
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

    const base = this.query.getActive();
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
      const currentApp: App = this.route.getData('app');
      movie.app[currentApp].status = getMoviePublishStatus(currentApp);
      if (currentApp === 'festival') movie.app[currentApp].acceptedAt = new Date();
    }

    // -- Update movie & media -- //
    await this.service.upsert(movie);
    this.uploaderService.upload();
    this.form.markAsPristine();
  }

}
