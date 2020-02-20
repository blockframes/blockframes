import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'catalog-how-it-works',
  templateUrl: './how-it-works.component.html',
  styleUrls: ['./how-it-works.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogHowItWorksComponent {
  public sellerFeatures = [
    {
      title: 'Bulk Import',
      image: 'bulk_import.svg',
      description: 'Import large amounts of data easily (either by directly filling a predefined template or with the help of an Archipel Content team member).'
    },
    {
      title: 'Deals Management',
      image: 'deal_management.svg',
      description: 'Keep track of your previous and ongoing deals information. Download related documents. Get notified of any new element or information. Check your avails. '
    },
    {
      title: 'Sales Statistics',
      image: 'sales_statistics.svg',
      description: 'Track your global sales and sales per title. Get an efficient overview of your data thanks to analytics tools.'
    },
    {
      title: 'A Human Salesforce',
      image: 'human_salesforce.svg',
      description: 'Make the most of your library thanks to the Archipel Content salesforce, who will editorialize the platform and push the right content to the right Buyers.'
    },
    {
      title: 'Servicing Included',
      image: 'servicing_included.svg',
      description: 'Sit back and relax while the Archipel Content team takes care of delivering the material to Buyers (material price will be deducted from the package price after all sales commissions).'
    }
  ];

  public buyerFeatures = [
    {
      title: 'Access to line-up and library content ',
      image: 'library_content.svg',
      description: 'Search for quality content from a multitude of different Rights Holders in one consolidated library.'
    },
    {
      title: 'Efficient content browsing',
      image: 'efficient_content_browsing.svg',
      description: 'Search content in a simple and efficient way and find what you’re looking for in just a few clicks, using efficient search criteria and filters'
    },
    {
      title: 'Package deals',
      image: 'package_deal.svg',
      description: 'Group several Sellers’ titles together in one deal.'
    },
    {
      title: 'Deals management',
      image: 'deal_management.svg',
      description: 'Keep track of your deals information and negotiations. Download related documents.Get notified of any new element or information.'
    }
  ]
}
