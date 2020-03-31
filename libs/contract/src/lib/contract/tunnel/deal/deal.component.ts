import { DistributionDealForm } from '@blockframes/distribution-deals/form/distribution-deal.form';
import { map, tap } from 'rxjs/operators';
import { Movie } from '@blockframes/movie/+state';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ContractTunnelComponent } from '../contract-tunnel.component';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'contract-deal',
  templateUrl: 'deal.component.html',
  styleUrls: ['deal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DealComponent implements OnInit {

  public movie$: Observable<Movie>;

  public showTVCriteria = new BehaviorSubject(true);

  constructor(
    private tunnel: ContractTunnelComponent,
    private routerQuery: RouterQuery,
    private dynTitle: DynamicTitleService) { }

  ngOnInit() {
    // only the movie with corresponding ID
    this.movie$ = combineLatest([
      this.tunnel.movies$,
      this.routerQuery.selectParams('titleId')
    ]).pipe(
      map(([movies, titleId]) => {
        const filteredMovie = movies.find(movie => movie.id === titleId)
        return filteredMovie
      }),
      tap(movie => {
        this.dynTitle.setPageTitle(`${movie.main.title.international}`, 'Exploitation Rights - Create a contract offer')
      }))
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
    this.tunnel.removeTitle(this.titleId, true)
  }
}
