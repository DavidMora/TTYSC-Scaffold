import { dataFetcher } from "@/lib/api";
import {
  createAnalysis,
  getAnalysisById,
  renameAnalysis,
} from "@/lib/services/analysisService";
import { Analysis } from "@/lib/types/analysis";
import { useMutation } from "./useMutation";

export const ANALYSIS_KEY = "analysis";

export const useAnalysis = (id: string) => {
  return dataFetcher.fetchData(ANALYSIS_KEY, () => getAnalysisById(id));
};

export const useCreateAnalysis = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: Analysis) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation(() => createAnalysis(), {
    invalidateQueries: [],
    onSuccess: (data) => {
      onSuccess?.(data.data.analysis);
    },
    onError: (error) => {
      onError?.(error);
    },
  });
};

export const useRenameAnalysis = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: Analysis) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation(
    ({ id, data }: { id: string; data: { name: string } }) =>
      renameAnalysis(id, data),
    {
      invalidateQueries: [],
      onSuccess: (data) => {
        onSuccess?.(data.data.analysis);
      },
      onError: (error) => {
        onError?.(error);
      },
    }
  );
};
