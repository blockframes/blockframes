import { DistributionRightForm } from '@blockframes/distribution-rights/form/distribution-right.form';
import { map, tap } from 'rxjs/operators';
import { Movie } from '@blockframes/movie/+state';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ContractTunnelComponent } from '../contract-tunnel.component';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'contract-right',
  templateUrl: 'right.component.html',
  styleUrls: ['right.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RightComponent implements OnInit {

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
        if(movie){
          this.dynTitle.setPageTitle(`${movie.title.international}`, 'Exploitation Rights - Create a contract offer')
        }
      }))
  }

  get rightForm() {
    return this.tunnel.rightForms.controls[this.titleId];
  }

  get titleId(): string {
    const { titleId } = this.routerQuery.getValue().state.root.params;
    return titleId;
  }

  public terms(control: DistributionRightForm) {
    return control.get('terms');
  }

  public catchUp(control: DistributionRightForm) {
    return control.get('catchUp');
  }

  public download(control: DistributionRightForm) {
    return control.get('download');
  }

  public holdbacks(control: DistributionRightForm) {
    return control.get('holdbacks');
  }

  public assetLanguages(control: DistributionRightForm) {
    return control.get('assetLanguage');
  }

  public addHoldback(control: DistributionRightForm) {
    control.get('holdbacks').add();
  }

  public removeTVCriteria(control: DistributionRightForm) {
    control.get('catchUp').reset();
    control.get('multidiffusion').reset();
    control.get('download').reset();
    control.get('multidiffusion').reset();
    this.showTVCriteria.next(false);
  }

  public removeHoldback(control: DistributionRightForm, holdbackIndex: number) {
    control.get('holdbacks').removeAt(holdbackIndex);
  }

  public addRight() {
    this.tunnel.addRight(this.titleId);
  }

  public removeRight(index: number) {
    this.tunnel.removeRight(this.titleId, index)
  }

  public removeTitle() {
    this.tunnel.removeTitle(this.titleId, true)
  }
}
