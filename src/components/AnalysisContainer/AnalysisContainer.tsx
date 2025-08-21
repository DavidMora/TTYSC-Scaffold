'use client';

import AnalysisChat from '@/components/AnalysisChat/AnalysisChat';
import AnalysisFilter from '@/components/AnalysisFilters/AnalysisFilters';
import AnalysisHeader from '@/components/AnalysisHeader/AnalysisHeader';
import { useAnalysisFilters } from '@/hooks/useAnalysisFilters';
import {
  BusyIndicator,
  Button,
  FlexBox,
  FlexBoxDirection,
  Text,
  Title,
} from '@ui5/webcomponents-react';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChat, useCreateChat, useUpdateChat } from '@/hooks/chats';
import { useAutosaveUI } from '@/contexts/AutosaveUIProvider';
import { useAutoSave } from '@/hooks/useAutoSave';
import { INITIAL_FILTERS } from '@/lib/constants/UI/analysisFilters';
import { useSequentialNaming } from '@/contexts/SequentialNamingContext';

// Toggle: enable or disable auto-creation when an analysis (chat) is not found (404)
const ENABLE_AUTO_CREATE_ON_404 = true;

const isNotFoundError = (err: Error | undefined) =>
  !!err &&
  (err.message.includes('HTTP 404') ||
    err.message.toLowerCase().includes('not found'));

const ErrorDisplay = ({
  error,
  onRetry,
}: {
  error: Error;
  onRetry?: () => void;
}) => (
  <FlexBox
    direction={FlexBoxDirection.Column}
    style={{
      padding: '2rem',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: '1rem',
      backgroundColor: 'var(--sapGroup_ContentBackground)',
    }}
  >
    <Title level="H3" style={{ color: 'var(--sapNeutralTextColor)' }}>
      Unable to Load Analysis
    </Title>

    <Text style={{ maxWidth: '400px', color: 'var(--sapNeutralTextColor)' }}>
      {error.message ||
        'Something went wrong while fetching the analysis data. Please try again.'}
    </Text>

    {onRetry && (
      <Button design="Emphasized" onClick={onRetry}>
        Try Again
      </Button>
    )}
  </FlexBox>
);

const LoadingDisplay = () => (
  <FlexBox
    style={{
      padding: '2rem',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <BusyIndicator active size="L" text="Loading analysis..." />
  </FlexBox>
);

export default function AnalysisContainer() {
  const router = useRouter();
  const params = useParams();
  const analysisId = params.id as string;
  const [analysisName, setAnalysisName] = useState<string>('');
  const { generateAnalysisName } = useSequentialNaming();

  const {
    data: analysis,
    error,
    isLoading,
    isValidating,
    mutate: refetchAnalysis,
  } = useChat(analysisId);

  const { filters, availableOptions, isDisabled, handleFilterChange } =
    useAnalysisFilters(
      { ...INITIAL_FILTERS, ...analysis?.data?.metadata },
      () => {
        hasUserModifiedRef.current = true;
      }
    );

  const { activateAutosaveUI, showAutoSaved } = useAutosaveUI();

  const { mutate: updateChat } = useUpdateChat({});

  const createChatMutation = useCreateChat({
    onSuccess: (newChat) => {
      router.replace(`/${newChat.id}`);
    },
  });

  const hasUserModifiedRef = useRef(false);
  const hasAutoCreatedRef = useRef(false);

  useAutoSave({
    valueToWatch: hasUserModifiedRef.current ? filters : undefined,
    onSave: () =>
      void updateChat({
        id: analysisId,
        metadata: {
          analysis: filters.analysis,
          organizations: filters.organizations,
          CM: filters.CM,
          SKU: filters.SKU,
          NVPN: filters.NVPN,
        },
      }),
    delayMs: 3000,
    onSuccess: () => {
      activateAutosaveUI();
    },
    onError: () => {
      console.error('Autosave failed');
    },
  });

  // Auto-create analysis if the requested one does not exist (404)
  useEffect(() => {
    if (!ENABLE_AUTO_CREATE_ON_404) return;

    if (error && isNotFoundError(error) && !hasAutoCreatedRef.current) {
      hasAutoCreatedRef.current = true;
      createChatMutation.mutate?.({ title: generateAnalysisName() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  useEffect(() => {
    if (analysis?.data?.title) {
      setAnalysisName(analysis.data.title);
    }
  }, [analysis?.data]);

  const shouldOfferCreateRetry =
    ENABLE_AUTO_CREATE_ON_404 &&
    !!error &&
    isNotFoundError(error) &&
    !!createChatMutation.error;

  let content;
  if (error) {
    if (shouldOfferCreateRetry) {
      content = (
        <ErrorDisplay
          error={createChatMutation.error as Error}
          onRetry={() =>
            createChatMutation.mutate?.({ title: generateAnalysisName() })
          }
        />
      );
    } else {
      content = <ErrorDisplay error={error} onRetry={refetchAnalysis} />;
    }
  } else {
    content = (
      <>
        <AnalysisHeader
          currentAnalysisId={analysis?.data?.id}
          currentAnalysisName={analysisName}
          showAutoSaved={showAutoSaved}
        />
        <AnalysisChat
          previousMessages={analysis?.data?.messages || []}
          draft={analysis?.data?.draft || ''}
        />
      </>
    );
  }

  return (
    <>
      {isLoading ||
      isValidating ||
      (ENABLE_AUTO_CREATE_ON_404 && createChatMutation.isLoading) ? (
        <LoadingDisplay />
      ) : (
        <>
          <AnalysisFilter
            filters={filters}
            availableOptions={availableOptions}
            isDisabled={isDisabled}
            handleFilterChange={handleFilterChange}
          />
          <div className="h-[2px] bg-[var(--sapToolbar_SeparatorColor)]" />
          {content}
        </>
      )}
    </>
  );
}
