import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmationModal } from "@/components/Modal/ConfirmationModal";

describe("ConfirmationModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: "Test Title",
    message: "Test message",
    actions: [
      {
        label: "Cancel",
        design: "Transparent" as const,
        onClick: jest.fn(),
      },
      {
        label: "Confirm",
        design: "Emphasized" as const,
        onClick: jest.fn(),
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call action onClick when button is clicked", () => {
    const cancelAction = jest.fn();
    const confirmAction = jest.fn();

    const props = {
      ...defaultProps,
      actions: [
        { label: "Cancel", onClick: cancelAction },
        { label: "Confirm", onClick: confirmAction },
      ],
    };

    render(<ConfirmationModal {...props} />);

    const buttons = screen.getAllByTestId("ui5-button");

    fireEvent.click(buttons[0]);
    expect(cancelAction).toHaveBeenCalledTimes(1);

    fireEvent.click(buttons[1]);
    expect(confirmAction).toHaveBeenCalledTimes(1);
  });
});
