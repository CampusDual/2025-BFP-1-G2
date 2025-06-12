import {Component, OnInit} from '@angular/core';
import {AuthService, User} from "../auth/services/auth.service";

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
  phoneNumber: string | null = null;

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    this.authService.getCandidateDetails().subscribe({
      next: (user: User) => {
        this.userName = user.name;
        this.userSurname1 = user.surname1;
        this.userSurname2 = user.surname2;
        this.userEmail = user.email;
        this.phoneNumber = user.phoneNumber;
      },
      error: (error: any) => {
        console.error('Error fetching user data', error);
      }
    })
  }
}

