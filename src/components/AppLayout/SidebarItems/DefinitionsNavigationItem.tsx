import {
  SideNavigationItem,
  FlexBox,
  FlexBoxDirection,
  Icon,
  Input,
  Label,
  List,
  ListItemStandard,
  Card,
  CardHeader,
} from '@ui5/webcomponents-react';
import { useState } from 'react';

interface Definition {
  title: string;
  description?: string;
  icon: string;
  details?: string[];
}

interface DefinitionsNavigationItemProps {
  definitions?: Definition[];
}

const defaultDefinitions: Definition[] = [
  {
    title: 'Uncommitted Orders:',
    description: 'Orders that are yet to be confirmed',
    icon: 'inspect',
  },
  {
    title: 'Estimated Delivery Date:',
    icon: 'inspect',
    details: [
      'If RECOMMIT_DELIVERY_DATE is not null take RECOMMIT_DELIVERY_DATE',
      'If COMMITED_DELIVERY_DATE is not null...',
    ],
  },
];

export default function DefinitionsNavigationItem({
  definitions = defaultDefinitions,
}: Readonly<DefinitionsNavigationItemProps>) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDefinitions = definitions.filter(
    (def) =>
      def.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      def.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SideNavigationItem
      text="Definitions"
      icon="attachment-text-file"
      unselectable
    >
      <FlexBox
        direction={FlexBoxDirection.Column}
        className="gap-2 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <Input
          icon={<Icon name="search" />}
          placeholder="Search"
          style={{ width: '100%' }}
          value={searchTerm}
          onInput={(event) => setSearchTerm(event.target.value)}
        />

        {/* Definition Cards */}
        {filteredDefinitions.map((def) => (
          <Card key={def.title} className="w-full">
            <CardHeader
              titleText={def.title}
              action={<Icon name={def.icon} />}
              className="text-left"
            />
            <FlexBox direction={FlexBoxDirection.Column} className="p-2">
              {def.description && <Label>{def.description}</Label>}
              {def.details && (
                <List>
                  {def.details.map((item, i) => (
                    <ListItemStandard key={`${def.title}-detail-${i}`}>
                      {item}
                    </ListItemStandard>
                  ))}
                </List>
              )}
            </FlexBox>
          </Card>
        ))}
      </FlexBox>
    </SideNavigationItem>
  );
}
