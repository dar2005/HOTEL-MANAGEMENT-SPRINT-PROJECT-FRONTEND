import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation.service';
import { Reservation } from '../../models/models';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  username: string = 'User';
  email: string = '';
  role: string = 'USER';
  memberSince: string = '';

  totalBookings: number = 0;
  upcomingBookings: number = 0;
  completedBookings: number = 0;
  isLoading = true;

  recentReservations: Reservation[] = [];

  constructor(
    private authService: AuthService,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || 'Guest User';
    this.email = localStorage.getItem('email') || 'Not available';
    this.role = localStorage.getItem('role') || 'USER';
    this.memberSince = localStorage.getItem('memberSince') || new Date().getFullYear().toString();

    this.reservationService.getAllReservations().subscribe({
      next: (res) => {
        this.totalBookings = res.length;
        const today = new Date();
        this.upcomingBookings = res.filter(r => new Date(r.checkInDate) >= today).length;
        this.completedBookings = res.filter(r => new Date(r.checkOutDate) < today).length;
        this.recentReservations = res.slice(0, 5);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getInitials(): string {
    return this.username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  }
}
