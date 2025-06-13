import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-offer-card',
  templateUrl: './offer-card.component.html',
  styleUrls: ['./offer-card.component.css']
})
export class OfferCardComponent {
  @Input() offer: any;
  isDisabled: boolean = false;

  toggleActions() {
    this.isDisabled = !this.isDisabled;
  }
}

