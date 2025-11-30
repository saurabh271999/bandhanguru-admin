import { useState } from "react";
import apiClient from "../apis/apiClient";
import { toast } from "react-toastify";
const headers = {
  "Content-Type": "application/json",
};

const usePostQuery = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();
  const [error, setError] = useState();

  const postQuery = async (params) => {
    const {
      url,
      onSuccess = () => {
        console.log("onSuccess function");
      },
      onFail = () => {
        console.log("onFail function");
      },
      postData,
      headers: headersFromParams,
    } = params;
    setLoading(true);
    console.log(headersFromParams, "headersFromParamsheadersFromParams");
    try {
      const { data: apiData = {} } = await apiClient.post(url, postData, {
        headers: headersFromParams ?? headers,
      });
      setData(apiData);
      await onSuccess(apiData);
      console.log(apiData, "postQuery-success");
      return apiData;
    } catch (err) {
      onFail(err);
      console.log(err, "postQuery-fail");
      setError(err);
      setData();
      toast.error(
        err?.error || err?.data?.message || err?.message || err?.error?.message
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    postQuery,
    loading,
    setLoading,
    data,
    setData,
    error,
    setError,
  };
};

export default usePostQuery;
