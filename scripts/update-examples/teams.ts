import { example, localClient, prodClient } from "./config";

export default async function teams() {
  await example(
    "teams",
    "getTeamSwissTournaments",
    prodClient().GET("/api/team/{teamId}/swiss", {
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

  await example(
    "teams",
    "getSingleTeam",
    prodClient().GET("/api/team/{teamId}", {
      params: {
        path: {
          teamId: "lichess-swiss",
        },
      },
    }),
  );

  await example("teams", "getPopularTeams", prodClient().GET("/api/team/all"));

  await example(
    "teams",
    "teamsOfPlayer",
    localClient().GET("/api/team/of/{username}", {
      params: {
        path: {
          username: "bobby",
        },
      },
    }),
  );

  await example(
    "teams",
    "searchTeams",
    prodClient().GET("/api/team/search", {
      params: {
        query: {
          text: "coders",
        },
      },
    }),
  );
}
