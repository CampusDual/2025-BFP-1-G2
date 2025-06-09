import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-offer-table',
  templateUrl: './offer-table.component.html',
  styleUrls: ['./offer-table.component.css']
})
export class OfferTableComponent {
  offers = [
    {
      title: 'Software Engineer',
      description: 'Develop and maintain software applications.',
      email: 'aposfd@exmple',
      companyName: 'Tech Solutions',
      dateAdded: '2025-01-15'
    },
    {
      title: 'Data Analyst',
      description: 'Analyze data and generate reports.',
      email: 'data@exmple',
      companyName: 'Data Insights',
      dateAdded: '2025-01-20'
    },
    {
      title: 'Project Manager',
      description: 'Manage projects and coordinate teams.',
      email: 'pm@exmple',
      companyName: 'Project Masters',
      dateAdded: '2025-01-25'
    }
  ];

}
