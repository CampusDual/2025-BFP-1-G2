import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from "../../auth/services/auth.service";
import { OfferService } from "../../services/offer.service";
import { Tag } from 'src/app/admin/admin-tags/admin-tags.component';


@Component({
  selector: 'app-offer-card',
  templateUrl: './offer-card.component.html',
  styleUrls: ['./offer-card.component.css']
})
export class OfferCardComponent {

  @Input() offer: any;
  @Input() isCompany: boolean = false;
  @Input() isBookmarked: boolean = false;
  @Input() isCandidate: boolean = false;
  @Output() viewDetails = new EventEmitter<any>();
  @Output() toggleBookmark = new EventEmitter<number>();
  @Output() onChipClick = new EventEmitter<{ tag: Tag }>();

  isDisabled: boolean = true;
  candidates: any[] = [];


  constructor(protected authService: AuthService,
    protected offerService: OfferService) {
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
  onChipClickHandler($event: MouseEvent, tag: Tag) {
    $event.stopPropagation();
    this.onChipClick.emit({ tag: tag });
  }
}

