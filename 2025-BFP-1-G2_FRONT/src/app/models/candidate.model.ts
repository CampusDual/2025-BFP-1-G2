import { Tag } from './tag.model';


export interface Candidate {
  id: number;
  login: string;
  name: string;
  surname1: string;
  surname2: string;
  email: string;
  phoneNumber: string;
  date: string;
  Linkedin?: string;
  dateAdded: string;
  valid: boolean | null;
  logoImageBase64?: string;
  tagIds?: Tag[];
}
