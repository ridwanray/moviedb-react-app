import {
    POPULAR_MOVIES_FETCH_SUCCESS,
    TOP_RATED_MOVIES_FETCH_SUCCESS,
    UPCOMING_MOVIES_FETCH_SUCCESS
} from "../home/home.types"
import {GENRES_FETCH_SUCCESS} from "../common/common.types"
import {RECOMMENDED_MOVIES_FETCH_SUCCESS, SIMILAR_MOVIES_FETCH_SUCCESS} from "../movie/movie.types"
import {SEARCH_SUCCESS} from "../search/search.types"
import {prepareImage} from "../../utils"

const initialState = {
    moviesById: {},
    genresById: {}
}

export function entitiesReducer(state = initialState, action) {
    const {type, payload} = action
    switch (type) {
        case GENRES_FETCH_SUCCESS:
            const genresById = {}
            for (let genre of payload.genres) {
                genresById[genre.id] = genre.name
            }
            return {...state, genresById: genresById}
        case POPULAR_MOVIES_FETCH_SUCCESS:
        case TOP_RATED_MOVIES_FETCH_SUCCESS:
        case UPCOMING_MOVIES_FETCH_SUCCESS:
        case SIMILAR_MOVIES_FETCH_SUCCESS:
        case RECOMMENDED_MOVIES_FETCH_SUCCESS:
        case SEARCH_SUCCESS:
            const moviesById = {...state.moviesById}
            for (let movie of payload.results) {
                moviesById[movie.id] = prepareMovie(movie)
            }
            return {...state, moviesById: moviesById}
        default:
            return state
    }
}

function prepareMovie(raw = {}) {
    return {
        id: raw.id,
        name: raw.title,
        overview: raw.overview,
        genreIds: raw.genre_ids,
        date: new Date(raw.release_date),
        voteAverage: raw.vote_average,
        posterImageUrl: prepareImage(raw.poster_path),
        backdropImageUrl: prepareImage(raw.backdrop_path),
    }
}
