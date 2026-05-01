import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { RoomService } from '../../services/room.service';
import { ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  totalRooms = 0;
  totalReservations = 0;
  recentReservations: any[] = [];
  isLoading = true;

  constructor(
    private roomService: RoomService,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    // In a real scenario we might have an endpoint for stats.
    // For now we'll fetch all and count them.
    this.fetchData();
  }

  fetchData() {
    // We would use forkJoin for parallel fetching, but this is fine for now
    this.roomService.getAvailableRooms().subscribe(rooms => {
      this.totalRooms = rooms.length; // Approximate total if we don't have a count all endpoint
    });

    this.reservationService.getAllReservations().subscribe(reservations => {
      this.totalReservations = reservations.length;
      this.recentReservations = reservations.slice(-5).reverse(); // Mock recent
      this.isLoading = false;
    });
  }
}
