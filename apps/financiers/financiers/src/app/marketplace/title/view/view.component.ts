import { AfterViewInit, ChangeDetectionStrategy, Component, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CampaignService } from '@blockframes/campaign/service';
import { Movie, MovieCurrency, Organization } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { additionalRoute, artisticRoute, mainRoute, productionRoute } from '@blockframes/movie/marketplace';
import { OrganizationService } from '@blockframes/organization/service';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { RouteDescription } from '@blockframes/model';
import { pluck, shareReplay, switchMap, tap } from 'rxjs/operators';
import { ContactPartnerModalComponent, ContactPartnerModalData } from '../contact-partner-modal/contact-partner-modal.component';
import { scrollIntoView } from '@blockframes/utils/browser/utils';

@Component({
  selector: 'financiers-movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieViewComponent implements AfterViewInit {
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

  ngAfterViewInit(): void {
    setTimeout(() => {
      scrollIntoView(document.querySelector('#top'));
    });
  }

  openForm(orgs: Organization[], movie: Movie) {
    const form = new UntypedFormGroup({
      subject: new UntypedFormControl('', Validators.required),
      scope: new UntypedFormGroup({
        from: new UntypedFormControl(),
        to: new UntypedFormControl()
      }),
      message: new UntypedFormControl(),
    });
    this.dialog.open(ContactPartnerModalComponent, {
      data: createModalData<ContactPartnerModalData>({
        orgs,
        form,
        movie,
        currency: this.currency,
        campaign: this.campaign$
      })
    });
  }
}