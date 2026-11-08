import { checklistRepository } from './ChecklistRepository.js';
import { quantityHistoryRepository } from './QuantityHistoryRepository.js';
import { QuantityHistoryTracker } from './QuantityHistoryTracker.js';

export const quantityHistoryTracker = new QuantityHistoryTracker({
  checklists: checklistRepository,
  histories: quantityHistoryRepository
});
