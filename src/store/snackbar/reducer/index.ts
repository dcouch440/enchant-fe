import { CLEAR_ERROR, UPDATE_ERROR } from 'store/actions';

import { AnyAction } from 'redux';
import { ISnackbarState } from './interfaces';

export const errorInitialState: ISnackbarState = {
  error: '',
};

function reducer(
  state = errorInitialState,
  { type, payload }: AnyAction
): ISnackbarState {
  switch (type) {
    case UPDATE_ERROR:
      return {
        ...state,
        error: payload,
      };
    case CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

export default reducer;