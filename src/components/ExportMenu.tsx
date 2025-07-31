import React, { useRef, useState } from "react";
import { Menu, MenuItem, ToolbarButton } from "@ui5/webcomponents-react";
import { useExportTable } from "@/hooks/useExport";
import { ExportFormat } from "@/lib/types/export";
import { EXPORT_CONFIG } from "@/lib/constants/UI/export";

interface ExportMenuProps {
  tableId: string;
  buttonText?: string;
  buttonIcon?: string;
  disabled?: boolean;
  className?: string;
  customFormats?: ExportFormat[];
}

export const ExportMenu: React.FC<Readonly<ExportMenuProps>> = ({
  tableId,
  buttonText = "Export",
  buttonIcon = "excel-attachment",
  disabled = false,
  className,
  customFormats,
}) => {
  const menuRef = useRef(null);
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const { exportToFormat, isExporting, error } = useExportTable(tableId);

  const formats = customFormats || EXPORT_CONFIG.formats;

  const handleExport = async (format: ExportFormat) => {
    setMenuIsOpen(false);
    try {
      await exportToFormat(format);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <ToolbarButton
        icon={buttonIcon}
        endIcon={menuIsOpen ? "slim-arrow-up" : "slim-arrow-down"}
        design="Transparent"
        onClick={() => setMenuIsOpen(true)}
        ref={menuRef}
        disabled={disabled || isExporting}
        className={className}
      >
        {buttonText}
      </ToolbarButton>

      <Menu
        opener={menuRef.current ?? undefined}
        open={menuIsOpen}
        onClose={() => setMenuIsOpen(false)}
        horizontalAlign="Center"
      >
        {formats.map((format) => (
          <MenuItem
            key={format.id}
            icon={format.icon}
            text={`Export to ${format.name}`}
            onClick={() => handleExport(format)}
            disabled={isExporting}
          />
        ))}
      </Menu>

      {error && (
        <div
          style={{
            color: "red",
            fontSize: "0.875rem",
            marginLeft: "0.5rem",
            maxWidth: "200px",
          }}
        >
          {error}
        </div>
      )}
    </>
  );
};
