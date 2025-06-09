import {Component} from '@angular/core';
import {OfferService} from "../../services/offer.service";

@Component({
  selector: 'app-offer-table',
  templateUrl: './offer-table.component.html',
  styleUrls: ['./offer-table.component.css']
})
export class OfferTableComponent {
  displayedColumns: string[] = ['title', 'description', 'email', 'companyName', 'dateAdded'];
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
        // Manejo de errores aquí si es necesario
      }
    });


    this.dataSource = [
      {
        title: 'Sample Offer',
        description: 'This is a sample offer description.',
        email: '',
        companyName: 'Sample Company',
        dateAdded: new Date().toLocaleDateString()
      }];


  }
}
