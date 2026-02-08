import { example, localClient, prodClient } from "./config";

example(
  "teams",
  "getTeamSwissTournaments",
  await prodClient().GET("/api/team/{teamId}/swiss", {
    params: {
      path: {
        teamId: "lichess-swiss",
      },
      query: {
        max: 1,
      },
    },
  }),
);

example(
  "teams",
  "getSingleTeam",
  await prodClient().GET("/api/team/{teamId}", {
    params: {
      path: {
        teamId: "lichess-swiss",
      },
    },
  }),
);

example("teams", "getPopularTeams", await prodClient().GET("/api/team/all"));

example(
  "teams",
  "teamsOfPlayer",
  await localClient().GET("/api/team/of/{username}", {
    params: {
      path: {
        username: "bobby",
      },
    },
  }),
);

example(
  "teams",
  "searchTeams",
  await prodClient().GET("/api/team/search", {
    params: {
      query: {
        text: "coders",
      },
    },
  }),
);
