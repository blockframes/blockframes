import { Component, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

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
      image: '/assets/images/lp_dashboard_market_sales_agents.webp',
      description: 'Showcase your line-up, get in touch with Buyers and manage meetings and screenings.'
    },
    {
      title: 'For Buyers.',
      image: '/assets/images/lp_archipel_market_buyers.webp',
      description: 'Explore a large library of films, get in touch with sales agents, plan meetings and watch screenings.'
    }
  ]

  public sellerFeatures = [
    {
      title: 'Showcase your company & film details',
      image: 'filmpage.webp',
      description: 'Import your metadata and promotional elements easily and have your company and films showcased on the marketplace.'
    },
    {
      title: 'Manage your schedule',
      image: 'calendar.webp',
      description: 'Plan online meetings and book live screenings sessions on your calendar. Set privacy parameters and invite buyers to your events.'
    },
    {
      title: 'Match with buyers',
      image: 'matching.webp',
      description: 'Contact and get contacted by buyers, get requests to your screenings, and get notified when buyers show interest in your films.'
    },
    {
      title: 'Track your films\' activity',
      image: 'sales_statistics.webp',
      description: 'Track your films’ activity on the platform, and get screening reports with detailed stats after each screening.'
    }
  ];

  public buyerFeatures = [
    {
      title: 'Find the newest gems',
      image: 'gems.webp',
      description: 'Explore a large library of films and find the content you\'re looking for in just a few clicks thanks to search and filter functions.'
    },
    {
      title: 'Match with sales agents',
      image: 'matching.webp',
      description: 'Access their company information and contact details, get in touch with them. Explore their line ups and screening schedules and ask for invitations to their screenings.'
    },
    {
      title: 'Access detailed movies pages',
      image: 'filmpage.webp',
      description: 'Access each film\'s metadata, promotional elements and screening information.'
    },
    {
      title: 'Plan meetings and watch screenings',
      image: 'calendar.webp',
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

}
