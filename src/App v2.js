import { useEffect, useState } from "react";
import StarRating from "./starRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "85fec0d580aa8a22011668c210c42c7a";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const isWatched = watched.some((movie) => movie.imdbID === selectedId);

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    if (isWatched) return;
    setWatched((watched) => [...watched, movie]);
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `https://api.themoviedb.org/3/search/movie?&api_key=${KEY}&include_adult=true&language=en-US&query=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok)
            throw new Error("Something went wrong, please try again!");
          const data = await res.json();
          if (data.results.length === 0) throw new Error("Movie not found!");
          setMovies(data.results);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }

      handleCloseMovie();

      fetchMovies();
      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return (
    <>
      <NavBar>
        <Search
          query={query}
          setQuery={setQuery}
        />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {query.length < 3 && (
            <h2 className="error">
              Please start searching for an awesome movie...
            </h2>
          )}
          {!isLoading && !error && (
            <MovieList
              movies={movies}
              onSelectMovie={handleSelectMovie}
              onCloseMovie={handleCloseMovie}
            />
          )}
          {isLoading && <Loader />}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              isWatched={isWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⚠️</span> {message}
    </p>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onSelectMovie, onCloseMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.id}
          onSelectMovie={onSelectMovie}
          onCloseMovie={onCloseMovie}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  const year = movie.release_date.split("-").slice(0, 1).join("");
  return (
    <li onClick={() => onSelectMovie(movie.id)}>
      <img
        src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
        alt={`${movie.title} poster`}
      />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({
  selectedId,
  onCloseMovie,
  onAddWatched,
  isWatched,
  watched,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      poster: `https://image.tmdb.org/t/p/w300${movie.poster_path}`,
      runtime: Number(movie.runtime),
      imdbRating: Number(movie.vote_average).toFixed(1),
      userRating,
    };
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }
  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") onCloseMovie();
      }
      document.addEventListener("keydown", callback);
      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [onCloseMovie]
  );

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

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(1)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovieList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img
        src={`https://image.tmdb.org/t/p/w300${movie.poster}`}
        alt={`${movie.Title} poster`}
      />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
