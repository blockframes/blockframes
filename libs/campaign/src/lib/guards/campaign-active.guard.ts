import { Injectable } from "@angular/core";
import { CollectionGuardConfig } from "akita-ng-fire";
import { ActivatedRouteSnapshot, CanActivate } from "@angular/router";
import { Campaign, CampaignService } from "../+state";

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class CampaignActiveGuard implements CanActivate {

  public campaign: Campaign;

  constructor(
    private campaignService: CampaignService,
  ) { }

  async canActivate(next: ActivatedRouteSnapshot) {
    this.campaign = await this.campaignService.getValue(next.params.movieId as string);
    return true;
  }

}