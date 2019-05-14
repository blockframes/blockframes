import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Investor } from '../model';

@Component({
  selector: 'financing-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagementComponent implements OnInit {

  investors: Investor[];

  constructor() { }

  ngOnInit() {
    this.investors = [
      {
        name: 'Investor Name',
        hasLink: true,
        hasUploaded: true,
        contributionDate: new Date(),
        status: 'Paid',
        investment: '100K',
        reward: 'Lot 1',
        waterfallPos: 'Rank D'
      },
      {
        name: 'Investor Name',
        hasLink: false,
        hasUploaded: false,
        contributionDate: new Date(),
        status: 'Not Paid',
        investment: '50K',
      },
      {
        name: 'Nom Prenom Blacklist',
        hasLink: true,
        hasUploaded: false,
        contributionDate: new Date(),
        status: 'Not Paid',
        investment: '50K',
      },
      {
        name: 'Nom Prenom Invité',
        hasLink: false,
        hasUploaded: false,
        contributionDate: new Date(),
        status: 'Not Paid',
        investment: '50K',
      },
      {
        name: 'Visitor name',
        hasLink: true,
        hasUploaded: false,
        contributionDate: new Date(),
        status: 'Not Paid',
        investment: '50K',
      },
      {
        name: 'Visitor name',
        hasLink: true,
        hasUploaded: true,
        contributionDate: new Date(),
        status: 'Not Paid',
        investment: '50K',
      },
    ]
  }

}
