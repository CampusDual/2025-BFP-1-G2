import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from "../auth/services/auth.service";
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input() drawer!: any;
  showBackButton = false;
  username: string = '';
  private sub: Subscription;
  animatedName: string = '';
  showCursor: boolean = true;
  isCandidate: boolean = false;
  isCompany: boolean = false;

  constructor(
    protected authService: AuthService,

  ) {
    this.sub = this.authService.userName$.subscribe(name => {
      this.username = name;
    });
    this.isCandidate = this.authService.isCandidateCached();
    this.isCompany = this.authService.isCompanyCached();
  }
}