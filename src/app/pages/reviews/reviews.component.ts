import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../models/models';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.css'
})
export class ReviewsComponent implements OnInit {
  reviews: Review[] = [];
  isLoading = true;
  averageRating: number = 0;
  searchKeyword: string = '';
  currentFilter: string = 'All';

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.fetchAllData();
  }

  fetchAllData() {
    this.loadAverageRating();
    this.loadAllReviews();
  }

  loadAverageRating() {
    this.reviewService.getAverageRating().subscribe({
      next: (val) => this.averageRating = val,
      error: (err) => console.error('Failed to load average rating', err)
    });
  }

  loadAllReviews() {
    this.setLoadingState('All');
    this.reviewService.getAllReviews().subscribe(this.getObserver());
  }

  loadLatestReviews() {
    this.setLoadingState('Latest');
    this.reviewService.getLatestReviews().subscribe(this.getObserver());
  }

  filterByRating(rating: number) {
    this.setLoadingState(`${rating} Stars`);
    this.reviewService.getReviewsByRating(rating).subscribe(this.getObserver());
  }

  searchReviews() {
    if (!this.searchKeyword.trim()) {
      this.loadAllReviews();
      return;
    }
    this.setLoadingState(`Search: "${this.searchKeyword}"`);
    this.reviewService.searchReviews(this.searchKeyword).subscribe(this.getObserver());
  }

  private setLoadingState(filterName: string) {
    this.currentFilter = filterName;
    this.isLoading = true;
    this.reviews = [];
  }

  private getObserver() {
    return {
      next: (data: Review[]) => {
        this.reviews = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load reviews', err);
        this.isLoading = false;
      }
    };
  }
}
