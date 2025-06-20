import { Component } from '@angular/core';


export interface Company {
  name: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  foundationYear: number;
}

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})

export class AdminPanelComponent {

displayedColumns: string[] = ['name', 'description', 'email', 'phone', 'website', 'address', 'foundationYear'];

dataSource: Company[] = [
  {
    name: 'TechNova',
    description: 'Innovative software development',
    email: 'contact@technova.com',
    phone: '+34 912 345 678',
    website: 'https://www.technova.com',
    address: 'Futura Street 123, Madrid',
    foundationYear: 2012
  },
  {
    name: 'GreenWorld',
    description: 'Renewable energy and sustainability',
    email: 'info@greenworld.org',
    phone: '+34 933 456 789',
    website: 'https://www.greenworld.org',
    address: 'Green Avenue 45, Barcelona',
    foundationYear: 2008
  },
  {
    name: 'EduSmart',
    description: 'Digital educational platforms',
    email: 'support@edusmart.edu',
    phone: '+34 954 123 321',
    website: 'https://www.edusmart.edu',
    address: 'Knowledge Street 56, Seville',
    foundationYear: 2015
  },
  {
    name: 'HealthLink',
    description: 'Healthcare IT solutions',
    email: 'contact@healthlink.net',
    phone: '+34 911 987 654',
    website: 'https://www.healthlink.net',
    address: 'Medical Plaza 9, Valencia',
    foundationYear: 2010
  },
  {
    name: 'FoodLogix',
    description: 'Smart logistics for food delivery',
    email: 'sales@foodlogix.com',
    phone: '+34 921 321 987',
    website: 'https://www.foodlogix.com',
    address: 'Logistics Park 5, Zaragoza',
    foundationYear: 2017
  },
  {
    name: 'AeroX',
    description: 'Advanced drone technologies',
    email: 'info@aerox.io',
    phone: '+34 900 456 321',
    website: 'https://www.aerox.io',
    address: 'Skyline Hub 12, Bilbao',
    foundationYear: 2020
  },
  {
    name: 'FinVerse',
    description: 'Next-gen financial tools and APIs',
    email: 'partners@finverse.com',
    phone: '+34 911 234 567',
    website: 'https://www.finverse.com',
    address: 'Wall Street 100, Madrid',
    foundationYear: 2013
  },
  {
    name: 'UrbanGrow',
    description: 'Urban farming and green roofs',
    email: 'contact@urbangrow.org',
    phone: '+34 933 123 888',
    website: 'https://www.urbangrow.org',
    address: 'Eco Street 33, Valencia',
    foundationYear: 2016
  },
  {
    name: 'AutoMind',
    description: 'AI systems for autonomous driving',
    email: 'ai@automind.ai',
    phone: '+34 932 987 654',
    website: 'https://www.automind.ai',
    address: 'Technology Park 21, Málaga',
    foundationYear: 2019
  },
  {
    name: 'CloudCraft',
    description: 'Cloud-based development tools',
    email: 'dev@cloudcraft.dev',
    phone: '+34 955 654 321',
    website: 'https://www.cloudcraft.dev',
    address: 'Dev District 7, Granada',
    foundationYear: 2011
  }
];

selectedCompany: Company | null = null;

openCard(company: Company) {
  this.selectedCompany = company;
}

closeCard() {
  this.selectedCompany = null;
}
  
}
