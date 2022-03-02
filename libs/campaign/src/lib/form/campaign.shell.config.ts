import { Injectable } from "@angular/core";
import { RouterQuery } from "@datorama/akita-ng-router-store";
import type { FormShellConfig } from '@blockframes/movie/form/movie.shell.interfaces';
import { CampaignControls, CampaignForm } from './form';
import { Campaign, CampaignService } from '../+state';
import { switchMap, tap } from 'rxjs/operators';
import { Observable } from "rxjs";
import { FileUploaderService } from "@blockframes/media/+state";

@Injectable({ providedIn: 'root' })
export class CampaignShellConfig implements FormShellConfig<CampaignControls, Campaign>{
  form = new CampaignForm();
  name = 'Campaign'
  constructor(
    private route: RouterQuery,
    private service: CampaignService,
    private uploaderService: FileUploaderService,
  ) { }

  async onInit(movieId: string) {
    // Fill Form
    const campaign = await this.service.getValue(movieId);
    this.form.reset();
    this.form.setAllValue(campaign);
  }

  async onSave(): Promise<unknown> {
    const id: string = this.route.getParams('movieId');

    this.uploaderService.upload();
    await this.service.save(id, this.form.value);

    this.form.markAsPristine();
    return id;
  }

}
