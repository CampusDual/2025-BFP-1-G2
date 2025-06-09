import { Component, Input } from '@angular/core';
import {OfferService} from "../../services/offer.service";

@Component({
  selector: 'app-offer-table',
  templateUrl: './offer-table.component.html',
  styleUrls: ['./offer-table.component.css']
})
export class OfferTableComponent {

  dataSource: any[] = [];

  constructor(private offerService: OfferService) {

    this.offerService.getOffers().subscribe({
      next: (offers: any[]) => {
        this.dataSource = offers.map((offer: any) => ({
          id: offer.id,
          title: offer.title,
          description: offer.description,
          email: offer.email,
          companyName: offer.companyName,
          dateAdded: new Date(offer.dateAdded).toLocaleDateString()
        }));
        console.log('Offers fetched successfully', this.dataSource);
      },
      error: (error: any) => {
        console.error('Error fetching offers', error);
      }
    });

  }
}
