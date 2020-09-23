import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'event-participant',
  templateUrl: './participant.component.html',
  styleUrls: ['./participant.component.css']
})
export class ParticipantComponent implements OnInit {

  // FIXME
  // Make Participant interfce !!
  @Input() participant: any

  constructor() { }

  ngOnInit(): void {
    console.log('ParticipantComponent ngOnInit participant : ', this.participant)
    this.testEventParticipant(this.participant);
  }

  testEventParticipant(participant){
   console.log('participant : ', participant)

    participant.on('trackSubscribed', (t, a) => {
      console.log({t, a})
    })
  }

}
