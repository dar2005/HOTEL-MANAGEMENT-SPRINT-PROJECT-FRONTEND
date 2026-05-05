import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HotelService } from '../../services/hotel.service';
import { RoomService } from '../../services/room.service';
import { RoomTypeService } from '../../services/room-type.service';
import { ReservationService } from '../../services/reservation.service';
import { ReviewService } from '../../services/review.service';
import { Hotel, Reservation, Review, Room, RoomType } from '../../models/models';

type AdminTab = 'hotels' | 'rooms' | 'bookings' | 'reviews';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  activeTab: AdminTab = 'hotels';
  isLoading = true;
  message = '';
  errorMsg = '';

  hotels: Hotel[] = [];
  rooms: Room[] = [];
  roomTypes: RoomType[] = [];
  reservations: Reservation[] = [];
  reviews: Review[] = [];

  hotelSearch = '';
  roomFilter: 'ALL' | 'AVAILABLE' | 'UNAVAILABLE' = 'ALL';
  bookingSearch = '';
  bookingDate = '';
  reviewSearch = '';
  reviewRatingFilter: number | 'ALL' = 'ALL';

  newRoom = {
    roomId: 0,
    roomNumber: 0,
    roomTypeId: 0,
    isAvailable: true
  };

  editingReservationId: number | null = null;
  editReservation: Partial<Reservation> = {};

  constructor(
    private hotelService: HotelService,
    private roomService: RoomService,
    private roomTypeService: RoomTypeService,
    private reservationService: ReservationService,
    private reviewService: ReviewService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAdminData();
  }

  loadAdminData(): void {
    this.isLoading = true;
    this.message = '';
    this.errorMsg = '';

    forkJoin({
      hotels: this.hotelService.getAllHotels(),
      rooms: this.roomService.getAllRooms(),
      roomTypes: this.roomTypeService.getAllRoomTypes(),
      reservations: this.reservationService.getAllReservations(),
      reviews: this.reviewService.getAllReviews()
    }).subscribe({
      next: ({ hotels, rooms, roomTypes, reservations, reviews }) => {
        this.hotels = hotels;
        this.rooms = rooms;
        this.roomTypes = roomTypes;
        this.reservations = this.sortRecentFirst(reservations);
        this.reviews = reviews;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load admin data', err);
        this.errorMsg = 'Could not load admin data. Check backend and admin permissions.';
        this.isLoading = false;
      }
    });
  }

  get filteredHotels(): Hotel[] {
    const term = this.normalize(this.hotelSearch);
    if (!term) return this.hotels;

    return this.hotels.filter((hotel) =>
      this.normalize(hotel.name).includes(term) ||
      this.normalize(hotel.location).includes(term) ||
      String(hotel.hotelId || '').includes(term)
    );
  }

  get filteredRooms(): Room[] {
    return this.rooms.filter((room) => {
      if (this.roomFilter === 'AVAILABLE') return room.isAvailable;
      if (this.roomFilter === 'UNAVAILABLE') return !room.isAvailable;
      return true;
    });
  }

  get filteredReservations(): Reservation[] {
    const term = this.normalize(this.bookingSearch);

    return this.reservations.filter((reservation) => {
      const matchesTerm = !term ||
        this.normalize(reservation.guestName).includes(term) ||
        this.normalize(reservation.guestEmail).includes(term) ||
        String(reservation.reservationId || '').includes(term) ||
        String(this.getRoomId(reservation) || '').includes(term);

      const matchesDate = !this.bookingDate ||
        String(reservation.checkInDate) === this.bookingDate ||
        String(reservation.checkOutDate) === this.bookingDate;

      return matchesTerm && matchesDate;
    });
  }

  get filteredReviews(): Review[] {
    const term = this.normalize(this.reviewSearch);

    return this.reviews.filter((review) => {
      const matchesTerm = !term ||
        this.normalize(review.comment).includes(term) ||
        String(review.reviewId || '').includes(term) ||
        String(review.reservationId || '').includes(term);

      const matchesRating = this.reviewRatingFilter === 'ALL' ||
        Number(review.rating) === Number(this.reviewRatingFilter);

      return matchesTerm && matchesRating;
    });
  }

  get availableRoomsCount(): number {
    return this.rooms.filter((room) => room.isAvailable).length;
  }

  get unavailableRoomsCount(): number {
    return this.rooms.length - this.availableRoomsCount;
  }

  createRoom(): void {
    if (!this.newRoom.roomId || !this.newRoom.roomNumber || !this.newRoom.roomTypeId) {
      this.errorMsg = 'Room ID, room number and room type are required.';
      return;
    }

    const room: Room = {
      roomId: this.newRoom.roomId,
      roomNumber: this.newRoom.roomNumber,
      roomTypeId: this.newRoom.roomTypeId,
      isAvailable: this.newRoom.isAvailable
    };

    this.roomService.createRoom(room, this.newRoom.roomTypeId).subscribe({
      next: () => {
        this.message = 'Room created successfully.';
        this.newRoom = { roomId: 0, roomNumber: 0, roomTypeId: 0, isAvailable: true };
        this.loadAdminData();
      },
      error: (err) => {
        console.error('Failed to create room', err);
        this.errorMsg = this.getErrorMessage(err) || 'Could not create room.';
      }
    });
  }

  setRoomAvailability(room: Room, status: boolean): void {
    if (!room.roomId) return;

    this.roomService.updateAvailability(room.roomId, status).subscribe({
      next: () => {
        this.message = `Room ${room.roomNumber} marked ${status ? 'available' : 'unavailable'}.`;
        this.loadAdminData();
      },
      error: (err) => {
        console.error('Failed to update room status', err);
        this.errorMsg = this.getErrorMessage(err) || 'Could not update room status.';
      }
    });
  }

  bulkSetRooms(status: boolean): void {
    const updates = this.filteredRooms
      .filter((room) => room.roomId && room.isAvailable !== status)
      .map((room) => this.roomService.updateAvailability(room.roomId!, status));

    if (updates.length === 0) {
      this.message = 'No rooms needed updating.';
      return;
    }

    forkJoin(updates).subscribe({
      next: () => {
        this.message = `Updated ${updates.length} room(s).`;
        this.loadAdminData();
      },
      error: (err) => {
        console.error('Failed bulk room update', err);
        this.errorMsg = this.getErrorMessage(err) || 'Could not bulk update rooms.';
      }
    });
  }

  deleteRoom(room: Room): void {
    if (!room.roomId || !confirm(`Delete room ${room.roomNumber}?`)) return;

    this.roomService.deleteRoom(room.roomId).subscribe({
      next: () => {
        this.message = 'Room deleted successfully.';
        this.loadAdminData();
      },
      error: (err) => {
        console.error('Failed to delete room', err);
        this.errorMsg = this.getErrorMessage(err) || 'Could not delete room.';
      }
    });
  }

  deleteHotel(hotel: Hotel): void {
    if (!hotel.hotelId || !confirm(`Delete ${hotel.name}?`)) return;

    this.hotelService.deleteHotel(hotel.hotelId).subscribe({
      next: () => {
        this.message = 'Hotel deleted successfully.';
        this.loadAdminData();
      },
      error: (err) => {
        console.error('Failed to delete hotel', err);
        this.errorMsg = this.getErrorMessage(err) || 'Could not delete hotel.';
      }
    });
  }

  openHotelForm(hotel?: Hotel): void {
    if (hotel?.hotelId) {
      this.router.navigate(['/hotel-form', hotel.hotelId]);
      return;
    }

    this.router.navigate(['/hotel-form']);
  }

  startEditReservation(reservation: Reservation): void {
    this.editingReservationId = reservation.reservationId || null;
    this.editReservation = {
      ...reservation,
      checkInDate: this.toDateInput(reservation.checkInDate),
      checkOutDate: this.toDateInput(reservation.checkOutDate)
    };
  }

  cancelEditReservation(): void {
    this.editingReservationId = null;
    this.editReservation = {};
  }

  saveReservation(reservation: Reservation): void {
    if (!reservation.reservationId) return;

    const updated: Reservation = {
      ...reservation,
      ...this.editReservation,
      room: reservation.room || ({ roomId: reservation.roomId } as Room)
    };

    this.reservationService.updateReservation(reservation.reservationId, updated).subscribe({
      next: () => {
        this.message = 'Reservation updated successfully.';
        this.cancelEditReservation();
        this.loadAdminData();
      },
      error: (err) => {
        console.error('Failed to update reservation', err);
        this.errorMsg = this.getErrorMessage(err) || 'Could not update reservation.';
      }
    });
  }

  deleteReservation(reservation: Reservation): void {
    if (!reservation.reservationId || !confirm(`Cancel reservation #${reservation.reservationId}?`)) return;

    this.reservationService.deleteReservation(reservation.reservationId).subscribe({
      next: () => {
        this.message = 'Reservation cancelled successfully.';
        this.loadAdminData();
      },
      error: (err) => {
        console.error('Failed to cancel reservation', err);
        this.errorMsg = this.getErrorMessage(err) || 'Could not cancel reservation.';
      }
    });
  }

  deleteReview(review: Review): void {
    if (!review.reviewId || !confirm(`Delete review #${review.reviewId}?`)) return;

    this.reviewService.deleteReview(review.reviewId).subscribe({
      next: () => {
        this.message = 'Review deleted successfully.';
        this.loadAdminData();
      },
      error: (err) => {
        console.error('Failed to delete review', err);
        this.errorMsg = this.getErrorMessage(err) || 'Could not delete review.';
      }
    });
  }

  getRoomId(reservation: Reservation): number | undefined {
    return reservation.roomId ?? reservation.room?.roomId;
  }

  getRoomTypeName(room: Room): string {
    return room.roomType?.typeName || 'Unassigned';
  }

  getRoomPrice(room: Room): number {
    return room.roomType?.pricePerNight || 0;
  }

  getRoomCapacity(room: Room): number {
    return room.roomType?.maxOccupancy || 0;
  }

  private toDateInput(value: Date | string): string {
    return String(value).slice(0, 10);
  }

  private normalize(value: string | number | null | undefined): string {
    return String(value || '').trim().toLowerCase();
  }

  private getErrorMessage(err: any): string | null {
    if (typeof err?.error === 'string') return err.error;
    return err?.error?.message || err?.message || null;
  }

  private sortRecentFirst(reservations: Reservation[]): Reservation[] {
    return [...reservations].sort((a, b) => {
      const bId = b.reservationId ?? 0;
      const aId = a.reservationId ?? 0;
      if (bId !== aId) {
        return bId - aId;
      }

      return new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime();
    });
  }
}
