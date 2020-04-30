import { Component, OnInit, Input, TemplateRef, ContentChild, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { ascTimeFrames } from '@blockframes/utils/pipes/filter-by-date.pipe';
import { slideUpList } from '@blockframes/utils/animations/fade';

@Component({
  selector: 'event-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [slideUpList('li')],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit {
  @HostBinding('@slideUpList') animation = true;
  timeFrames = ascTimeFrames;

  @Input() events: Event[];
  @ContentChild(TemplateRef) itemTemplate: TemplateRef<any>;
  
  constructor() { }

  ngOnInit(): void {
  }

}
