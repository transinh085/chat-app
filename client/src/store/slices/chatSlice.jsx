import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AxiosInstance from '~/api/AxiosInstance';

export const getConversations = createAsyncThunk(
  'auth/getConversations',
  async () => {
    try {
      const response = await AxiosInstance.get(`/chat/conversations/`);
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
);

export const getMessagesOfConversation = createAsyncThunk(
  'auth/getMessagesOfConversation',
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

const initialState = {
  conversations: [],
  chat: {
    currentConversation: {
      id: null,
      title: null,
      image: null
    },
    lastPage: 0,
    currentPage: 1,
    messages: [],
    isLoading: false
  },
  isLoading: true
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentConversation(state, action) {
      state.chat.currentConversation = action.payload;
      state.chat.lastPage = 0,
      state.chat.currentPage = 1,
      state.chat.messages = []
    },
    receiverMessage(state, action) {
      state.chat.messages.push(action.payload);
      state.conversations.map((conversation) => {
        if (conversation.id === action.payload.conversation_id) {
          conversation.latest_message = action.payload;
        }
      });
    },
    setPage(state, action) {
      state.chat.currentPage = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getConversations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.conversations = action.payload.data;
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
      });
  }
});

export default chatSlice.reducer;
export const { setCurrentConversation, receiverMessage, setPage } =
  chatSlice.actions;