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

import YouTube, { YouTubeProps } from 'react-youtube';
import { Toaster, toast } from 'react-hot-toast';
import scrapeCaptionsAndSave from '@wasp/actions/scrapeCaptionsAndSave';
import ThemeSwitch from './theme/themeSwitcher';
import { AnimatePresence, motion } from 'framer-motion';

type YouTubePlayer = typeof YouTube;

export function MainPage() {
  // const [videoId, setVideoId] = useState('w7i4amO_zaE'); // prime
  // const [chosenWord, setChosenWord] = useState('lua');
  const [videoId, setVideoId] = useState(''); // 'hgglCqAXHuE' theo
  const [chosenWord, setChosenWord] = useState<string>('');

  const [counter, setCounter] = useState(0);
  const [ascOrder, setAscOrder] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
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
      setCounter(0)
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
          {/* if chosenWord.length < 1, show a placeholder text positioned absolutely over top the hidden Box element */}
          {/* <Text
            visibility={chosenWord.length < 1 ? 'visible' : 'hidden'}
            fontSize='sm'
            color='gray.500'
            alignSelf='center'
            textAlign='center'
          >
            Select a word to track
          </Text> */}

          {videoId.length ? (
            <YouTubePlayer
              chosenWord={chosenWord}
              counter={counter}
              setCounter={setCounter}
              captions={captions}
              videoId={videoId}
              showToast={showToast}
            />
          ) : (
            <VStack
              width='640px'
              height='360px'
              layerStyle={'card'}
              // border='2px solid gray'
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
        {/* <img src={waspLogo} alt='wasp logo' /> */}
      </VStack>
    </>
  );
}

function AnimatedCounter({ counter, poo }: { counter: number; poo: boolean }) {
  const prevValue = usePrevious(counter);
  // create an array with as many elements as the counter value
  const array = new Array(prevValue).fill(0);

  const MotionBox = motion(HStack);

  useEffect(() => {
    console.log('prevValue:   ', prevValue);
    console.log('counter:   ', counter);
  }, [counter]);

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
    <HStack pos='relative' w='100%' h='1.5em' shouldWrapChildren={true} flexWrap={'wrap'} spacing={0.5}>
      {array.map((num, idx) => (
        <Text fontSize='lg' key='idx' mx={0} px={0}>
          {!poo ? '🥃' : '💩'}
        </Text>
      ))}
      <AnimatePresence initial={false}>
        {counter && counter > prevValue && (
          <MotionBox
            key={'animated-counter'}
            top={0}
            left={0}
            right={0}
            variants={variants}
            initial='from'
            animate='to'
          >
            {new Array(counter - prevValue).fill(0).map((num, idx) => (
              <Text fontSize='lg' key={'num' + 'idx'}>
                {!poo ? '🥃' : '💩'}
              </Text>
            ))}
          </MotionBox>
        )}
      </AnimatePresence>
    </HStack>
  );
}
function YouTubePlayer({
  counter,
  setCounter,
  captions,
  chosenWord,
  videoId,
  showToast,
}: {
  counter: number;
  setCounter: Dispatch<SetStateAction<number>>;
  captions: CaptionChunk[] | null;
  chosenWord: string;
  videoId: string;
  showToast: boolean;
}) {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [prevCaption, setPrevCaption] = useState('');
  const [currentCaption, setCurrentCaption] = useState('');
  let getTime: NodeJS.Timer;

  useEffect(() => {
    console.log('currentTime >>>', currentTime);

    // check to see if the current time is in the captions and if so, highlight the word
    if (captions) {
      const caption = captions.find((caption) => {
        const startTime = Number(caption.start);
        // find how many times the chosenWord occurs within the caption.text property

        return currentTime >= startTime && currentTime <= startTime + 1;
      });
      console.log('caption >>>', caption);
      if (caption) {
        setCurrentCaption(caption.text);
        if (caption.text !== prevCaption) {
          // const regex = new RegExp('\\b' + chosenWord + '\\b', 'gi');
          // const wordCount = (caption.text.match(regex) || []).length;

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

  useEffect(() => {
    return () => {
      if (getTime) {
        clearInterval(getTime);
      }
    };
  }, []);

  const onPlayerReady: YouTubeProps['onReady'] = (event: { target: any }) => {
    // access to player in all event handlers via event.target
    event.target.pauseVideo();
    clearInterval(getTime);
    getTime = setInterval(() => {
      const currentTime = event.target.getCurrentTime() as number;
      setCurrentTime(currentTime);
    }, 1000);
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event: { target: any }) => {
    if (event.target.getPlayerState() === 2) {
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

  return <YouTube videoId={videoId} opts={opts} onReady={onPlayerReady} onStateChange={onStateChange} />;
}

// function usePlaybackState() {
//     const [player, setPlayer] = useState(null);

//     useEffect(() => {
//       // Load the YouTube player once the component has mounted
//       const newPlayer = new window.YT.Player('player', {
//         videoId,
//         events: {
//           onReady: () => {
//             setPlayer(newPlayer);
//           },
//         },
//       });
//     }, []);
// }
