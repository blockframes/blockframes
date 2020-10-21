import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { CampaignForm } from '../../form';

@Component({
  selector: 'campaign-summary-profits',
  templateUrl: './profits.component.html',
  styleUrls: ['./profits.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryProfitsComponent implements OnInit {
  @Input() form: CampaignForm;
  @Input() link: string | string[];
  constructor() { }

  ngOnInit(): void {
  }
}
