import React, { useRef, useState, useEffect } from 'react';
import {
  FlexBox,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  Text,
  Icon,
  InputDomRef,
} from '@ui5/webcomponents-react';

import { AnalysisRenaming } from './AnalysisRenaming';
import { CreateAnalysis } from './CreateAnalysis';
import { useRouter } from 'next/navigation';
import { useCreateChat } from '@/hooks/chats';
import { useSequentialNaming } from '@/contexts/SequentialNamingContext';

interface AnalysisHeaderProps {
  currentAnalysisId?: string;
  currentAnalysisName?: string;
  showAutoSaved?: boolean;
}

const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({
  currentAnalysisId,
  currentAnalysisName,
  showAutoSaved = false,
}) => {
  const inputRef = useRef<InputDomRef>(null);
  const [name, setName] = useState<string>(currentAnalysisName || '');
  const router = useRouter();

  const { generateAnalysisName } = useSequentialNaming();

  const { mutate: createAnalysis, isLoading: isCreating } = useCreateChat({
    onSuccess: (data) => {
      router.push(`/${data.id}`);
    },
  });

  useEffect(() => {
    setName(currentAnalysisName || '');
  }, [currentAnalysisName]);

  return (
    <FlexBox
      justifyContent={FlexBoxJustifyContent.SpaceBetween}
      alignItems={FlexBoxAlignItems.Center}
      style={{ paddingInline: '0.5rem' }}
    >
      <FlexBox style={{ gap: '1.5rem' }}>
        <AnalysisRenaming
          analysisName={name}
          analysisId={currentAnalysisId}
          onNameChange={setName}
          inputRef={inputRef}
        />

        <CreateAnalysis
          onCreateAnalysis={() =>
            createAnalysis({ title: generateAnalysisName() })
          }
          isCreating={isCreating}
        />
      </FlexBox>

      {showAutoSaved && (
        <FlexBox
          alignItems={FlexBoxAlignItems.Center}
          style={{
            gap: '0.5rem',
            color: 'var(--sapHighlightColor)',
          }}
        >
          <Text
            style={{
              fontSize: 'var(--sapFontSize)',
              color: 'var(--sapHighlightColor)',
              fontWeight: '400',
            }}
          >
            Analysis Auto-Saved
          </Text>
          <Icon
            name="accept"
            style={{
              fontSize: '1rem',
              color: 'var(--sapHighlightColor)',
            }}
          />
        </FlexBox>
      )}
    </FlexBox>
  );
};

export default AnalysisHeader;
