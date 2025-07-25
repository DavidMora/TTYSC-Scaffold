import {
  SideNavigationItem,
  FlexBox,
  FlexBoxDirection,
  Switch,
  Label,
  RadioButton,
} from "@ui5/webcomponents-react";
import { useState } from "react";

export default function SettingsNavigationItem() {
  const [shareChatsEnabled, setShareChatsEnabled] = useState(true);
  const [hideTableIndex, setHideTableIndex] = useState("No");

  const handleTableIndexChange = (value: string) => {
    setHideTableIndex(value);
  };

  return (
    <SideNavigationItem text="Settings" icon="action-settings">
      <FlexBox direction={FlexBoxDirection.Column} style={{ padding: "1rem" }}>
        {/* Toggle Switch */}
        <FlexBox style={{ paddingBlockEnd: "1rem" }}>
          <Switch
            checked={shareChatsEnabled}
            onChange={() => setShareChatsEnabled(!shareChatsEnabled)}
          />
          <Label style={{ paddingInlineStart: "1rem" }}>
            Share chats for development
          </Label>
        </FlexBox>

        {/* Radio Buttons */}
        <FlexBox direction={FlexBoxDirection.Column}>
          <Label>Hide the index of tables</Label>
          <FlexBox style={{ paddingTop: "0.5rem" }}>
            <RadioButton
              name="tableIndex"
              text="Yes"
              style={{ marginRight: "1rem" }}
              checked={hideTableIndex === "Yes"}
              onChange={() => handleTableIndexChange("Yes")}
            />
            <RadioButton
              name="tableIndex"
              text="No"
              checked={hideTableIndex === "No"}
              onChange={() => handleTableIndexChange("No")}
            />
          </FlexBox>
        </FlexBox>
      </FlexBox>
    </SideNavigationItem>
  );
}
