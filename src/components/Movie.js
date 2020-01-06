import React, {useCallback, useEffect} from 'react'
import Container from "@material-ui/core/Container"
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"
import Rating from "@material-ui/lab/Rating"
import {makeStyles} from "@material-ui/core/styles"
import {connect} from "react-redux"
import {fetchMovie, fetchRecommendedMovies, fetchSimilarMovies} from "../store/domains/movie/movie.actions"
import LazyLoad from 'react-lazyload'
import {getMovie} from "../store/utils"
import MovieBrowser from "./MovieBrowser"
import MoviePagePlaceholder from "./placeholders/MoviePagePlaceholder"
import {useParams} from "react-router"
import FavoriteIcon from "@material-ui/icons/Favorite"
import Button from "@material-ui/core/Button"
import {toggleFavorite} from "../store/domains/user/user.actions"

const useStyles = makeStyles(theme => ({
    movieContainer: {
        paddingTop: 50,
        paddingBottom: 50,
    },
    backdrop: {
        position: 'absolute',
        height: '100%',
        width: '100%',
        zIndex: -1,
        '&:after': {
            position: 'absolute',
            content: "''",
            display: 'block',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(30, 47, 60, 0.75)',
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(30, 47, 60, 0.75) 0%, rgba(48, 65, 78, 0.75) 100%)'
        }
    },
    backdropImage: {
        display: 'block',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    poster: {
        width: '100%',
        borderRadius: 10,
        boxShadow: '0px 3px 20px #0000003b',
    },
    releaseDate: {
        fontSize: '11pt',
        color: '#dadde2'
    },
    vote: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '12pt'
    },
    genreList: {
        listStyle: 'none',
        padding: 0,
        display: 'flex',
        flexWrap: 'wrap',
    },
    genre: {
        cursor: 'pointer',
        padding: '1px 6px',
        marginRight: 10,
        border: '1px solid white',
        borderRadius: 4,
        fontSize: '10pt'
    },
    subtitle: {
        marginBottom: 8,
        fontSize: '13pt'
    },
    crewList: {
        listStyle: 'none',
        padding: 0,
    },
}))

function Movie(props) {
    const {id: urlId} = useParams()
    const {
        isAppReady,

        movie,
        user,

        fetchMovie,
        toggleFavorite
    } = props
    const {
        id,
        title,
        genres,
        duration,
        budget,
        backdropImage,
        posterImage,
        releaseDate,
        productionCountries,
        voteAverage,
        legend,
        overview,
        crew,
        actors,

        isFavorite,
        isFetched,
        isFetching
    } = movie

    const classes = useStyles()

    // TODO Sort actors and crew by their popularity/importance

    useEffect(function () {
        fetchMovie(urlId)
        window.scrollTo({top: 0, left: 0})
    }, [urlId, fetchMovie])

    return (
        <React.Fragment>
            <main style={{position: 'relative'}}>
                <div className={classes.backdrop}>
                    <img className={classes.backdropImage} src={backdropImage} alt={"Backdrop of " + title}/>
                </div>
                <Container className={classes.movieContainer}>
                    {(isAppReady && isFetched) ?
                        <Grid container spacing={7}>
                            <Grid item md={3}>
                                <img className={classes.poster} src={posterImage} alt={"Poster of " + title}/>
                            </Grid>
                            <Grid item md={8} style={{color: 'white'}}>
                                <div className={classes.releaseDate}>
                                    {Utils.formatDate(releaseDate)} ({productionCountries.join(', ')})
                                </div>
                                <Typography variant={"h4"} style={{fontWeight: 'bold'}} component={"h1"}>
                                    {title}
                                </Typography>
                                <ul className={classes.genreList}>
                                    {genres.map(genre => (
                                        <li className={classes.genre} key={genre}>{genre}</li>
                                    ))}
                                </ul>
                                <div className={classes.vote}>
                                    <Rating value={voteAverage / 2} readOnly/>
                                    <span style={{margin: '2px 0px 0 6px'}}>{voteAverage}/10</span>
                                    <Button
                                        style={{marginLeft: 16}}
                                        onClick={() => toggleFavorite(id)}
                                        variant={isFavorite ? "contained" : "outlined"}
                                        color="secondary"
                                        aria-label="like"
                                    >
                                        <FavoriteIcon/>
                                    </Button>
                                </div>
                                <div style={{marginTop: 10}}>
                                    <Typography component={"div"} style={{marginRight: 15}}>
                                        <b>Duration:</b> {duration} min.
                                    </Typography>
                                    <Typography component={"div"}>
                                        <b>Budget:</b> {budget ? '$' + Utils.numberWithCommas(budget) : '-'}
                                    </Typography>
                                </div>
                                {legend && <React.Fragment>
                                    <h3 className={classes.subtitle}>Legend</h3>
                                    <Typography variant={"body1"}>{legend}</Typography>
                                </React.Fragment>}
                                {overview && <React.Fragment>
                                    <h3 className={classes.subtitle}>Overview</h3>
                                    <Typography variant={"body1"}>{overview}</Typography>
                                </React.Fragment>}
                                {crew.length && <React.Fragment>
                                    <h3 className={classes.subtitle}>Crew</h3>
                                    <Grid container spacing={3} component="ul" className={classes.crewList}>
                                        {crew.slice(0, 4).map((person, i) => (
                                            <Grid item md={3} sm={6} component="li" key={i} style={{paddingRight: 16}}>
                                                <Typography variant={"body2"}
                                                            style={{fontWeight: 'bold'}}>{person.name}</Typography>
                                                <Typography
                                                    variant={"body2"}>{person.department}, {person.job}</Typography>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </React.Fragment>}
                            </Grid>
                        </Grid> :
                        <MoviePagePlaceholder/>}
                </Container>
            </main>
            <SecondBlock {...props} id={urlId}/>
        </React.Fragment>
    )
}

function SecondBlock(props) {
    const {
        id,

        movie,
        entities,
        user,

        toggleFavorite,
        fetchSimilarMovies,
        fetchRecommendedMovies,
    } = props

    const {recommendedMovies: recommended, similarMovies: similar} = movie

    const MOVIES_PER_LIST = 6

    const recommendedMovies = recommended.ids.slice(0, MOVIES_PER_LIST).map(id => getMovie(id, entities, user))
    const similarMovies = similar.ids.slice(0, MOVIES_PER_LIST).map(id => getMovie(id, entities, user))

    const fetchSimilarMoviesCb = useCallback(() => fetchSimilarMovies(id), [id, fetchSimilarMovies])
    const fetchRecommendedMoviesCb = useCallback(() => fetchRecommendedMovies(id), [id, fetchRecommendedMovies])

    return (
        <Container>
            <section>
                <h2>Recommended movies</h2>
                <LazyLoad height={400}>
                    <MovieList
                        isFetching={recommended.isFetching}
                        isFetched={recommended.isFetched}
                        movies={recommendedMovies}
                        placeholderAmount={MOVIES_PER_LIST}
                        fetch={fetchRecommendedMoviesCb}
                        onFavorite={toggleFavorite}
                    />
                </LazyLoad>
            </section>
            <section>
                <h2>Similar movies</h2>
                <LazyLoad height={400}>
                    <MovieList
                        isFetching={similar.isFetching}
                        isFetched={similar.isFetched}
                        movies={similarMovies}
                        placeholderAmount={MOVIES_PER_LIST}
                        fetch={fetchSimilarMoviesCb}
                        onFavorite={toggleFavorite}
                    />
                </LazyLoad>
            </section>
        </Container>
    )
}

const movieListStyles = makeStyles(theme => ({
    container: {
        "height": 300,
        "background": "#f3f3f3",
        "borderRadius": 4,
        "display": "flex",
        "justifyContent": "center",
        "alignItems": "center",
        "color": "rgba(0, 0, 0, 0.20)"
    }
}))

function MovieList({isFetching, isFetched, movies = [], placeholderAmount, fetch, onFavorite}) {
    const classes = movieListStyles()

    useEffect(function () {
        fetch()
    }, [fetch])

    if (isFetched && !movies.length) return (
        <div className={classes.container}>
            <Typography variant="body1">There is no data for this movie</Typography>
        </div>
    )

    return (
        <MovieBrowser placeholdersAmount={placeholderAmount}
                      isFetching={isFetching}
                      isFetched={isFetched}
                      movies={movies}
                      onFavorite={onFavorite}
        />
    )
}

const Utils = {
    formatDate(date) {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ]
        return `${date.getDay()} ${monthNames[date.getMonth()]}, ${date.getFullYear()}`
    },
    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

function mapStateToProps(state) {
    return {
        isAppReady: state.common.isAppReady,
        movie: {
            ...state.movie,
            isFavorite: state.movie.id ? state.user.favoriteMovieIds.indexOf(state.movie.id) !== -1 : false
        },
        entities: state.entities,
        user: state.user
    }
}

function mapDispatchToProps(dispatch) {
    return {
        fetchMovie: (id) => dispatch(fetchMovie(id)),
        fetchSimilarMovies: (id) => dispatch(fetchSimilarMovies(id)),
        fetchRecommendedMovies: (id) => dispatch(fetchRecommendedMovies(id)),
        toggleFavorite: (id) => dispatch(toggleFavorite(id))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Movie)
