import { Injectable } from '@angular/core';
import { extractMediaFromDocumentBeforeUpdate } from "@blockframes/media/+state/media.model";
import { MediaService } from "@blockframes/media/+state/media.service";
import { App, getMoviePublishStatus } from "@blockframes/utils/apps";
import { mergeDeep } from "@blockframes/utils/helpers";
import { ProductionStatus } from "@blockframes/utils/static-model";
import { MovieControl, MovieForm } from "./movie.form";
import { Movie, MoviePromotionalElements, MovieQuery, MovieService } from "../+state";
import { FormShellConfig } from './shell/shell.component';
import { switchMap, startWith, filter } from "rxjs/operators";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { RouterQuery } from '@datorama/akita-ng-router-store';

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
    still_photo: promotional.still_photo.filter(photo => !!photo),
    notes: promotional.notes.filter(note => !!note.ref)
  }
}

@Injectable({ providedIn: 'root' })
export class MovieShellConfig implements FormShellConfig<MovieControl, Movie> {
  form = new MovieForm(this.query.getActive());
  constructor(
    private route: RouterQuery,
    private service: MovieService,
    private query: MovieQuery,
    private mediaService: MediaService,
  ) { }

  onInit(): Observable<any>[] {
    // Update form on change
    const onMovieChanges = this.route.selectParams('movieId').pipe(
      switchMap((id: string) => this.service.getValue(id)),
      tap(movie => {
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

  async onSave(publishing: boolean): Promise<any> {
    const { documentToUpdate, mediasToUpload } = extractMediaFromDocumentBeforeUpdate(this.form);
    const base = this.query.getActive();
    const movie = mergeDeep(base, documentToUpdate);

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
    if (publishing) {
      const currentApp: App = this.route.getData('app');
      movie.storeConfig.status = getMoviePublishStatus(currentApp); // @TODO (#2765)
      movie.storeConfig.appAccess[currentApp] = true;
    }

    // -- Update movie & media -- //
    await this.service.upsert(movie);
    this.mediaService.uploadMedias(mediasToUpload);
    this.form.markAsPristine();
  }

}