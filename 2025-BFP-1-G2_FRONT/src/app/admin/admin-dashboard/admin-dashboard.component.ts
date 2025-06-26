import { Component, OnInit } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEditedEvent } from '@angular/material/chips';
import { FormControl, Validators } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';

export interface Tag {
  name: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  
 
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  tags: Tag[] = [];
  tag = new FormControl('', [Validators.required, Validators.minLength(2)]);
  
  constructor(private adminService: AdminService) { }
  
  ngOnInit(): void {
    this.adminService.getAllTags().subscribe(
      (tags: Tag[]) => {
        this.tags = tags;
      },
      (error) => {
        console.error('Error al obtener los tags:', error);
      }
    );
  }


  add(): void {
    const value = this.tag.value?.toString().trim();
    
    if (this.tag.valid && value) {
      const exists = this.tags.some(existingTag => 
        existingTag.name.toLowerCase() === value.toLowerCase()
      );
      
      if (!exists) {
        this.tags.push({ name: value });
        this.tag.reset();
      } else {
        console.warn('El tag ya existe');
      }
    }
  }

  remove(tag: Tag): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  edit(tag: Tag, event: MatChipEditedEvent): void {
    const value = event.value.trim();
    
    if (!value) {
      this.remove(tag);
      return;
    }
    
    const exists = this.tags.some(existingTag => 
      existingTag !== tag && existingTag.name.toLowerCase() === value.toLowerCase()
    );
    
    if (!exists) {
      const index = this.tags.indexOf(tag);
      if (index >= 0) {
        this.tags[index].name = value;
      }
    } else {
      console.warn('El tag ya existe');
    }
  }
}