import '@testing-library/jest-dom';
import { vi } from 'vitest';

Object.defineProperty(window, 'location', {
  writable: true,
  value: { hash: '', href: 'http://localhost/', assign: vi.fn(), reload: vi.fn() },
});

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn(), loading: vi.fn() },
  Toaster: () => null,
}));

vi.mock('../infra/messaging/EventBus', () => ({
  EventBus: { publish: vi.fn(), subscribe: vi.fn() },
}));

vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});
