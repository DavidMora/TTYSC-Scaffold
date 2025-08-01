import React from "react";
import { Button, Dialog, FlexBox } from "@ui5/webcomponents-react";
import type { DialogPropTypes, DialogDomRef } from "@ui5/webcomponents-react";
import { RawDataTable } from "../Tables/RawDataTable";
import styles from "./RawDataModal.module.css";

type RawDataDialogProps = DialogPropTypes & {
  data: {
    text: string;
    additionalText: string;
  }[];
};

export const RawDataModal = (props: RawDataDialogProps) => {
  const dialogRef = React.useRef<DialogDomRef>(null);

  const handleClose = () => {
    if (props.onClose) {
      props.onClose({} as Parameters<NonNullable<typeof props.onClose>>[0]);
    }
  };

  return (
    <Dialog
      ref={dialogRef}
      {...props}
      header={
        <FlexBox
          justifyContent="SpaceBetween"
          alignItems="Center"
          className="w-full justify-between"
        >
          <h2 className="text-lg font-semibold">Raw Data</h2>
          <Button
            design="Transparent"
            icon="decline"
            className="-mr-5"
            onClick={handleClose}
          />
        </FlexBox>
      }
      className={`${props.className || ""} ${styles.rawDataModal}`}
      data-component="raw-data-modal"
    >
      <div className="overflow-hidden bg-[var(--sapBackgroundColor)] p-4">
        <RawDataTable
          mainClassName="w-full rounded-xl overflow-hidden outline outline-gray-300 bg-[var(--sapBaseColor)]"
          tableClassName="h-[calc(100vh-16rem)] w-full"
          data={{ headers: [], rows: [] }}
        />
        <FlexBox>
          <Button design="Emphasized" className="mt-4">
            Download full data
          </Button>
        </FlexBox>
      </div>
    </Dialog>
  );
};
