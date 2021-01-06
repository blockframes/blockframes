import { Injectable } from "@angular/core";
import { RouterQuery } from "@datorama/akita-ng-router-store";
import type { FormShellConfig } from '@blockframes/movie/form/movie.shell.interfaces';
import { CampaignControls, CampaignForm } from './form';
import { Campaign, CampaignService } from '../+state';
import { MediaService, extractMediaFromDocumentBeforeUpdate } from '@blockframes/media/+state';
import { switchMap, tap } from 'rxjs/operators';
import { Observable } from "rxjs";
import { FormSaveOptions } from "@blockframes/utils/common-interfaces";

@Injectable({ providedIn: 'root' })
export class CampaignShellConfig implements FormShellConfig<CampaignControls, Campaign>{
  form = new CampaignForm();
  name = 'Campaign'
  constructor(
    private route: RouterQuery,
    private service: CampaignService,
    private mediaService: MediaService
  ) { }

  onInit(): Observable<any>[] {
    const sub = this.route.selectParams('movieId').pipe(
      switchMap((id: string) => this.service.getValue(id)),
      tap(campaign => {
        this.form.reset();
        this.form.setAllValue(campaign);
      })
    );
    return [sub];
  }

  async onSave(options: FormSaveOptions): Promise<any> {
    const id: string = this.route.getParams('movieId');

    const { documentToUpdate, mediasToUpload } = extractMediaFromDocumentBeforeUpdate(this.form);
    await this.service.save(id, documentToUpdate);
    this.mediaService.uploadMedias(mediasToUpload);
    this.form.markAsPristine();
    return id;
  }

}