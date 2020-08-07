import { useState, useEffect } from "react";
function useFetch(url) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  async function fetchUrl() {
    try {
      const response = await fetch(url);
      const json = await response.json();
      console.log(json);

      setData(json);
      setLoading(false);
    } catch (error) {
      console.log(error);

    }
  }
  useEffect(() => {
    fetchUrl();
  }, []);
  return [data, loading];
}
export { useFetch };