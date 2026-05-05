import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { RoomService } from '../../services/room.service';
import { ReservationService } from '../../services/reservation.service';
import { HotelService } from '../../services/hotel.service';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  currentDate = new Date();
  // Metrics
  totalRooms = 0;
  availableRooms = 0;
  totalHotels = 0;
  activeHotels = 0;
  totalReservations = 0;
  confirmedBookings = 0;
  cancelledBookings = 0;
  totalRevenue = 0;
  pendingPayments = 0;
  
  recentReservations: any[] = [];
  isLoading = true;

  // Chart data
  bookingTrendData: any[] = [];
  revenueData: any[] = [];

  constructor(
    private roomService: RoomService,
    private reservationService: ReservationService,
    private hotelService: HotelService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.isLoading = true;
    
    forkJoin({
      allRooms: this.roomService.getAllRooms(),
      availableRooms: this.roomService.getAvailableRooms(),
      allHotels: this.hotelService.getAllHotels(),
      reservations: this.reservationService.getAllReservations(),
      payments: this.paymentService.getAllPayments()
    }).subscribe({
      next: (data) => {
        // Process rooms
        this.totalRooms = data.allRooms.length;
        this.availableRooms = data.availableRooms.length;

        // Process hotels
        this.totalHotels = data.allHotels.length;
        this.activeHotels = data.allHotels.filter(h => h.isActive).length;

        // Process reservations
        this.totalReservations = data.reservations.length;
        this.confirmedBookings = data.reservations.filter(r => 
          (r.status || 'CONFIRMED').toUpperCase() === 'CONFIRMED'
        ).length;
        this.cancelledBookings = data.reservations.filter(r =>
          (r.status || 'CONFIRMED').toUpperCase() === 'CANCELLED'
        ).length;
        this.recentReservations = data.reservations.slice(-5).reverse();

        // Process payments
        this.totalRevenue = data.payments
          .filter(p => p.paymentStatus === 'COMPLETED')
          .reduce((sum, p) => sum + p.amount, 0);
        this.pendingPayments = data.payments
          .filter(p => p.paymentStatus === 'PENDING')
          .reduce((sum, p) => sum + p.amount, 0);

        // Generate chart data
        this.generateChartData(data.reservations);
        
        this.isLoading = false;
      },
      error: () => {
        // If backend requests fail (backend down or CORS), populate with sample data for development
        const sampleHotels = [
          { hotelId: 1, name: 'Grand Plaza Hotel', isActive: true },
          { hotelId: 2, name: 'Oceanfront Resort & Spa', isActive: true }
        ];

        const sampleRooms = [
          { roomId: 101, roomNumber: 101, roomTypeId: 1, isAvailable: true, hotelId: 1 },
          { roomId: 102, roomNumber: 102, roomTypeId: 2, isAvailable: false, hotelId: 1 },
          { roomId: 201, roomNumber: 201, roomTypeId: 1, isAvailable: true, hotelId: 2 }
        ];

        const sampleReservations = [
          { reservationId: 1, guestName: 'Kush', guestEmail: 'kush@example.com', guestPhone: '000', checkInDate: new Date(), checkOutDate: new Date(), roomId: 101, status: 'CONFIRMED', hotel: sampleHotels[0] },
          { reservationId: 2, guestName: 'Jahnvi', guestEmail: 'jahnvi@example.com', guestPhone: '000', checkInDate: new Date(), checkOutDate: new Date(), roomId: 201, status: 'CONFIRMED', hotel: sampleHotels[1] }
        ];

        const samplePayments = [
          { paymentId: 1, reservationId: 1, amount: 100, paymentDate: new Date(), paymentStatus: 'COMPLETED' },
          { paymentId: 2, reservationId: 2, amount: 150, paymentDate: new Date(), paymentStatus: 'PENDING' }
        ];

        // Apply sample data to metrics
        this.totalRooms = sampleRooms.length;
        this.availableRooms = sampleRooms.filter(r => r.isAvailable).length;
        this.totalHotels = sampleHotels.length;
        this.activeHotels = sampleHotels.filter(h => h.isActive).length;
        this.totalReservations = sampleReservations.length;
        this.confirmedBookings = sampleReservations.filter(r => (r.status || 'CONFIRMED').toUpperCase() === 'CONFIRMED').length;
        this.cancelledBookings = sampleReservations.filter(r => (r.status || 'CONFIRMED').toUpperCase() === 'CANCELLED').length;
        this.recentReservations = sampleReservations.slice(-5).reverse();
        this.totalRevenue = samplePayments.filter(p => p.paymentStatus === 'COMPLETED').reduce((s, p) => s + p.amount, 0);
        this.pendingPayments = samplePayments.filter(p => p.paymentStatus === 'PENDING').reduce((s, p) => s + p.amount, 0);
        this.generateChartData(sampleReservations);
        this.isLoading = false;
      }
    });
  }

  private generateChartData(reservations: any[]): void {
    // Simple booking trend - count bookings by status
    const statusCounts = {
      'CONFIRMED': 0,
      'CANCELLED': 0,
      'COMPLETED': 0
    };

    reservations.forEach(r => {
      const status = (r.status || 'CONFIRMED').toUpperCase();
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status as keyof typeof statusCounts]++;
      }
    });

    this.bookingTrendData = Object.entries(statusCounts).map(([label, value]) => ({
      label,
      value
    }));

    // Revenue data - by payment status
    this.revenueData = [
      { label: 'Completed', value: this.totalRevenue },
      { label: 'Pending', value: this.pendingPayments }
    ];
  }

  getOccupancyRate(): number {
    if (this.totalRooms === 0) return 0;
    return Math.round(((this.totalRooms - this.availableRooms) / this.totalRooms) * 100);
  }

  getHotelActiveRate(): number {
    if (this.totalHotels === 0) return 0;
    return Math.round((this.activeHotels / this.totalHotels) * 100);
  }
}

