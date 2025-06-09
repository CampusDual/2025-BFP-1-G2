import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import { OfferService } from '../services/offer.service';


interface Offer {
  title: string;
  description: string;
}

@Component({
  selector: 'app-company-panel',
  templateUrl: './company-panel.component.html',
  styleUrls: ['./company-panel.component.css']
})
export class CompanyPanelComponent implements OnInit {
  companyName: string | null = null;

  title = new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]);
  description = new FormControl('',[Validators.required, Validators.minLength(20), Validators.maxLength(1000)]);
  offersForm = new FormGroup({
    title: this.title,
    description: this.description
  });



  constructor(private route: ActivatedRoute, private fb: FormBuilder, private offerService: OfferService) {}

  ngOnInit(): void {
    this.companyName = this.route.snapshot.paramMap.get('companyName');
  }

onSubmit(): void {
  if (!this.companyName) {
    console.error('Company name is missing');
    return;
  }

  if (this.offersForm.valid) {

    const formValue = this.offersForm.value;
    const title = formValue.title ?? '';
    const description = formValue.description ?? '';

    if (!title || !description) {
      console.error('Title or Description are empty');
      return;
    }

    const offerData: Offer = {
      title,
      description
    };

    this.offerService.createOffer(offerData, this.companyName).subscribe({
      next: response => {
        console.log('Offer created successfully', response);
        this.offersForm.reset();
      },
      error: error => {
        console.error('Error creating offer', error);
      }
    });

  } else {
    console.error('Form is invalid');
    this.offersForm.markAllAsTouched();
  }
}

onReset(): void {
  this.offersForm.reset();
}

}
