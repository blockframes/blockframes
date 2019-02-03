import { Component, OnInit } from '@angular/core';
import { IpQuery, Ip } from '@blockframes/ip';
import { Observable } from 'rxjs';

@Component({
  selector: 'ip-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  public scripts$: Observable<Ip[]>;

  constructor(private query: IpQuery) {}

  ngOnInit() {
    this.scripts$ = this.query.selectAll();
  }
}
