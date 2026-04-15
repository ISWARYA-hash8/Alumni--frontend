import { useState, useEffect } from "react";

export default function useFetch(apiCall) {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {

    try {

      setLoading(true);

      const res = await apiCall();

      setData(res.data);

    } catch (err) {

      setError(err);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}