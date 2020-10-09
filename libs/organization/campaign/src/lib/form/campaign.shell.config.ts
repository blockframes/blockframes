import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FormSaveOptions, FormShellConfig } from '@blockframes/movie/form/shell/shell.component';
import { OrganizationQuery } from "@blockframes/organization/+state";
import { CampaignControls, createCampaignForm } from './form';
import { Campaign, CampaignService } from '../+state';
import { switchMap } from 'rxjs/operators';
import { Subscription } from "rxjs";
import { RouterQuery } from "@datorama/akita-ng-router-store";

@Injectable({ providedIn: 'root' })
export class CampaignShellConfig implements FormShellConfig<CampaignControls, Campaign>{
  form = createCampaignForm();
  constructor(
    private route: RouterQuery,
    private service: CampaignService,
    private orgQuery: OrganizationQuery,
  ) {}

  onInit(): Subscription[] {
    const orgId = this.orgQuery.getActiveId();
    const sub = this.route.selectParams('movieId').pipe(
      switchMap((id: string) => this.service.valueChanges(id, { params: { orgId }}))
    ).subscribe(campaign => this.form.patchAllValue(campaign));
    return [sub];
  }

  async onSave(options: FormSaveOptions): Promise<any> {
    const id: string = this.route.getParams('movieId');
    await this.service.save(id, this.form.value);
    this.form.markAsPristine();
    return id;
  }

}