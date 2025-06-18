import {Component} from '@angular/core';
import {animate, style, transition, trigger} from "@angular/animations";
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('fadeAnimation', [
      transition('* <=> *', [
        style({ opacity: 0, transform: 'translateY(20px)', filter: 'blur(2px)' }),
        animate('400ms', style({ opacity: 1 , transform: 'translateY(0px)', filter: 'blur(0px)' })),
      ])
    ]),
  ]
} )

export class AppComponent {
    showFiller = false;

  getRouterOutletState(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
