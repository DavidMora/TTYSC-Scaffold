import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatInput } from '@/components/AnalysisChat/ChatInput';
const { useAutoSave } = require('@/hooks/useAutoSave'); // eslint-disable-line @typescript-eslint/no-require-imports

// Mock the hooks
const mockActivateAutosaveUI = jest.fn();
const mockUpdateChat = jest.fn();

jest.mock('@/contexts/AutosaveUIProvider', () => ({
  useAutosaveUI: () => ({
    activateAutosaveUI: mockActivateAutosaveUI,
  }),
}));

jest.mock('@/hooks/useAutoSave', () => ({
  useAutoSave: jest.fn(),
}));

jest.mock('@/hooks/chats', () => ({
  useUpdateChat: () => ({
    mutate: mockUpdateChat,
  }),
}));

// Mock useParams to return an id
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'test-chat-id' }),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

const mockOnSendMessage = jest.fn();

describe('ChatInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Sending messages', () => {
    it('clears input state after sending message via Enter key', () => {
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          isLoading={false}
          draft=""
        />
      );
      const textarea: HTMLTextAreaElement = screen.getByPlaceholderText(
        'Write your lines here'
      );

      // Set input value
      fireEvent.input(textarea, { target: { value: 'Test message' } });
      expect(textarea.value).toBe('Test message');

      // Send message via Enter key
      fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

      // Verify input is cleared
      expect(textarea.value).toBe('');
      expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
    });

    it('does not send when input is empty', () => {
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          isLoading={false}
          draft=""
        />
      );
      const button = screen.getByRole('button');

      fireEvent.click(button);

      expect(mockOnSendMessage).not.toHaveBeenCalled();
    });

    it('does not send message when enter key is pressed and shift key is pressed', () => {
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          isLoading={false}
          draft=""
        />
      );
      const textarea = screen.getByPlaceholderText('Write your lines here');

      fireEvent.input(textarea, { target: { value: 'Test message' } });
      fireEvent.keyDown(textarea, {
        key: 'Enter',
        code: 'Enter',
        shiftKey: true,
      });

      expect(mockOnSendMessage).not.toHaveBeenCalled();
    });
  });

  describe('useAutoSave integration', () => {
    it('should call activateAutosaveUI when useAutoSave onSuccess is triggered', () => {
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          isLoading={false}
          draft=""
        />
      );

      const useAutoSaveCall = useAutoSave.mock.calls[0][0];
      useAutoSaveCall.onSuccess();

      expect(mockActivateAutosaveUI).toHaveBeenCalled();
    });

    it('should call onError when useAutoSave onError is triggered', () => {
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          isLoading={false}
          draft=""
        />
      );

      const useAutoSaveCall = useAutoSave.mock.calls[0][0];
      useAutoSaveCall.onError();
    });

    it('should call updateChat with correct parameters when onSave is triggered', async () => {
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          isLoading={false}
          draft=""
        />
      );

      const useAutoSaveCall = useAutoSave.mock.calls[0][0];

      mockUpdateChat.mockResolvedValue(undefined);

      await useAutoSaveCall.onSave();

      expect(mockUpdateChat).toHaveBeenCalledWith({
        id: 'test-chat-id',
        draft: '',
      });
    });
  });
});
