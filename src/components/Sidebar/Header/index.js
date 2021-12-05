import { Box } from '@mui/system';
import PropTypes from 'prop-types';
import React from 'react';
import { Typography } from '@mui/material';

const styles = () => ({
  root: {
    width: '100%',
    textAlign: 'center',
    pb: 1,
  },
  text: {
    fontFamily: 'families.cursive',
    fontSize: 'sizes.xxl',
  },
});

export default function Header({ text }) {
  const sx = styles();

  return (
    <Box sx={sx.root}>
      <Typography color="primary" sx={sx.text}>
        {text}
      </Typography>
    </Box>
  );
}

Header.propTypes = {
  text: PropTypes.string.isRequired,
};
