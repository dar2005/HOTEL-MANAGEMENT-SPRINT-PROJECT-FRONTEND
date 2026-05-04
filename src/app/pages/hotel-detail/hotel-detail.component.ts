import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HotelService } from '../../services/hotel.service';
import { Hotel } from '../../models/models';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule],
  templateUrl: './hotel-detail.component.html',
  styleUrl: './hotel-detail.component.css'
})
export class HotelDetailComponent implements OnInit {
  hotel: Hotel | null = null;
  isLoading = true;
  errorMsg = '';
  hotelId: number = 0;

  readonly hotelImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=85',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=85',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=85',
  ];

  readonly amenities = [
    { icon: 'bi-water', label: 'Swimming Pool' },
    { icon: 'bi-heart-pulse', label: 'Spa & Wellness' },
    { icon: 'bi-cup-hot', label: 'Restaurant & Bar' },
    { icon: 'bi-wifi', label: 'Free High-Speed WiFi' },
    { icon: 'bi-p-circle', label: 'Valet Parking' },
    { icon: 'bi-wind', label: 'Air Conditioning' },
    { icon: 'bi-tv', label: 'Smart TV' },
    { icon: 'bi-shield-check', label: '24/7 Security' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hotelService: HotelService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.hotelId = +id;
      this.loadHotel(this.hotelId);
    }
  }

  loadHotel(id: number) {
    this.isLoading = true;
    this.errorMsg = '';
    this.hotelService.getHotelById(id).subscribe({
      next: (data) => {
        this.hotel = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Hotel not found or server is unreachable.';
        this.isLoading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/hotels']);
  }
}
