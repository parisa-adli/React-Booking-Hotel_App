import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function useFetch(url, query = "") {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchData() {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`${url}${query}`, { signal });
        setData(data);
      } catch (err) {
        if (!axios.isCancel()) {
          setData([]);
          // console.log(err?.message);
          toast.error(err?.message);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [query, url]);

  return { isLoading, data };
}
