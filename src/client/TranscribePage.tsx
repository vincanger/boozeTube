import generateCaptionsAndSave from '@wasp/actions/generateCaptionsAndSave';
import { useLocation, useHistory } from 'react-router-dom';
import {
  Stack,
  Button,
  Text,
  VStack,
  Box,
  Divider,
  Badge,
  Code,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { toast } from 'react-hot-toast';
import { useQuery } from '@wasp/queries';
import getVideoInfo from '@wasp/queries/getVideoInfo';
import getCaptionsInfo from '@wasp/queries/getCaptionsInfo';
import { useState } from 'react';

export function TranscribePage() {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const videoId = location.pathname.split('/')[2];

  const videoInfo = useQuery(getVideoInfo, { id: videoId });
  const captionsInfo = useQuery(getCaptionsInfo, { id: videoId });

  const handleTranscribe = async () => {
    if (!videoId) return;

    try {
      setIsLoading(true);
      toast('Transcribing... This can take a while', {
        id: 'transcribing',
      });
      let transcribeWithLyrics
      if (!captionsInfo?.data) {
        transcribeWithLyrics = false;
      } else {
        transcribeWithLyrics = captionsInfo?.data?.transcribedWithLyrics ? false : true;
      }

      const result = await generateCaptionsAndSave({ videoId, transcribeWithLyrics });
      toast.success('Transcription complete!', {
        id: 'transcribing',
      });

      setIsLoading(false);
    } catch (error: any) {
      toast.error(error.message || 'Transcription failed.', {
        id: 'transcribing',
      });
      setIsLoading(false);
    }
  };

  if (videoInfo.isLoading) {
    return <div>Loading...</div>;
  }
  if (videoInfo.error) {
    return <div>Error: {videoInfo.error.message}</div>;
  }

  return (
    <Stack maxW='666px' width='full'>
      <Text fontSize='xl' color='text-contrast-lg' textAlign='center'>
        Transcribe {videoInfo?.data?.videoTitle || 'this video'} w/ OpenAI's Whisper 🗣{' '}
      </Text>
      <VStack layerStyle='card' width='full' p={3} m={1} spacing={3}>
        {videoInfo?.data?.thumbnail && (
          <Box>
            <img src={videoInfo?.data?.thumbnail} width='100%' />
          </Box>
        )}

        <Divider mt={3} />
        <Stack layerStyle='card' m={1} p={3} spacing={3}>
          <VStack layerStyle='cardMd' p={3} spacing={3}>
            <Text fontSize='md' color='text-contrast-md'>
              <Badge colorScheme='green'>Info: </Badge> If the first attempt at transcribing doesn't give a desirable
              result, come back and <Code>Retry Transcription</Code>. We will apply different settings to increase
              the likelihood of a good result.
            </Text>
          </VStack>
          <VStack layerStyle='cardMd' p={3} spacing={3}>
            <Text fontSize='md' color='text-contrast-md'>
              <Badge>Tip: </Badge> If you're having trouble transcribing a song, use a video that has a clean, concise
              title. Try to avoid verbose titles, e.g. 'Levels (Official Visualizer) (Remix)' and videos from
              third-party accounts.
            </Text>
          </VStack>
        </Stack>
      </VStack>
      <Stack flexDirection={['column', 'row']} justifyContent='space-between' alignItems='center' width='full'>
        <Button onClick={() => history.push(`/?v=${videoId}`)}>Go Back</Button>
        <Button isLoading={isLoading} onClick={captionsInfo && captionsInfo.data ? onOpen : handleTranscribe}>
          {captionsInfo && captionsInfo.data ? 'Retry Transcription 🗣' : 'Transcribe Audio 🗣'}
        </Button>
      </Stack>
      <TranscribePageModal onOpen={onOpen} onClose={onClose} isOpen={isOpen} handleTranscribe={handleTranscribe} />
    </Stack>
  );
}

type TranscribePageModalProps = {
  onOpen: () => void;
  onClose: () => void;
  isOpen: boolean;
  transcribeWithLyrics?: boolean;
  handleTranscribe: () => Promise<void>;
};
function TranscribePageModal({ isOpen, onOpen, onClose, transcribeWithLyrics, handleTranscribe }: TranscribePageModalProps) {
  const handleClose = () => {
    onClose();
    handleTranscribe();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Retry transcription with different settings?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize='sm' color='text-contrast-lg'>
              Transcriptions already exist. Clicking RETRY will transcribe them again using different settings 🧙‍♂️
            </Text>
          </ModalBody>

          <ModalFooter justifyContent='space-between'>
            <Button colorScheme='red' variant='outline' mr={3} onClick={onClose}>
              ❌ Nevermind
            </Button>
            <Button mr={3} onClick={handleClose}>
              ⏳ Yes, Retry
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
