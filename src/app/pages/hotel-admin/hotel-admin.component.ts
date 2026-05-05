import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../services/hotel.service';
import { Hotel } from '../../models/models';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-hotel-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  templateUrl: './hotel-admin.component.html',
  styleUrl: './hotel-admin.component.css'
})
export class HotelAdminComponent implements OnInit {
  hotels: Hotel[] = [];
  filteredHotels: Hotel[] = [];
  isLoading = true;
  errorMsg = '';
  successMsg = '';
  searchTerm = '';

  // Delete confirmation modal state
  showDeleteModal = false;
  hotelToDelete: Hotel | null = null;
  isDeleting = false;

  // Stats
  totalHotels = 0;

  constructor(
    private hotelService: HotelService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadHotels();
  }

  loadHotels() {
    this.isLoading = true;
    this.errorMsg = '';
    this.hotelService.getAllHotels().subscribe({
      next: (data) => {
        this.hotels = data;
        this.filteredHotels = data;
        this.totalHotels = data.length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Failed to load hotels. Ensure backend is running on port 8087.';
        this.isLoading = false;
      }
    });
  }

  filterHotels() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredHotels = this.hotels;
    } else {
      this.filteredHotels = this.hotels.filter(h =>
        h.name?.toLowerCase().includes(term) ||
        h.location?.toLowerCase().includes(term) ||
        h.hotelId?.toString().includes(term)
      );
    }
  }

  clearFilter() {
    this.searchTerm = '';
    this.filteredHotels = this.hotels;
  }

  navigateToCreate() {
    this.router.navigate(['/hotel-form']);
  }

  navigateToEdit(hotel: Hotel) {
    this.router.navigate(['/hotel-form', hotel.hotelId]);
  }

  confirmDelete(hotel: Hotel) {
    this.hotelToDelete = hotel;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.hotelToDelete = null;
    this.showDeleteModal = false;
  }

  executeDelete() {
    if (!this.hotelToDelete) return;
    this.isDeleting = true;
    this.hotelService.deleteHotel(this.hotelToDelete.hotelId!).subscribe({
      next: () => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.successMsg = 'Hotel deleted successfully.';
        this.hotelToDelete = null;
        this.loadHotels();
      },
      error: (err) => {
        console.error(err);
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.errorMsg = 'Could not delete hotel.';
        this.hotelToDelete = null;
      }
    });
  }

  viewHotel(hotel: Hotel) {
    this.router.navigate(['/hotels', hotel.hotelId]);
  }

  refresh() {
    this.successMsg = '';
    this.errorMsg = '';
    this.searchTerm = '';
    this.loadHotels();
  }

  getHotelImage(index: number): string {
    const images = [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=70',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=70',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=70',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=70',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=70',
    ];
    return images[index % images.length];
  }
}
