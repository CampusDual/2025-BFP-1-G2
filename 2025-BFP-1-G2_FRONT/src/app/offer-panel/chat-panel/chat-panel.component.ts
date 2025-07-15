import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../auth/services/auth.service';
import { ChatConversation, Message } from '../../models/chat.models';
import { Subscription } from 'rxjs';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-chat-panel',
  templateUrl: './chat-panel.component.html',
  styleUrls: ['./chat-panel.component.css']
})
export class ChatPanelComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Output() onClose = new EventEmitter<void>();
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  conversations: ChatConversation[] = [];
  activeConversation: ChatConversation | null = null;
  messages: Message[] = [];
  messageControl = new FormControl('', [Validators.required]);

  isCandidate = false;
  isCompany = false;
  isLoading = false;
  isLoadingConversations = false;
  isLoadingMessages = false;
  isSending = false;

  currentView: 'conversations' | 'chat' = 'conversations';

  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom = false;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.checkUserRole();
    this.subscribeToUpdates();
    // loadData() se llama desde checkUserRole() después de obtener los roles
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private checkUserRole(): void {
    const rolesSub = this.authService.roles$.subscribe({
      next: (roles) => {
        this.isCandidate = roles.includes('ROLE_CANDIDATE');
        this.isCompany = roles.includes('ROLE_COMPANY');
        if (!this.isCandidate && !this.isCompany) {
          console.warn('User does not have a valid role for chat.');
        }
        // Cargar datos después de obtener los roles
        this.loadData();
        this.checkIfLoadingComplete();
      },
      error: (error) => {
        console.error('Error fetching user roles:', error);
        this.isCandidate = false;
        this.isCompany = false;
        this.isLoading = false; // Desactivar loading en caso de error
      }
    });

    this.subscriptions.push(rolesSub);
  }


  private subscribeToUpdates(): void {
    const conversationsSub = this.chatService.conversations$.subscribe(conversations => {
      this.conversations = conversations;
      this.isLoadingConversations = false;
      this.checkIfLoadingComplete();
    });
    
    const activeConversationSub = this.chatService.activeConversation$.subscribe(conversation => {
      this.activeConversation = conversation;
      if (conversation) {
        this.currentView = 'chat';
        this.isLoadingMessages = true; // Activar loading para mensajes
      }
    });
    
    const messagesSub = this.chatService.messages$.subscribe(messages => {
      this.messages = messages;
      this.shouldScrollToBottom = true;
      this.isLoadingMessages = false;
    });


    this.subscriptions.push(conversationsSub, activeConversationSub, messagesSub);
  }

  private loadData(): void {
    if (this.isCandidate || this.isCompany) {
      this.isLoadingConversations = true;
      // Esperar a que el usuario se inicialice completamente antes de cargar conversaciones
      this.chatService.waitForUserInitialization().then(() => {
        this.chatService.loadConversations();
      });
    }
  }
  openConversation(conversation: ChatConversation): void {
    this.chatService.setActiveConversation(conversation);
  }

  sendMessage(): void {
    if (this.messageControl.valid && this.activeConversation && !this.isSending) {
      const content = this.messageControl.value!.trim();
      if (content) {
        this.isSending = true;

        let otherUserId: number;
        if (this.isCandidate) {
          otherUserId = this.activeConversation.companyId;
        } else {
          otherUserId = this.activeConversation.candidateId;
        }

        this.chatService.sendMessageAndUpdate(otherUserId, content);
        this.messageControl.setValue('');
        
        // Desactivar loading después de un delay mínimo
        setTimeout(() => {
          this.isSending = false;
        }, 1000);
      }
    }
  }

  // Manejar Enter para enviar mensaje
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // Volver a la lista de conversaciones
  backToConversations(): void {
    this.currentView = 'conversations';
    this.chatService.setActiveConversation(null);
  }

  // Cerrar el panel
  closePanel(): void {
    this.onClose.emit();
  }

  // Formatear fecha del mensaje
  formatMessageTime(date: string): string {
    const messageDate = new Date(date);
    const now = new Date();
    const diff = now.getTime() - messageDate.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;

    return messageDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  }

  // Formatear fecha de la conversación
  formatConversationTime(date: string): string {
    const conversationDate = new Date(date);
    const now = new Date();
    const diff = now.getTime() - conversationDate.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;

    return conversationDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: conversationDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }

  // Obtener el nombre del contacto
  getContactName(conversation: ChatConversation): string {
    if (this.isCandidate) {
      return conversation.companyName || 'Empresa';
    } else {
      return conversation.candidateName || 'Candidato';
    }
  }

  // Obtener avatar del contacto
  getContactAvatar(conversation: ChatConversation): string {
    if (this.isCandidate) {
      return conversation.companyLogo || '';
    } else {
      return conversation.candidateAvatar || '';
    }
  }

  // Scroll al final del chat
  private scrollToBottom(): void {
    if (this.messagesContainer) {
      try {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      } catch (err) {
        console.error('Error scrolling to bottom:', err);
      }
    }
  }

  // Verificar si el mensaje es del usuario actual
  isMyMessage(message: Message): boolean {
    const currentUserId = this.chatService.getCurrentUserId();
    return message.senderId === currentUserId;
  }

  // TrackBy functions para optimizar el rendering
  trackByConversationId(index: number, conversation: ChatConversation): number {
    return conversation.id;
  }

  trackByMessageId(index: number, message: Message): number {
    return message.id;
  }

  // Método para verificar si todas las operaciones de carga han terminado
  private checkIfLoadingComplete(): void {
    // Solo desactivar loading general cuando tanto roles como conversaciones estén cargados
    if (!this.isLoadingConversations && (this.isCandidate || this.isCompany)) {
      this.isLoading = false;
    }
  }

  // Método para verificar si hay alguna operación de carga activa
  get isAnyLoading(): boolean {
    return this.isLoading || this.isLoadingConversations || this.isLoadingMessages || this.isSending;
  }

  // Método para obtener el mensaje de estado de carga
  get loadingMessage(): string {
    if (this.isLoading) return 'Inicializando chat...';
    if (this.isLoadingConversations) return 'Cargando conversaciones...';
    if (this.isLoadingMessages) return 'Cargando mensajes...';
    if (this.isSending) return 'Enviando mensaje...';
    return '';
  }
}
