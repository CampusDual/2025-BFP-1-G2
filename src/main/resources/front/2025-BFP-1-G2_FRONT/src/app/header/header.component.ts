import { Component } from '@angular/core';
import {AuthService} from "../auth/services/auth.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {


  constructor(protected authService: AuthService) {
  }

}
