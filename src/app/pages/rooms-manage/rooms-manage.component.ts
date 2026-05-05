import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { HotelService } from '../../services/hotel.service';
import { Room, Hotel, RoomType } from '../../models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rooms-manage',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavbarComponent, RouterModule],
  templateUrl: './rooms-manage.component.html',
  styleUrl: './rooms-manage.component.css'
})
export class RoomsManageComponent implements OnInit {
  rooms: Room[] = [];
  hotels: Hotel[] = [];
  isLoading = false;
  showForm = false;
  editingId: number | null = null;
  roomForm: FormGroup;
  searchTerm = '';
  filterStatus = 'all'; // 'all', 'available', 'unavailable'
  selectedRoomIds: Set<number> = new Set();
  showBulkActions = false;

  constructor(
    private roomService: RoomService,
    private hotelService: HotelService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.roomForm = this.fb.group({
      roomNumber: ['', [Validators.required, Validators.min(1)]],
      hotelId: ['', Validators.required],
      roomTypeId: ['', [Validators.required, Validators.min(1)]],
      isAvailable: [true]
    });
  }

  ngOnInit(): void {
    this.loadHotels();
    this.loadRooms();
  }

  loadHotels(): void {
    this.hotelService.getAllHotels().subscribe({
      next: (data) => {
        this.hotels = data;
      },
      error: () => this.toastr.error('Failed to load hotels')
    });
  }

  loadRooms(): void {
    this.isLoading = true;
    this.roomService.getAllRooms().subscribe({
      next: (data) => {
        this.rooms = data;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load rooms');
        this.isLoading = false;
      }
    });
  }

  get filteredRooms(): Room[] {
    let filtered = this.rooms;

    // Apply status filter
    if (this.filterStatus === 'available') {
      filtered = filtered.filter(r => r.isAvailable);
    } else if (this.filterStatus === 'unavailable') {
      filtered = filtered.filter(r => !r.isAvailable);
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.roomNumber.toString().includes(term) ||
        r.roomType?.typeName.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  openForm(room?: Room): void {
    this.showForm = true;
    if (room) {
      this.editingId = room.roomId || null;
      this.roomForm.patchValue({
        roomNumber: room.roomNumber,
        hotelId: room.hotelId,
        roomTypeId: room.roomTypeId,
        isAvailable: room.isAvailable
      });
    } else {
      this.editingId = null;
      this.roomForm.reset({ isAvailable: true });
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.roomForm.reset();
  }

  saveRoom(): void {
    if (this.roomForm.invalid) {
      this.toastr.error('Please fill all required fields');
      return;
    }

    const formValue = this.roomForm.value;
    const room: Room = {
      roomNumber: formValue.roomNumber,
      roomTypeId: formValue.roomTypeId,
      isAvailable: formValue.isAvailable,
      hotelId: formValue.hotelId
    };

    if (this.editingId) {
      room.roomId = this.editingId;
      this.roomService.updateRoom(this.editingId, room).subscribe({
        next: () => {
          this.toastr.success('Room updated successfully');
          this.closeForm();
          this.loadRooms();
        },
        error: () => this.toastr.error('Failed to update room')
      });
    } else {
      this.roomService.createRoom(room, formValue.roomTypeId).subscribe({
        next: () => {
          this.toastr.success('Room created successfully');
          this.closeForm();
          this.loadRooms();
        },
        error: () => this.toastr.error('Failed to create room')
      });
    }
  }

  deleteRoom(id: number): void {
    if (confirm('Are you sure you want to delete this room?')) {
      this.roomService.deleteRoom(id).subscribe({
        next: () => {
          this.toastr.success('Room deleted successfully');
          this.loadRooms();
        },
        error: () => this.toastr.error('Failed to delete room')
      });
    }
  }

  toggleAvailability(room: Room): void {
    const newStatus = !room.isAvailable;
    this.roomService.updateAvailability(room.roomId || 0, newStatus).subscribe({
      next: () => {
        room.isAvailable = newStatus;
        this.toastr.success(`Room ${newStatus ? 'marked available' : 'marked unavailable'}`);
      },
      error: () => this.toastr.error('Failed to update room availability')
    });
  }

  toggleRoomSelection(roomId: number): void {
    if (this.selectedRoomIds.has(roomId)) {
      this.selectedRoomIds.delete(roomId);
    } else {
      this.selectedRoomIds.add(roomId);
    }
    this.showBulkActions = this.selectedRoomIds.size > 0;
  }

  isRoomSelected(roomId: number): boolean {
    return this.selectedRoomIds.has(roomId);
  }

  bulkMarkAvailable(): void {
    if (this.selectedRoomIds.size === 0) {
      this.toastr.warning('No rooms selected');
      return;
    }

    const roomIds = Array.from(this.selectedRoomIds);
    this.roomService.bulkUpdateRoomStatus({
      roomIds,
      isAvailable: true
    }).subscribe({
      next: () => {
        this.toastr.success(`${roomIds.length} rooms marked available`);
        this.selectedRoomIds.clear();
        this.showBulkActions = false;
        this.loadRooms();
      },
      error: () => this.toastr.error('Failed to bulk update rooms')
    });
  }

  bulkMarkUnavailable(): void {
    if (this.selectedRoomIds.size === 0) {
      this.toastr.warning('No rooms selected');
      return;
    }

    const roomIds = Array.from(this.selectedRoomIds);
    this.roomService.bulkUpdateRoomStatus({
      roomIds,
      isAvailable: false
    }).subscribe({
      next: () => {
        this.toastr.success(`${roomIds.length} rooms marked unavailable`);
        this.selectedRoomIds.clear();
        this.showBulkActions = false;
        this.loadRooms();
      },
      error: () => this.toastr.error('Failed to bulk update rooms')
    });
  }

  clearSelection(): void {
    this.selectedRoomIds.clear();
    this.showBulkActions = false;
  }

  getHotelName(hotelId?: number): string {
    if (!hotelId) return 'N/A';
    const hotel = this.hotels.find(h => h.hotelId === hotelId);
    return hotel ? hotel.name : 'Unknown';
  }
}
