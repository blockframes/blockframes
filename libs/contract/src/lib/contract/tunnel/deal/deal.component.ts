import { DistributionDealForm } from '@blockframes/movie/distribution-deals/form/distribution-deal.form';
import { filter, flatMap } from 'rxjs/operators';
import { Movie } from '@blockframes/movie/movie/+state';
import { Observable, BehaviorSubject } from 'rxjs';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ContractTunnelComponent } from '../contract-tunnel.component';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { DistributionDealHoldbacksForm } from '@blockframes/movie/distribution-deals/form/holdbacks/holdbacks.form';

@Component({
  selector: 'contract-deal',
  templateUrl: 'deal.component.html',
  styleUrls: ['deal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DealComponent implements OnInit {

  public movie$: Observable<Movie>;

  public showTVCriteria = new BehaviorSubject(true);

  constructor(private tunnel: ContractTunnelComponent, private routerQuery: RouterQuery) { }

  ngOnInit() {
    // only the movie with corresponding ID
    this.movie$ = this.tunnel.movies$.pipe(
      flatMap(movies => movies),
      filter(movie => movie.id === this.titleId))
  }

  get dealForm() {
    return this.tunnel.dealForms.controls[this.titleId];
  }

  get titleId(): string {
    const { titleId } = this.routerQuery.getValue().state.root.params;
    return titleId;
  }

  public distributionDealTerms(control: DistributionDealForm) {
    return control.get('terms');
  }

  public distributionDealCatchUp(control: DistributionDealForm) {
    return control.get('catchUp');
  }

  public distributionDealDownload(control: DistributionDealForm) {
    return control.get('download');
  }

  public distributionDealHoldbacks(control: DistributionDealForm) {
    return control.get('holdbacks');
  }

  public distributionDealAssetLanguages(control: DistributionDealForm) {
    return control.get('assetLanguage');
  }

  public addHoldback(control: DistributionDealForm) {
    return control.get('holdbacks').push(new DistributionDealHoldbacksForm());
  }

  public removeTVCriteria(control: DistributionDealForm) {
    control.get('catchUp').reset();
    control.get('multidiffusion').reset();
    control.get('download').reset();
    control.get('multidiffusion').reset();
    this.showTVCriteria.next(false);
  }

  public removeHoldback(control: DistributionDealForm, holdbackIndex: number) {
    control.get('holdbacks').removeAt(holdbackIndex);
  }

  public addDistributionDeal() {
    this.tunnel.addDeal(this.titleId);
  }

  public addDeal() {
    this.tunnel.addDeal(this.titleId);
  }

  public removeDeal(index: number) {
    this.tunnel.removeDeal(this.titleId, index)
  }

  public removeTitle() {
    this.tunnel.removeTitle(this.titleId)
  }
}
