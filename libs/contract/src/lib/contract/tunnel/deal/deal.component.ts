import { DistributionDealForm } from '@blockframes/movie/distribution-deals/form/distribution-deal.form';
import { map } from 'rxjs/operators';
import { Movie } from '@blockframes/movie/movie/+state';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ContractTunnelComponent } from '../contract-tunnel.component';
import { RouterQuery } from '@datorama/akita-ng-router-store';

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
    this.movie$ = combineLatest([
      this.tunnel.movies$,
      this.routerQuery.selectParams('titleId')
    ]).pipe(
      map(([movies, titleId]) => movies.find(movie => movie.id === titleId)
      ))
  }

  get dealForm() {
    return this.tunnel.dealForms.controls[this.titleId];
  }

  get titleId(): string {
    const { titleId } = this.routerQuery.getValue().state.root.params;
    return titleId;
  }

  public terms(control: DistributionDealForm) {
    return control.get('terms');
  }

  public catchUp(control: DistributionDealForm) {
    return control.get('catchUp');
  }

  public download(control: DistributionDealForm) {
    return control.get('download');
  }

  public holdbacks(control: DistributionDealForm) {
    return control.get('holdbacks');
  }

  public assetLanguages(control: DistributionDealForm) {
    return control.get('assetLanguage');
  }

  public addHoldback(control: DistributionDealForm) {
    control.get('holdbacks').add();
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
