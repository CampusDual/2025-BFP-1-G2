import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { environment } from '../../environments/environment';
import { Message, ChatConversation } from '../models/chat.models';
import { AuthService } from '../auth/services/auth.service';
import { Candidate } from '../models/candidate.model';
import { Company } from '../models/company.model';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private baseUrl = `${environment.apiUrl}/chat`;

    private unreadCountSubject = new BehaviorSubject<number>(0);
    private conversationsSubject = new BehaviorSubject<ChatConversation[]>([]);
    private activeConversationSubject = new BehaviorSubject<ChatConversation | null>(null);
    private messagesSubject = new BehaviorSubject<Message[]>([]);
    private currentUserId: number | null = null;
    private currentUserType: 'CANDIDATE' | 'COMPANY' | null = null;

    public unreadCount$ = this.unreadCountSubject.asObservable();
    public conversations$ = this.conversationsSubject.asObservable();
    public activeConversation$ = this.activeConversationSubject.asObservable();
    public messages$ = this.messagesSubject.asObservable();

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {
        this.initializeUserInfo();
        interval(50000).subscribe(() => {
            if (this.conversationsSubject.value.length > 0 && this.currentUserId) {
                this.refreshConversations();
            }
        });
    }

    private initializeUserInfo(): void {
        this.authService.roles$.subscribe({
            next: (roles) => {
                if (roles.includes('ROLE_CANDIDATE')) {
                    this.currentUserType = 'CANDIDATE';
                    this.authService.getCandidateDetails().subscribe({
                        next: (candidate: Candidate) => {
                            this.currentUserId = candidate.id;
                            console.log('Chat initialized for candidate:', this.currentUserId);
                        },
                        error: (error) => console.error('Error getting candidate ID:', error)
                    });
                } else if (roles.includes('ROLE_COMPANY')) {
                    this.currentUserType = 'COMPANY';
                    this.authService.getCompanyDetails().subscribe({
                        next: (company: Company) => {
                            this.currentUserId = company.id;
                            console.log('Chat initialized for company:', this.currentUserId);
                        },
                        error: (error) => console.error('Error getting company ID:', error)
                    });
                } else {
                    console.warn('User does not have a valid role for chat.');
                    this.currentUserType = null;
                    this.currentUserId = null;
                }
            },
            error: (error) => {
                console.error('Error fetching user roles:', error);
                this.currentUserType = null;
                this.currentUserId = null;
            }
        });
    }

    sendMessage(receiverId: number, content: string): Observable<Message> {
        const messageDTO = {
            senderId: this.currentUserId,
            receiverId: receiverId,
            content: content,
            senderType: this.currentUserType
        };
        return this.http.post<Message>(`${this.baseUrl}/send`, messageDTO);
    }   

    getConversations(): Observable<ChatConversation[]> {
        if (!this.currentUserId || !this.currentUserType) {
            console.warn('User ID or type not available for loading conversations');
            return new Observable(observer => observer.next([]));
        }
        
        const params = new HttpParams().set('userType', this.currentUserType);
        return this.http.get<ChatConversation[]>(`${this.baseUrl}/conversations`, { params });
    }

    loadConversations(): void {
        this.getConversations().subscribe({
            next: (conversations) => {
                this.conversationsSubject.next(conversations);
                const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
                this.unreadCountSubject.next(totalUnread);
            },
            error: (error) => {
                console.error('Error loading conversations:', error);
            }
        });
    }

    refreshConversations(): void {
        this.loadConversations();
    }

    getMessages(otherUserId: number): Observable<Message[]> {
        if (!this.currentUserId || !this.currentUserType) {
            console.warn('User ID or type not available for loading messages');
            return new Observable(observer => observer.next([]));
        }
        
        const params = new HttpParams().set('userType', this.currentUserType);
        console.log(`Fetching messages for user ${this.currentUserId} with other user ${otherUserId}`);
        return this.http.get<Message[]>(`${this.baseUrl}/conversation/${otherUserId}`, { params });
    }

    getMessagesPaged(otherUserId: number, page: number = 0, size: number = 20): Observable<any> {
        if (!this.currentUserId) {
            return new Observable(observer => observer.next({ content: [] }));
        }

        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get<any>(`${this.baseUrl}/conversation/${this.currentUserId}/${otherUserId}/paged`, { params });
    }

    loadMessages(otherUserId: number): void {
        this.getMessages(otherUserId).subscribe({
            next: (messages) => {
                this.messagesSubject.next(messages);
                // Marcar mensajes como leídos y actualizar el contador
                this.markMessagesAsRead(otherUserId).subscribe({
                    next: (markedCount) => {
                        console.log(`Marked ${markedCount} messages as read`);
                        // Recargar conversaciones para actualizar el contador de no leídos
                        this.refreshConversations();
                    },
                    error: (error) => {
                        console.error('Error marking messages as read:', error);
                    }
                });
            },
            error: (error) => {
                console.error('Error loading messages:', error);
            }
        });
    }

    sendMessageAndUpdate(otherUserId: number, content: string): void {
        this.sendMessage(otherUserId, content).subscribe({
            next: (newMessage) => {
                const currentMessages = this.messagesSubject.value;
                this.messagesSubject.next([...currentMessages, newMessage]);
                this.refreshConversations();
            },
            error: (error) => {
                console.error('Error sending message:', error);
            }
        });
    }

    markMessagesAsRead(otherUserId: number): Observable<number> {
        if (!this.currentUserId || !this.currentUserType) {
            console.warn('User ID or type not available for marking messages as read');
            return new Observable(observer => observer.next(0));
        }

        const params = new HttpParams().set('userType', this.currentUserType);
        return this.http.put<number>(`${this.baseUrl}/markread/${otherUserId}`, null, { params });
    }

    findConversation(candidateId: number, companyId: number): Observable<ChatConversation> {
        return this.http.get<ChatConversation>(`${this.baseUrl}/conversation/find/${candidateId}/${companyId}`);
    }

    startConversation(candidateId: number): void {
        if (!this.currentUserId || this.currentUserType !== 'COMPANY') {
            console.error('Solo las empresas pueden iniciar conversaciones con candidatos');
            return;
        }

        this.findConversation(candidateId, this.currentUserId).subscribe({
            next: (conversation) => {
                this.setActiveConversation(conversation);
                this.loadConversations();
            },
            error: (error) => {
                if (error.status === 404) {
                    this.sendMessage(candidateId, 'Hola, me interesa conocer más sobre tu perfil profesional.').subscribe({
                        next: () => {
                            this.loadConversations();
                            setTimeout(() => {
                                this.findConversation(candidateId, this.currentUserId!).subscribe({
                                    next: (newConversation) => {
                                        this.setActiveConversation(newConversation);
                                    }
                                });
                            }, 1000);
                        },
                        error: (sendError) => {
                            console.error('Error creating conversation:', sendError);
                        }
                    });
                } else {
                    console.error('Error finding conversation:', error);
                }
            }
        });
    }

    setActiveConversation(conversation: ChatConversation | null): void {
        this.activeConversationSubject.next(conversation);
        if (conversation) {
            let otherUserId: number;
            if (this.currentUserType === 'CANDIDATE') {
                otherUserId = conversation.companyId;
            } else {
                otherUserId = conversation.candidateId;
            }
            this.loadMessages(otherUserId);
        } else {
            this.messagesSubject.next([]);
        }
    }

    getUnreadCount(): number {
        return this.unreadCountSubject.value;
    }

    clearChatState(): void {
        this.conversationsSubject.next([]);
        this.activeConversationSubject.next(null);
        this.messagesSubject.next([]);
        this.unreadCountSubject.next(0);
    }

    getCurrentUserId(): number | null {
        return this.currentUserId;
    }

    // Método para obtener el tipo de usuario actual (helper)
    getCurrentUserType(): 'CANDIDATE' | 'COMPANY' | null {
        return this.currentUserType;
    }

    // Método para verificar si el usuario está completamente inicializado
    isUserInitialized(): boolean {
        return this.currentUserId !== null && this.currentUserType !== null;
    }

    // Método para esperar a que el usuario se inicialice
    waitForUserInitialization(): Promise<void> {
        return new Promise((resolve) => {
            if (this.isUserInitialized()) {
                resolve();
                return;
            }
            
            const checkInterval = setInterval(() => {
                if (this.isUserInitialized()) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
            
            // Timeout después de 10 segundos
            setTimeout(() => {
                clearInterval(checkInterval);
                console.warn('User initialization timeout');
                resolve();
            }, 10000);
        });
    }

}
