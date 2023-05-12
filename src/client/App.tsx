import {
  ChakraProvider,
  Box,
  VStack,
  HStack,
  Text,
  Container,
  Stack,
  ButtonGroup,
  IconButton,
  Button,
  Divider,
  ColorModeScript,
} from '@chakra-ui/react';
import { theme } from './theme';
import { ReactNode, useEffect, useState } from 'react';
import { FaGithub, FaTwitter, FaShareSquare } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';

export default function App({ children }: { children: ReactNode }) {
  const [canCopy, setCanCopy] = useState(false);
  const [shake, setShake] = useState(false);

  const MotionButton = motion(Box);

  const buttonVariants = {
    initial: { y: 0 },
    shake: { y: [0, -5, 0, 5, 0, -5, 0, 5, 0, -5, 0, 5, 0, -5, 0], transition: { duration: 1.5 } },
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success('Copied to clipboard!');
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const params = new URLSearchParams(window.location.search);
      const videoId = params.get('v');
      const word = params.get('w');
      if (videoId && word) {
        setCanCopy(true);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!canCopy) return;
    const timeoutId = setTimeout(() => {
      setShake(true);
    }, 2500);

    const timeoutId2 = setTimeout(() => {
      setShake(false);
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
    };
  }, [canCopy]);

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />

      <Toaster
        position='top-center'
        toastOptions={{
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />

      {/* Container */}
      <Container display='flex' flexDirection='column' minH='100vh' maxW='666px' w='full' p={0}>
        {/* Content */}
        <VStack gap={5} spacing={5} mt={5} px={{ base: '4', md: '0' }}>
          {children}
        </VStack>

        {/* Footer */}

        <Container
          as='footer'
          marginTop='auto'
          minW='100%'
          mx={0}
          px={0}
          role='contentinfo'
          py={{ base: '4', md: '6' }}
        >
          <Divider mb={6} />
          <Stack w='full' px={{ base: '4', md: '0' }}>
            <Stack justify='space-between' direction='row' w='full' align='center'>
              <Text fontSize='2xl' textColor='text-contrast-lg' textAlign='start' aria-label='BoozeTube'>
                🍺ooze🍸ube
              </Text>

              {canCopy && (
                <HStack justifyContent='center'>
                  <MotionButton
                    variants={buttonVariants}
                    initial='initial'
                    animate={shake ? 'shake' : 'initial'}
                  >
                    <Button
                      id='share-btn'
                      onClick={handleCopy}
                      aria-label='share'
                      fontSize='sm'
                      colorScheme='purple'
                      rightIcon={<FaShareSquare  />}
                    >
                      {'Copy sharable link'}
                    </Button>
                  </MotionButton>
                </HStack>
              )}

              <ButtonGroup variant='ghost'>
                <Text fontSize='xs' textColor='text-contrast-md' alignSelf='flex-end'></Text>
                <IconButton
                  as='a'
                  href='https://wasp-lang.dev'
                  aria-label='Wasp'
                  icon={<Text fontSize='1.25rem'>{'=}'}</Text>}
                />
                <IconButton
                  as='a'
                  href='https://github.com/vincanger/boozeTube'
                  aria-label='GitHub'
                  icon={<FaGithub fontSize='1.25rem' />}
                />
                <IconButton
                  as='a'
                  href='https://twitter.com/hot_town'
                  aria-label='Twitter'
                  icon={<FaTwitter fontSize='1.25rem' />}
                />
              </ButtonGroup>
            </Stack>
            <HStack>
              <Text
                ml={1}
                as='a'
                transition='color 0.2s ease-out'
                _hover={{
                  transition: 'color 0.2s ease-out',
                  color: 'purple.300',
                }}
                href='https://wasp-lang.dev'
                fontSize='sm'
                textColor='text-contrast-md'
              >
                built with {'Wasp =} '}
              </Text>

              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                opacity='0.6'
              >
                <line x1='7' y1='17' x2='17' y2='7'></line>
                <polyline points='7 7 17 7 17 17'></polyline>
              </svg>
            </HStack>
          </Stack>
        </Container>
      </Container>
    </ChakraProvider>
  );
}
