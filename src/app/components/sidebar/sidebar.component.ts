import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  @Input() role: 'USER' | 'ADMIN' = 'USER';
  displayName: string = 'Account';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const savedName = localStorage.getItem('username');
    if (savedName) {
      // Show first name only for a clean sidebar
      this.displayName = savedName.split(' ')[0] || savedName;
    }

    // Always check localStorage for role (works in both production and development)
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      this.role = storedRole as 'USER' | 'ADMIN';
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
