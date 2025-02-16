const apiUrl =
  "https://tmdb-proxy.cubos-academy.workers.dev/3/discover/movie?language=pt-BR&include_adult=false";
const imgHtml = document.querySelector(".backgroundimg");
const movies = document.querySelector(".movies");

const btnNext = document.querySelector(".btn-next");
const btnPrev = document.querySelector(".btn-prev");

let page = 0;

let movieData = [];

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await axios.get(apiUrl);
    movieData = response.data.results;
    pagination();
    filmeDoDia();
  } catch (error) {
    console.error("Erro ao carregar site", error);
  }
});

const createMovieCard = (movie) => {
  if (!movie || !movie.poster_path || !movie.title || !movie.vote_average) {
    return;
  }

  const movieContainer = document.createElement("div");
  movieContainer.classList.add("movie");
  movieContainer.style.backgroundImage = `url(${movie.poster_path})`;

  const movieInfo = document.createElement("div");
  movieInfo.classList.add("movie__info");

  const movieTitle = document.createElement("span");
  movieTitle.classList.add("movie__title");
  movieTitle.textContent = movie.title;
  movieTitle.title = movie.title;

  const movieRating = document.createElement("span");
  movieRating.classList.add("movie__rating");
  const ratingStar = document.createElement("img");
  ratingStar.src = "./assets/estrela.svg";
  ratingStar.alt = "rating star image";

  const voteAverage = document.createElement("span");
  voteAverage.textContent = movie.vote_average.toFixed(2);

  movieRating.appendChild(ratingStar);
  movieRating.appendChild(voteAverage);
  movieInfo.appendChild(movieTitle);
  movieInfo.appendChild(movieRating);
  movieContainer.appendChild(movieInfo);
  movies.appendChild(movieContainer);

  movieContainer.addEventListener("click", () => openModal(movie.id));
};

const input = document.querySelector(".input");

input.addEventListener("keyup", async (event) => {
  if (event.key !== "Enter") {
    return;
  }
  if (input.value.trim() == "") {
    return;
  }

  const searchQuery = input.value.trim();

  const searchUrl = `https://tmdb-proxy.cubos-academy.workers.dev/3/search/movie?language=pt-BR&include_adult=false&query=${searchQuery}`;
  try {
    const response = await axios.get(searchUrl);
    const searchResults = response.data.results;

    page = 0;

    if (!searchResults || searchResults.length === 0) {
      loadMovies();
    } else {
      movieData = searchResults;
      pagination();
      input.value = "";
    }
  } catch (error) {
    console.error("Erro ao buscar filmes:", error);
    loadMovies();
  }
});

const pagination = () => {
  movies.innerHTML = "";
  try {
    const start = page * 5;
    const end = Math.min(start + 5, movieData.length);

    for (let i = start; i < end; i++) {
      const movie = movieData[i];
      if (!movie) {
        continue;
      }
      createMovieCard(movie);
    }
  } catch (error) {
    console.error(error.message);
  }
};

btnNext.addEventListener("click", () => {
  if (page < Math.floor((movieData.length - 1) / 5)) {
    page++;
  } else {
    page = 0;
  }

  pagination();
});

btnPrev.addEventListener("click", () => {
  if (page > 0) {
    page--;
  } else {
    page = Math.floor((movieData.length - 1) / 5);
  }

  pagination();
});

const loadMovies = async () => {
  try {
    const response = await axios.get(apiUrl);
    movieData = response.data.results;
    pagination();
  } catch (error) {
    console.error(error);
  }
};

const modal = document.querySelector(".modal");
const modalClose = document.querySelector(".modal__close");
const modalTitle = document.querySelector(".modal__title");
const modalImage = document.querySelector(".modal__img");
const modalDesc = document.querySelector(".modal__description");
const modalAverage = document.querySelector(".modal__average");
const modalGenres = document.querySelector(".modal__genres");

async function openModal(id) {
  const data = await axios.get(
    `https://tmdb-proxy.cubos-academy.workers.dev/3/movie/${id}?language=pt-BR`
  );
  const results = data.data;

  modalGenres.innerHTML = "";

  for (const genres of results.genres) {
    const span = document.createElement("span");
    span.classList.add("modal__genre");
    span.textContent = genres.name;
    modalGenres.appendChild(span);
  }
  modal.classList.remove("hidden");
  modalAverage.textContent = results.vote_average.toFixed(1);
  modalImage.src = results.backdrop_path;
  modalDesc.textContent = results.overview;
  modalTitle.textContent = results.title;
}

modal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

modalClose.addEventListener("click", () => {
  modal.classList.add("hidden");
});

const filmeDoDia = async () => {
  try {
    const highLightVideo = document.querySelector(".highlight__video-link");
    const highLightTitle = document.querySelector(".highlight__title");
    const highLightRating = document.querySelector(".highlight__rating");
    const highLightGenres = document.querySelector(".highlight__genres");
    const highLightLaunch = document.querySelector(".highlight__launch");
    const highLightDescription = document.querySelector(
      ".highlight__description"
    );

    const result = await axios.get(
      "https://tmdb-proxy.cubos-academy.workers.dev/3/movie/436969?language=pt-BR"
    );
    const {
      backdrop_path,
      title,
      vote_average,
      genres,
      release_date,
      overview,
    } = result.data;
    const dataVideo = await axios.get(
      "https://tmdb-proxy.cubos-academy.workers.dev/3/movie/436969/videos?language=pt-BR"
    );

    const splitDate = release_date.split("-");
    const releaseDate = `${splitDate[2]}-${splitDate[1]}-${splitDate[0]}`;

    highLightVideo.style.backgroundImage = `url(${backdrop_path})`;
    highLightDescription.textContent = overview;
    highLightRating.textContent = vote_average.toFixed(1);
    highLightGenres.textContent = genres.map((genre) => genre.name).join(", ");
    highLightTitle.textContent = title;
    highLightLaunch.textContent = releaseDate;
    highLightVideo.href = `https://www.youtube.com/watch?v=${dataVideo.data.results[0].key}`;
  } catch (error) {
    console.log(error);
  }
};

loadMovies();
