import React, { useState, useEffect, useRef, FormEventHandler, FormEvent, Dispatch, SetStateAction } from 'react';
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Select,
  Switch,
  Checkbox,
  Button,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Text,
  Divider,
  Spacer,
  Spinner,
  usePrevious,
} from '@chakra-ui/react';
// Wasp imports 🐝 = }
import { useQuery } from '@wasp/queries'; // Wasp uses a thin wrapper around react-query
import getCaptions from '@wasp/queries/getCaptions';
import getRepeatedWords from '@wasp/queries/getRepeatedWords';
import type { Caption } from '@wasp/entities';
import type { CaptionChunk } from '@wasp/shared/types';

import YouTube, { YouTubePlayer, YouTubeProps } from 'react-youtube';
import { Toaster, toast } from 'react-hot-toast';
import scrapeCaptionsAndSave from '@wasp/actions/scrapeCaptionsAndSave';
import ThemeSwitch from './theme/themeSwitcher';
import { AnimatePresence, motion } from 'framer-motion';

export function MainPage() {
  // const [videoId, setVideoId] = useState('w7i4amO_zaE'); // prime
  // const [chosenWord, setChosenWord] = useState('lua');
  const [videoId, setVideoId] = useState(''); // 'hgglCqAXHuE' theo
  const [chosenWord, setChosenWord] = useState<string>('');

  const [counter, setCounter] = useState(0);
  const [ascOrder, setAscOrder] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [allowOptions, setAllowOptions] = useState(false); 
  const [showToast, setShowToast] = useState(false);
  const [poo, setPoo] = useState(false);
  const [captions, setCaptions] = useState<CaptionChunk[] | null>(null);

  const {
    data: repeatedWords,
    isLoading: isLoadingRptWrds,
    isFetched: isFetchedRptWrds,
    error: errorRptWrds,
  } = useQuery(getRepeatedWords, { id: videoId });
  const {
    data: dbCaptions,
    isLoading,
    isFetched,
    error,
  } = useQuery(getCaptions, { id: videoId, chosenWord }, { enabled: !!chosenWord });

  useEffect(() => {
    if (isFetched && repeatedWords?.length && dbCaptions?.length) {
      setCaptions(dbCaptions);
    }
  }, [repeatedWords, dbCaptions]);

  useEffect(() => {
    const fetchCaptions = async () => {
      if (isFetchedRptWrds && videoId.length && !repeatedWords?.length) {
        await scrapeCaptionsAndSave({ videoId });
      }
    };
    fetchCaptions();
  }, [repeatedWords]);

  // TODO: when changing video id, cancel other setInterval and make YOUTUBE player pause ....
  useEffect(() => {
    if (videoId.length) {
      setCounter(0);
      setCaptions(null);
      setChosenWord('');
    }
  }, [videoId]);

  return (
    <>
      <VStack w='666px'>
        <Toaster
          position='top-center'
          toastOptions={{
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />

        <VStack layerStyle='card' p={3}>
          <VStack layerStyle='card' width='full' spacing={0}>
            <HStack p={3} width='full'>
              <FormControl flex={3} display='flex' alignItems='center' justifyContent='center'>
                <Input
                  min='30'
                  fontSize={'sm'}
                  placeholder='youtube.com/watch?v=hgglCqAXHuE'
                  onChange={(e) => {
                    const str = e.target.value;
                    // regex for youtube.com/watch?v=hgglCqAXHuE
                    const regex = /(?:\?v=)([a-zA-Z0-9_-]{11})/;
                    const match = str.match(regex);
                    if (match) {
                      setVideoId(match[1]);
                      console.log('match regex: ', match[1]);
                    } else {
                      toast.error('Please enter a valid YouTube URL', {
                        id: 'youtube-url-error',
                      });
                    }
                  }}
                />
              </FormControl>
              <FormControl flex={2} display='flex' alignItems='center' justifyContent='center'>
                <Select
                  size='md'
                  id='word-select'
                  variant='filled'
                  fontSize='sm'
                  value={chosenWord}
                  isDisabled={!videoId.length}
                  placeholder='Select a highly occuring word to track'
                  onChange={(e) => {
                    setChosenWord(e.target.value);
                  }}
                >
                  {repeatedWords?.length && !ascOrder
                    ? repeatedWords?.map(([word, number]) => (
                        <option key={word} value={word}>
                          {word}
                        </option>
                      ))
                    : repeatedWords
                        ?.map(([word, number]) => (
                          <option key={word} value={word}>
                            {word}
                          </option>
                        ))
                        .reverse()}
                </Select>
              </FormControl>
              <FormControl flex={2} display='flex' alignItems='center' justifyContent='flex-end'>
                <FormLabel htmlFor='adv-options' mb='0' textAlign='center' fontSize='xs'>
                  {`Show advanced options`}
                </FormLabel>
                <Checkbox
                  // isDisabled={!allowOptions}
                  key={'adv-options'}
                  id={'adv-options'}
                  defaultChecked={showOptions}
                  onChange={() => setShowOptions(!showOptions)}
                />
              </FormControl>
            </HStack>
            {showOptions && (
              <>
                <Divider></Divider>
                <VStack width='full' spacing={3} p={3}>
                  <FormControl display='flex' alignItems='center' justifyContent='space-between'>
                    <FormLabel htmlFor='freq-sort' mb='0' textAlign='center' fontSize='sm'>
                      {`Order words from most to least frequent`}
                    </FormLabel>
                    <Switch
                      key={'freq-sort'}
                      id={'freq-sort'}
                      defaultChecked={!ascOrder}
                      onChange={() => setAscOrder((ascOrder) => !ascOrder)}
                    />
                  </FormControl>
                  <FormControl display='flex' alignItems='center' justifyContent='space-between'>
                    <FormLabel htmlFor='show-toast' mb='0' textAlign='center' fontSize='sm'>
                      {`Show toast notifications`}
                    </FormLabel>
                    <Switch
                      key={'show-toast'}
                      id={'show-toast'}
                      defaultChecked={showToast}
                      onChange={() => setShowToast((showToast) => !showToast)}
                    />
                  </FormControl>
                  <ThemeSwitch />
                  <FormControl display='flex' alignItems='center' justifyContent='space-between'>
                    <FormLabel htmlFor='emoji' mb='0' textAlign='center' fontSize='md'>
                      {'💩'}
                    </FormLabel>
                    <Switch key={'emoji'} id={'emoji'} defaultChecked={poo} onChange={() => setPoo((poo) => !poo)} />
                  </FormControl>
                </VStack>
              </>
            )}
          </VStack>
          {videoId.length ? (
            <Box
              onClick={() => {
                if (videoId.length && !chosenWord.length) {
                  toast.error('Please select a word to track', {
                    id: 'select-word-error',
                  });
                }
              }}
              w='full'
              opacity={videoId.length && !chosenWord.length ? 0.5 : 1}
            >
              <YouTubePlayer
                chosenWord={chosenWord}
                setCounter={setCounter}
                captions={captions}
                videoId={videoId}
                showToast={showToast}
                setAllowOptions={setAllowOptions}
                pointerEvents={videoId.length && !chosenWord.length ? 'none' : 'all'}
              />
            </Box>
          ) : (
            <VStack
              width='640px'
              height='360px'
              layerStyle={'card'}
              borderRadius='md'
              justifyContent='center'
              alignItems='center'
            >
              {videoId.length && !repeatedWords?.length && <Spinner />}
              <Text>{'Enter a YouTube URL and select a frequently occuring word to get started'}</Text>
            </VStack>
          )}
        </VStack>
        <HStack justifyContent='flex-start' w='full'>
          <Text fontSize='xl' alignSelf='start' visibility={counter ? 'visible' : 'hidden'}>
            {counter}
          </Text>
          <Spacer />
          <AnimatedCounter counter={counter} poo={poo} />
        </HStack>
      </VStack>
    </>
  );
}

function AnimatedCounter({ counter, poo }: { counter: number; poo: boolean }) {
  const prevValue = usePrevious(counter);

  const MotionBox = motion(HStack);

  const variants = {
    from: () => ({
      x: `800%`,
    }),
    to: () => ({
      x: '0%',
      transition: {
        type: 'spring',
        mass: 1,
        damping: 15,
        stiffness: 100,
        restDelta: 0.001,
      },
    }),
  };
  return (
    <HStack
      id='static-counter'
      pos='relative'
      w='100%'
      h='1.5em'
      shouldWrapChildren={true}
      flexWrap={'wrap'}
      spacing={0.5}
    >
      {counter > 0 && new Array(prevValue).fill(0).map((num, idx) => (
          <Text fontSize='lg' key={idx} mx={0} px={0}>
            {!poo ? '🥃' : '💩'}
          </Text>
        ))}
      <AnimatePresence initial={false}>
        
          <MotionBox
            id={'animated-counter'}
            key={'animated-counter'}
            top={0}
            left={0}
            right={0}
            variants={variants}
            initial='from'
            animate='to'
          >
            {counter > prevValue && new Array(counter - (counter - 1)).fill(0).map((num, idx) => (
              <Text fontSize='lg' key={'num' + 'idx'}>
                {!poo ? '🥃' : '💩'}
              </Text>
            ))}
          </MotionBox>

      </AnimatePresence>
    </HStack>
  );
}
function YouTubePlayer({
  setAllowOptions,
  setCounter,
  captions,
  chosenWord,
  videoId,
  showToast,
  pointerEvents,
}: {
  setAllowOptions: Dispatch<SetStateAction<boolean>>;
  setCounter: Dispatch<SetStateAction<number>>;
  captions: CaptionChunk[] | null;
  chosenWord: string;
  videoId: string;
  showToast: boolean;
  pointerEvents: 'all' | 'none';
}) {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [prevCaption, setPrevCaption] = useState('');
  const [youtubePlayer, setYoutubePlayer] = useState<YouTubePlayer | null>(null);
  const [getTime, setGetTime] = useState<NodeJS.Timeout>();

  useEffect(() => {

    youtubePlayer?.pauseVideo();
    youtubePlayer?.seekTo(0);

    return () => {
      if (getTime) {
        clearInterval(getTime);
      }
    };
  }, [youtubePlayer, getTime]);

  useEffect(() => {
    console.log('currentTime >>>', currentTime);

    if (captions) {
      const caption = captions.find((caption) => {
        const startTime = Number(caption.start);
        return currentTime >= startTime && currentTime <= startTime + 1;
      });
      console.log('caption >>>', caption);
      if (caption) {
        if (caption.text !== prevCaption) {
          const captionTextArray = caption.text.split(' ');
          const timePerWord = (Number(caption.dur) * 1000) / captionTextArray.length;
          const indexes = captionTextArray.forEach((word, index) => {
            if (word.toLowerCase().trim() === chosenWord.toLowerCase()) {
              const timeDelay = timePerWord * index;
              setTimeout(() => {
                setCounter((counter) => counter + 1);
                if (showToast) {
                  toast.success(`They said ${chosenWord} 🍻!`, {
                    duration: 2000,
                  });
                }
              }, timeDelay);
            }
          });

          console.log('wordIndex >>>', indexes);

          setPrevCaption(caption.text);
        }
      }
    }
  }, [currentTime]);

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {

    setYoutubePlayer(event.target);

    const getTime = setInterval(() => {
      const currentTime = event.target.getCurrentTime() as number;
      setCurrentTime(currentTime);
    }, 1000);

    setGetTime(getTime);
    event.target.pauseVideo();
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    console.log('event.data >>>', event.data)
    if (event.data === 1) {
      // setAllowOptions(false);
    } else {
      // setAllowOptions(true);
    }
  };

  const opts: YouTubeProps['opts'] = {
    height: '390',
    width: '640',
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
    },
  };

  return (
    <Box pointerEvents={pointerEvents}>
      <YouTube id='yt-player' videoId={videoId} opts={opts} onReady={onPlayerReady} onStateChange={onStateChange} />
    </Box>
  );
}
