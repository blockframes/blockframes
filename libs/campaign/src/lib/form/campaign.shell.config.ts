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

  onInit(): Observable<unknown>[] {
    const sub = this.route.selectParams('movieId').pipe(
      switchMap((id: string) => this.service.getValue(id)),
      tap(campaign => {
        this.form.reset();
        this.form.setAllValue(campaign);
      })
    );
    return [sub];
  }

  async onSave(): Promise<unknown> {
    const id: string = this.route.getParams('movieId');

    this.uploaderService.upload();
    await this.service.save(id, this.form.value);

    this.form.markAsPristine();
    return id;
  }

}
