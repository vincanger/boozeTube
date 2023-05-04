import { FormControl, FormLabel, Switch, useColorMode } from '@chakra-ui/react';
import * as React from 'react';

const ThemeSwitch = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <FormControl display='flex' alignItems='center' justifyContent='space-between'>
      <FormLabel htmlFor='theme' fontSize='sm' mb='0'>
        Dark mode
      </FormLabel>
      <Switch
        key={colorMode}
        defaultChecked={colorMode === 'dark'}
        onChange={() => {
          toggleColorMode();
        }}
        id='theme'
      />
    </FormControl>
  );
};

export default ThemeSwitch;
