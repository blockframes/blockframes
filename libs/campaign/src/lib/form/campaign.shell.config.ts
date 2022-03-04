import { Injectable } from "@angular/core";
import type { FormShellConfig } from '@blockframes/movie/form/movie.shell.interfaces';
import { CampaignControls, CampaignForm } from './form';
import { Campaign, CampaignService } from '../+state';
import { FileUploaderService } from "@blockframes/media/+state";
import { MovieActiveGuard } from "@blockframes/movie/guards/movie-active.guard";

@Injectable({ providedIn: 'root' })
export class CampaignShellConfig implements FormShellConfig<CampaignControls, Campaign>{
  form: CampaignForm;
  name = 'Campaign';

  constructor(
    private service: CampaignService,
    private uploaderService: FileUploaderService,
    private movieActiveGuard: MovieActiveGuard,
  ) { }

  async onInit() {
    // Fill Form
    const campaign = await this.service.getValue(this.movieActiveGuard.movie.id);
    this.form = new CampaignForm(campaign);
  }

  async onSave(): Promise<unknown> {
    this.uploaderService.upload();
    await this.service.save(this.movieActiveGuard.movie.id, this.form.value);

    this.form.markAsPristine();
    return this.movieActiveGuard.movie.id;
  }

}
