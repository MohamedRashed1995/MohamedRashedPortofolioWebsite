import { useCallback, useState } from 'react';
import { submitInquiry, type CreateInquiryInput, type CreateInquiryResult } from '@/services/api';

export function useSubmitInquiry() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<CreateInquiryResult | null>(null);

  const submit = useCallback(async (input: CreateInquiryInput) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await submitInquiry(input);
      setSuccess(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, []);

  return { submit, loading, error, success, reset };
}
