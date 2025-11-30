import { useState } from "react";
import apiClient from "../apis/apiClient";
import { logger } from "../utils/logger";
import { toast } from "react-toastify";

const headers = {
  "Content-Type": "application/json",
};

const usePatchQuery = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();
  const [error, setError] = useState();

  const patchQuery = async (params) => {
    const {
      url,
      onSuccess = () => {
        logger.log("onSuccess function");
      },
      onFail = () => {
        logger.log("onFail function");
      },
      patchData,
    } = params;
    setLoading(true);
    try {
      const { data: apiData = {} } = await apiClient.patch(url, patchData, {
        headers: headers,
      });
      setData(apiData);
      await onSuccess(apiData);
      logger.log(apiData, "putQuery-success");
    } catch (err) {
      onFail(err);
      logger.log(err, "putQuery-fail");
      setError(err);
      toast.error(
        err?.error || err?.data?.message || err?.message || err?.error?.message
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    patchQuery,
    loading,
    setLoading,
    data,
    setData,
    error,
    setError,
  };
};

export default usePatchQuery;
