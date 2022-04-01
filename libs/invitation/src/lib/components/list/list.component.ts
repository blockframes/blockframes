// Angular
import { Component, ChangeDetectionStrategy, TemplateRef, ContentChild, Input } from '@angular/core';

// Blockframes
import { descTimeFrames } from '@blockframes/utils/pipes/filter-by-date.pipe';
import { Invitation } from '@blockframes/shared/model';

@Component({
  selector: 'invitation-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent {
  @Input() invitations: Invitation[];
  @ContentChild(TemplateRef) itemTemplate: TemplateRef<unknown>;

  timeFrames = descTimeFrames;

  trackById = (i: number, doc: { id: string }) => doc.id;
}
