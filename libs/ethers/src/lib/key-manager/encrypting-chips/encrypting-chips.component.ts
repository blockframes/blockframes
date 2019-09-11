import { Component, ChangeDetectionStrategy, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { KeyManagerQuery } from "../+state";

@Component({
  selector: 'encrypting-chips',
  templateUrl: './encrypting-chips.component.html',
  styleUrls: ['./encrypting-chips.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EncryptingChipsComponent implements OnInit {
  public encrypting$: Observable<boolean>;

  constructor(private query: KeyManagerQuery) {}

  ngOnInit() {
    this.encrypting$ = this.query.selectLoading();
  }
}
