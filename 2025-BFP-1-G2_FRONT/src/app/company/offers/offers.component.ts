import { Component, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OfferTableComponent } from '../../offer-panel/offer-table/offer-table.component';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css']
})
export class OffersComponent implements OnInit {
  @ViewChild(OfferTableComponent) offerTableComponent!: OfferTableComponent;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['addNew'] === 'true') {
        setTimeout(() => {
          this.addOffer();
        }, 100);
      }
    });
  }

  addOffer() {
    if (this.offerTableComponent) {
      this.offerTableComponent.openNewOfferCard();
    }
  }
}