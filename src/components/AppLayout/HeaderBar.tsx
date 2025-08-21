import React, { useRef, useState } from 'react';
import {
  FlexBox,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  Title,
  Text,
  Icon,
  Popover,
  List,
  Label,
  ListItemCustom,
  Button,
  ButtonDomRef,
} from '@ui5/webcomponents-react';
import { useRouter } from 'next/navigation';
import { SUPPLY_CHAIN_MENU } from '@/lib/constants/UI/HeaderBar';
import { MenuItemKey } from '@/lib/types/HeaderBar';

type HeaderBarProps = {
  title: string;
  subtitle: string;
  actions?: MenuItemKey[];
  overrides?: Partial<Record<MenuItemKey, () => void>>;
};

export default function HeaderBar({
  title,
  subtitle,
  actions = [],
  overrides = {},
}: Readonly<HeaderBarProps>) {
  const router = useRouter();
  const iconRef = useRef<ButtonDomRef>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const actionsMap: Record<MenuItemKey, () => void> = {
    RETRY: () => console.log('Default retry...'),
    SETTINGS: () => console.log('Settings...'),
    PRINT: () => window.print(),
    RECORD_SCREENCAST: () => console.log('Recording...'),
    ABOUT: () => router.push('/about'),
    ...overrides,
  };

  const availableKeys = (
    actions.length > 0 ? actions : (Object.keys(actionsMap) as MenuItemKey[])
  ).filter((key) => actionsMap[key] && SUPPLY_CHAIN_MENU[key]);

  const handleClick = (key: MenuItemKey) => {
    setIsPopoverOpen(false);
    actionsMap[key]?.();
  };
  return (
    <>
      <FlexBox
        justifyContent={FlexBoxJustifyContent.SpaceBetween}
        alignItems={FlexBoxAlignItems.Center}
      >
        <div>
          <Title
            level="H1"
            style={{
              color: 'var(--sapHighlightColor)',
              fontSize: 'var(--sapFontHeader3Size)',
              fontWeight: 'bolder',
            }}
          >
            {title}
          </Title>
          <Text
            style={{
              color: 'var(--sapTextColor)',
              fontSize: 'var(--sapFontSmallSize)',
            }}
          >
            {subtitle}
          </Text>
        </div>

        {availableKeys.length > 0 && (
          <Button
            ref={iconRef}
            onClick={() => setIsPopoverOpen((prev) => !prev)}
            style={{
              minHeight: 'var(--sapElement_Compact_Height)',
              border: 'var(--sapButton_BorderWidth) solid transparent',
              height: '26px',
              width: '32px',
              ...(isPopoverOpen && {
                border:
                  'var(--sapButton_BorderWidth) solid var(--sapButton_Selected_BorderColor)',
                backgroundColor: 'var(--sapButton_Selected_Background)',
              }),
            }}
          >
            <Icon
              name="overflow"
              style={{
                color: isPopoverOpen
                  ? 'var(--sapButton_Lite_TextColor)'
                  : 'var(--sapHighlightColor)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          </Button>
        )}
      </FlexBox>

      <Popover
        opener={iconRef.current as HTMLElement}
        open={isPopoverOpen}
        onClose={() => setIsPopoverOpen(false)}
        placement="Top"
        horizontalAlign="End"
        style={{ padding: 0, width: '320px', marginTop: '5px' }}
      >
        <List>
          {availableKeys.map((key) => {
            const item = SUPPLY_CHAIN_MENU[key];
            return (
              <ListItemCustom
                key={key}
                style={{
                  padding: '0rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderBottom: '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'var(--sapContent_Selected_Hover_Background)';
                  e.currentTarget.style.borderBottomColor =
                    'var(--sapHighlightColor)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.borderBottomColor = 'transparent';
                }}
                onClick={() => handleClick(key)}
              >
                <FlexBox
                  alignItems={FlexBoxAlignItems.Center}
                  style={{ gap: '0.7rem' }}
                >
                  <Icon
                    name={item.icon}
                    style={{
                      color: 'var(--sapContent_NonInteractiveIconColor)',
                    }}
                  />
                  <Label
                    style={{
                      fontSize: 'var(--sapFontSize)',
                      color: 'var(--sapList_TextColor)',
                      cursor: 'pointer',
                    }}
                  >
                    {item.label}
                  </Label>
                </FlexBox>
              </ListItemCustom>
            );
          })}
        </List>
      </Popover>
    </>
  );
}
