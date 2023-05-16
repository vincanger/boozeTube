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
  const [btnSize, setBtnSize] = useState('md');

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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setBtnSize('sm');
      } else {
        setBtnSize('md');
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />

      <Toaster
        position='bottom-center'
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
          <Divider mb={[3, 6]} />
          <Stack w='full' px={{ base: '4', md: '0' }} direction={['column', 'row']}>
            <Stack direction='column' flex={1} spacing={[0, 2]} mb={[2, 0]} alignItems={['center', 'flex-start']}>
              <Text fontSize={['xl', '2xl']} textColor='text-contrast-lg' textAlign='start' aria-label='BoozeTube'>
                🍺ooze🍸ube
              </Text>
              <Stack direction='row'>
                <Text
                  ml={1}
                  as='a'
                  transition='color 0.2s ease-out'
                  _hover={{
                    transition: 'color 0.2s ease-out',
                    color: 'purple.300',
                  }}
                  href='https://wasp-lang.dev'
                  fontSize={['xs', 'sm']}
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
              </Stack>
            </Stack>

            {canCopy && (
              <HStack justifyContent='center' flex={1}>
                <MotionButton variants={buttonVariants} initial='initial' animate={shake ? 'shake' : 'initial'}>
                  <Button
                    id='share-btn'
                    onClick={handleCopy}
                    aria-label='share'
                    fontSize='sm'
                    colorScheme='purple'
                    rightIcon={<FaShareSquare />}
                    size={btnSize}
                  >
                    {'Copy sharable link'}
                  </Button>
                </MotionButton>
              </HStack>
            )}
            <Stack flex={1} justify='flex-end' direction={['column', 'row']} w='full' align='center'>
              <ButtonGroup variant='ghost' size={btnSize} isAttached={btnSize === 'sm'}>
                <Text fontSize='xs' textColor='text-contrast-md' alignSelf='flex-end'></Text>
                <IconButton
                  as='a'
                  href='https://wasp-lang.dev'
                  aria-label='Wasp'
                  icon={<Text fontSize={'1.25rem'}>{'=}'}</Text>}
                />
                <IconButton
                  as='a'
                  href='https://github.com/vincanger/boozeTube'
                  aria-label='GitHub'
                  icon={<FaGithub fontSize={'1.25rem'} />}
                />
                <IconButton
                  as='a'
                  href='https://twitter.com/hot_town'
                  aria-label='Twitter'
                  icon={<FaTwitter fontSize={'1.25rem'} />}
                />
              </ButtonGroup>
            </Stack>
          </Stack>
        </Container>
      </Container>
    </ChakraProvider>
  );
}
