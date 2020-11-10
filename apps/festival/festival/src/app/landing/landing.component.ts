import { Component, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { createDemoRequestInformations, RequestDemoInformations, RequestDemoRole } from '@blockframes/utils/request-demo';

@Component({
  selector: 'festival-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent {
  private scroll = new BehaviorSubject<number>(0);
  public toolbarColor$ = this.scroll.asObservable().pipe(
    map(position => position === 0),
    distinctUntilChanged(),
    map(isTop => isTop ? 'transparent-toolbar' : '')
  );

  public headerContent = {
    title: 'Welcome to Archipel Market',
    description: 'The endless film market',
  };

  public tabNames = ['Sales Agents', 'Buyers'];

  public tabTitle = [
    {
      title: 'For Sales Agents.',
      imgAsset: 'lp_dashboard_market_sales_agents.webp',
      description: 'Showcase your line-up, get in touch with Buyers and manage meetings and screenings.'
    },
    {
      title: 'For Buyers.',
      imgAsset: 'lp_archipel_market_buyers.webp',
      description: 'Explore a large library of films, get in touch with sales agents, plan meetings and watch screenings.'
    }
  ]

  public sellerFeatures = [
    {
      title: 'Showcase your company & film details',
      imgAsset: 'showcase.webp',
      description: 'Import your metadata and promotional elements easily and have your company and films showcased on the marketplace.'
    },
    {
      title: 'Manage your schedule',
      imgAsset: 'calendar.webp',
      description: 'Plan online meetings and book live screenings sessions on your calendar. Set privacy parameters and invite buyers to your events.'
    },
    {
      title: 'Match with buyers',
      imgAsset: 'matching.webp',
      description: 'Contact and get contacted by buyers, get requests to your screenings, and get notified when buyers show interest in your films.'
    },
    {
      title: 'Track your films\' activity',
      imgAsset: 'sales_statistics.webp',
      description: 'Track your films’ activity on the platform, and get screening reports with detailed stats after each screening.'
    }
  ];

  public buyerFeatures = [
    {
      title: 'Find the newest gems',
      imgAsset: 'gems.webp',
      description: 'Explore a large library of films and find the content you\'re looking for in just a few clicks thanks to search and filter functions.'
    },
    {
      title: 'Match with sales agents',
      imgAsset: 'matching.webp',
      description: 'Access their company information and contact details, get in touch with them. Explore their line ups and screening schedules and ask for invitations to their screenings.'
    },
    {
      title: 'Access detailed movies pages',
      imgAsset: 'filmpage.webp',
      description: 'Access each film\'s metadata, promotional elements and screening information.'
    },
    {
      title: 'Plan meetings and watch screenings',
      imgAsset: 'calendar.webp',
      description: 'Plan online meetings with sales agents and watch film screenings at specific hours, just like in real live markets.'
    }
  ]

  // According to this article, it's fine with Angular Universal
  // source: https://technoapple.com/blog/post/scroll-event-at-angular-universal
  /** Change the toolbar class when page is scrolled. */
  @HostListener('window:scroll', [])
  scrollHandler() {
    this.scroll.next(window.pageYOffset);
  }

  public form = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl('', Validators.email),
    phoneNumber: new FormControl(''),
    companyName: new FormControl(''),
    role: new FormControl('')
  });

  public roles: RequestDemoRole[] = [
    'buyer',
    'seller',
    'other'
  ];

  public submitted = false;

  constructor(
    private snackBar: MatSnackBar,
    private functions: AngularFireFunctions,
    private routerQuery: RouterQuery
  ) { }

  get phoneNumber() {
    return this.form.get('phoneNumber');
  }

  /** Send a mail to the admin with user's informations. */
  private async sendDemoRequest(information: RequestDemoInformations) {
    const f = this.functions.httpsCallable('sendDemoRequest');
    return f(information).toPromise();
  }

  /** Triggers when a user click on the button from LearnMoreComponent.  */
  public sendRequest(form: FormGroup) {
    if (form.invalid) {
      this.snackBar.open('Please fill the required informations.', 'close', { duration: 2000 });
      return;
    }
    try {
      const currentApp = getCurrentApp(this.routerQuery);
      const information: RequestDemoInformations = createDemoRequestInformations({ app: currentApp, ...form.value });

      this.sendDemoRequest(information);
      this.snackBar.open('Your request has been sent !', 'close', { duration: 2000 });
      this.submitted = true;
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 5000 });
    }
  }
}
