import React, { Ref, useEffect, useImperativeHandle, useState } from 'react';
import { Modal as RnModal } from 'react-native';
import { ImageResult } from 'expo-image-manipulator';

import { fakeId } from './utils';
import Cropper from './Cropper';
import { View } from 'react-native';

export interface ModalRef {
  present: () => void;
  close: () => void;
}

interface Props {
  modalRef: Ref<ModalRef>;
  imageSrc: string;
  onImageSave: (img: ImageResult) => void;
  saveBtnLabel?: string;
  cancelBtnLabel?: string;
  croppingBtnLabel?: string;
  compress?: number;
}

export default function Modal({
  modalRef,
  imageSrc,
  onImageSave,
  saveBtnLabel,
  cancelBtnLabel,
  croppingBtnLabel,
  compress,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [id, setId] = useState<number>();

  useEffect(() => {
    setId(fakeId());
  }, [visible]);

  useImperativeHandle(modalRef, () => ({
    present: () => {
      setVisible(true);
    },
    close: () => setVisible(false),
  }));

  return (
    <RnModal visible={visible} animationType="fade" key={id}>
      <View style={{ flex: 1 }}>
        <Cropper
          onClose={() => {
            setVisible(false);
          }}
          onImageSave={(img) => {
            onImageSave(img);
            setVisible(false);
          }}
          imageSrc={imageSrc}
          cancelBtnLabel={cancelBtnLabel}
          croppingBtnLabel={croppingBtnLabel}
          saveBtnLabel={saveBtnLabel}
          compress={compress}
        />
      </View>
    </RnModal>
  );
}
