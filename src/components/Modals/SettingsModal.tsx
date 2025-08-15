'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  Button,
  DialogDomRef,
  FlexBox,
  FlexBoxDirection,
  Label,
  List,
  ListItemCustom,
  Select,
  Option,
  Title,
  CheckBox,
  FlexBoxJustifyContent,
  Icon,
} from '@ui5/webcomponents-react';
import { FeatureFlaggedDialog } from '@/components/Modals/FeatureFlaggedDialog';
import { useSettingsModal } from '@/contexts/SettingsModalContext';

type SettingsSectionKey = 'development' | 'appearance' | 'theme';

export default function SettingsModal() {
  const dialogRef = useRef<DialogDomRef>(null);
  const { isOpen, close } = useSettingsModal();
  const [activeSection, setActiveSection] =
    useState<SettingsSectionKey>('development');

  const [runOnSave, setRunOnSave] = useState<boolean>(false);
  const wideMode = false;

  const sections = useMemo(
    () => [
      {
        key: 'development' as const,
        label: 'Development',
        icon: 'attachment-html',
      },
      {
        key: 'appearance' as const,
        label: 'Appearance',
        icon: 'official-service',
      },
      {
        key: 'theme' as const,
        label: 'Choose app theme, colors and fonts',
        icon: 'approvals',
      },
    ],
    []
  );

  const SectionNav = useMemo(
    () => (
      <List>
        <Title
          style={{
            padding: '10px',
            borderBottom: '1px solid var(--sapList_BorderColor)',
          }}
        >
          Settings
        </Title>
        {sections.map(({ key, label, icon }) => (
          <ListItemCustom
            key={key}
            style={{
              cursor: 'pointer',
              userSelect: 'none',
              background:
                activeSection === key
                  ? 'var(--sapContent_Selected_Hover_Background)'
                  : undefined,
              borderBottomColor:
                activeSection === key ? 'var(--sapHighlightColor)' : undefined,
            }}
            onClick={() => setActiveSection(key)}
          >
            <Icon
              name={icon}
              style={{
                color: 'var(--sapContent_NonInteractiveIconColor)',
                marginRight: '0.75rem',
              }}
            />
            <Label
              style={{
                color: 'var(--sapList_TextColor)',
              }}
            >
              {label}
            </Label>
          </ListItemCustom>
        ))}
      </List>
    ),
    [activeSection, sections]
  );

  const sectionsContent: Record<SettingsSectionKey, React.ReactNode> = {
    development: (
      <FlexBox direction={FlexBoxDirection.Column} style={{ gap: '0.75rem' }}>
        <Title level="H4">Development</Title>
        <FlexBox style={{ alignItems: 'end' }}>
          <CheckBox
            checked={runOnSave}
            onChange={() => setRunOnSave((v) => !v)}
          />
          <Label
            style={{
              color: 'var(--sapTextColor)',
            }}
          >
            <span>Run on save</span>
            <br />
            <span style={{ fontSize: 'var(--sapFontSmallSize)' }}>
              Automatically updates the app when the underlying code is updated.
            </span>
          </Label>
          <Label></Label>
        </FlexBox>
      </FlexBox>
    ),
    appearance: (
      <FlexBox
        direction={FlexBoxDirection.Column}
        style={{ gap: '0.75rem', color: 'var(--sapTextColor)' }}
      >
        <Title level="H4">Appearance</Title>
        <FlexBox style={{ alignItems: 'end' }}>
          <CheckBox checked={wideMode} />
          <Label
            style={{
              color: 'var(--sapTextColor)',
            }}
          >
            <span>Wide mode</span>
            <br />
            <span style={{ fontSize: 'var(--sapFontSmallSize)' }}>
              Turn on to make this app occupy the entire width of the screen.
            </span>
          </Label>
        </FlexBox>
      </FlexBox>
    ),
    theme: (
      <FlexBox direction={FlexBoxDirection.Column} style={{ gap: '1rem' }}>
        <Title level="H4">Choose app theme, colors and fonts</Title>
        <Select valueState="None" style={{ width: '100%' }}>
          <Option selected data-value="system">
            User system setting
          </Option>
          <Option data-value="light">Light</Option>
          <Option data-value="dark">Dark</Option>
        </Select>
      </FlexBox>
    ),
  };

  const renderSection = () => sectionsContent[activeSection];

  return (
    <FeatureFlaggedDialog
      ref={dialogRef}
      featureFlagKey="FF_Settings_Menu"
      open={isOpen}
      onClose={close}
      className="paddingless-content"
      style={{ maxWidth: '80vw', minWidth: '70vw' }}
      footer={
        <FlexBox
          justifyContent={FlexBoxJustifyContent.End}
          style={{
            gap: '1rem',
            marginTop: '0.5rem',
            width: '100%',
          }}
        >
          <Button design="Transparent" onClick={close}>
            Close
          </Button>
        </FlexBox>
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          minHeight: '380px',
        }}
      >
        <div
          style={{
            borderRight: '1px solid var(--sapList_BorderColor)',
          }}
        >
          {SectionNav}
        </div>
        <div style={{ padding: '1rem' }}>{renderSection()}</div>
      </div>
    </FeatureFlaggedDialog>
  );
}
