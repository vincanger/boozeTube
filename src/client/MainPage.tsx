import clinkSound from './clink.mp3';
import thumbnail from './boozetube_thumbnail.png';
import React, { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Select,
  Switch,
  Checkbox,
  Input,
  Text,
  Divider,
  Spacer,
  Spinner,
  usePrevious,
} from '@chakra-ui/react';
import ThemeSwitch from './theme/themeSwitcher';
import { Toaster, toast } from 'react-hot-toast';
import YouTube, { YouTubePlayer, YouTubeProps } from 'react-youtube';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
// Wasp imports 🐝 = }
import { useQuery } from '@wasp/queries'; // Wasp uses a thin wrapper around react-query
import getCaptions from '@wasp/queries/getCaptions';
import getRepeatedWords from '@wasp/queries/getRepeatedWords';
import scrapeCaptionsAndSave from '@wasp/actions/scrapeCaptionsAndSave';
import getVideoInfo from '@wasp/queries/getVideoInfo';
import type { CaptionChunk } from '@wasp/shared/types';

const clink = new Audio(clinkSound);
clink.volume = 0.75;

export function MainPage() {
  const [videoId, setVideoId] = useState('');
  const [chosenWord, setChosenWord] = useState<string>('');

  const [counter, setCounter] = useState(0);
  const [ascOrder, setAscOrder] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isClinkSound, setIsClinkSound] = useState(true);
  const [poo, setPoo] = useState(false);
  const [captions, setCaptions] = useState<CaptionChunk[] | null>(null);
  const [isFetchingRptWrds, setIsFetchingRptWrds] = useState(false);
  const [areCaptionsSaved, setAreCaptionsSaved] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const location = useLocation();

  const {
    data: repeatedWords,
    isFetched: isFetchedRptWrds,
    error: errorRptWrds,
  } = useQuery(getRepeatedWords, { id: videoId }, { enabled: !!videoId });

  const {
    data: dbCaptions,
    isFetched,
    error,
  } = useQuery(getCaptions, { id: videoId, chosenWord }, { enabled: !!chosenWord });

  const { data: videoInfo, error: errorVideoInfo } = useQuery(getVideoInfo, { id: videoId }, { enabled: !!areCaptionsSaved });

  useEffect(() => {
    if (location.search) {
      const params = new URLSearchParams(location.search);
      const videoId = params.get('v');
      if (videoId) {
        setVideoId(videoId);
      }
    }
  }, []);

  useEffect(() => {
    if (error || errorRptWrds || errorVideoInfo) {
      toast.error('Error fetching data', {
        id: 'fetch-data-error',
      });
    }
  }, [error, errorRptWrds, errorVideoInfo]);

  useEffect(() => {
    if (isFetched && repeatedWords?.length && dbCaptions?.length) {
      setCaptions(dbCaptions);
    }
  }, [repeatedWords, dbCaptions]);

  useEffect(() => {
    if (repeatedWords?.length) {
      setIsFetchingRptWrds(false);
    }
    const fetchCaptions = async () => {
      try {
        if (isFetchedRptWrds && videoId.length && !repeatedWords?.length) {
          toast('Fetching captions and sorting frequent words. This can take a minute...',)
          await scrapeCaptionsAndSave({ videoId });
          setAreCaptionsSaved(true)
        }
      } catch (error) {
        toast.error('Error fetching captions', {
          id: 'fetch-captions-error',
        });
        setIsFetchingRptWrds(false);
      }
    };
    fetchCaptions();
  }, [repeatedWords]);

  useEffect(() => {
    if (videoId.length) {
      setCounter(0);
      setCaptions(null);
      setChosenWord('');
      if (!repeatedWords?.length) {
        setIsFetchingRptWrds(true);
      }
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
                  ref={inputRef}
                  min='30'
                  fontSize={'sm'}
                  value={videoId && `youtube.com/watch?v=${videoId}`}
                  placeholder='youtube.com/watch?v=hgglCqAXHuE'
                  onChange={(e) => {
                    const str = e.target.value;
                    // regex for youtube urls with v=VIDEO_ID
                    const regex = /(?:\?v=)([a-zA-Z0-9_-]{11})/;
                    const match = str.match(regex);
                    if (match) {
                      setVideoId(match[1]);
                    } else {
                      toast.error('Please enter a valid YouTube URL', {
                        id: 'youtube-url-error',
                      });
                    }
                  }}
                />
              </FormControl>
              <FormControl flex={2} display='flex' alignItems='center' justifyContent='center'>
                {isFetchingRptWrds && <Spinner />}
                {!isFetchingRptWrds && (
                  <Select
                    ref={selectRef}
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
                )}
              </FormControl>
              <FormControl flex={2} display='flex' alignItems='center' justifyContent='flex-end'>
                <FormLabel htmlFor='adv-options' mb='0' textAlign='center' fontSize='xs' color='text-contrast-md'>
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
                  <FormControl display='flex' alignItems='center' justifyContent='space-between'>
                    <FormLabel htmlFor='clink-sound' mb='0' textAlign='center' fontSize='sm'>
                      {`Turn off glass sound`}
                    </FormLabel>
                    <Switch
                      key={'clink-sound'}
                      id={'clink-sound'}
                      defaultChecked={!isClinkSound}
                      onChange={() => setIsClinkSound((clink) => !clink)}
                    />
                  </FormControl>
                  <ThemeSwitch />
                  <FormControl display='flex' alignItems='center' justifyContent='space-between'>
                    <FormLabel htmlFor='emoji' mb='0' textAlign='center' fontSize='sm'>
                      {'💩?'}
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
                  selectRef.current?.focus();
                }
              }}
              minWidth='640px'
              minHeight='360px'
              opacity={videoId.length && !chosenWord.length ? 0.5 : 1}
            >
              <YouTubePlayer
                chosenWord={chosenWord}
                setCounter={setCounter}
                isClinkSound={isClinkSound}
                captions={captions}
                videoId={videoId}
                showToast={showToast}
                pointerEvents={videoId.length && !chosenWord.length ? 'none' : 'all'}
              />
            </Box>
          ) : (
            <VStack
              minWidth='640px'
              minHeight='360px'
              layerStyle={'card'}
              borderRadius='md'
              justifyContent='center'
              alignItems='center'
              bgImage={`url(${thumbnail})`}
              bgSize='640px 360px'
              bgRepeat='no-repeat'
              onClick={() => {
                inputRef.current?.focus();
              }}
            >
              {videoId.length && !repeatedWords?.length && <Spinner />}
            </VStack>
          )}
        </VStack>
        <HStack justifyContent='flex-start' w='full'>
          <Text fontSize='xl' alignSelf='start' visibility={counter ? 'visible' : 'hidden'}>
            {counter}
          </Text>
          <Spacer />
          <AnimatedCounter
            counter={counter}
            emoji={!poo ? '🥃' : videoInfo?.youTuberId === 'UCbRP3c757lWg9M-U7TyEkXA' ? '🥸' : '💩'}
          />
        </HStack>
      </VStack>
    </>
  );
}

function AnimatedCounter({ counter, emoji }: { counter: number; emoji: string }) {
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
      {counter > 0 &&
        new Array(prevValue).fill(0).map((num, idx) => (
          <Text fontSize='lg' key={idx} mx={0} px={0}>
            {emoji}
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
          {counter > prevValue && (
            <Text fontSize='lg' key={'num' + 'idx'}>
              {emoji}
            </Text>
          )}
        </MotionBox>
      </AnimatePresence>
    </HStack>
  );
}

function YouTubePlayer({
  setCounter,
  isClinkSound,
  captions,
  chosenWord,
  videoId,
  showToast,
  pointerEvents,
}: {
  setCounter: Dispatch<SetStateAction<number>>;
  isClinkSound: boolean;
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
    // console.log('currentTime >>>', currentTime);

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
                if (isClinkSound) {
                  if (clink.paused) {
                    clink.currentTime = 0;
                    clink.play();
                  } else {
                    clink.currentTime = 0;
                  }
                }
              }, timeDelay);
            }
          });

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

  //TODO: add confetti on video end
  const onStateChange: YouTubeProps['onStateChange'] = (event) => {};

  const opts: YouTubeProps['opts'] = {
    height: '390',
    width: '640',
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 0,
    },
  };

  return (
    <Box pointerEvents={pointerEvents}>
      <YouTube id='yt-player' videoId={videoId} opts={opts} onReady={onPlayerReady} onStateChange={onStateChange} />
    </Box>
  );
}
