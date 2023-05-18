const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("No error: initializing Done");
    });
  } catch (error) {
    console.log(`error: ${error}`);
    process.exit(1);
  }
};

initializeDBandServer();

app.get("/movies/", async (request, response) => {
  const movieQuery = `SELECT movie_name
    FROM movie;`;
  const getmovieDetail = await db.all(movieQuery);
  const getfiltermovieDetail = getmovieDetail.map((eachMovie) => {
    return {
      movieName: eachMovie.movie_name,
    };
  });
  response.send(getfiltermovieDetail);
});

app.post("/movies/", async (request, response) => {
  const getData = request.body;
  const { directorId, movieName, leadActor } = getData;
  const postQuery = `
    INSERT INTO movie
    (director_id, movie_name, lead_actor)
    VALUES
    (${directorId}, '${movieName}', '${leadActor}');
    `;
  const getaddData = await db.run(postQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  try {
    const getQueryData = `
    SELECT * FROM movie
    WHERE movie_id = ${movieId};
    `;
    const getmovieData = await db.get(getQueryData);
    const filtermovieData = (getmovieData) => {
      return {
        movieId: getmovieData.movie_id,
        directorId: getmovieData.director_id,
        movieName: getmovieData.movie_name,
        leadActor: getmovieData.lead_actor,
      };
    };
    response.send(filtermovieData);
  } catch (e) {
    console.log(`Error: ${e}`);
  }
});

app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateQuery = `UPDATE movie
    SET director_id = ${directorId}, movie_name = '${movieName}', 
    lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;
  const updateMovieDetails = await db.run(updateQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;

  const getDeleteMovie = await db.run(deleteQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorDetails = `
    SELECT * FROM director;
    `;

  const getAlldirectorsName = await db.all(getDirectorDetails);
  const filterDirectorsName = getAlldirectorsName.map((eachDirecotr) => {
    return {
      directorId: eachDirecotr.director_id,
      directorName: eachDirecotr.director_name,
    };
  });
  response.send(filterDirectorsName);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const singleMovieDetialQuery = `
    SELECT * FROM movie
    WHERE director_id = ${directorId};
    `;
  const getMovieDetail = await db.get(singleMovieDetialQuery);
  const filtersingleMovieDetail = (getMovieDetail) => {
    return {
      movieName: getMovieDetail.movie_name,
    };
  };
  response.send(filtersingleMovieDetail);
});

module.exports = app;
