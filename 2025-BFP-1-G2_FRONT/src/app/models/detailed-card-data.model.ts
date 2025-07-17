import { FormGroup } from '@angular/forms';
import { Tag } from './tag.model';


export interface DetailedCardData {
  id: number;
  title: string;
  editableTitle?: string;
  titleLabel?: string;
  subtitle?: string;
  subtitleLabel?: string;
  content: string;
  contentLabel?: string;
  editable?: boolean;
  form?: FormGroup;
  metadata?: { [key: string]: any; };
  candidates?: any[];
  actions?: DetailedCardAction[];
  tags?: Tag[];
}export interface DetailedCardAction {
  label: string;
  action: string;
  color?: string;
  icon?: string;
  data?: any;
}

