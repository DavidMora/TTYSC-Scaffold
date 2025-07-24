import { useSettings } from "@/hooks/settings";
import { UpdateSettingsRequest } from "@/lib/types/settings";
import {
  SideNavigationItem,
  FlexBox,
  FlexBoxDirection,
  Switch,
  Label,
  RadioButton,
} from "@ui5/webcomponents-react";
import { useEffect, useState } from "react";
import { updateSettings as updateSettingsService } from "@/lib/services/settings.service";

export default function SettingsNavigationItem() {
  const {
    data: settings,
    isLoading: isLoadingSettings,
    error: errorLoadingSettings,
    mutate: mutateSettings,
  } = useSettings();

  // Initialize state from settings when loaded
  const [shareChatsEnabled, setShareChatsEnabled] = useState<boolean>(true);
  const [hideTableIndex, setHideTableIndex] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (settings) {
      setShareChatsEnabled(!!settings.shareChats);
      setHideTableIndex(!!settings.hideIndexTable);
    }
  }, [settings]);

  const updateSettings = async (newSettings: UpdateSettingsRequest) => {
    setIsUpdating(true);
    try {
      const response = await updateSettingsService(newSettings);
      if (response.ok) {
        mutateSettings?.();
      } else {
        console.error("Failed to update settings:", response.statusText);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShareChatsToggle = () => {
    const newValue = !shareChatsEnabled;
    setShareChatsEnabled(newValue);
    updateSettings({ ...settings, shareChats: newValue });
  };

  const handleTableIndexChange = (value: boolean) => {
    setHideTableIndex(value);
    updateSettings({ ...settings, hideIndexTable: value });
  };

  let content = null;
  if (isLoadingSettings) {
    content = (
      <FlexBox direction={FlexBoxDirection.Column} style={{ padding: "1rem" }}>
        <Label>Loading settings...</Label>
      </FlexBox>
    );
  } else if (errorLoadingSettings) {
    content = (
      <FlexBox direction={FlexBoxDirection.Column} style={{ padding: "1rem" }}>
        <Label style={{ color: "red" }}>Error loading settings.</Label>
      </FlexBox>
    );
  } else {
    content = (
      <FlexBox direction={FlexBoxDirection.Column} style={{ padding: "1rem" }}>
        {/* Toggle Switch */}
        <FlexBox style={{ paddingBlockEnd: "1rem" }}>
          <Switch
            checked={shareChatsEnabled}
            disabled={isUpdating}
            onChange={handleShareChatsToggle}
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
              checked={hideTableIndex === true}
              disabled={isUpdating}
              onChange={() => handleTableIndexChange(true)}
            />
            <RadioButton
              name="tableIndex"
              text="No"
              checked={hideTableIndex === false}
              disabled={isUpdating}
              onChange={() => handleTableIndexChange(false)}
            />
          </FlexBox>
        </FlexBox>
        {isUpdating && (
          <Label style={{ marginTop: "1rem", color: "#888" }}>
            Updating settings...
          </Label>
        )}
      </FlexBox>
    );
  }

  return (
    <SideNavigationItem text="Settings" icon="action-settings" unselectable>
      {content}
    </SideNavigationItem>
  );
}
