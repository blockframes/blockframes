import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'event-local-participant',
  templateUrl: './local-participant.component.html',
  styleUrls: ['./local-participant.component.css']
})
export class LocalParticipantComponent implements OnInit {

  // FIXME
  // make interface for participant
  @Input() localParticipant: any;

  constructor() {
  }

  ngOnInit(): void {

    console.log('this.localParticipant : ', this.localParticipant)
  }


}
