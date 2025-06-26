import { Component } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEditedEvent } from '@angular/material/chips';
import { FormControl, Validators } from '@angular/forms';

export interface Tag {
  name: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
 
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  tags: Tag[] = [
    { name: 'Frontend' }, 
    { name: 'Backend' }, 
    { name: 'Full Stack' },
    { name: 'Angular' },
    { name: 'React' }
  ];
  tag = new FormControl('', [Validators.required, Validators.minLength(2)]);
  
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

  clearAllTags(): void {
    if (confirm('¿Estás seguro de que quieres eliminar todos los tags?')) {
      this.tags = [];
    }
  }
}