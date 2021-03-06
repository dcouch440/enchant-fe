import { Box, SxProps, Typography } from '@mui/material';
import React, { ReactElement } from 'react';

import UserAvatar from './AppUserAvatar';

interface Props {
  username: string;
  userAvatar: string;
  renderSubText?: string;
  sx?: SxProps;
}

/**
 * @description Displays a users avatar with username. Renders optional subtext.
 */

function AppUser({
  username,
  userAvatar,
  renderSubText,
  sx,
}: Props): ReactElement {
  return (
    <Box
      sx={{
        display: 'flex',
        width: 'absolute',
        gap: 1,
        p: 1,
        alignItems: 'center',
        textTransform: 'capitalize',
        backgroundColor: (theme) => theme.custom.palette.secondary.transparent,
        borderBottom: (theme) => `1px solid ${theme.palette.primary.dark}`,
        ...sx,
      }}
    >
      <UserAvatar src={userAvatar} alt={username} />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography fontWeight="bold" color="primary">
          {username}
        </Typography>
        <Typography
          sx={{
            width: '100%',
            fontSize: 12,
          }}
          color="primary"
        >
          {renderSubText}
        </Typography>
      </Box>
    </Box>
  );
}

export default AppUser;
