import { AppInput, AppTextArea } from 'components/common';
import React, { ReactElement } from 'react';

import { FormWidthContainer } from 'Layout';
import { IEnchantInfo } from './EnchantsCreateNUpdate';
import { useTheme } from '@mui/material';

interface OwnProps {
  onChange: React.ChangeEventHandler<HTMLTextAreaElement> | undefined;
}

type Props = IEnchantInfo & OwnProps;

function EnchantInfoForm({
  itemName,
  condition,
  origin,
  whereFound,
  about,
  onChange,
}: Props): ReactElement {
  const theme = useTheme();

  return (
    <FormWidthContainer
      component="form"
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppInput
        sx={{ marginBottom: 3, width: '100%' }}
        onChange={onChange}
        value={itemName}
        label="Enchant name"
        name="itemName"
        aria-label="name"
        required
      />
      <AppInput
        sx={{ marginBottom: 3, width: '100%' }}
        onChange={onChange}
        value={condition}
        label="What condition is it in?"
        name="condition"
        aria-label="condition"
      />
      <AppTextArea
        style={{ marginBottom: theme.spacing(3) }}
        onChange={onChange}
        value={origin}
        label="Origin / Backstory"
        name="origin"
        aria-label="origin"
      />
      <AppTextArea
        style={{ marginBottom: theme.spacing(3) }}
        onChange={onChange}
        value={whereFound}
        name="whereFound"
        label="Where was it found?"
        aria-label="location-found"
      />
      <AppTextArea
        onChange={onChange}
        name="about"
        label="About"
        value={about}
        placeholder="Talk About it"
        aria-label="about"
      />
    </FormWidthContainer>
  );
}

export default EnchantInfoForm;
