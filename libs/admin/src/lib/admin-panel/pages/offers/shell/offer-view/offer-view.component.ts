import { Component, ChangeDetectionStrategy, OnInit, Pipe, PipeTransform } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Organization, OrganizationService } from '@blockframes/organization/+state';
import { UserService } from '@blockframes/user/+state';
import { Query, queryChanges } from 'akita-ng-fire';
import { combineLatest } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { OfferShellComponent } from '../shell.component';


const columns = {
  'seller_approved': 'Seller Approved',
  'sellers_name': 'Seller\'s name (Email)',
  'organization_name': 'Organization Name',
  'id': 'Actions',
};

@Component({
  selector: 'offer-view',
  templateUrl: './offer-view.component.html',
  styleUrls: ['./offer-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferViewComponent {

  public offer$ = this.shell.offer$.pipe(shareReplay(1));
  public buyerOrg$ = this.shell.buyerOrg$;
  public contracts$ = this.shell.contracts$;
  public incomes$ = this.shell.incomes$;
  public form = this.fb.group({
    type: this.fb.control('general_contract_status'),
    buyers_specific_term: this.fb.control(null),
    buyers_delivery_wishlist: this.fb.control(null),
  })
  public hydratedContracts$ = combineLatest(
    this.buyerOrg$,
    this.contracts$,
    this.offer$,
  ).pipe(
    tap(
      ([buyerOrg, contracts, offer]) => {
        console.log({ offer, buyerOrg, contracts })
        this.form.get('buyers_specific_term').setValue(offer.specificity)
        this.form.get('buyers_delivery_wishlist').setValue(offer.delivery)
      }
    ),
    map(
      ([buyerOrg, contracts]) => {
        return contracts.map(_ => ({
          seller_approved: _.status,
          sellers_name: _.sellerId,
          organization_name: buyerOrg.denomination.public,
          id: _.id,
        }))
      }
    )
  )

  public titles: {
    seller_approved
    sellers_name
    organization_name
    id: string
  }[] = [];
  columns = columns;
  initialColumns = ['seller_approved', 'sellers_name', 'organization_name', 'id'];

  constructor(
    private shell: OfferShellComponent,
    public fb: FormBuilder,
    private userService: UserService,
  ) { }


  update() {
    console.log('hello')
  }

}


@Pipe({ name: 'getUser' })
export class GetUserPipe implements PipeTransform {
  constructor(private orgService: OrganizationService) { }

  transform(orgid: string) {
    const queryOffer: Query<Organization> = {
      path: `orgs/${orgid}`,
      //@ts-ignore
      userIds: (org: Organization) => ({
        path: 'users',
        queryFn: ref => ref.where('uid', '==', org.userIds[0]),
      }),
    }
    return queryChanges.call(this.orgService, queryOffer).pipe(
      tap(s => console.log({ s })),
      map((_) => _.userIds[0])
    )
  }
}
