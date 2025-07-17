import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../auth/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-button',
  templateUrl: './chat-button.component.html',
  styleUrls: ['./chat-button.component.css']
})
export class ChatButtonComponent implements OnInit, OnDestroy {
  public static openChat: () => void; 
  unreadCount = 0;
  isChatOpen = false;
  isCandidate = false;
  isCompany = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.checkUserRole();
    this.subscribeToChatUpdates();
    ChatButtonComponent.openChat = () => this.toggleChat();

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
        ChatButtonComponent.openChat = () => {};

  }

 

  private checkUserRole(): void {
    const rolesSub = this.authService.roles$.subscribe({
      next: (roles) => {
        this.isCandidate = roles.includes('ROLE_CANDIDATE');
        this.isCompany = roles.includes('ROLE_COMPANY');
        if (!this.isCandidate && !this.isCompany) {
          console.warn('User does not have a valid role for chat.');
        }
        // Cargar datos iniciales después de obtener los roles
        this.loadInitialData();
      },
      error: (error) => {
        console.error('Error fetching user roles:', error);
        this.isCandidate = false;
        this.isCompany = false;
      }
    });

    this.subscriptions.push(rolesSub);
  }

  private subscribeToChatUpdates(): void {
    const unreadSub = this.chatService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
    this.subscriptions.push(unreadSub);
  }

  private loadInitialData(): void {
    if (this.isCandidate || this.isCompany) {
      // Esperar a que el usuario se inicialice completamente antes de cargar conversaciones
      this.chatService.waitForUserInitialization().then(() => {
        this.chatService.loadConversations();
      });
    }
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
    if (!this.isChatOpen) {
      this.chatService.setActiveConversation(null);
    }
  }

  shouldShowButton(): boolean {
    return this.isCandidate || this.isCompany;
  }
}
