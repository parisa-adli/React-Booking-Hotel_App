import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

// GET `${url}?${query}` against the API. Returns the data, the
// X-Total-Count header (json-server pagination), the HTTP status of a failed
// request and a refetch function. 404s are reported without a toast.
// Pass url = null to skip fetching.
export default function useFetch(url, query = "", { initialData = [] } = {}) {
  const [result, setResult] = useState({
    key: null,
    data: initialData,
    total: null,
    error: null,
    status: null,
  });
  const [reloadKey, setReloadKey] = useState(0);
  const requestUrl = url ? (query ? `${url}?${query}` : url) : null;
  const key = requestUrl ? `${requestUrl}#${reloadKey}` : null;

  useEffect(() => {
    if (!requestUrl) return;
    const controller = new AbortController();

    async function fetchData() {
      try {
        const response = await api.get(requestUrl, { signal: controller.signal });
        const count = response.headers["x-total-count"];
        setResult({
          key,
          data: response.data,
          total: count === undefined ? null : Number(count),
          error: null,
          status: response.status,
        });
      } catch (err) {
        if (axios.isCancel(err)) return;
        const status = err?.response?.status ?? null;
        const message = err?.message || "Something went wrong";
        setResult({ key, data: initialData, total: null, error: message, status });
        if (status !== 404) toast.error(message, { id: url });
      }
    }
    fetchData();

    return () => controller.abort();
    // initialData is a default value, not an input
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const refetch = useCallback(() => setReloadKey((value) => value + 1), []);
  const isLoading = Boolean(key) && result.key !== key;

  return {
    isLoading,
    data: result.data,
    total: result.total,
    error: isLoading ? null : result.error,
    status: isLoading ? null : result.status,
    refetch,
  };
}
