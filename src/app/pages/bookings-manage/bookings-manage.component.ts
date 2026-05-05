import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { HotelService } from '../../services/hotel.service';
import { Reservation, Hotel } from '../../models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-bookings-manage',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, RouterModule],
  templateUrl: './bookings-manage.component.html',
  styleUrl: './bookings-manage.component.css'
})
export class BookingsManageComponent implements OnInit {
  bookings: Reservation[] = [];
  hotels: Hotel[] = [];
  isLoading = false;
  searchTerm = '';
  filterStatus = 'all'; // 'all', 'confirmed', 'cancelled', 'completed'
  filterHotel = 'all';
  filterDateStart = '';
  filterDateEnd = '';
  selectedBookingId: number | null = null;
  showCancelConfirm = false;

  constructor(
    private reservationService: ReservationService,
    private hotelService: HotelService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadHotels();
    this.loadBookings();
  }

  loadHotels(): void {
    this.hotelService.getAllHotels().subscribe({
      next: (data) => {
        this.hotels = data;
      },
      error: () => this.toastr.error('Failed to load hotels')
    });
  }

  loadBookings(): void {
    this.isLoading = true;
    this.reservationService.getAllReservations().subscribe({
      next: (data) => {
        this.bookings = data;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load bookings');
        this.isLoading = false;
      }
    });
  }

  get filteredBookings(): Reservation[] {
    let filtered = this.bookings;

    // Apply status filter
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(b => 
        (b.status || 'CONFIRMED').toUpperCase() === this.filterStatus.toUpperCase()
      );
    }

    // Apply hotel filter
    if (this.filterHotel !== 'all') {
      const hotelId = parseInt(this.filterHotel);
      filtered = filtered.filter(b => b.hotel?.hotelId === hotelId);
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.guestName.toLowerCase().includes(term) ||
        b.guestEmail.toLowerCase().includes(term) ||
        b.guestPhone.includes(term)
      );
    }

    // Apply date range filter
    if (this.filterDateStart) {
      const startDate = new Date(this.filterDateStart);
      filtered = filtered.filter(b => new Date(b.checkInDate) >= startDate);
    }

    if (this.filterDateEnd) {
      const endDate = new Date(this.filterDateEnd);
      filtered = filtered.filter(b => new Date(b.checkOutDate) <= endDate);
    }

    return filtered;
  }

  cancelBooking(bookingId: number): void {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.reservationService.cancelReservation(bookingId).subscribe({
        next: () => {
          this.toastr.success('Booking cancelled successfully');
          this.loadBookings();
        },
        error: () => this.toastr.error('Failed to cancel booking')
      });
    }
  }

  updateBookingStatus(bookingId: number, newStatus: string): void {
    this.reservationService.updateReservationStatus(bookingId, newStatus).subscribe({
      next: () => {
        this.toastr.success(`Booking status updated to ${newStatus}`);
        this.loadBookings();
      },
      error: () => this.toastr.error('Failed to update booking status')
    });
  }

  getHotelName(hotelId?: number): string {
    if (!hotelId) return 'N/A';
    const hotel = this.hotels.find(h => h.hotelId === hotelId);
    return hotel ? hotel.name : 'Unknown';
  }

  getStatusBadgeClass(status?: string): string {
    const s = (status || 'CONFIRMED').toUpperCase();
    switch (s) {
      case 'CONFIRMED': return 'bg-success';
      case 'CANCELLED': return 'bg-danger';
      case 'COMPLETED': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterStatus = 'all';
    this.filterHotel = 'all';
    this.filterDateStart = '';
    this.filterDateEnd = '';
  }

  calculateNights(checkIn: Date | string, checkOut: Date | string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  exportBookings(): void {
    const csv = this.convertToCSV(this.filteredBookings);
    this.downloadCSV(csv, 'bookings.csv');
    this.toastr.success('Bookings exported successfully');
  }

  private convertToCSV(data: Reservation[]): string {
    const headers = ['Reservation ID', 'Guest Name', 'Email', 'Phone', 'Check In', 'Check Out', 'Room ID', 'Total Price', 'Status'];
    const rows = data.map(b => [
      b.reservationId,
      b.guestName,
      b.guestEmail,
      b.guestPhone,
      new Date(b.checkInDate).toLocaleDateString(),
      new Date(b.checkOutDate).toLocaleDateString(),
      b.roomId,
      b.totalPrice,
      b.status || 'CONFIRMED'
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    return csv;
  }

  private downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
