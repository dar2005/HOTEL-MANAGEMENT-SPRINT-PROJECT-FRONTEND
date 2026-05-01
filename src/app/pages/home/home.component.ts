import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HeroComponent } from '../../components/hero/hero.component';

import { HotelService } from '../../services/hotel.service';
import { RoomService } from '../../services/room.service';
import { ReviewService } from '../../services/review.service';
import { Hotel, Room, Review } from '../../models/models';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent, HeroComponent, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  featuredHotels: Hotel[] = [];
  popularRooms: Room[] = [];
  guestReviews: Review[] = [];

  constructor(
    private hotelService: HotelService,
    private roomService: RoomService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.fetchFeaturedHotels();
    this.fetchPopularRooms();
    this.fetchGuestReviews();
  }

  fetchFeaturedHotels() {
    this.hotelService.getAllHotels().subscribe({
      next: (data) => {
        // Just take first 4 for featured
        this.featuredHotels = data.slice(0, 4);
      },
      error: (err) => console.error('Error fetching hotels', err)
    });
  }

  fetchPopularRooms() {
    this.roomService.getAvailableRooms().subscribe({
      next: (data) => {
        // Just take first 3 for popular
        this.popularRooms = data.slice(0, 3);
      },
      error: (err) => console.error('Error fetching rooms', err)
    });
  }

  fetchGuestReviews() {
    this.reviewService.getAllReviews().subscribe({
      next: (data) => {
        this.guestReviews = data.slice(0, 3);
      },
      error: (err) => {
        // If API fails (maybe not implemented yet), we can fallback to empty
        console.error('Error fetching reviews', err);
      }
    });
  }
}
