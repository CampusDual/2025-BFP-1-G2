import { Component, Input, HostListener, ElementRef } from '@angular/core';

@Component({
  selector: 'app-offer-card',
  templateUrl: './offer-card.component.html',
  styleUrls: ['./offer-card.component.css']
})
export class OfferCardComponent {
  @Input() offer: any;
  @Input() isSelected: boolean = false;

  isDisabled: boolean = true;

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.isDisabled && !this.elementRef.nativeElement.contains(event.target)) {
      this.closeCard();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePress() {
    if (!this.isDisabled) {
      this.closeCard();
    }
  }

  toggleSelection(event: Event) {
    event.stopPropagation();
    this.isSelected = !this.isSelected;
  }

  toggleActions(event: Event) {
    event.stopPropagation();
    this.isDisabled = !this.isDisabled;
  }

  closeCard() {
    this.isDisabled = true;
    this.isSelected = false;
  }
}
