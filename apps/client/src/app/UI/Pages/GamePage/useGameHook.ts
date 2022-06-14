import {
  votingControllerResume,
  votingControllerFinish,
} from './../../../../../../../libs/shared/backend-api-client/src/backend';
import { useAuth } from '@planning-poker/react/api-hooks';
import {
  Custom,
  useVotingControllerFinish,
  useVotingControllerSetCurrentIssue,
} from '@planning-poker/shared/backend-api-client';
import { SetIssuesBody } from '@planning-poker/shared/backend-api-client';
import { useVotingControllerSetIssues } from '@planning-poker/shared/backend-api-client';
import { useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import {
  useVotingControllerVote,
  useVotingControllerGetResult,
  useVotingControllerStartNew,
  calculateEtag,
  GetResultSuccessDto,
} from '@planning-poker/shared/backend-api-client';
import { useGlobalState } from '../../../GlobalStateProvider';
import { useMutation, useQueryClient } from 'react-query';
import { useLocation } from 'react-router-dom';
import { useGameResult } from '@planning-poker/react/api-hooks';

export const useGameHook = () => {
  const { authToken, profile } = useAuth();
  const g = useGlobalState();
  const params = useParams();
  const room = params['id']!;

  const setIssues = useVotingControllerSetIssues();
  const mutateSetIssues = (x: SetIssuesBody) => {
    return setIssues.mutateAsync({ roomID: room, data: x });
  };

  const setActiveIssue = useVotingControllerSetCurrentIssue();
  const mutateSetActiveIssue = (id: string) => {
    return setActiveIssue.mutateAsync({ roomID: room, data: { id } });
  };

  const finishGame = useMutation({
    mutationFn: () => votingControllerFinish(room),
  });

  const resumeGame = useMutation(() => votingControllerResume(room));

  const vote = useMutation({
    mutationFn: (score: number | null) =>
      Custom.votingControllerVote(
        room,
        { player: g.state.userName ?? 'unknown' + Math.random(), score },
        authToken
      ),
    onSettled: () => result.fetch(),
  });

  const startNew = useMutation({
    mutationFn: (name: string) =>
      Custom.votingControllerStartNew(room, { name }, authToken),
  });

  const result = useGameResult();

  const loginToVoting = useCallback(
    function loginToVoting() {
      return vote.mutateAsync(null);
    },
    [g.state.userName, vote]
  );

  const voteFn = useCallback(
    function voteFNN(value: number | null) {
      console.log('vote', g.state.userName);
      if (g.state.userName) {
        vote.mutateAsync(value);
      }
    },
    [g.state.userName, vote]
  );

  useEffect(function loginToVotingAtStartup() {
    //loginToVoting();
    result.fetch();
  }, []);

  return {
    data: {
      ...result.data,
      players: [...result.data.players].reverse().reduce((all, player) => {
        if (all.find((x) => x.player === player.player) === undefined) {
          all.push(player);
        }
        return all;
      }, [] as typeof result.data.players),
    } as typeof result.data,
    startNewVoting: (gameName: string) => startNew.mutateAsync(gameName).then(() => profile?.refetch()),
    vote: voteFn,
    setIssues: { ...setIssues, mutateAsync: mutateSetIssues },
    setActiveIssue: { ...setActiveIssue, mutateAsync: mutateSetActiveIssue },
    finishGame,
    resumeGame,
    amIHost: profile?.data?.roomsCreated.find((r) => r === room) !== undefined,
  };
};
