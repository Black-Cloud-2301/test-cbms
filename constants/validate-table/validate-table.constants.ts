export interface IValidateTableColumn {
  title?: string;
  type: 'text' | 'link' | 'currency' | 'checkbox' | 'number' | 'date' | 'action';
  align?: 'center' | 'left' | 'right';
  optionValue?: string | string[];
  require?: boolean;
  format?: string;
}