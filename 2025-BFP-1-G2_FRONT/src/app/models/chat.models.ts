export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: Date;
  read: boolean;
  senderType: 'CANDIDATE' | 'COMPANY';
}

export interface ChatConversation {
  id: number;
  candidateId: number;
  candidateName: string;
  candidateAvatar?: string;
  companyId: number;
  companyName: string;
  companyLogo?: string;
  lastMessage?: Message;
  unreadCount: number;
  lastActivity: Date;
}