// Angular
import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { boolean } from '@blockframes/utils/decorators/decorators';

import { Statement, Waterfall, Movie, getStatementRightholderTag, WaterfallContract, WaterfallSource } from '@blockframes/model';

@Component({
  selector: 'waterfall-statement-main-info',
  templateUrl: './statement-main-info.component.html',
  styleUrls: ['./statement-main-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementMainInfoComponent implements OnInit {
  @Input() statement: Statement;
  @Input() waterfall: Waterfall;
  @Input() movie: Movie;
  @Input() contract: WaterfallContract;
  @Input() sources: WaterfallSource[];
  @Input() @boolean showLink = false;
  public rightholderTag: string;
  public rightholderName: string;

  ngOnInit() {
    const rightholderKey = this.statement.type === 'producer' ? 'receiverId' : 'senderId';
    this.rightholderName = this.waterfall.rightholders.find(r => r.id === this.statement[rightholderKey]).name;
    this.rightholderTag = getStatementRightholderTag(this.statement);
  }
}
