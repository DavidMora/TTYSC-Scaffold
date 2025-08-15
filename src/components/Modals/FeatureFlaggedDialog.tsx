'use client';

import React from 'react';
import {
  Dialog,
  type DialogPropTypes,
  type DialogDomRef,
} from '@ui5/webcomponents-react';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';
import type { FeatureFlagKey } from '@/lib/types/feature-flags';

type FeatureFlaggedDialogProps = DialogPropTypes & {
  fallback?: React.ReactNode;
  featureFlagKey?: FeatureFlagKey;
};

export const FeatureFlaggedDialog = React.forwardRef<
  DialogDomRef,
  FeatureFlaggedDialogProps
>(function FeatureFlaggedDialog(props, ref) {
  const {
    fallback = null,
    featureFlagKey = 'FF_Modals',
    ...dialogProps
  } = props;
  const { flag: enabled, loading } = useFeatureFlag(featureFlagKey);

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
