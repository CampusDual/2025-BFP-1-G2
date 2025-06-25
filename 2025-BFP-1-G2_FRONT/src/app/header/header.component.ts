import { Component, Input } from '@angular/core';
import { AuthService } from "../auth/services/auth.service";
import {  Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input() drawer!: any;
  username: string = '';
  private sub: Subscription;
  animatedName: string = '';
  private typingInterval: any;
  showCursor: boolean = true;


  constructor(protected authService: AuthService) {
    this.sub = this.authService.userName$.subscribe(name => {
      this.username = name;
      this.startTypingAnimation();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

   startTypingAnimation() {
    this.animatedName = '';
    let i = 0;
    this.showCursor = true;
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
    this.typingInterval = setInterval(() => {
      if (i < this.username.length) {
        this.animatedName += this.username[i];
        i++;
      } else {
        clearInterval(this.typingInterval);
        this.showCursor = false;
      }
    }, 70);
  }
}
