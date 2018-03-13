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
import initialState from './initialState';

const fullInitialState = {
  playerSearcher: initialState,
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

    this.socket.on('connection_verified', ({ userId, isAdmin }) => {
      console.log(`Current userId is: ${userId}`);
      store.dispatch(userActions.setUserId(userId));
      if (isAdmin) {
        store.dispatch(userActions.markUserAsAdmin(true));
      }
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

      console.log('Update current user roster id selected on first load (should be the client userId)');
      store.dispatch(playerDrafterActions
        .updateCurrentSelectedUserRosterId(store.getState().playerSearcher.userId));

      console.log('Update draft history on first load');
      store.dispatch(playerDrafterActions.updateHistory(preloadData.draftHistory));

      console.log('Update ticker on first load');
      store.dispatch(playerDrafterActions.updateFuturePicks(preloadData.futurePicks));

      console.log('Update roster on first load');
      store.dispatch(playerDrafterActions.updateUserRoster(preloadData.userRoster));

      console.log('Update if draft is paused or not on first load');
      store.dispatch(playerDrafterActions.updateDraftPauseState(preloadData.isPaused));

      console.log('Update user next pick on first load');
      store.dispatch(playerDrafterActions.updateNextUserPick(preloadData.nextUserPick));
    });

    // When someone drafts a player:
    // a. remove the player from everyone's selectable track
    // b. update the current user pick
    // c. block off client side drafting by non current users
    this.socket.on('player_drafted', (playerDraftedData) => {
      console.log(JSON.stringify(playerDraftedData));

      store.dispatch(playerDrafterActions
        .setCurrentPickUserId(playerDraftedData.currentPickUserId));

      store.dispatch(playerDrafterActions
        .updateFuturePicks(playerDraftedData.futurePicks));

      if (store.getState().playerSearcher.currentSelectedUserRosterId ===
        playerDraftedData.previousPickUserId) {
        store.dispatch(playerDrafterActions.updateUserRoster(playerDraftedData.userRoster));
      }

      const historyPlayerData = [{
        previousPickUserId: playerDraftedData.previousPickUserId,
        previousPickPlayerId: playerDraftedData.previousPickPlayerId,
        previousPickRound: playerDraftedData.previousPickRound,
        previousPickPickNumber: playerDraftedData.previousPickPickNumber,
        isKeeper: playerDraftedData.isKeeper,
      }];

      store.dispatch(playerDrafterActions
        .updateHistory(historyPlayerData));

      store.dispatch(playerDrafterActions
        .markPlayerAsDrafted(playerDraftedData.previousPickPlayerId));
    });

    this.socket.on('get_user_roster_return', (userRosterData) => {
      store.dispatch(playerDrafterActions
        .updateUserRoster(userRosterData.userRoster));
    });

    this.socket.on('toggle_pause_draft_return', (isPaused) => {
      store.dispatch(playerDrafterActions.updateDraftPauseState(isPaused));
    });

    this.socket.on('admin_roll_back_pick_return', (response) => {
      if (!response.error) {
        // MOVE TO function
        console.log('Update current pick user on pick rollback');
        store.dispatch(playerDrafterActions.setCurrentPickUserId(response.currentPickUserId));

        console.log('Update players with the player marked as undrafted');
        store.dispatch(playerSearcherActions.searchPlayersSuccess(response.players));

        console.log('Remove last player from draft history');
        store.dispatch(playerDrafterActions.rollbackDraftHistory());

        console.log('Update ticker on pick rollback');
        store.dispatch(playerDrafterActions.updateFuturePicks(response.futurePicks));

        console.log('Update roster on pick rollback');
        if (store.getState().playerSearcher.currentSelectedUserRosterId ===
          response.currentPickUserId) {
          store.dispatch(playerDrafterActions.updateUserRoster(response.userRoster));
        }

        console.log('Update if draft is paused or not on pick rollback');
        store.dispatch(playerDrafterActions.updateDraftPauseState(response.isPaused));

        this.socket.emit('next_user_pick_request', store.getState().playerSearcher.userId);
      } else {
        alert(response.error);
      }
    });

    this.socket.on('next_user_pick', (pickNumber) => {
      store.dispatch(playerDrafterActions.updateNextUserPick(pickNumber));
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
        <DraftClientLayout
          socket={this.socket}
        />
      </Provider>
    );
  }
}

export default DraftClient;
