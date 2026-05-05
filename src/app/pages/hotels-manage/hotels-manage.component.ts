import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HotelService } from '../../services/hotel.service';
import { Hotel, HotelRequest } from '../../models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-hotels-manage',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SidebarComponent],
  templateUrl: './hotels-manage.component.html',
  styleUrl: './hotels-manage.component.css'
})
export class HotelsManageComponent implements OnInit {
  hotels: Hotel[] = [];
  isLoading = false;
  showForm = false;
  editingId: number | null = null;
  hotelForm: FormGroup;
  searchTerm = '';
  filterStatus = 'all'; // 'all', 'active', 'inactive'

  constructor(
    private hotelService: HotelService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.hotelForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      location: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      imageUrl: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadHotels();
  }

  loadHotels(): void {
    this.isLoading = true;
    this.hotelService.getAllHotels().subscribe({
      next: (data) => {
        this.hotels = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load hotels');
        this.isLoading = false;
      }
    });
  }

  get filteredHotels(): Hotel[] {
    let filtered = this.hotels;

    // Apply status filter
    if (this.filterStatus === 'active') {
      filtered = filtered.filter(h => h.isActive);
    } else if (this.filterStatus === 'inactive') {
      filtered = filtered.filter(h => !h.isActive);
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(h =>
        h.name.toLowerCase().includes(term) ||
        h.location.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  openForm(hotel?: Hotel): void {
    this.showForm = true;
    if (hotel) {
      this.editingId = hotel.hotelId || null;
      this.hotelForm.patchValue({
        name: hotel.name,
        location: hotel.location,
        description: hotel.description,
        imageUrl: hotel.imageUrl || '',
        isActive: hotel.isActive ?? true
      });
    } else {
      this.editingId = null;
      this.hotelForm.reset({ isActive: true });
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.hotelForm.reset();
  }

  saveHotel(): void {
    if (this.hotelForm.invalid) {
      this.toastr.error('Please fill all required fields');
      return;
    }

    const formValue = this.hotelForm.value;
    const request: HotelRequest = {
      name: formValue.name,
      location: formValue.location,
      description: formValue.description,
      imageUrl: formValue.imageUrl,
      isActive: formValue.isActive
    };

    if (this.editingId) {
      this.hotelService.updateHotel(this.editingId, request).subscribe({
        next: () => {
          this.toastr.success('Hotel updated successfully');
          this.closeForm();
          this.loadHotels();
        },
        error: () => this.toastr.error('Failed to update hotel')
      });
    } else {
      // For new hotels, you may need to adjust this based on your backend
      const newId = Math.max(...this.hotels.map(h => h.hotelId || 0), 0) + 1;
      this.hotelService.createHotel(newId, request).subscribe({
        next: () => {
          this.toastr.success('Hotel created successfully');
          this.closeForm();
          this.loadHotels();
        },
        error: () => this.toastr.error('Failed to create hotel')
      });
    }
  }

  deleteHotel(id: number): void {
    if (confirm('Are you sure you want to delete this hotel?')) {
      this.hotelService.deleteHotel(id).subscribe({
        next: () => {
          this.toastr.success('Hotel deleted successfully');
          this.loadHotels();
        },
        error: () => this.toastr.error('Failed to delete hotel')
      });
    }
  }

  toggleStatus(hotel: Hotel): void {
    const newStatus = !(hotel.isActive ?? true);
    this.hotelService.toggleHotelStatus(hotel.hotelId || 0, newStatus).subscribe({
      next: () => {
        hotel.isActive = newStatus;
        this.toastr.success(`Hotel ${newStatus ? 'activated' : 'deactivated'} successfully`);
      },
      error: () => this.toastr.error('Failed to update hotel status')
    });
  }

  handleImageUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // In a real app, upload to server and get URL
        this.hotelForm.patchValue({
          imageUrl: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  }
}
