import { useState, useCallback } from "react";
import apiClient from "../apis/apiClient";
import { toast } from "react-toastify";

const useGetQuery = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();
  const [error, setError] = useState();

  const getQuery = useCallback(async (params) => {
    const {
      url,
      onSuccess = () => {
        console.log("onSuccess function");
      },
      onFail = () => {
        console.log("onFail function");
      },
    } = params;
    setLoading(true);
    try {
      const { data: apiData = {} } = await apiClient.get(url);
      setData(apiData);
      await onSuccess(apiData);
      return apiData;
    } catch (err) {
      onFail(err);
      setError(err);
      toast.error(
        err?.error || err?.data?.message || err?.message || err?.error?.message
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since getQuery doesn't depend on any external values

  return {
    getQuery,
    loading,
    setLoading,
    data,
    setData,
    error,
    setError,
  };
};

export default useGetQuery;
