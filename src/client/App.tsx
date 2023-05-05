import {
  ChakraProvider,
  VStack,
  HStack,
  Text,
  Container,
  Stack,
  ButtonGroup,
  IconButton,
  Divider,
  ColorModeScript,
} from '@chakra-ui/react';
import { theme } from './theme';
import { ReactNode } from 'react';
import { FaGithub, FaTwitter } from 'react-icons/fa';

export default function App({ children }: { children: ReactNode }) {

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />

      {/* Container */}
      <Container display='flex' flexDirection='column' minH='100vh' minW='666px' p={0}>
        {/* Content */}
        <VStack gap={5} spacing={5} mt={5}>
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
          <Stack w='full'>
            <Stack justify='space-between' direction='row' w='full' align='center'>
              <Text fontSize='2xl' textColor='text-contrast-lg' textAlign='start' aria-label='BoozeTube'>
                🍺ooze🍸ube
              </Text>
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
                  href='https://github.com/wasp-lang'
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
