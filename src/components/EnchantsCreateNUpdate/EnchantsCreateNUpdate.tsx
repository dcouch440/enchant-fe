import { Button, useTheme } from '@mui/material';
import { ConnectedProps, connect } from 'react-redux';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import {
  apiEnchantPath,
  apiEnchantUpdatePath,
  apiEnchantUploadPath,
  enchantPath,
  enchantsPath,
} from 'config/paths';
import { useNavigate, useParams } from 'react-router-dom';

import { Box } from '@mui/system';
import EnchantImageList from './EnchantImageListItem';
import EnchantInfoForm from './EnchantInfoForm';
import EnchantTags from './EnchantTags';
import FileInput from './FileInput';
import FormWidthContainer from 'Layout/FormWidthContainer';
import Header from 'components/common/AppHeader';
import { IAppState } from 'store/types';
import PageHeader from 'components/common/AppPageHeader';
import axios from 'axios';
import convertTag from 'utils/convertTag';
import isValidTag from 'utils/isValidTag';
import { snackbarMessageSent } from 'store/snackbar/actionCreators';
import { validateImage } from 'image-validator';

export interface IImageData {
  id: string;
  caption: string;
  url: string | ArrayBuffer | null;
  favorite: boolean;
}

// https://www.typescriptlang.org/docs/handbook/utility-types.html
export interface IEnchantInfo {
  id: string;
  userId: string | null;
  itemName: string;
  condition: string;
  origin: string;
  about: string;
  images: Array<IImageData>;
  tags: string[];
  whereFound: string;
}

interface OwnProps {
  newUpload: boolean;
}

type AxiosImagePostRequest = Array<{
  referenceKey: string;
  url: string;
  wasSuccessful: boolean;
}>;

type FileReadResults = {
  result: string | ArrayBuffer | null;
  fileData: File;
};

export type RemoveImage = (id: string, index: number) => void;

const mapStateToProps = ({ user: { id } }: IAppState) => ({ id });

const mapDispatchToProps = {
  snackbarMessageSent,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux & OwnProps;

/**
 * * CreateAndUpdate is used to create enchants.
 * * This component prepares id'd objects that will be sent with
 * * their respective images.
 */

function EnchantsCreateNUpdate({
  id,
  newUpload,
  snackbarMessageSent,
}: Props): ReactElement {
  const [fileState, setFileState] = useState<Array<File>>([]);
  const theme = useTheme();
  const nav = useNavigate();
  const param = useParams();
  const requestSent = useRef(false);

  // if it is a new upload set loading to false by reversing.
  // this way we can retrieve the user info.
  const [doneLoading, setDoneLoading] = useState(() => {
    if (newUpload) return true;
    if (!newUpload) return false;
  });
  const [enchant, setEnchant] = useState<IEnchantInfo>({
    id: '',
    userId: id,
    itemName: '',
    condition: '',
    origin: '',
    about: '',
    images: [],
    tags: [],
    whereFound: '',
  });
  const [imagesToDelete, setImagesToDelete] = useState<Array<IImageData>>([]);

  // If the user is trying to creat a new post
  // exit useEffect
  useEffect(() => {
    if (newUpload) return;
    if (!param?.enchantId) return;

    axios
      .get<IEnchantInfo>(apiEnchantUpdatePath(param.enchantId), {
        withCredentials: true,
      })
      .then(({ data }) => {
        setEnchant(data);
        setDoneLoading(true);
      })
      .catch(console.error);
  }, [newUpload]);

  const handleEnchantInfoOnChange:
    | React.ChangeEventHandler<HTMLTextAreaElement>
    | undefined = ({ target }) => {
    setEnchant((prev) => ({
      ...prev,
      [target.name]: target.value,
    }));
  };

  const handleFileInputChange: ReactOnChange = async ({ target }) => {
    // check if file exists
    if (!target.files) return;
    const file = target.files[0];

    try {
      // make sure its valid
      if (!(await validateImage(file, { throw: false }))) {
        snackbarMessageSent('Must be an image.');
        return;
      }
    } catch (err) {
      console.error(err);
      return;
    }

    // verify the format will work with the backend resizer
    const splitFilename = file.name.split('.');
    const ext = splitFilename[splitFilename.length - 1].toLowerCase();
    const formats = ['jpg', 'jpeg', 'png', 'tif', 'tiff', 'bmp'];
    if (!formats.includes(ext)) {
      snackbarMessageSent(
        `Unsupported format. Supported formats: ${formats.join(', ')}`
      );
      return;
    }

    try {
      const { result, fileData } = await new Promise<FileReadResults>(
        (resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () =>
            resolve({ result: reader.result, fileData: file });
          reader.onerror = () => reject('Failed to read image');
        }
      );

      setEnchant((prev) => ({
        ...prev,
        images: [
          ...prev.images,
          {
            id: '',
            caption: '',
            url: result as string,
            favorite: false,
          },
        ],
      }));

      setFileState((prev) => [...prev, fileData]);
    } catch (err) {
      snackbarMessageSent(`That image could not be loaded.`);
      console.error(err);
    }
  };

  const handleRemoveImage: (index: number) => void = (index) => {
    const currentImage = enchant.images[index];
    const isNewUpload = currentImage.id === '';

    if (enchant.images.length <= 1) {
      snackbarMessageSent('At least one image must be present at all times.');
      return;
    }

    // if index is blank, find out which index it is from the users previously uploaded
    // new images will always be placed at the end of the array.
    if (isNewUpload) {
      let newUploadIndex = -1;

      for (let i = 0; i < enchant.images.length; i++) {
        const id = enchant.images[i].id;

        // find how far the new upload index from the users previous images
        if (id === '') newUploadIndex++;

        // if index equals i then we have reached the image
        // and we know how far into the index's the new images are.
        if (i === index) break;
      }

      setEnchant((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));

      // remove the file from the index relative to itself.
      setFileState((prev) => {
        const fs = [...prev];
        fs.splice(newUploadIndex, 1);
        return fs;
      });
    } else {
      // if this is not a new upload and the user is trying to remove an image they got
      // from a update get request. set it in the state so the database knows to delete it.
      setEnchant((prev) => {
        return {
          ...prev,
          images: prev.images.filter(({ id }) => id !== currentImage.id),
        };
      });
      setImagesToDelete((prev) => [...prev, currentImage]);
    }
  };

  const handleAddTag: (tag: string) => void = (tag) => {
    setEnchant((prev) => {
      const t = convertTag(tag);
      if (!isValidTag(prev.tags, t)) return prev;
      return {
        ...prev,
        tags: [...prev.tags, t],
      };
    });
  };

  const handleRemoveTag: (tag: string) => void = (tag) => {
    setEnchant((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleUpdateFavorite: (index: number) => void = (index) => {
    setEnchant((prev) => ({
      ...prev,
      images: prev.images.map((img, mapIndex) => {
        if (mapIndex === index) {
          return {
            ...img,
            favorite: true,
          };
        } else if (img.favorite === true) {
          return {
            ...img,
            favorite: false,
          };
        } else {
          return img;
        }
      }),
    }));
  };

  const handleUpdateCaption = (caption: string, index: number) => {
    setEnchant((prev) => ({
      ...prev,
      images: prev.images.map((img, mapIndex) => {
        if (mapIndex === index) {
          return {
            ...img,
            caption,
          };
        }

        return img;
      }),
    }));
  };

  const handleSubmit = async () => {
    if (requestSent.current === true) return;
    if (enchant.images.length < 1) {
      snackbarMessageSent(
        'At least one image must be present for this submission.'
      );
      return;
    }

    // if fileState is zero then go ahead with the request.
    // theres nothing special that needs to be done.
    if (fileState.length === 0) {
      await handleSendEnchantInformation(enchant, imagesToDelete);
      return;
    }

    // OVERVIEW
    // images are sent viA formData in multi file format
    // each image is attached with a uniqueKey
    // upload the files and get response.
    // referenceKeysOrder maintains the order for the multi thread backend upload and
    // should be used as the reference to maintain imaged matching up.
    // the response will have the property reference Keys
    // after the request is returned the key order is looped through
    // and a filter is used to find that specific image
    // information is provided by the backend on whether the image upload was a success.
    const formData = new FormData();
    const referenceKeysOrder: string[] = [];
    for (let i = 0; i < fileState.length; i++) {
      const randomId = Math.floor(Math.random() * 10000000000).toString();
      referenceKeysOrder.push(randomId);
      formData.append(randomId, fileState[i]);
    }

    snackbarMessageSent('Uploading images');

    try {
      const { data } = await axios.post<AxiosImagePostRequest>(
        apiEnchantUploadPath,
        formData,
        { withCredentials: true }
      );
      // send the data to the database with its attached keys.
      // once the index of the images in question is found.
      // keep track of the last reference used so we can use it to
      // find the value.
      let lastReferenceUsed = 0;
      const updatedImages: Array<IImageData | null | undefined> = enchant.images
        .map((img) => {
          // if id is empty it is a new upload.
          // so we must find the image that matches the reference key.
          if (img.id !== '') return img;

          const referenceKey = referenceKeysOrder[lastReferenceUsed];
          const imgUpload = data.filter(
            (r) => r.referenceKey === referenceKey
          )[0];

          // if nothing is found return
          // this would be a critical problem
          if (imgUpload === undefined) return;

          lastReferenceUsed++;

          if (imgUpload.wasSuccessful !== true) return null;

          return {
            ...img,
            url: imgUpload.url,
          };
        })
        .filter((x) => x !== null || x !== undefined);

      if (updatedImages.length === 0) return; // handle snackbar error

      // verify favorite image was added and successful
      let favoriteWasFound = false;
      for (const img of updatedImages) {
        if (!img?.favorite) continue;
        favoriteWasFound = true;
        break;
      }

      if (!favoriteWasFound) {
        if (updatedImages?.[0]?.favorite !== undefined)
          updatedImages[0].favorite = true;
      }

      await handleSendEnchantInformation(
        { ...enchant, images: updatedImages as Array<IImageData> },
        null
      );
    } catch (err) {
      console.error(err);
      return;
    }
  };

  const handleSendEnchantInformation = async (
    enchant: IEnchantInfo,
    imagesToDelete: IImageData[] | null
  ) => {
    requestSent.current = true;

    try {
      // if its a new upload send it to the create route
      if (newUpload) {
        const { data } = await axios.post(enchantsPath, enchant, {
          withCredentials: true,
        });
        nav(enchantPath(data.id));
      } else {
        // if its a patch route send it to the patch route with the correct id.
        // eslint-disable-next-line no-debugger
        const { data } = await axios.patch(
          apiEnchantPath(enchant.id),
          { enchant, imagesToDelete },
          { withCredentials: true }
        );
        nav(enchantPath(data.id));
      }
    } catch (err) {
      /// handle snackbar error
      snackbarMessageSent('Failed to upload');
      requestSent.current = false;
      console.error(err);
    }
  };

  return (
    <>
      {doneLoading && (
        <FormWidthContainer
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: '0 auto',
            backgroundColor: theme.custom.palette.secondary.slightlyLighter,
            transition: '0.5s',
            minHeight: `calc(100% - ${theme.topBarHeight}px)`,
            '& > *:not(:last-child)': {
              mb: 3,
            },
          }}
        >
          <PageHeader text="Show it off" />
          <EnchantInfoForm {...enchant} onChange={handleEnchantInfoOnChange} />
          <EnchantTags
            tags={enchant.tags ?? []}
            addTag={handleAddTag}
            removeTag={handleRemoveTag}
          />
          <Box
            sx={{
              justifyContent: 'space-between',
              width: '100%',
              display: 'flex',
            }}
          >
            <Header
              component="h2"
              size="sub"
              text="Upload your favorite images!"
            />
            <FileInput handleChange={handleFileInputChange} />
          </Box>
          <>
            {enchant.images?.map(({ url, favorite, id, caption }, index) => (
              <EnchantImageList
                url={url}
                favorite={favorite}
                id={id}
                caption={caption}
                index={index}
                updateFavorites={() => handleUpdateFavorite(index)}
                removeImage={() => handleRemoveImage(index)}
                updateCaption={handleUpdateCaption}
                key={index}
              />
            ))}
          </>
          <Box
            sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}
          >
            <Button
              variant="contained"
              sx={{ width: '100%', mb: 3 }}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Box>
        </FormWidthContainer>
      )}
    </>
  );
}

export default connector(EnchantsCreateNUpdate);
