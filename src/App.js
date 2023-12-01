import {useEffect, useRef, useState} from "react";
import StarRating from "./StarRating";
import {useLocalStorageState} from "./useLocalStorageState";

const average = (arr) =>
    arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "6959f417"

export default function App() {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false)
    const [query, setQuery] = useState("");
    const [error, setError] = useState("")
    const [selectedId, setSelectedId] = useState(null)

    // using LocalStorage in initial state
    const [watched, setWatched] = useLocalStorageState([])

    function handleSelectMovie(id) {
        setSelectedId(selectedId => selectedId === id ? null : id)
    }

    function handleCloseMovie() {
        setSelectedId(null)
    }

    function handleAddWatched(movie) {
        setWatched(watchedMovie => [...watchedMovie, movie])
    }

    function handleDeleteWatched(id) {
        setWatched(watched => watched.filter(movie => movie.imdbID !== id))
    }




    useEffect(() => {

        const controller = new AbortController()

        async function fetchMovies() {

            try {
                setIsLoading(true)
                setError("")
                const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`, {signal: controller.signal});

                if (!res.ok) throw new Error("Something went wrong with fetching movies")

                const data = await res.json()
                if (data.Response === "False") throw new Error("Movie not found")
                setMovies(data.Search)
                setError("")

            } catch (err) {
                console.log(err.message)
                if (err.name !== "AbortError") {
                    setError(err.message)
                }

            } finally {
                setIsLoading(false)

            }
        }

        if (query.length < 2) {
            setMovies([]);
            setError("")
            return
        }
        handleCloseMovie()
        fetchMovies()

        // CleanUp for API request
        return () => controller.abort()

    }, [query]);


    return (
        <>
            <NavBar>
                <Search query={query} setQuery={setQuery}/>
                <NumResults movies={movies}/>
            </NavBar>
            <Main>
                <Box>
                    {/*{isLoading ? <Loader/> : <MoviesList movies={movies}/>}*/}
                    {isLoading && <Loader/>}
                    {!isLoading && !error && <MoviesList movies={movies} onHandleSelectedMovie={handleSelectMovie}/>}
                    {error && <ErrorMessage message={error}/>}
                </Box>
                <Box>
                    {
                        selectedId ? <MovieDetails onCloseMovie={handleCloseMovie} selectedId={selectedId}
                                                   onAddWatched={handleAddWatched}
                                                   watched={watched}/> :
                            <>
                                <WatchedSummary watched={watched}/>
                                <WatchedMovieList watched={watched} onhandleDeleteWatched={handleDeleteWatched}/>
                            </>

                    }
                </Box>
            </Main>
        </>
    );
}

function NavBar({children}) {
    return <nav className="nav-bar">
        <Logo/>

        {children}
    </nav>
}

function Logo() {
    return <div className="logo">
        <span role="img">🍿</span>
        <h1>usePopcorn</h1>
    </div>
}

function NumResults({movies}) {
    return <p className="num-results">
        Found <strong>{movies.length}</strong> results
    </p>
}

function Search({query, setQuery}) {

    const inputEl = useRef(null)

    useEffect(() => {
        function callback(e) {
            if (e.code === "Enter") {
                inputEl.current.focus();
                setQuery("")
            }
        }

        document.addEventListener("keydown", callback)
        return () => document.addEventListener("keydown", callback)

    }, [setQuery]);

    return <input
        className="search"
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        ref={inputEl}
    />
}

function Main({children}) {
    return <main className="main">
        {children}
    </main>
}

function Box({children}) {

    const [isOpen, setIsOpen] = useState(true);
    return <div className="box">
        <button
            className="btn-toggle"
            onClick={() => setIsOpen((open) => !open)}
        >
            {isOpen ? "–" : "+"}
        </button>

        {isOpen && children

        }
    </div>
}

function Loader() {
    return <p className="loader">Loading...</p>
}

function ErrorMessage({message}) {
    return <p className="error">
        <span>👮‍♂️</span> {message}
    </p>
}

function MoviesList({movies, onHandleSelectedMovie}) {

    return <ul className="list list-movies">
        {movies?.map((movie) => (
            <Movie movie={movie} key={movie.imdbID} onHandleSelectedMovie={onHandleSelectedMovie}/>
        ))}
    </ul>
}

function Movie({movie, onHandleSelectedMovie}) {
    return <li key={movie.imdbID} onClick={() => onHandleSelectedMovie(movie.imdbID)}>
        <img src={movie.Poster} alt={`${movie.Title} poster`}/>
        <h3>{movie.Title}</h3>
        <div>
            <p>
                <span>🗓</span>
                <span>{movie.Year}</span>
            </p>
        </div>
    </li>
}

function MovieDetails({selectedId, onCloseMovie, onAddWatched, watched}) {
    const [movie, setMovie] = useState({})
    const [movieRating, setMovieRating] = useState(0)
    const isWatched = watched.map(movie => movie.imdbID).includes(selectedId)
    const watchedMovieRating = watched.find(movies => movies.imdbID === selectedId)?.movieRating

    const countRef = useRef(0)

    useEffect(() => {
        if (movieRating) countRef.current = countRef.current + 1
    }, [movieRating]);


    const {
        Title: title,
        Year: year,
        Poster: poster,
        Runtime: runtime,
        imdbRating,
        Plot: plot,
        Released: released,
        Actors: actors,
        Director: director,
        Genre: genre
    } = movie;

    function handleAdd() {
        const newMovie = {
            imdbID: selectedId,
            title,
            year,
            poster,
            imdbRating: Number(imdbRating),
            runtime: Number(runtime.split(" ").at(0)),
            movieRating,
            countRatingDecision: countRef.current
        }
        onAddWatched(newMovie)
        onCloseMovie()

    }


    useEffect(() => {
        async function getMovieDetails() {
            const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
            const data = await res.json()
            setMovie(data)
        }

        getMovieDetails()

    }, [selectedId]);

    useEffect(() => {
        if (!title) return
        document.title = `Movie | ${title}`

        return () => document.title = "usePopcorn"
    }, [title]);

    useEffect(() => {

            function callback(e) {
                if (e.code === "Escape") {
                    onCloseMovie()
                }
            }

            document.addEventListener("keydown", callback)

            return () => document.removeEventListener("keydown", callback)

        }

        , [onCloseMovie]);

    return <div className="details">
        <header>
            <button className="btn-back" onClick={onCloseMovie}>&larr;
            </button>
            <img src={poster} alt={`Poster of ${movie}`}/>
            <div className="details-overview">
                <h2>{title}</h2>
                <p>{released} &bull; {runtime}</p>
                <p>{genre}</p>
                <p><span>⭐</span>{imdbRating} IMDb Rating</p>

            </div>
        </header>

        <section>
            {!isWatched ? <>
                    <div className="rating">

                        <StarRating maxRating={10} size={24} onSetMovieRating={setMovieRating}/>
                        {movieRating > 0 && <button className="btn-add" onClick={handleAdd}>Add to watch list</button>}
                    </div>
                    <p><em>{plot}</em></p>
                    <p>Starring: {actors}</p>
                    <p>Directed by: {director}</p> </>
                : <p>You watched this movie once and rated {watchedMovieRating}</p>}
        </section>

    </div>
}

function WatchedSummary({watched}) {
    const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
    const avgUserRating = average(watched.map((movie) => movie.movieRating));
    const avgRuntime = average(watched.map((movie) => movie.runtime));
    return <div className="summary">
        <h2>Movies you watched</h2>
        <div>
            <p>
                <span>#️⃣</span>
                <span>{watched.length} movies</span>
            </p>
            <p>
                <span>⭐️</span>
                <span>{avgImdbRating.toFixed(2)}</span>
            </p>
            <p>
                <span>🌟</span>
                <span>{avgUserRating.toFixed(2)}</span>
            </p>
            <p>
                <span>⏳</span>
                <span>{avgRuntime.toFixed(2)} min</span>
            </p>
        </div>
    </div>
}

function WatchedMovieList({watched, onhandleDeleteWatched}) {
    return <ul className="list">
        {watched.map((movie) => (
            <WatchedMovie movie={movie} key={movie.imdbID} onhandleDeleteWatched={onhandleDeleteWatched}/>
        ))}
    </ul>
}


function WatchedMovie({movie, onhandleDeleteWatched}) {
    return <li key={movie.imdbID}>
        <img src={movie.poster} alt={`${movie.title} poster`}/>
        <h3>{movie.title}</h3>
        <div>
            <p>
                <span>⭐️</span>
                <span>{movie.imdbRating}</span>
            </p>
            <p>
                <span>🌟</span>
                <span>{movie.movieRating}</span>
            </p>
            <p>
                <span>⏳</span>
                <span>{movie.runtime} min</span>
            </p>

            <button className="btn-delete" onClick={() => onhandleDeleteWatched(movie.imdbID)}>X</button>
        </div>
    </li>
}



