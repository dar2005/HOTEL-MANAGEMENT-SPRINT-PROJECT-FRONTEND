import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation.service';
import { Reservation } from '../../models/models';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, NavbarComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  username: string = 'User';
  email: string = '';
  phone: string = '';
  address: string = '';
  role: string = 'USER';
  memberSince: string = '';
  profileImage: string | null = null;

  totalBookings: number = 0;
  upcomingBookings: number = 0;
  completedBookings: number = 0;
  isLoading = true;

  recentReservations: Reservation[] = [];

  // Edit Modal
  showEditModal = false;
  profileForm: FormGroup;
  tempImagePreview: string | null = null;

  constructor(
    private authService: AuthService,
    private reservationService: ReservationService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.profileForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfileData();
    this.loadUserReservations();
  }

  loadProfileData(): void {
    this.username = localStorage.getItem('username') || 'Guest User';
    this.email = localStorage.getItem('email') || 'Not available';
    this.phone = localStorage.getItem('phone') || '';
    this.address = localStorage.getItem('address') || '';
    this.role = localStorage.getItem('role') || 'USER';
    this.memberSince = localStorage.getItem('memberSince') || new Date().getFullYear().toString();
    this.profileImage = localStorage.getItem('profileImage');
  }

  loadUserReservations(): void {
    this.reservationService.getAllReservations().subscribe({
      next: (res) => {
        // Filter exactly like DashboardComponent
        let userBookings = res;
        
        // Only filter if not ADMIN. (If admin wants to see all bookings here, they can, 
        // but profile should ideally show THEIR OWN bookings. Let's filter by their ID/email anyway to be strict)
        const myUserIdStr = localStorage.getItem('userId');
        const myEmail = localStorage.getItem('email');
        const myBookingIdsRaw = localStorage.getItem('my_booking_ids');
        const myBookingIds: number[] = myBookingIdsRaw ? JSON.parse(myBookingIdsRaw) : [];

        userBookings = res.filter(r => {
          const isOwnerById = myUserIdStr && r.userId && r.userId.toString() === myUserIdStr;
          const isOwnerByEmail = myEmail && r.guestEmail && r.guestEmail.toLowerCase() === myEmail.toLowerCase();
          const isOwnerByLocalId = r.reservationId && myBookingIds.includes(r.reservationId);
          return isOwnerById || isOwnerByEmail || isOwnerByLocalId;
        });

        this.totalBookings = userBookings.length;
        const today = new Date();
        this.upcomingBookings = userBookings.filter(r => new Date(r.checkInDate) >= today).length;
        this.completedBookings = userBookings.filter(r => new Date(r.checkOutDate) < today).length;
        
        // Show 5 most recent
        this.recentReservations = userBookings.sort((a, b) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime()).slice(0, 5);
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

  // --- Modal Logic ---

  openEditModal(): void {
    this.profileForm.patchValue({
      username: this.username,
      email: this.email !== 'Not available' ? this.email : '',
      phone: this.phone,
      address: this.address
    });
    this.tempImagePreview = this.profileImage;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.tempImagePreview = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.match(/image\/*/)) {
        this.toastr.error('Only images are supported');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.tempImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.toastr.error('Please check your input fields');
      return;
    }

    const val = this.profileForm.value;
    
    // Save to local storage to persist
    localStorage.setItem('username', val.username);
    localStorage.setItem('email', val.email);
    localStorage.setItem('phone', val.phone);
    localStorage.setItem('address', val.address);
    if (this.tempImagePreview) {
      localStorage.setItem('profileImage', this.tempImagePreview);
    } else {
      localStorage.removeItem('profileImage');
    }

    this.toastr.success('Profile updated successfully');
    
    // Reload local data
    this.loadProfileData();
    this.closeEditModal();
  }
}
