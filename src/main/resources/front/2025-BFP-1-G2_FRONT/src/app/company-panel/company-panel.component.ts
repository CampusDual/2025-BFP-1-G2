import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-company-panel',
  templateUrl: './company-panel.component.html',
  styleUrls: ['./company-panel.component.css']
})
export class CompanyPanelComponent implements OnInit {
  companyName: string | null = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.companyName = this.route.snapshot.paramMap.get('companyName');
  }
}
