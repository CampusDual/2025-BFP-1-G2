import {Component, OnInit, OnDestroy} from '@angular/core';
import {AuthService, User} from "../auth/services/auth.service";
@Component({
  selector: 'app-user-panel',
  templateUrl: './user-panel.component.html',
  styleUrls: ['./user-panel.component.css']
})
export class UserPanelComponent implements OnInit, OnDestroy {

  userName: string | null = null;
  userSurname1: string | null = null;
  userSurname2: string | null = null;
  userEmail: string | null = null;
  phoneNumber: string | null = null;
  animatedName: string = '';
  private fullName: string = '';
  private typingInterval: any;
  showCursor: boolean = true;

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
        const parts = [user.name, user.surname1, user.surname2].filter(Boolean);
        this.fullName = parts.join(' ');
        this.startTypingAnimation();
      },
      error: (error: any) => {
        console.error('Error fetching user data', error);
      }
    })
  }

  startTypingAnimation() {
    this.animatedName = '';
    let i = 0;
    this.showCursor = true;
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
    this.typingInterval = setInterval(() => {
      if (i < this.fullName.length) {
        this.animatedName += this.fullName[i];
        i++;
      } else {
        clearInterval(this.typingInterval);
        this.showCursor = false;
      }
    }, 70); 
  }

  ngOnDestroy(): void {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
  }
}

