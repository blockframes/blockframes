import { Injectable } from "@angular/core";
import { RouterQuery } from "@datorama/akita-ng-router-store";
import { FormSaveOptions, FormShellConfig } from '@blockframes/movie/form/shell/shell.component';
import { OrganizationQuery } from "@blockframes/organization/+state";
import { CampaignControls, CampaignForm } from './form';
import { Campaign, CampaignService } from '../+state';
import { switchMap, tap } from 'rxjs/operators';
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class CampaignShellConfig implements FormShellConfig<CampaignControls, Campaign>{
  form = new CampaignForm();
  constructor(
    private route: RouterQuery,
    private service: CampaignService,
    private orgQuery: OrganizationQuery,
  ) {}

  onInit(): Observable<any>[] {
    const orgId = this.orgQuery.getActiveId();
    const sub = this.route.selectParams('movieId').pipe(
      switchMap((id: string) => this.service.valueChanges(id, { params: { orgId }})),
      tap(campaign => this.form.setAllValue(campaign))
    );
    return [sub];
  }

  async onSave(options: FormSaveOptions): Promise<any> {
    const id: string = this.route.getParams('movieId');
    await this.service.save(id, this.form.value);
    this.form.markAsPristine();
    return id;
  }

}