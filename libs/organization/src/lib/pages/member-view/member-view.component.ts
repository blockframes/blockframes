import { Component, OnInit, Input } from '@angular/core';
import { User } from '../../components/member-form/member-form.component';

@Component({
  selector: 'org-member-view',
  templateUrl: './member-view.component.html',
  styleUrls: ['./member-view.component.scss']
})
export class MemberViewComponent implements OnInit {

  @Input() member: User;

  constructor() { }

  ngOnInit() {
  }

}
