import { Injectable } from "@angular/core";
import type { FormShellConfig } from '@blockframes/movie/form/movie.shell.interfaces';
import { CampaignControls, CampaignForm } from './form';
import { Campaign, CampaignService } from '../+state';
import { FileUploaderService } from "@blockframes/media/+state";
import { CampaignActiveGuard } from "../guards/campaign-active.guard";

@Injectable({ providedIn: 'root' })
export class CampaignShellConfig implements FormShellConfig<CampaignControls, Campaign>{
  form: CampaignForm;
  name = 'Campaign'

  constructor(
    private service: CampaignService,
    private uploaderService: FileUploaderService,
    private campaignActiveGuard: CampaignActiveGuard,
  ) { }

  onInit() {
    // Fill Form
    this.form = new CampaignForm(this.campaignActiveGuard.campaign);
  }

  async onSave(): Promise<unknown> {
    this.uploaderService.upload();
    await this.service.save(this.campaignActiveGuard.campaignId, this.form.value);

    this.form.markAsPristine();
    return this.campaignActiveGuard.campaignId;
  }

}
