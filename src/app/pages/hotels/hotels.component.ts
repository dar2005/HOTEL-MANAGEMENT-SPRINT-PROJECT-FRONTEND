import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../services/hotel.service';
import { Hotel } from '../../models/models';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule, FormsModule],
  templateUrl: './hotels.component.html',
  styleUrl: './hotels.component.css'
})
export class HotelsComponent implements OnInit {
  hotels: Hotel[] = [];
  isLoading = true;
  errorMsg = '';

  searchName = '';
  searchLocation = '';

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.fetchHotels();
  }

  fetchHotels() {
    this.isLoading = true;
    this.errorMsg = '';
    this.hotelService.getAllHotels().subscribe({
      next: (data) => {
        this.hotels = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load hotels', err);
        this.errorMsg = 'Could not connect to the server. Please ensure the backend is running on port 8087.';
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    this.isLoading = true;
    this.errorMsg = '';
    const name = this.searchName.trim();
    const loc  = this.searchLocation.trim();

    if (name && loc) {
      this.hotelService.searchByLocationAndName(loc, name).subscribe({
        next: (data) => { this.hotels = data; this.isLoading = false; },
        error: () => { this.isLoading = false; this.errorMsg = 'Search failed.'; }
      });
    } else if (name) {
      this.hotelService.searchByName(name).subscribe({
        next: (data) => { this.hotels = data; this.isLoading = false; },
        error: () => { this.isLoading = false; this.errorMsg = 'Search failed.'; }
      });
    } else if (loc) {
      this.hotelService.searchByLocation(loc).subscribe({
        next: (data) => { this.hotels = data; this.isLoading = false; },
        error: () => { this.isLoading = false; this.errorMsg = 'Search failed.'; }
      });
    } else {
      this.fetchHotels();
    }
  }

  clearSearch() {
    this.searchName = '';
    this.searchLocation = '';
    this.fetchHotels();
  }

  getHotelImage(index: number): string {
    const images = [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
    ];
    return images[index % images.length];
  }
}
