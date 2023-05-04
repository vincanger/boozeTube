import { ChakraProvider, VStack, Box, ColorModeScript } from '@chakra-ui/react';
import { theme } from './theme';
import { ReactNode, useState, useEffect, createContext } from 'react';
// import NavBar from './components/NavBar';
import { useLocation } from 'react-router-dom';
// import useAuth from '@wasp/auth/useAuth';

export default function App({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <VStack gap={5} spacing={5} mt={5}>
        {children}
      </VStack>
    </ChakraProvider>
  );
}
