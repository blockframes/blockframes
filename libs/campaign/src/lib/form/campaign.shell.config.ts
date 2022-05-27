import { Injectable } from '@angular/core';
import type { FormShellConfig } from '@blockframes/movie/form/movie.shell.interfaces';
import { CampaignControls, CampaignForm } from './form';
import { CampaignService } from '../service';
import { FileUploaderService } from '@blockframes/media/file-uploader.service';
import { MovieActiveGuard } from '@blockframes/movie/guards/movie-active.guard';
import { Campaign } from '@blockframes/model';

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
