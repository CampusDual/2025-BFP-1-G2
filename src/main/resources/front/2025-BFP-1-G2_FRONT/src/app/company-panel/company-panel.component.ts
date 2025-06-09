import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";


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



  constructor(private route: ActivatedRoute, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.companyName = this.route.snapshot.paramMap.get('companyName');
  }

  onSubmit(): void{
    if (this.offersForm.valid) {
      const offerData = this.offersForm.value;
      console.log('Offer submitted:', offerData);
    } else {
      console.error('Form is invalid');
    }
  }

  onReset(): void{
    this.offersForm.reset();
  }
}
