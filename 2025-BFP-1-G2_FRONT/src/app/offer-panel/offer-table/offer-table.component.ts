import {Component} from '@angular/core';
import {OfferService} from "../../services/offer.service";

@Component({
  selector: 'app-offer-table',
  templateUrl: './offer-table.component.html',
  styleUrls: ['./offer-table.component.css']
})
export class OfferTableComponent {

  offers!: any[];

  constructor(private offerService: OfferService) {
    this.offerService.getOffers().subscribe({
      next: (offers: any[]) => {
        this.offers = offers.map((offer: any) => ({
          id: offer.id,
          title: offer.title,
          description: offer.description,
          companyName: offer.companyName,
          email: offer.email,
          location: offer.location,
          dateAdded: new Date(offer.dateAdded).toLocaleDateString()
        }));
        console.log('Offers fetched successfully', this.offers);
      },
      error: (error: any) => {
        console.error('Error fetching offers', error);
      }
    });
  }
}

