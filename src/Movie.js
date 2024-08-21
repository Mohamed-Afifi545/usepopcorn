export function Movie({ movie, onSelectMovie }) {
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
