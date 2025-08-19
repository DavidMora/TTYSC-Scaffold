import { render, screen, fireEvent } from '@testing-library/react';
import TestStreamPage from '@/app/(main)/test-stream/page';
import { useChatStream } from '@/hooks/chats/stream';

// Mock the useChatStream hook
jest.mock('@/hooks/chats/stream');
const mockUseChatStream = useChatStream as jest.MockedFunction<
  typeof useChatStream
>;

describe('TestStreamPage', () => {
  const mockChatStreamHook = {
    start: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
    isStreaming: false,
    aggregatedContent: '',
    steps: [],
    finishReason: null,
    metadata: null,
    error: null,
    chunks: [],
    lastChunk: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseChatStream.mockReturnValue(mockChatStreamHook);
  });

  it('should render the test stream page', () => {
    render(<TestStreamPage />);

    expect(screen.getByText('Test Chat Stream')).toBeInTheDocument();
    expect(screen.getByLabelText('Modelo')).toBeInTheDocument();
    expect(screen.getByLabelText('Prompt')).toBeInTheDocument();
  });

  it('should have default values in form fields', () => {
    render(<TestStreamPage />);

    const modelInput = screen.getByLabelText('Modelo') as HTMLInputElement;
    const promptTextarea = screen.getByLabelText(
      'Prompt'
    ) as HTMLTextAreaElement;

    expect(modelInput.value).toBe('supply_chain_workflow');
    expect(promptTextarea.value).toBe(
      'Hola, genera un resumen de la cadena de suministro.'
    );
  });

  it('should update model input when changed', () => {
    render(<TestStreamPage />);

    const modelInput = screen.getByLabelText('Modelo') as HTMLInputElement;
    fireEvent.change(modelInput, { target: { value: 'new-model' } });

    expect(modelInput.value).toBe('new-model');
  });

  it('should update prompt textarea when changed', () => {
    render(<TestStreamPage />);

    const promptTextarea = screen.getByLabelText(
      'Prompt'
    ) as HTMLTextAreaElement;
    fireEvent.change(promptTextarea, { target: { value: 'New prompt text' } });

    expect(promptTextarea.value).toBe('New prompt text');
  });

  it('should call start when send button is clicked', () => {
    render(<TestStreamPage />);

    // Ensure prompt has content
    const promptTextarea = screen.getByLabelText(
      'Prompt'
    ) as HTMLTextAreaElement;
    fireEvent.change(promptTextarea, {
      target: { value: 'Valid prompt content' },
    });

    const sendButton = screen.getByRole('button', { name: /enviar/i });
    fireEvent.click(sendButton);

    expect(mockChatStreamHook.start).toHaveBeenCalledWith({
      messages: [
        {
          role: 'user',
          content: 'Valid prompt content',
        },
      ],
      model: 'supply_chain_workflow',
      temperature: 0,
      max_tokens: 0,
      top_p: 0,
    });
  });

  it('should not call start when prompt is empty', () => {
    render(<TestStreamPage />);

    const promptTextarea = screen.getByLabelText(
      'Prompt'
    ) as HTMLTextAreaElement;
    fireEvent.change(promptTextarea, { target: { value: '' } });

    const sendButton = screen.getByRole('button', { name: /enviar/i });
    fireEvent.click(sendButton);

    expect(mockChatStreamHook.start).not.toHaveBeenCalled();
  });

  it('should not call start when prompt is only whitespace', () => {
    render(<TestStreamPage />);

    const promptTextarea = screen.getByLabelText(
      'Prompt'
    ) as HTMLTextAreaElement;
    fireEvent.change(promptTextarea, { target: { value: '   \n  \t  ' } });

    const sendButton = screen.getByRole('button', { name: /enviar/i });
    fireEvent.click(sendButton);

    expect(mockChatStreamHook.start).not.toHaveBeenCalled();
  });

  it('should call stop when stop button is clicked', () => {
    mockUseChatStream.mockReturnValue({
      ...mockChatStreamHook,
      isStreaming: true,
    });

    render(<TestStreamPage />);

    const stopButton = screen.getByRole('button', { name: /detener/i });
    fireEvent.click(stopButton);

    expect(mockChatStreamHook.stop).toHaveBeenCalled();
  });

  it('should call reset when reset button is clicked', () => {
    render(<TestStreamPage />);

    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);

    expect(mockChatStreamHook.stop).toHaveBeenCalled();
    expect(mockChatStreamHook.reset).toHaveBeenCalled();
  });

  it('should disable send button when streaming', () => {
    mockUseChatStream.mockReturnValue({
      ...mockChatStreamHook,
      isStreaming: true,
    });

    render(<TestStreamPage />);

    const sendButton = screen.getByRole('button', {
      name: /transmitiendo.../i,
    });
    expect(sendButton).toBeDisabled();
  });

  it('should disable send button when prompt is empty', () => {
    render(<TestStreamPage />);

    const promptTextarea = screen.getByLabelText(
      'Prompt'
    ) as HTMLTextAreaElement;
    fireEvent.change(promptTextarea, { target: { value: '' } });

    const sendButton = screen.getByRole('button', { name: /enviar/i });
    expect(sendButton).toBeDisabled();
  });

  it('should disable stop button when not streaming', () => {
    render(<TestStreamPage />);

    const stopButton = screen.getByRole('button', { name: /detener/i });
    expect(stopButton).toBeDisabled();
  });

  it('should display streaming state correctly', () => {
    mockUseChatStream.mockReturnValue({
      ...mockChatStreamHook,
      isStreaming: true,
    });

    render(<TestStreamPage />);

    expect(screen.getByText('Estado: Streaming')).toBeInTheDocument();
  });

  it('should display finished state correctly', () => {
    mockUseChatStream.mockReturnValue({
      ...mockChatStreamHook,
      finishReason: 'stop',
    });

    render(<TestStreamPage />);

    expect(screen.getByText('Estado: Finalizado')).toBeInTheDocument();
    expect(screen.getByText('finish_reason: stop')).toBeInTheDocument();
  });

  it('should display error state correctly', () => {
    mockUseChatStream.mockReturnValue({
      ...mockChatStreamHook,
      error: 'Test error message',
    });

    render(<TestStreamPage />);

    expect(screen.getByText('Error: Test error message')).toBeInTheDocument();
  });

  it('should display aggregated content', () => {
    mockUseChatStream.mockReturnValue({
      ...mockChatStreamHook,
      aggregatedContent: 'This is the aggregated content',
    });

    render(<TestStreamPage />);

    expect(
      screen.getByText('This is the aggregated content')
    ).toBeInTheDocument();
  });

  it('should display workflow steps', () => {
    mockUseChatStream.mockReturnValue({
      ...mockChatStreamHook,
      steps: [
        {
          ts: '2023-01-01T00:00:00Z',
          step: 'initialization',
          workflow_status: 'started',
          data: { progress: 0.1 },
        },
        {
          ts: '2023-01-01T00:00:01Z',
          step: 'processing',
          workflow_status: 'in_progress',
        },
      ],
    });

    render(<TestStreamPage />);

    expect(screen.getByText('initialization')).toBeInTheDocument();
    expect(screen.getByText('processing')).toBeInTheDocument();
    expect(screen.getByText('[started]')).toBeInTheDocument();
    expect(screen.getByText('[in_progress]')).toBeInTheDocument();
  });

  it('should display metadata when available', () => {
    const metadata = {
      original_query: 'test query',
      final_query: 'processed query',
      execution_plan: {
        complexity: 'simple',
        entities_referenced: {},
        data_sources_needed: ['test_db'],
        reasoning: 'test reasoning',
        steps: ['step1'],
        parallel_steps: [],
      },
      selected_data_source: 'test_db',
      entity_validation: {
        valid: ['entity1'],
        inferred: {},
      },
      generated_sql: 'SELECT * FROM test',
      query_results: {
        success: true,
        limited_to: -1,
        truncated: false,
        dataframe_records: [],
      },
      completed_steps: ['step1'],
      error: null,
    };

    mockUseChatStream.mockReturnValue({
      ...mockChatStreamHook,
      metadata,
    });

    render(<TestStreamPage />);

    // Check for a part of the metadata that should be visible
    expect(screen.getByText(/test query/)).toBeInTheDocument();
  });

  it('should display chunks information', () => {
    mockUseChatStream.mockReturnValue({
      ...mockChatStreamHook,
      chunks: [
        {
          id: 'chunk1',
          object: 'chat.completion.chunk',
          model: 'test-model',
          created: '2023-01-01T00:00:00Z',
          choices: [],
        },
        {
          id: 'chunk2',
          object: 'chat.completion.chunk',
          model: 'test-model',
          created: '2023-01-01T00:00:01Z',
          choices: [],
        },
      ],
    });

    render(<TestStreamPage />);

    expect(screen.getByText('Ver chunks (2)')).toBeInTheDocument();
  });

  it('should call reset before starting when send is clicked', () => {
    render(<TestStreamPage />);

    const sendButton = screen.getByRole('button', { name: /enviar/i });
    fireEvent.click(sendButton);

    expect(mockChatStreamHook.reset).toHaveBeenCalled();
    expect(mockChatStreamHook.start).toHaveBeenCalled();
  });

  it('should display steps without workflow_status', () => {
    mockUseChatStream.mockReturnValue({
      ...mockChatStreamHook,
      steps: [
        {
          ts: '2023-01-01T00:00:00Z',
          step: 'processing',
        },
      ],
    });

    render(<TestStreamPage />);

    expect(screen.getByText('processing')).toBeInTheDocument();
    // Should not show workflow status since it's undefined
    expect(screen.queryByText(/\[.*\]/)).not.toBeInTheDocument();
  });

  it('should display step without step name as "(step)"', () => {
    mockUseChatStream.mockReturnValue({
      ...mockChatStreamHook,
      steps: [
        {
          ts: '2023-01-01T00:00:00Z',
        },
      ],
    });

    render(<TestStreamPage />);

    expect(screen.getByText('(step)')).toBeInTheDocument();
  });

  it('should display step data in details element', () => {
    mockUseChatStream.mockReturnValue({
      ...mockChatStreamHook,
      steps: [
        {
          ts: '2023-01-01T00:00:00Z',
          step: 'processing',
          data: { progress: 0.5, status: 'running' },
        },
      ],
    });

    render(<TestStreamPage />);

    expect(screen.getByText('data')).toBeInTheDocument();
    expect(screen.getByText('processing')).toBeInTheDocument();
  });
});
