import React from 'react';
import { Provider } from 'react-redux';
import io from 'socket.io-client';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducer from './reducers/reducer';
import DraftClientLayout from './containers/DraftClientLayout';
import * as playerDrafterActions from './actions/playerDrafterActions';
import * as playerSearcherActions from './actions/playerSearcherActions';
import * as userActions from './actions/userActions';


const INITIAL_STATE = {
  players: [],
  extendedPlayer: {
    name: 'Edgar Martinez',
    position: 'DH',
    rank: 11,
    isHallOfFame: true,
    playerId: 0,
  },
  selectedPlayerId: 0,
  playerSearchString: '',
  isLoading: false,
  error: '',
  userId: -1,
  currentPickUserId: -1,
  draftHistory: [],
  futurePicks: [],
  userRoster: [],
  users: [],
  isPaused: false,
};

const fullInitialState = {
  playerSearcher: INITIAL_STATE,
};

const store = createStore(reducer, fullInitialState, applyMiddleware(thunk));

class DraftClient extends React.Component {
  constructor() {
    super();
    this.socket = io.connect(window.location.host);

    // Some server errors require a force refresh of the client
    // including on server reset
    this.socket.on('force_refresh', () => {
      window.location.reload();
    });

    this.socket.on('user_status', (status) => {
      if (status) {
        console.log('Update user status');
        const updatedUsers = [];
        store.getState().playerSearcher.users.forEach((user) => {
          const updatedUser = user;
          if (user.id === status.userId) {
            updatedUser.online = status.online;
          }
          updatedUsers.push(updatedUser);
        });
        store.dispatch(userActions.updateUsers(updatedUsers));
      }
    });

    this.socket.on('connection_verified', (userId) => {
      console.log('Handshake complete.');
      console.log(`Current userId is: ${userId}`);
      store.dispatch(playerDrafterActions.setUserId(userId));
    });

    // Players & users data is required to come in first due to dependencies on it
    this.socket.on('draft_orchestration_preload', (orchestrationData) => {
      console.log('Update players on preload');
      store.dispatch(playerSearcherActions.searchPlayersSuccess(orchestrationData.players));

      console.log('Update users on preload');
      store.dispatch(userActions.updateUsers(orchestrationData.users));

      this.socket.emit('draft_orchestration_preload_success');
    });

    this.socket.on('draft_orchestration_load', (preloadData) => {
      console.log('Update current pick user on first load');
      store.dispatch(playerDrafterActions.setCurrentPickUserId(preloadData.currentPickUserId));

      console.log('Update draft history on first load');
      store.dispatch(playerDrafterActions.updateHistory(preloadData.draftHistory));

      console.log('Update ticker on first load');
      store.dispatch(playerDrafterActions.updateFuturePicks(preloadData.futurePicks));

      console.log('Update roster on first load');
      store.dispatch(playerDrafterActions.updateUserRoster(preloadData.userRoster));

      console.log('Update if draft is paused or not on first load');
      store.dispatch(playerDrafterActions.updateDraftPauseState(preloadData.isPaused));
    });

    // When someone drafts a player:
    // a. remove the player from everyone's selectable track
    // b. update the current user pick
    // c. block off client side drafting by non current users
    this.socket.on('player_drafted', (playerDraftedData) => {
      console.log(JSON.stringify(playerDraftedData));
      const userId = store.getState() && store.getState().playerSearcher.userId;

      store.dispatch(playerDrafterActions
        .setCurrentPickUserId(playerDraftedData.currentPickUserId));

      store.dispatch(playerDrafterActions
        .updateFuturePicks(playerDraftedData.futurePicks));

      this.socket.emit('get_user_roster', userId);

      // Only updates for non-active users (who are not currently picking)
      if (userId !== playerDraftedData.previousPickUserId) {
        const historyPlayerData = [{
          previousPickUserId: playerDraftedData.previousPickUserId,
          previousPickPlayerId: playerDraftedData.previousPickPlayerId,
          previousPickRound: playerDraftedData.previousPickRound,
          previousPickPickNumber: playerDraftedData.previousPickPickNumber,
        }];

        store.dispatch(playerDrafterActions
          .updateHistory(historyPlayerData));
        // store.dispatch(playerDrafterActions.updateUserRosters)

        store.dispatch(playerDrafterActions
          .markPlayerAsDrafted(playerDraftedData.previousPickPlayerId));
      }
    });

    this.socket.on('get_user_roster_return', (userRoster) => {
      store.dispatch(playerDrafterActions
        .updateUserRoster(userRoster));
    });

    this.socket.on('toggle_pause_draft_return', (isPaused) => {
      store.dispatch(playerDrafterActions.updateDraftPauseState(isPaused));
    });

    this.socket.on('admin_roll_back_pick_return', (response) => {
      // MOVE TO function
      console.log('Update current pick user on first load');
      store.dispatch(playerDrafterActions.setCurrentPickUserId(response.currentPickUserId));

      store.dispatch(playerSearcherActions.searchPlayersSuccess(response.players));

      console.log('Remove last player from draft history');
      store.dispatch(playerDrafterActions.rollbackDraftHistory());

      console.log('Update ticker on first load');
      store.dispatch(playerDrafterActions.updateFuturePicks(response.futurePicks));

      console.log('Update roster on first load');
      store.dispatch(playerDrafterActions.updateUserRoster(response.userRoster));

      console.log('Update if draft is paused or not on first load');
      store.dispatch(playerDrafterActions.updateDraftPauseState(response.isPaused));
    });

    this.socket.on('draft_complete', () => {
      alert('Draft finished');
    });
  }

  componentWillUnmount() {
    this.socket.disconnect();
  }

  render() {
    return (
      <Provider store={store}>
        <DraftClientLayout socket={this.socket} />
      </Provider>
    );
  }
}

export default DraftClient;
