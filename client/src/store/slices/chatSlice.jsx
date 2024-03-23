import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AxiosInstance from '~/api/AxiosInstance';
import { MessageTypes } from '~/utils/enum';

export const getConversations = createAsyncThunk(
  'chat/getConversations',
  async ({ page }) => {
    try {
      const response = await AxiosInstance.get(
        `/chat/conversations/?page=${page}`
      );
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
);

export const getMessagesOfConversation = createAsyncThunk(
  'chat/getMessagesOfConversation',
  async ({ conversation_id, page }, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance.get(
        `/chat/conversations/${conversation_id}/messages/?page=${page}`
      );
      return response;
    } catch (error) {
      throw rejectWithValue(error.response.data);
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'chat/deleteMessage',
  async (messageId) => {
    try {
      const response = await AxiosInstance.delete(
        `chat/messages/${messageId}/`
      );
      return response;
    } catch (error) {
      console.log(error);
    }
  }
);

export const recallMessageRequest = createAsyncThunk(
  'chat/recallMessage',
  async (messageId) => {
    try {
      const response = await AxiosInstance.put(`chat/messages/${messageId}/`);
      return response;
    } catch (error) {
      console.log(error);
    }
  }
);

const initialState = {
  conversations: [],
  currentPage: 1,
  lastPage: 0,
  chat: {
    currentConversation: {
      id: null,
      title: null,
      image: null,
      type: null,
      latest_message: null,
      members: []
    },
    messages: [],
    lastPage: 0,
    currentPage: 1,
    isLoading: false
  },
  call: {
    open: false,
    calling: false,
    owner: false,
    user: null
  },
  forwardMessage: null,
  isLoading: false,
  isLoadingSecond: false
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentConversation(state, action) {
      state.chat.currentConversation = action.payload;
      state.chat.lastPage = 0;
      state.chat.currentPage = 1;
      state.chat.messages = [];
    },
    setCurrentPage(state, action) {
      state.currentPage = action.payload;
    },
    receiverMessage(state, action) {
      const result = action.payload;
      if (result.conversation != null)
        if (state.conversations.find((c) => c.id === c.id) == null) {
          if (result.conversation != null) {
            state.conversations = [result.conversation, ...state.conversations];
          }
        }
      state.conversations.map((conversation) => {
        if (conversation.id === result.message.conversation_id) {
          conversation.latest_message = result.message;
        }
      });
      state.chat.messages.push(result.message);
    },
    createGroup(state, action) {
      state.conversations.push(action.payload);
    },
    setPage(state, action) {
      state.chat.currentPage = action.payload;
    },
    setForwardMessage(state, action) {
      state.forwardMessage = state.chat.messages.find(
        (message) => message.id === action.payload
      );
    },
    recallMessage(state, action) {
      const { currentConversation, messages } = state.chat;
      const { conversation_id, id } = action.payload;
      if (currentConversation.id === conversation_id) {
        let message = messages.find((message) => message.id === id);
        if (message) {
          message.message_type = MessageTypes.RECALL;
        }
      }
    },
    openCall(state) {
      state.call.calling = false;
      state.call.owner = true;
    },
    setCall(state, action) {
      state.call.calling = action.payload.calling || false;
      state.call.owner = action.payload.owner || false;
      state.call.open = action.payload.open || false;
      state.call.user = action.payload.user || null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getConversations.pending, (state) => {
        if (state.conversations.length == 0) state.isLoading = true;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.conversations = [
          ...state.conversations,
          ...action.payload.data.results
        ];
        state.currentPage = action.payload.data.meta.current_page;
        state.lastPage = action.payload.data.meta.last_page;
        state.isLoading = false;
      })
      .addCase(getConversations.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(getMessagesOfConversation.pending, (state) => {
        state.chat.isLoading = true;
      })
      .addCase(getMessagesOfConversation.fulfilled, (state, action) => {
        state.chat.messages = [
          ...action.payload.data.results,
          ...state.chat.messages
        ];
        state.chat.lastPage = action.payload.data.meta.last_page;
        state.chat.isLoading = false;
      })
      .addCase(getMessagesOfConversation.rejected, (state) => {
        state.chat.isLoading = false;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.chat.messages = state.chat.messages.filter(
          (message) => message.id !== action.payload.data.result.message
        );
      });
  }
});

export default chatSlice.reducer;
export const {
  setCurrentConversation,
  receiverMessage,
  setPage,
  setForwardMessage,
  createGroup,
  recallMessage,
  setCurrentPage,
  openCall,
  setCall
} = chatSlice.actions;
