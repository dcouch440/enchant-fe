import React, { useState } from 'react';

import { AnimatePresence } from 'framer-motion';
import { Box } from '@mui/system';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { Fab } from '@mui/material';
import MotionDiv from 'animation/MotionDiv';
import PropTypes from 'prop-types';
import Search from '@mui/icons-material/Search';
import { SearchBar } from 'components';
import { connect } from 'react-redux';
import { enchantAC } from 'store/enchant';

/**
 * @description When a user enters search terms, the body and title will searched through. The term will be submitted to the store and one of 3 variable will decide Friends, New, and Hot will change the users search preference. The selected preference will be stored in the store and change what the user will receive.
 */

function SearchMenu({ searchQueryUpdated }) {
  const [show, setShow] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: Setup Thunk for Query
  const handleChange = ({ target: { value } }) => setSearchQuery(value);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShow((prev) => !prev);

    //TODO: ADD ERRORS FOR SEARCH TERMS THAT ARE NOT CORRECT.
    searchQueryUpdated(searchQuery);
  };

  return (
    <AnimatePresence>
      <Fab
        onClick={() => setShow((prev) => !prev)}
        color="primary"
        key="open-close-button"
      >
        {show ? <CloseOutlinedIcon /> : <Search />}
      </Fab>
      {show && (
        <MotionDiv
          key="search-drawer"
          initial={{ width: 0 }}
          animate={{ width: '70vw' }}
          transition={{ duration: 0.5 }}
          style={{ overflow: 'hidden' }}
        >
          <Box
            sx={{
              display: 'flex',
              height: '100%',
              width: '100%',
              backgroundColor: 'secondary.lighter',
              borderRadius: '0 12px 12px 0',
              ml: 1,
            }}
          >
            <SearchBar
              onChange={handleChange}
              onSubmit={handleSubmit}
              sx={{ m: 1, flex: 1 }}
            />
          </Box>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}

SearchMenu.propTypes = {
  searchQueryUpdated: PropTypes.func.isRequired,
};

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  searchQueryUpdated: (query) => enchantAC.searchQueryUpdated(query),
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchMenu);
