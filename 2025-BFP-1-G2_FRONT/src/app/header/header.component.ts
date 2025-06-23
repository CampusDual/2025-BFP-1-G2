import { Component, Input } from '@angular/core';
import {AuthService} from "../auth/services/auth.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input() drawer!: any;
  username: string = '';
  

  constructor(protected authService: AuthService) {
    if (this.authService.isLoggedIn()) {
      this.username = this.authService.getLogin();
    }
  }
}