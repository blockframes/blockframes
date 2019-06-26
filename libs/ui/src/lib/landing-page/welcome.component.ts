import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'delivery-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goToForm() {
    this.router.navigate(["/layout/welcome/create-organization"])
  }
}
