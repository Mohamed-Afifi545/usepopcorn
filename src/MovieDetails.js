import { useState, useRef, useEffect } from "react";
import { Loader } from "./Loader";
import StarRating from "./starRating";
import { useKey } from "./useKey";

export function MovieDetails({
  selectedId,
  onCloseMovie,
  onAddWatched,
  isWatched,
  watched,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const countRef = useRef(0);

  useEffect(() => {
    if (userRating) countRef.current++;
  }, [userRating]);

  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  // const [isTop, setIsTop] = useState(movie.vote_average > 8);
  // console.log(isTop);
  // useEffect(() => {
  //   setIsTop(movie.vote_average > 8);
  // }, [movie.vote_average]);
  // const isTop = movie.vote_average > 8;
  // console.log(isTop);
  // const [avgRating, setAvgRating] = useState(0);
  function handleAdd() {
    const newWatchedMovie = {
      imdbID: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      poster: `https://image.tmdb.org/t/p/w300${movie.poster_path}`,
      runtime: Number(movie.runtime),
      imdbRating: Number(movie.vote_average).toFixed(1),
      userRating,
      countRatingDecisions: countRef.current,
    };
    onAddWatched(newWatchedMovie);
    // onCloseMovie();
  }

  useKey("Escape", onCloseMovie);

  // useEffect(
  //   function () {
  //     function callback(e) {
  //       if (e.code === "Escape") onCloseMovie();
  //     }
  //     document.addEventListener("keydown", callback);
  //     return function () {
  //       document.removeEventListener("keydown", callback);
  //     };
  //   },
  //   [onCloseMovie]
  // );
  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const options = {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4NWZlYzBkNTgwYWE4YTIyMDExNjY4YzIxMGM0MmM3YSIsIm5iZiI6MTcyMzI5NzMxMy4yMjc2MTEsInN1YiI6IjY2Yjc2ZDAyNDA5MDFkM2ZjODI2MjM3OCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.cVX2UxsUgUFLpbt-6focfb8yj5--O352X3C21ynrdcw",
          },
        };
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${selectedId}`,
          options
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!movie.title) return;
      document.title = `Movie: ${movie.title}`;
      return function () {
        document.title = "usePopcorn";
      };
    },
    [movie.title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button
              className="btn-back"
              onClick={onCloseMovie}
            >
              &larr;
            </button>
            <img
              src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
              alt={`${movie.title} poster`}
            />
            <div className="details-overview">
              <h2>{movie.title}</h2>
              <p>
                {movie.release_date} &bull; {movie.runtime} mins
              </p>
              {movie.genres && movie.genres.length > 0 && (
                <p>{movie.genres[0].name}</p>
              )}
              <p>
                <span>⭐</span> {Number(movie.vote_average).toFixed(1)} IMDb
                rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button
                      className="btn-add"
                      onClick={handleAdd}
                    >
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <div>
                  You rated this movie with {watchedUserRating} <span>⭐</span>
                </div>
              )}
            </div>
            <p>
              <em>{movie.overview}</em>
            </p>
            <p>Starring:</p>
            <p>Directed by:</p>
          </section>
        </>
      )}
    </div>
  );
}
