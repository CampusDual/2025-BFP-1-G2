import {Component, Input, OnInit} from '@angular/core';
import {AuthService} from "../../auth/services/auth.service";
import {OfferService} from "../../services/offer.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from '@angular/router';

@Component({
  selector: 'app-offer-card',
  templateUrl: './offer-card.component.html',
  styleUrls: ['./offer-card.component.css']
})
export class OfferCardComponent implements OnInit {
  @Input() offer: any;

  isDisabled: boolean = true;
  isCompany: any;
  candidates: any[] = [];
  

  constructor(protected authService: AuthService,
              protected offerService: OfferService,
              private snackBar: MatSnackBar,
              private router: Router) {
  }

  closeCard() {
    this.isDisabled = !this.isDisabled;
  }


  ngOnInit() {
    this.authService.hasRole('ROLE_COMPANY').subscribe({
      next: (hasRole) => {
        this.isCompany = hasRole;
      },
      error: (error) => {
        console.error('Error checking role:', error);
        this.isCompany = false;
      }
    });
    this.offerService.getCandidates(this.offer.id).subscribe({
      next: (candidates) => {
        this.candidates = candidates;
        this.offer.candidatesCount = candidates.length;
        console.log('Candidates fetched successfully:', this.candidates);
      },
      error: (error) => {
        console.error('Error fetching candidates:', error);
      }
    });
  }

  showCandidates(){

  }
}

