import { useState } from "react";
import apiClient from "../apis/apiClient";
import { toast } from "react-toastify";

const headers = {
  "Content-Type": "application/json",
};

const usePutQuery = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();
  const [error, setError] = useState();

  const putQuery = async (params) => {
    const {
      url,
      onSuccess = () => {
        console.log("onSuccess function");
      },
      onFail = () => {
        console.log("onFail function");
      },
      putData,
    } = params;
    setLoading(true);
    try {
      const { data: apiData = {} } = await apiClient.put(url, putData, {
        headers,
      });
      setData(apiData);
      await onSuccess(apiData);
      console.log(apiData, "putQuery-success");
    } catch (err) {
      onFail(err);
      console.log(err, "putQuery-fail");
      setError(err);
      toast.error(
        err?.error || err?.data?.message || err?.message || err?.error?.message
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    putQuery,
    loading,
    setLoading,
    data,
    setData,
    error,
    setError,
  };
};

export default usePutQuery;
