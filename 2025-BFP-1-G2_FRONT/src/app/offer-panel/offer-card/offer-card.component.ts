import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from "../../auth/services/auth.service";
import { OfferService } from "../../services/offer.service";


@Component({
  selector: 'app-offer-card',
  templateUrl: './offer-card.component.html',
  styleUrls: ['./offer-card.component.css']
})
export class OfferCardComponent implements OnInit {

  @Input() offer: any;
  @Input() isCompany: boolean = false;
  @Input() isBookmarked: boolean = false;
  @Output() viewDetails = new EventEmitter<any>();
  @Output() toggleBookmark = new EventEmitter<number>();

  isDisabled: boolean = true;
  isCandidate: any;
  candidates: any[] = [];


  constructor(protected authService: AuthService,
    protected offerService: OfferService) {
  }


  ngOnInit() {
    this.authService.hasRole('ROLE_CANDIDATE').subscribe({
      next: (hasRole) => {
        this.isCandidate = hasRole;
        if (this.isCandidate) {
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
        this.isCandidate = false;
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

  onViewDetails(event: Event) {
    event.stopPropagation();
    this.viewDetails.emit(this.offer);
  }

  onToggleBookmark(event: Event) {
    event.stopPropagation();
    this.toggleBookmark.emit(this.offer.id);
  }

  getOfferStatusClass(): string {
    if (!this.isCompany || !this.offer.status) {
      return '';
    }

    switch (this.offer.status) {
      case 'PUBLISHED':
      case 'ACTIVE':
        return 'offer-card-published';
      case 'DRAFT':
        return 'offer-card-draft';
      case 'ARCHIVED':
        return 'offer-card-archived';
      default:
        return '';
    }
  }
}

