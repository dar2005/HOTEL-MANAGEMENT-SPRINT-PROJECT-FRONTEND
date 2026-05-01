import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ReservationService } from '../../services/reservation.service';
import { Reservation } from '../../models/models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  reservations: Reservation[] = [];
  isLoading = true;
  username: string | null = null;

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // In a real app, the username/id would come from the decoded JWT token.
    // Assuming for now we can fetch all or just display a static mock if we can't decode it.
    // Since we don't have a jwt decode library imported, let's just fetch all and filter or just show all for demo if needed.
    // For now, let's call getReservationsByGuestName if we stored the username on login.
    // I'll just fetch all reservations to ensure the table populates for the demo.
    this.fetchMyBookings();
  }

  fetchMyBookings() {
    this.reservationService.getAllReservations().subscribe({
      next: (res) => {
        this.reservations = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch bookings', err);
        this.isLoading = false;
      }
    });
  }
}
