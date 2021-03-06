import {
  AppDescriptionSubText,
  AppHeader,
  AppInput,
  AppTag,
} from 'components/common';
import React, { ReactElement, useState } from 'react';

import { AddButton } from '.';
import { Box } from '@mui/material';

interface Props {
  tags: string[];
  removeTag: (tag: string) => void;
  addTag: (tag: string) => void;
}

/**
 * @description Handles the display of tags and holds an internal state to prevent constant re renders in the parent while the user types.
 */

function EnchantTags({ tags, removeTag, addTag }: Props): ReactElement {
  const [input, setInput] = useState('');
  const handleChange: ReactOnChange = ({ target }) => {
    setInput(target.value);
  };

  const handleAddTag = () => {
    addTag(input);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.key === 'Enter' && handleAddTag();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <AppHeader
        component="h3"
        size="sub"
        text="What tags would help other find your item?"
      />
      <AppDescriptionSubText
        text="Use relatable words that will make it easy for people to find your
            item. Ex: Bottle, Gundamn..."
      />
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          flexWrap: 'wrap',
          gap: 1,
          pt: tags.length ? 3 : 0,
          pb: tags.length ? 1 : 0,
        }}
      >
        {tags.map((tag: string) => (
          <AppTag key={tag} tag={tag} onClick={() => removeTag(tag)} />
        ))}
      </Box>
      <Box
        sx={{ display: 'flex', gap: 1, pt: tags.length ? 2 : 3, width: '100%' }}
      >
        <AppInput
          aria-label="tags"
          value={input}
          sx={{ flex: 1 }}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          label="Enter a tag"
        />
        <AddButton onClick={handleAddTag} />
      </Box>
    </Box>
  );
}

export default EnchantTags;
