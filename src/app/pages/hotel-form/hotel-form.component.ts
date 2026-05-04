import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HotelService } from '../../services/hotel.service';
import { HotelRequest } from '../../models/models';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-hotel-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, RouterModule],
  templateUrl: './hotel-form.component.html',
  styleUrl: './hotel-form.component.css'
})
export class HotelFormComponent implements OnInit {
  hotelForm!: FormGroup;
  isEditMode = false;
  hotelId: number | null = null;
  isLoading = false;
  isFetching = false;
  successMsg = '';
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.hotelForm = this.fb.group({
      hotelId: ['', [Validators.required, Validators.pattern(/^\d+$/), Validators.min(1)]],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      location: ['', [Validators.required]],
      description: ['', [Validators.maxLength(200)]]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.hotelId = +id;
      // In edit mode, hotelId field is read-only
      this.hotelForm.get('hotelId')?.setValue(this.hotelId);
      this.hotelForm.get('hotelId')?.disable();
      this.fetchHotel(this.hotelId);
    }
  }

  fetchHotel(id: number) {
    this.isFetching = true;
    this.hotelService.getHotelById(id).subscribe({
      next: (data) => {
        this.hotelForm.patchValue({
          name: data.name,
          location: data.location,
          description: data.description
        });
        this.isFetching = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Could not load hotel data.';
        this.isFetching = false;
      }
    });
  }

  onSubmit() {
    if (this.hotelForm.invalid) {
      this.hotelForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMsg = '';
    this.errorMsg = '';

    const dto: HotelRequest = {
      name: this.hotelForm.get('name')?.value,
      location: this.hotelForm.get('location')?.value,
      description: this.hotelForm.get('description')?.value
    };

    if (this.isEditMode && this.hotelId) {
      this.hotelService.updateHotel(this.hotelId, dto).subscribe({
        next: (updated) => {
          this.isLoading = false;
          this.successMsg = `Hotel "${updated.name}" updated successfully!`;
          setTimeout(() => this.router.navigate(['/hotel-admin']), 1500);
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          this.errorMsg = err.error?.message || 'Failed to update hotel. Check your permissions.';
        }
      });
    } else {
      const newId = +this.hotelForm.get('hotelId')?.value;
      this.hotelService.createHotel(newId, dto).subscribe({
        next: (created) => {
          this.isLoading = false;
          this.successMsg = `Hotel "${created.name}" created successfully!`;
          setTimeout(() => this.router.navigate(['/hotel-admin']), 1500);
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          this.errorMsg = err.error?.message || 'Failed to create hotel. You must be logged in as ADMIN.';
        }
      });
    }
  }

  getError(field: string): string {
    const c = this.hotelForm.get(field);
    if (!c?.touched || !c.errors) return '';
    if (c.errors['required']) return `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
    if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} characters.`;
    if (c.errors['maxlength']) return `Maximum ${c.errors['maxlength'].requiredLength} characters.`;
    if (c.errors['min']) return 'ID must be a positive number.';
    if (c.errors['pattern']) return 'ID must be a valid number.';
    return 'Invalid value.';
  }

  goBack() {
    this.router.navigate(['/hotel-admin']);
  }
}
