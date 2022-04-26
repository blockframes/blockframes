import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CampaignService } from '../service';

@Pipe({ name: 'getCampaign' })
export class GetCampaignPipe implements PipeTransform {

  constructor(private service: CampaignService) {}

  transform(movieId: string) {
    return this.service.getValue(movieId);
  }
}

@NgModule({
  declarations: [GetCampaignPipe],
  exports: [GetCampaignPipe],
})
export class CampaignPipeModule {}