import Grid from "@material-ui/core/Grid"
import MovieCard from "./MovieCard"
import React from "react"
import {makeStyles} from "@material-ui/core/styles"
import CircularProgress from "@material-ui/core/CircularProgress"
import PropTypes from 'prop-types'
import {Movie} from "../types/movie-type"
import Skeleton from "@material-ui/lab/Skeleton"
import {Box} from "@material-ui/core"
import Button from "@material-ui/core/Button"
import {Loop} from "@material-ui/icons"
import LazyLoad from 'react-lazyload'

const useStyles = makeStyles(theme => ({
    movieItem: {
        cursor: 'pointer',
        margin: 10,
        transition: 'all 0.1s cubic-bezier(0, 0, 0.2, 1)',
        transitionDelay: '0.075s',
        "&:hover": {
            background: 'white',
            boxShadow: '0px 10px 13px #0000000a',
            transform: "scale(1.075)",
            zIndex: 2,
        },
        [theme.breakpoints.down('sm')]: {
            margin: '15px 25px',
        },
    },
    loader: {
        height: 400,
        width: 300,
        margin: "0 auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    button: {
        marginTop: 20,
    },
    buttonProgress: {
        color: theme.palette.primary,
        animationDuration: '550ms',
        marginRight: 6
    },
}))

MovieBrowser.propTypes = {
    movies: PropTypes.arrayOf(Movie),
    isFetching: PropTypes.bool,
    isFetched: PropTypes.bool,
    totalMovies: PropTypes.number,
}

function MoviePlaceholder() {
    return (
        <Box>
            <Skeleton variant="rect" width={'100%'} height={250}/>
            <Skeleton variant="rect" style={{marginTop: 15}} width='100%'/>
            <Skeleton variant="rect" style={{marginTop: 8}} width='70%'/>
        </Box>
    )
}

function MovieBrowser({movies = [], isFetching, isFetched, totalMovies, onLoadMore, ...rest}) {
    const classes = useStyles()

    return (
        <React.Fragment>
            <Grid container justify="flex-start" wrap={"wrap"} spacing={2} {...rest}>
                {(isFetched ? movies : Array.from(new Array(10))).map((movie, index) => (
                    <Grid className={classes.movieItem} item key={index} xs={12} sm={4} md={2}>
                        {movie ?
                            <LazyLoad height={400} once placeholder={<MoviePlaceholder/>}>
                                <MovieCard {...movie} />
                            </LazyLoad> : <MoviePlaceholder/>}
                    </Grid>
                ))}
            </Grid>
            {!!movies.length &&
            <Button className={classes.button} variant="outlined" fullWidth size={"large"} disabled={isFetching} onClick={onLoadMore}>
                {isFetching ?
                    <CircularProgress
                        className={classes.buttonProgress}
                        variant="indeterminate"
                        disableShrink
                        size={16}
                        thickness={4}/> :
                    <Loop className={classes.buttonProgress}/>}
                {isFetching ? 'Loading...' : 'Load more'}
            </Button>}
        </React.Fragment>
    )
}

export default MovieBrowser