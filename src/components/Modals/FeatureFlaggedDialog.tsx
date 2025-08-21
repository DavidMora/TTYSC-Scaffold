'use client';

import React from 'react';
import {
  Dialog,
  type DialogPropTypes,
  type DialogDomRef,
} from '@ui5/webcomponents-react';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';

type FeatureFlaggedDialogProps = DialogPropTypes & {
  fallback?: React.ReactNode;
};

export const FeatureFlaggedDialog = React.forwardRef<
  DialogDomRef,
  FeatureFlaggedDialogProps
>(function FeatureFlaggedDialog(props, ref) {
  const { fallback = null, ...dialogProps } = props;
  const { flag: enabled, loading } = useFeatureFlag('FF_Modals');

  // While loading flags, render the dialog to avoid layout flicker and keep previous behavior
  if (loading) {
    return <Dialog ref={ref} {...dialogProps} />;
  }

  if (!enabled) {
    return <>{fallback}</>;
  }

  return <Dialog ref={ref} {...dialogProps} />;
});

export default FeatureFlaggedDialog;
