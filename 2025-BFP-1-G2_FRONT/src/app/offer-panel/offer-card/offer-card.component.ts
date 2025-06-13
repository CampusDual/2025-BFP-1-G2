import { Component, Input } from '@angular/core';
import {AuthService} from "../../auth/services/auth.service";
import {OfferService} from "../../services/offer.service";

@Component({
  selector: 'app-offer-card',
  templateUrl: './offer-card.component.html',
  styleUrls: ['./offer-card.component.css']
})
export class OfferCardComponent {
  @Input() offer: any;
  constructor(protected authService: AuthService,
              protected offerService: OfferService) { 
  }

  applytoOffer() {
    if (this.authService.isLoggedIn()) {
      console.log(`Applying to offer: ${this.offer.title}`);
      this.offerService.applyToOffer(this.offer.id).subscribe({
        next: (response) => {
          console.log('Application successful:'+ response);
        },
        error: (error) => {
          console.error('Error applying to offer:', error);
        }
      });
    } else {
      console.log('User is not authenticated. Redirecting to login.');
    }
  }
}

