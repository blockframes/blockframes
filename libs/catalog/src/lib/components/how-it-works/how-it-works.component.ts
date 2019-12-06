import { Component } from '@angular/core';

@Component({
  selector: 'catalog-how-it-works',
  templateUrl: './how-it-works.component.html',
  styleUrls: ['./how-it-works.component.scss']
})
export class CatalogHowItWorksComponent {
  public features = [
    {
      title: 'Bulk Import',
      description: 'Import large amounts of data easily (either by directly filling a predefined template or with the help of an    Archipel Content team member).'
    },
    {
      title: 'Deals Management',
      description: 'Keep track of your previous and ongoing deals information. Download related documents. Get notified of any new element or information. Check your avails. '
    },
    {
      title: 'Sales Statistics',
      description: 'Track your global sales and sales per title. Get an efficient overview of your data thanks to analytics tools.'
    },
    {
      title: 'A Human Salesforce',
      description: 'Make the most of your library thanks to the Archipel Content salesforce, who will editorialize the platform and push the right content to the right Buyers.'
    },
    {
      title: 'Servicing Included',
      description: 'Sit back and relax while the Archipel Content team takes care of delivering the material to Buyers (material price will be deducted from the package price after all sales commissions).'
    }
  ];
}
