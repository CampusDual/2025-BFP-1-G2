import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from "../../auth/services/auth.service";
import { OfferService } from "../../services/offer.service";


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
    protected offerService: OfferService) {
  }


  ngOnInit() {
    this.authService.hasRole('ROLE_COMPANY').subscribe({
      next: (hasRole) => {
        this.isCompany = hasRole;
        if (this.isCompany) {
          this.offerService.getCandidates(this.offer.id).subscribe({
            next: (candidates) => {
              this.offer.candidates = candidates;
              this.offer.candidatesCount = candidates.length;
              console.log('Candidates fetched successfully:', this.candidates);
            },
            error: (error) => {
              console.error('Error fetching candidates:', error);
            }
          });
        }
      },
      error: (error) => {
        console.error('Error checking role:', error);
        this.isCompany = false;
      }
    });
  }
  getFirstThreeTags(): any {
    if (!this.offer?.tags || !Array.isArray(this.offer.tags)) {
      return [];
    }
    return this.offer.tags.slice(0, 3);
  }
  hasMoreThanThreeTags(): boolean {
    return this.offer?.tags?.length > 3;
  }
  getAdditionalTagsCount(): number {
    if (!this.offer?.tags || this.offer.tags.length <= 3) {
      return 0;
    }
    return this.offer.tags.length - 3;
  }
  onImageError(event: any) {
    event.target.style.display = 'none';
  }
}

