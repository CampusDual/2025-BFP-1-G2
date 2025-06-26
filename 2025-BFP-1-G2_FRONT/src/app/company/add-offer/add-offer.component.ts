import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {OfferService} from '../../services/offer.service';
import {Router} from "@angular/router";
import { AuthService } from '../../auth/services/auth.service';


@Component({
  selector: 'app-add-offer',
  templateUrl: './add-offer.component.html',
  styleUrls: ['./add-offer.component.css']
})
export class AddOfferComponent implements OnInit {
  companyName: string | null = null;

  title = new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]);
  description = new FormControl('', [Validators.required, Validators.minLength(100), Validators.maxLength(2000)]);
  offersForm = new FormGroup({
    title: this.title,
    description: this.description
  });


  constructor(private route: ActivatedRoute,
     private fb: FormBuilder, 
     private offerService: OfferService,
     private router: Router,
     private authService: AuthService) {
  }

  ngOnInit(): void {
    this.companyName = this.authService.getLogin();
  }

  onSubmit(): void {
    if (!this.companyName) {
      console.error('Company name is missing');
      return;
    }

    if (this.offersForm.valid) {

      if (this.title.value && this.description.value) {

        this.offerService.createOffer({
          title: this.title.value,
          description: this.description.value
        }).subscribe({
          next: response => {
            this.router.navigate(["company/myoffers"]);
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
  }

  onReset(): void {
    this.offersForm.reset();
  }

  getDescriptionErrorMessage(): string {
    if (this.description.hasError('required')) {
      return 'Debes ingresar una descripción';
    }
    if (this.description.hasError('minlength')) {
      return 'La descripción debe tener al menos 100 caracteres';
    }
    if (this.description.hasError('maxlength')) {
      return 'La descripción no puede exceder los 2000 caracteres';
    }
    return '';
  }

  getTitleErrorMessage(): string {
    if (this.title.hasError('required')) {
      return 'Debes ingresar un título';
    }
    if (this.title.hasError('minlength')) {
      return 'El título debe tener al menos 5 caracteres';
    }
    if (this.title.hasError('maxlength')) {
      return 'El título no puede exceder los 255 caracteres';
    }
    return '';
  }

}
