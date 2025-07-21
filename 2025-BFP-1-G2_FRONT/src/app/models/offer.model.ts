import { Tag } from './tag.model';


export interface Offer {
  id?: number;
  title: string;
  description: string;
  location?: string;
  dateAdded?: Date;
  dateToString?: string;
  tags?: Tag[];
  valid?: Boolean;
  companyId?: number;
  companyName?: string;
  email?: string;
  logo?: string;
  status?: string;
  candidateValid?: boolean;
  isValid?: 'VALID' | 'INVALID' | 'PENDING' | null;
  applied?: boolean;
  bookmarked?: boolean;
}
