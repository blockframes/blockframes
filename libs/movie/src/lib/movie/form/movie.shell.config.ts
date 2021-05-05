
import { Injectable } from '@angular/core';

import { Observable } from "rxjs";
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { filter, startWith, switchMap, tap } from "rxjs/operators";

import { mergeDeep } from "@blockframes/utils/helpers";
import { FileUploaderService } from '@blockframes/media/+state';
import { ProductionStatus } from "@blockframes/utils/static-model";
import { App, getMoviePublishStatus } from "@blockframes/utils/apps";
import { FormSaveOptions } from '@blockframes/utils/common-interfaces';

import { MovieControl, MovieForm } from "./movie.form";
import type { FormShellConfig } from './movie.shell.interfaces'
import { Movie, MoviePromotionalElements, MovieQuery, MovieService } from "../+state";


const valueByProdStatus: Record<ProductionStatus, Record<string, string>> = {
  development: {
    'release.status': '',
    "runningTime.status": ''
  },
  shooting: {
    'release.status': '',
    "runningTime.status": ''
  },
  post_production: {
    'release.status': '',
    "runningTime.status": ''
  },
  finished: {
    'release.status': 'confirmed',
    "runningTime.status": 'confirmed'
  },
  released: {
    'release.status': 'confirmed',
    "runningTime.status": 'confirmed'
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
  form = new MovieForm(this.query.getActive());
  name = 'Title'
  constructor(
    private query: MovieQuery,
    private route: RouterQuery,
    private service: MovieService,
    private uploaderService: FileUploaderService,
  ) { }

  onInit(): Observable<any>[] {
    // Update form on change
    const onMovieChanges = this.route.selectParams('movieId').pipe(
      switchMap((id: string) => this.service.getValue(id)),
      tap(movie => {
        /* @TODO #5529 investigate & clean this up.
        We need to check if in the form the value for productionStatus is already set, because
        initially, this value is null, but since we made a request with `this.service.getValue(id)` to
        firebase, this code will get pushed onto the async stack, which will be executed later. The result
        of this is that all the "sync" code that updates this form will be overwritten with the value
        from the db. For instance, in title-status component we set the movie status to released when
        app is catalog. If we now wouldn't check if the productionStatus is already set to something, it will
        erase `released` and set it to null */
        if (this.form.productionStatus.value) {
          movie.productionStatus = this.form.productionStatus.value
        }

        if (this.form.release.get('status').value) {
          movie.release.status = this.form.release.get('status').value
        }

        if (this.form.runningTime.get('status').value) {
          movie.runningTime.status = this.form.runningTime.get('status').value
        }

        this.form.reset();
        this.form.setAllValue(movie);
      })
    );

    // Update form on status change
    const onStatusChanges = this.form.productionStatus.valueChanges.pipe(
      startWith(this.form.productionStatus.value),
      filter(status => !!status),
      tap(status => {
        for (const path in valueByProdStatus[status]) {
          this.form.get(path as any).setValue(valueByProdStatus[status][path]);
        }
      })
    );
    return [onMovieChanges, onStatusChanges];
  }

  // TODO issue#4002
  async onSave(options: FormSaveOptions): Promise<any> {

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
      movie.crew.forEach(crew => crew.status = 'confiremd');
    }

    // Update fields with dynamic keys
    const dynamicKeyFields = ['languages', 'shooting'];
    dynamicKeyFields.forEach(key => movie[key] = this.form.value[key])

    // Specific update if publishing
    if (options.publishing) {
      const currentApp: App = this.route.getData('app');
      movie.storeConfig.status = getMoviePublishStatus(currentApp);
      movie.storeConfig.appAccess[currentApp] = true;
    }

    // -- Update movie & media -- //
    await this.service.upsert(movie);
    this.uploaderService.upload();
    this.form.markAsPristine();
  }

}
