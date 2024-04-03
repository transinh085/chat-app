import Cookies from 'js-cookie';
import { createContext, useEffect, useState } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { useDispatch, useSelector } from '~/store';
import {
  changeStatePinMessage,
  createGroup,
  recallMessage,
  receiveChangeNameConversation,
  receiverMessage,
  setCall,
  setConversationCall,
  setPeerIds,
  setTypingIndicator
} from '~/store/slices/chatSlice';
import { receiveNotification } from '~/store/slices/notificationSlice';
import { receiveFriendRequest } from '~/store/slices/relationshipSlice';
export const SocketContext = createContext({
  socketInstance: null
});

export const SocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { call } = useSelector((state) => state.chat);
  const [socketInstance, setSocketInstance] = useState(null);

  // effect
  useEffect(() => {
    let token = Cookies.get('token');
    if (!token) return;
    if (isAuthenticated) {
      const endpoint = `ws://127.0.0.1:8000/ws/chat/${token}/`;
      var socket = new ReconnectingWebSocket(endpoint);

      socket.onopen = function (e) {
        console.log(`socket connected ${e}`);
      };

      socket.onmessage = function (event) {
        console.log('socket event', event.data);
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'chat_message') {
            dispatch(receiverMessage(data));
          } else if (data.type === 'pin_message') {
            dispatch(changeStatePinMessage(data.message));
          } else if (data.type === 'typing_indicator') {
            console.log(JSON.parse(data.message));
            dispatch(setTypingIndicator(JSON.parse(data.message)));
          } else if (data.type === 'receive_friend_request') {
            dispatch(receiveFriendRequest(data.message));
          } else if (data.type === 'receive_notification') {
            dispatch(receiveNotification(data.message));
          } else if (data.type === 'add_group') {
            dispatch(createGroup(data.message));
          } else if (data.type === 'recall_message') {
            dispatch(recallMessage(data.message));
          } else if (data.type === 'video_call') {
            const { conversation } = JSON.parse(data.message);
            dispatch(
              setCall({
                open: true,
                calling: false,
                ended: false,
                refused: false
              })
            );
            dispatch(setConversationCall({ conversation }));
          } else if (data.type === 'return_get_peer_ids') {
            console.log(data);
            const { conversation, peer_ids } = JSON.parse(data.message);
            dispatch(setConversationCall({ conversation }));
            dispatch(setPeerIds({ peer_ids }));
            if (peer_ids.length === 0) {
              dispatch(
                setCall({
                  calling: false,
                  refused: false,
                  ended: false
                })
              );
            } else {
              dispatch(
                setCall({
                  calling: true,
                  refused: false,
                  ended: false
                })
              );
            }
          } else if (data.type === 'refuse_video_call') {
            dispatch(
              setCall({
                calling: false,
                ended: false,
                refused: true
              })
            );
          } else if (data.type === 'interrupt_video_call') {
            console.log('receiver here');
            dispatch(
              setCall({
                open: false,
                calling: false,
                ended: true
              })
            );
          } else if (data.type === 'change_name_conversation') {
            dispatch(receiveChangeNameConversation(data.message));
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      socket.onclose = function (e) {
        console.log(`socket disconnected ${e}`);
      };

      setSocketInstance(socket);

      // clean up
      return () => {
        socket.close();
      };
    }
  }, [dispatch, isAuthenticated]);
  return (
    <SocketContext.Provider value={{ socketInstance }}>
      {children}
    </SocketContext.Provider>
  );
};
