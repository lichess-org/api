import {
  cleanUp,
  example,
  firstNdJson,
  localClient,
  ok,
  prodClient,
  readNdJson,
  seededTeams,
  streamTimeout,
} from "./config";

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

  await example(
    "teams",
    "getMembersOfTeam",
    firstNdJson(
      await localClient().GET("/api/team/{teamId}/users", {
        params: {
          path: {
            teamId: seededTeams.open,
          },
        },
        headers: {
          Accept: "application/x-ndjson",
        },
        parseAs: "stream",
        signal: streamTimeout(),
      }),
    ),
  );

  await example("teams", "updates", localClient().GET("/team/updates"));

  await example(
    "teams",
    "updates-of-team",
    localClient().GET("/team/updates/{teamId}", {
      params: {
        path: {
          teamId: seededTeams.open,
        },
      },
    }),
  );

  await joinAndQuitOpenTeam();
  await handleJoinRequests();
}

/** An open team accepts anyone immediately, so this leaves the team as it was. */
async function joinAndQuitOpenTeam() {
  const team = seededTeams.open;
  const player = seededTeams.outsider;
  const quit = () =>
    localClient(player).POST("/team/{teamId}/quit", {
      params: {
        path: {
          teamId: team,
        },
      },
    });

  try {
    await example(
      "teams",
      "joinTeam",
      localClient(player).POST("/team/{teamId}/join", {
        params: {
          path: {
            teamId: team,
          },
        },
      }),
    );

    await example("teams", "quitTeam", quit());
  } catch (error) {
    await cleanUp(quit);
    throw error;
  }
}

/**
 * A team that reviews its join requests: players ask to join, and the leader accepts, declines or
 * kicks them.
 *
 * A player the team has declined or kicked can never ask again (the request is dropped without an
 * error), so every run needs players that have no history with the team yet.
 */
async function handleJoinRequests() {
  const team = seededTeams.closed;
  const leader = seededTeams.leader;

  const [accepted, declined] = await requestToJoin(team, leader, 2);
  const kickAccepted = () =>
    localClient(leader).POST("/api/team/{teamId}/kick/{userId}", {
      params: {
        path: {
          teamId: team,
          userId: accepted!,
        },
      },
    });

  // A request that is left pending is picked up by the next run, but a member has to be kicked
  let isMember = false;
  try {
    await example(
      "teams",
      "getJoinRequests",
      localClient(leader).GET("/api/team/{teamId}/requests", {
        params: {
          path: {
            teamId: team,
          },
        },
      }),
    );

    await example(
      "teams",
      "acceptJoinRequest",
      localClient(leader).POST("/api/team/{teamId}/request/{userId}/accept", {
        params: {
          path: {
            teamId: team,
            userId: accepted!,
          },
        },
      }),
    );
    isMember = true;

    await example(
      "teams",
      "declineJoinRequest",
      localClient(leader).POST("/api/team/{teamId}/request/{userId}/decline", {
        params: {
          path: {
            teamId: team,
            userId: declined!,
          },
        },
      }),
    );

    await example("teams", "kickFromTeam", kickAccepted());
    isMember = false;

    await example(
      "teams",
      "sendTeamUpdate",
      localClient(leader).POST("/team/{teamId}/pm-all", {
        params: {
          path: {
            teamId: team,
          },
        },
        body: {
          // Sending the same message again soon is rejected, so make each run's message different
          message: `Welcome to the team! Our next tournament starts on Friday. (${new Date().toISOString()})`,
        },
      }),
    );
  } catch (error) {
    if (isMember) await cleanUp(kickAccepted);
    throw error;
  }
}

/** Ask `team` to join on behalf of players until `count` of them have a pending request. */
async function requestToJoin(team: string, leader: string, count: number) {
  const candidates: string[] = [];
  for await (const member of readNdJson(
    await localClient().GET("/api/team/{teamId}/users", {
      params: {
        path: {
          teamId: "lichess-swiss",
        },
      },
      headers: {
        Accept: "application/x-ndjson",
      },
      parseAs: "stream",
      signal: streamTimeout(),
    }),
  )) {
    candidates.push(member.id);
  }

  const pending: string[] = [];
  for (const candidate of candidates) {
    ok(
      await localClient(candidate).POST("/team/{teamId}/join", {
        params: {
          path: {
            teamId: team,
          },
        },
        body: {
          message: "I would like to join your team, please let me in!",
        },
      }),
    );
    const requests = ok(
      await localClient(leader).GET("/api/team/{teamId}/requests", {
        params: {
          path: {
            teamId: team,
          },
        },
      }),
    );
    if (requests.some((r) => r.request.userId === candidate)) {
      pending.push(candidate);
      if (pending.length === count) return pending;
    }
  }
  throw new Error(
    `Only ${pending.length} of ${count} players could ask to join ${team}. Everyone has been declined or kicked already; reset the database.`,
  );
}
