import { v4 as uuidv4 } from 'uuid';

export function generateId() {
  return uuidv4();
}

export function generatePropertyNumber(currentCount) {
  const prefix = 'PROP';
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(currentCount + 1).padStart(5, '0')}`;
}
