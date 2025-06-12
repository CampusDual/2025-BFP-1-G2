import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Router} from "@angular/router";

@Component({
  selector: 'app-user-panel',
  templateUrl: './user-panel.component.html',
  styleUrls: ['./user-panel.component.css']
})
export class UserPanelComponent implements OnInit {
  userName: string | null = null;
  userSurname1: string | null = null;
  userSurname2: string | null = null;
  userEmail: string | null = null;
  userPhone: string | null = null;

  constructor() {
  }

  ngOnInit(): void {
    this.userName = 'John';
    this.userSurname1 = 'Doe';
    this.userSurname2 = 'Smith';
    this.userEmail = 'johndoesmith@email.com';
    this.userPhone = '123-456-7890';
  }
}

