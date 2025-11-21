import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IForumPost } from '../../../interfaces';
import { AlertService } from '../../../services/alert.service';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-forum-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './forum-list.component.html',
  styleUrls: ['./forum-list.component.scss'] 
})
export class ForumListComponent {
  @Input() forumPosts: IForumPost[] = [];
  @Input() currentUserName: string = '';
  @Output() callEditMethod = new EventEmitter<IForumPost>();
  @Output() callDeleteMethod = new EventEmitter<IForumPost>();
  @Output() callOpenDetails = new EventEmitter<IForumPost>();

  private alertService = inject(AlertService);
  private modalService = inject(ModalService);

  loading = signal(false);

  onEdit(post: IForumPost): void {
    this.callEditMethod.emit(post);
  }

  onDelete(post: IForumPost): void {
    this.callDeleteMethod.emit(post);
  }

  openDetails(post: IForumPost): void {
    this.callOpenDetails.emit(post);
  }

  isOwner(post: IForumPost): boolean {
    return post.authorName === this.currentUserName;
  }
}
