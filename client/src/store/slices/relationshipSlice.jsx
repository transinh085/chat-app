import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AxiosInstance from '~/api/AxiosInstance';

const initialState = {
  isLoading: false,
  friends: [],
  sent_friend_requests: [],
  received_friend_requests: [],
  isLoadingGetAll: false,
  groups: {
    isLoading: false,
    data: []
  },
  profile: {
    open: false,
    id: null,
    info: null
  },
  isOpenFriendRequest: false
};

export const getRecommendedUsers = createAsyncThunk(
  'relationship/getRecommendedUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance.get(
        `relationship/get-recommended-users`
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const searchUsers = createAsyncThunk(
  'relationship/searchUsers',
  async (search, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance.get(
        `relationship/search-users/${search}`
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const sendFriendRequest = createAsyncThunk(
  'relationship/sendFriendRequest',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance.post(
        `relationship/friend-requests`,
        data
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getAllFriendRequests = createAsyncThunk(
  'relationship/getAllFriendRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance.get(`relationship/friend-requests`);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getNumberOfReceiveFriendRequests = createAsyncThunk(
  'relationship/getNumberOfReceiveFriendRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance.get(
        `relationship/friend-requests/receive-friend-requests/count`
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteFriendRequest = createAsyncThunk(
  'relationship/deleteFriendRequest',
  async (friend_request_id, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance.delete(
        `relationship/friend-requests/${friend_request_id}`
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const acceptFriendRequest = createAsyncThunk(
  'relationship/acceptFriendRequest',
  async (friend_request_id, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance.get(
        `relationship/friend-requests/${friend_request_id}`
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getAllFriends = createAsyncThunk(
  'relationship/getAllFriends',
  async ({ query, sort = null }, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance.get(
        `relationship/friends/?query=${query}&sort=${sort}`
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getAllGroup = createAsyncThunk(
  'relationship/getAllGroup',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance.get(`chat/conversations-group`);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getProfile = createAsyncThunk(
  'profile/getProfile',
  async (user_id, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance.get(`profile/${user_id}`);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Delete friend
export const deleteFriend = createAsyncThunk(
  'relationship/deleteFriend',
  async (friend_id, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance.delete(
        `relationship/friends/${friend_id}`
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const relationshipSlice = createSlice({
  name: 'relationship',
  initialState,
  reducers: {
    receiveFriendRequest(state, action) {
      state.received_friend_requests.push(action.payload);
    },
    setOpenProfile(state, action) {
      state.profile.open = true;
      state.profile.id = action.payload;
    },
    setCloseProfile(state) {
      state.profile.open = false;
      state.profile.id = '';
    },
    setProfileId(state, action) {
      state.profile.id = action.payload;
    },
    setOpenFriendRequest(state, action) {
      state.isOpenFriendRequest = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRecommendedUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRecommendedUsers.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(getRecommendedUsers.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(searchUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchUsers.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(searchUsers.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(sendFriendRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.profile.id) {
          console.log(action.payload.data);
          state.profile.info.friend_request = action.payload.data.data;
        }
      })
      .addCase(sendFriendRequest.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(getAllFriendRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllFriendRequests.fulfilled, (state, action) => {
        state.sent_friend_requests = action.payload.data.sent_friend_requests;
        state.received_friend_requests =
          action.payload.data.received_friend_requests;
        state.isLoading = false;
      })
      .addCase(getAllFriendRequests.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteFriendRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteFriendRequest.fulfilled, (state, action) => {
        state.sent_friend_requests = state.sent_friend_requests.filter(
          (item) => item.id !== action.payload.data.id
        );
        state.received_friend_requests = state.received_friend_requests.filter(
          (item) => item.id !== action.payload.data.id
        );
        if (state.profile.id) {
          state.profile.info.friend_request = null;
        }
        state.isLoading = false;
      })
      .addCase(deleteFriendRequest.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(acceptFriendRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        state.received_friend_requests = state.received_friend_requests.filter(
          (item) => item.id !== action.payload.data.id
        );
        if (state.profile.id) {
          state.profile.info.is_friend = true;
          state.profile.info.friend_request = null;
        }
        state.isLoading = false;
      })
      .addCase(acceptFriendRequest.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(getAllFriends.pending, (state) => {
        state.isLoading = true;
        state.isLoadingGetAll = true;
      })
      .addCase(getAllFriends.fulfilled, (state, action) => {
        state.friends = action.payload.data.friends;
        state.isLoading = false;
        state.isLoadingGetAll = false;
      })
      .addCase(getAllFriends.rejected, (state) => {
        state.isLoading = false;
        state.isLoadingGetAll = false;
      })
      .addCase(getAllGroup.pending, (state) => {
        state.groups.isLoading = true;
      })
      .addCase(getAllGroup.fulfilled, (state, action) => {
        state.groups.data = action.payload.data.result;
        state.groups.isLoading = false;
      })
      .addCase(getAllGroup.rejected, (state) => {
        state.groups.isLoading = false;
      })
      .addCase(getNumberOfReceiveFriendRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getNumberOfReceiveFriendRequests.fulfilled, (state, action) => {
        state.received_friend_requests = Array.from(
          { length: action.payload.data.result },
          (_, index) => index
        );
        state.isLoading = false;
      })
      .addCase(getNumberOfReceiveFriendRequests.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.profile.info = action.payload.data;
      })
      .addCase(deleteFriend.fulfilled, (state, action) => {
        state.friends = state.friends.filter(
          (item) => item.id !== action.payload.data.id
        );
        if (state.profile.info) {
          state.profile.info.is_friend = false;
        }
      });
  }
});

export default relationshipSlice.reducer;
export const {
  receiveFriendRequest,
  setOpenProfile,
  setCloseProfile,
  setProfileId,
  setOpenFriendRequest
} = relationshipSlice.actions;
