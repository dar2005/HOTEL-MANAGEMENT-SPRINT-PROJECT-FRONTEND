import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../services/room.service';
import { Room } from '../../models/models';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.css'
})
export class RoomsComponent implements OnInit {
  rooms: Room[] = [];
  isLoading = true;
  
  // Filter states
  filterMode: 'ALL' | 'AVAILABLE' | 'UNAVAILABLE' = 'AVAILABLE';
  filterType: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    // If coming from search widget, we might have params. Let's just fetch all available by default.
    this.route.queryParams.subscribe(params => {
      // If we had a specific requirement to use these params immediately, we would.
      // But we are moving to the robust API filter.
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.isLoading = true;

    // We will decide which endpoint to call based on the filters.
    // If price range is set, we use price endpoint
    if (this.minPrice !== null && this.maxPrice !== null && this.minPrice >= 0 && this.maxPrice > 0) {
      this.roomService.getRoomsByPrice(this.minPrice, this.maxPrice).subscribe({
        next: (res) => this.handleSuccess(res),
        error: (err) => this.handleError(err)
      });
      return;
    }

    // If type is set, we use type endpoint
    if (this.filterType && this.filterType.trim() !== '') {
      const formattedType = this.formatToTitleCase(this.filterType.trim());
      this.roomService.getRoomsByType(formattedType).subscribe({
        next: (res) => this.handleSuccess(res),
        error: (err) => this.handleError(err)
      });
      return;
    }

    // Otherwise, use availability endpoints
    if (this.filterMode === 'AVAILABLE') {
      this.roomService.getAvailableRooms().subscribe({
        next: (res) => this.handleSuccess(res),
        error: (err) => this.handleError(err)
      });
    } else if (this.filterMode === 'UNAVAILABLE') {
      this.roomService.getUnavailableRooms().subscribe({
        next: (res) => this.handleSuccess(res),
        error: (err) => this.handleError(err)
      });
    } else {
      this.roomService.getAllRooms().subscribe({
        next: (res) => this.handleSuccess(res),
        error: (err) => this.handleError(err)
      });
    }
  }

  resetFilters(): void {
    this.filterMode = 'AVAILABLE';
    this.filterType = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.applyFilters();
  }

  private handleSuccess(data: Room[]) {
    this.rooms = data;
    this.isLoading = false;
  }

  private handleError(error: any) {
    console.error('Failed to load rooms', error);
    this.rooms = [];
    this.isLoading = false;
  }

  private formatToTitleCase(str: string): string {
    if (!str) return '';
    return str.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
