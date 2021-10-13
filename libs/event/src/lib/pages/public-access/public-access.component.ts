import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'event-public-access',
  templateUrl: './public-access.component.html',
  styleUrls: ['./public-access.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublicAccessComponent implements OnInit {

  ngOnInit() {
   console.log('ici');
  }

}
