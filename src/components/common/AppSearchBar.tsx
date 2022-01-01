import { Box, useTheme } from '@mui/system';
import { Button, IconButton, Paper, SxProps } from '@mui/material';
import React, { ReactElement, useState } from 'react';

import AppInput from 'components/common/AppInput';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

interface IOwnProps {
  onSubmit: (e: string) => void;
  placeholder?: string;
  sx?: SxProps;
  onClear?: () => void;
  buttonContents?: ReactElement | string;
  renderExtraButton?: ReactElement;
}

/**
 * * AppSearchBar collects it's input and has it's own on submit button
 * * Prevent default is called within this search bar
 * * This component is housed in a form.
 * * Stretches to the full width of it's container on large screens, 50% on large.
 * * can be over ridden from props
 */

export default function AppSearchBar({
  onSubmit,
  placeholder = 'Search',
  sx = {},
  buttonContents,
  renderExtraButton,
  ...props
}: IOwnProps): JSX.Element {
  const [input, setInput] = useState('');
  const handleChange: ReactOnChange = ({ target }) => setInput(target.value);
  const handleSubmit: ReactOnSubmit = (e) => {
    e.preventDefault();
    onSubmit(input);
    setInput('');
  };

  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: 'transparent',
        alignItems: 'end',
        overflow: 'hidden',
        width: ['100%', '50%'],
        flex: [2, 2, 'none'],
        border: 'none',
        position: 'relative',
        height: 57,
        gap: 1,
        ...sx,
      }}
      onSubmit={handleSubmit}
      component="form"
      aria-label="search-form"
      {...props}
    >
      <AppInput
        sx={{ color: 'primary', flex: 1 }}
        placeholder={placeholder}
        onChange={handleChange}
        value={input}
        variant="outlined"
        inputProps={{ 'aria-label': 'Search' }}
      />
      <Button
        type="submit"
        variant="contained"
        sx={{
          display: 'flex',
          height: '100%',
        }}
        aria-label="search"
      >
        {buttonContents ?? <SearchIcon color="secondary" />}
      </Button>
      {renderExtraButton}
    </Paper>
  );
}