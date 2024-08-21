import { useRef } from "react";
import { useKey } from "./useKey";

export function Search({ query, setQuery }) {
  // useEffect(() => {
  //   const el = document.querySelector(".search");
  //   el.focus();
  // }, []);
  const inputEl = useRef(null);

  useKey("enter", function (e) {
    if (document.activeElement !== inputEl.current) {
      inputEl.current.focus();
      setQuery("");
    }
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}
