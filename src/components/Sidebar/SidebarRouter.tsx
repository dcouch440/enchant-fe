import { ConnectedProps, connect } from 'react-redux';
import {
  SIDEBAR_AUTH,
  SIDEBAR_FEED,
  SIDEBAR_MESSAGES,
  SIDEBAR_NAVIGATION,
} from 'constantVariables';

import { Authorize } from './SidebarTypes';
import { Feed } from './SidebarTypes';
import { IAppState } from 'store/types';
import { Messages } from './SidebarTypes';
import { Nav } from './SidebarTypes';

const mapStateToProps = ({ sidebar: { sidebarType } }: IAppState) => ({
  sidebarType,
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux;

/**
 * @description renders the appropriate sidebar menu after a user selects to change what they wish to view.
 */

export const RenderSidebarType = ({
  sidebarType,
}: Props): JSX.Element | null => {
  switch (sidebarType) {
    case SIDEBAR_NAVIGATION:
      return <Nav />;
    case SIDEBAR_AUTH:
      return <Authorize />;
    case SIDEBAR_MESSAGES:
      return <Messages />;
    case SIDEBAR_FEED:
      return <Feed />;
    default:
      return null;
  }
};

export default connector(RenderSidebarType);
