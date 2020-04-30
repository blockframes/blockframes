import { Component, OnInit, Input } from '@angular/core';
import { ScreeningEvent } from '../../+state';
import { InvitationQuery, Invitation } from '@blockframes/invitation/+state';
import { ImgRef } from '@blockframes/utils/image-uploader';

@Component({
  selector: 'event-screening-item',
  templateUrl: './screening-item.component.html',
  styleUrls: ['./screening-item.component.scss']
})
export class ScreeningItemComponent implements OnInit {
  public poster: ImgRef;
  public screening: ScreeningEvent;
  public invitation: Invitation;

  @Input() set event(screening: ScreeningEvent) {
    this.screening = screening;
    this.poster = screening.movie?.promotionalElements.poster[0].media;
    this.invitation = this.invitationQuery.getAll().find(e => e.docId === screening.id);
  }

  constructor(private invitationQuery: InvitationQuery) { }

  ngOnInit(): void {
  }

}
