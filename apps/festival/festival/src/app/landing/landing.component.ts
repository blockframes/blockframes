import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'festival-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent {

  public tabNames = ['Sales Agents', 'Buyers'];

  public tabTitle = [
    {
      title: 'For Sales Agents.',
      imgAsset: 'lp_festival_seller_perspective.webp',
      description: 'Showcase your line-up, get in touch with Buyers and manage meetings and screenings.'
    },
    {
      title: 'For Buyers.',
      imgAsset: 'lp_festival_buyer_perspective.webp',
      description: 'Explore a large library of films, get in touch with sales agents, plan meetings and watch screenings.'
    }
  ]

  public sellerFeatures = [
    {
      title: 'Showcase your company & film details',
      imgAsset: 'showcase.svg',
      description: 'Import your metadata and promotional elements easily and have your company and films showcased on the marketplace.'
    },
    {
      title: 'Manage your schedule',
      imgAsset: 'calendar.svg',
      description: 'Plan online meetings and book live screenings sessions on your calendar. Set privacy parameters and invite buyers to your events.'
    },
    {
      title: 'Match with buyers',
      imgAsset: 'matching.svg',
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
      imgAsset: 'gems.svg',
      description: 'Explore a large library of films and find the content you\'re looking for in just a few clicks thanks to search and filter functions.'
    },
    {
      title: 'Match with sales agents',
      imgAsset: 'matching.svg',
      description: 'Access their company information and contact details, get in touch with them. Explore their line ups and screening schedules and ask for invitations to their screenings.'
    },
    {
      title: 'Access detailed movies pages',
      imgAsset: 'filmpage.svg',
      description: 'Access each film\'s metadata, promotional elements and screening information.'
    },
    {
      title: 'Plan meetings and watch screenings',
      imgAsset: 'calendar.svg',
      description: 'Plan online meetings with sales agents and watch film screenings at specific hours, just like in real live markets.'
    }
  ]
}
