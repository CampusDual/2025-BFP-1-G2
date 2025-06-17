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

  applytoOffer() {
    if (this.authService.isLoggedIn()) {
      console.log(`Applying to offer: ${this.offer.title}`);
      this.offerService.applyToOffer(this.offer.id).subscribe({
        next: (response) => {
          this.snackBar.open(response, 'Cerrar', {duration: 3000});
        },
        error: (error) => {
          console.error('Error applying to offer:', error);
          this.snackBar.open(error.error, 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      console.log('User is not authenticated. Redirecting to login.');
      localStorage.setItem('pendingOfferId', this.offer.id);
      this.router.navigate([`../login`]);
    }
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

