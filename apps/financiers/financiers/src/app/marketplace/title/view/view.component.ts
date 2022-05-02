import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CampaignService } from '@blockframes/campaign/+state';
import { Movie, MovieCurrency, Organization } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { additionalRoute, artisticRoute, mainRoute, productionRoute } from '@blockframes/movie/marketplace';
import { OrganizationService } from '@blockframes/organization/+state';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { RouteDescription } from '@blockframes/utils/common-interfaces';
import { pluck, shareReplay, switchMap, tap } from 'rxjs/operators';
import { ContactPartnerModalComponent, ContactPartnerModalData } from '../modal/modal.component';

@Component({
  selector: 'financiers-movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieViewComponent {
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<unknown>;

  public movie$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((movieId: string) => this.movieService.getValue(movieId))
  );

  public orgs$ = this.movie$.pipe(
    switchMap(movie => this.orgService.valueChanges(movie.orgIds)),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  public campaign$ = this.movie$.pipe(
    switchMap(movie => this.campaignService.valueChanges(movie.id)),
    tap(campaign => this.currency = campaign.currency)
  );

  public currency: MovieCurrency;

  public navLinks: RouteDescription[] = [
    mainRoute,
    artisticRoute,
    {
      ...productionRoute,
      label: 'Production'
    },
    additionalRoute,
    {
      path: 'financing',
      label: 'Financial'
    },
    {
      path: 'investment',
      label: 'Investment'
    }
  ];

  promoLinks = [
    'scenario',
    'presentation_deck',
  ];

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private orgService: OrganizationService,
    private campaignService: CampaignService,
    private dialog: MatDialog,
    public router: Router
  ) { }

  openForm(orgs: Organization[], movie: Movie) {
    const form = new FormGroup({
      subject: new FormControl('', Validators.required),
      scope: new FormGroup({
        from: new FormControl(),
        to: new FormControl()
      }),
      message: new FormControl(),
    });
    this.dialog.open(ContactPartnerModalComponent, {
      data: createModalData<ContactPartnerModalData>({
        orgs,
        form,
        movie,
        currency: this.currency,
        campaign: this.movie$.pipe(
          switchMap(movie => this.campaignService.valueChanges(movie.id))
        )
      })
    });
  }
}