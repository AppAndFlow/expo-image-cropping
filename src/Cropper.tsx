import React, { useEffect, useState } from 'react';
import {
  Image,
  View,
  useWindowDimensions,
  TouchableOpacity,
  Text,
  LayoutChangeEvent,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { manipulateAsync, ImageResult } from 'expo-image-manipulator';

import DashedBorder from './DashedBorder';
import { getLineLengthPx } from './utils';
import type { Point } from './types';

export interface ModalRef {
  present: () => void;
  close: () => void;
}

interface Props {
  imageSrc: string;
  onClose: () => void;
  onImageSave: (img: ImageResult) => void;
  minSize?: number;
  saveBtnLabel?: string;
  cancelBtnLabel?: string;
  croppingBtnLabel?: string;
  compress?: number;
}

export default function Cropper({
  imageSrc,
  onClose,
  minSize = 50,
  saveBtnLabel,
  cancelBtnLabel,
  croppingBtnLabel,
  onImageSave,
  compress = 1,
}: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [showResult, setShowResult] = useState(false);

  const [imgManip, setImageManip] = useState<ImageResult | null>(null);

  const [layoutHeight, setLayoutHeight] = useState(0);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const pressed = useSharedValue(0);

  // Top corner left
  const point0 = useSharedValue({ x: 0, y: 0 });
  const point0Offset = useSharedValue({ x: 0, y: 0 });
  // Top corner right
  const point1 = useSharedValue({ x: 0, y: 0 });
  const point1Offset = useSharedValue({ x: 0, y: 0 });
  // Bottom corner left
  const point2Offset = useSharedValue({ x: 0, y: 0 });
  const point2 = useSharedValue({ x: 0, y: 0 });
  // Bottom corner right
  const point3 = useSharedValue({ x: 0, y: 0 });
  const point3Offset = useSharedValue({ x: 0, y: 0 });

  useEffect(() => {
    Image.getSize(imageSrc, (w, h) => setImageSize({ height: h, width: w }));
  }, []);

  const aspectRatio = imgManip
    ? imgManip.width / imgManip.height
    : imageSize.width / imageSize.height;

  const phoneRatio = imageSize.width / width;

  const middlePressed = useSharedValue(false);

  const fourPoints = { point0, point1, point2, point3 };
  const fourPointsOffset = {
    point0Offset,
    point1Offset,
    point2Offset,
    point3Offset,
  };

  const onSave = async () => {
    if (imgManip) {
      onImageSave(imgManip);
    }
  };

  const onCrop = async () => {
    try {
      let current = imageSrc;

      if (imgManip) {
        current = imgManip.uri;
      }

      const h = point2Offset.value.y + 20 - point0Offset.value.y;
      const w = point1Offset.value.x + 20 - point0Offset.value.x;

      const manipResult = await manipulateAsync(
        current,
        [
          {
            crop: {
              height: h * phoneRatio,
              width: w * phoneRatio,
              originX: point0Offset.value.x * phoneRatio,
              originY: point0Offset.value.y * phoneRatio,
            },
          },

          // {
          //   resize: { width: w * phoneRatio, height: h * phoneRatio },
          // },
        ],
        { base64: true, compress }
      );

      setImageManip(manipResult);

      setShowResult(true);
    } catch (error) {
      console.log('error', error);
    }
  };

  const panGesture0 = Gesture.Pan()
    .onBegin((e) => {
      const values = Object.keys(fourPointsOffset).map((key) => {
        // @ts-ignore
        const point: SharedValue<Point> = fourPointsOffset[key];

        const value = point.value;

        const distance = getLineLengthPx(value, { x: e.x, y: e.y });

        return {
          distance,
          key,
          point,
        };
      });

      values.sort(function (
        a: { key: string; distance: number },
        b: { key: string; distance: number }
      ) {
        if (a.distance < b.distance) {
          return -1;
        }
        if (a.distance > b.distance) {
          return 1;
        }
        return 0;
      });

      const active = values[0];

      if (!active) return;

      const userTouchedNearestPoint = active.distance < 40;

      if (!userTouchedNearestPoint) {
        if (
          e.x > point0Offset.value.x &&
          e.x < point1Offset.value.x &&
          e.y > point0Offset.value.y &&
          e.y < point2Offset.value.y
        ) {
          middlePressed.value = true;
          return;
        }

        middlePressed.value = false;
        return;
      }

      middlePressed.value = false;

      const activeIndex = Number(
        active.key[active.key.length - 'offset'.length - 1]
      );

      pressed.value = activeIndex + 1;
    })
    .onUpdate((e) => {
      if (middlePressed.value) {
        point0Offset.value = {
          x: point0.value.x + e.translationX,
          y: point0.value.y + e.translationY,
        };

        point1Offset.value = {
          x: point1.value.x + e.translationX,
          y: point1.value.y + e.translationY,
        };

        point2Offset.value = {
          x: point2.value.x + e.translationX,
          y: point2.value.y + e.translationY,
        };

        point3Offset.value = {
          x: point3.value.x + e.translationX,
          y: point3.value.y + e.translationY,
        };

        return;
      }

      const v = fourPoints[
        `point${pressed.value - 1}` as keyof typeof fourPoints
      ] as SharedValue<Point>;
      const vOffset = fourPointsOffset[
        `point${pressed.value - 1}Offset` as keyof typeof fourPointsOffset
      ] as SharedValue<Point>;

      const offsetY = e.translationY + v.value.y;
      const offsetX = e.translationX + v.value.x;

      const x =
        offsetX > width - 20
          ? width - 20
          : Math.max(e.translationX + v.value.x, 0);

      const y =
        offsetY > layoutHeight - 20 ? layoutHeight - 20 : Math.max(offsetY, 0);

      if (
        (pressed.value - 1 === 0 || pressed.value - 1 === 2) &&
        x + minSize >= point1Offset.value.x
      ) {
        return;
      }

      if (
        (pressed.value - 1 === 1 || pressed.value - 1 === 3) &&
        point0Offset.value.x + minSize >= x
      ) {
        return;
      }

      if (
        (pressed.value - 1 === 0 || pressed.value - 1 === 1) &&
        y + minSize >= point2Offset.value.y
      ) {
        return;
      }

      if (
        (pressed.value - 1 === 2 || pressed.value - 1 === 3) &&
        y <= point0Offset.value.y + minSize
      ) {
        return;
      }

      vOffset.value = {
        x,
        y,
      };

      switch (pressed.value) {
        case 1:
          point1Offset.value = {
            y,
            x: point1Offset.value.x,
          };
          point2Offset.value = {
            y: point2Offset.value.y,
            x,
          };
          break;
        case 2:
          point0Offset.value = {
            y,
            x: point0Offset.value.x,
          };
          point3Offset.value = {
            y: point3Offset.value.y,
            x,
          };
          break;
        case 3:
          point0Offset.value = {
            y: point0Offset.value.y,
            x,
          };
          point3Offset.value = {
            y,
            x: point3Offset.value.x,
          };
          break;
        case 4:
          point1Offset.value = {
            y: point1Offset.value.y,
            x,
          };
          point2Offset.value = {
            y,
            x: point2Offset.value.x,
          };
          break;
      }
    })
    .onEnd(() => {
      point0.value = {
        x: point0Offset.value.x,
        y: point0Offset.value.y,
      };
      point1.value = {
        x: point1Offset.value.x,
        y: point1Offset.value.y,
      };
      point2.value = {
        x: point2Offset.value.x,
        y: point2Offset.value.y,
      };
      point3.value = {
        x: point3Offset.value.x,
        y: point3Offset.value.y,
      };
    })
    .onFinalize(() => {
      pressed.value = 0;
    });

  const onLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    point1.value = {
      x: nativeEvent.layout.width - 20,
      y: 0,
    };
    point1Offset.value = {
      x: nativeEvent.layout.width - 20,
      y: 0,
    };

    point2.value = {
      x: 0,
      y: nativeEvent.layout.height - 20,
    };
    point2Offset.value = {
      x: 0,
      y: nativeEvent.layout.height - 20,
    };

    point3.value = {
      x: nativeEvent.layout.width - 20,
      y: nativeEvent.layout.height - 20,
    };
    point3Offset.value = {
      x: nativeEvent.layout.width - 20,
      y: nativeEvent.layout.height - 20,
    };

    setLayoutHeight(nativeEvent.layout.height);
  };

  // 1
  const point0Style = useAnimatedStyle(() => ({
    top: point0Offset.value.y,
    left: point0Offset.value.x,
    opacity: withSpring([1, 2, 3].includes(pressed.value) ? 1 : 0.4),
  }));

  // 2
  const point1Style = useAnimatedStyle(() => ({
    top: point1Offset.value.y,
    left: point1Offset.value.x,
    opacity: withSpring([1, 2, 4].includes(pressed.value) ? 1 : 0.4),
  }));

  // 3
  const point2Style = useAnimatedStyle(() => ({
    top: point2Offset.value.y,
    left: point2Offset.value.x,
    opacity: withSpring([1, 3, 4].includes(pressed.value) ? 1 : 0.4),
  }));

  // 4
  const point3Style = useAnimatedStyle(() => ({
    top: point3Offset.value.y,
    left: point3Offset.value.x,
    opacity: withSpring([2, 3, 4].includes(pressed.value) ? 1 : 0.4),
  }));

  const onCancel = () => {
    onClose();
    setShowResult(false);
    setImageManip(null);
  };

  const cropBtn = !imgManip ? (
    <TouchableOpacity style={{ padding: 16 }} onPress={onCrop}>
      <Text style={{ color: 'white', fontSize: 20 }}>
        {croppingBtnLabel ?? 'Crop'}
      </Text>
    </TouchableOpacity>
  ) : null;

  const saveBtn = imgManip ? (
    <TouchableOpacity style={{ padding: 16 }} onPress={onSave}>
      <Text style={{ color: 'white', fontSize: 20 }}>
        {saveBtnLabel ?? 'Save'}
      </Text>
    </TouchableOpacity>
  ) : null;

  return (
    <View
      style={{
        backgroundColor: '#000',
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        flex: 1,
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <View
        style={{ position: 'relative' }}
        onLayout={onLayout}
        key={imgManip ? imgManip.uri : imageSrc}
      >
        {imageSize.height > 0 && (
          <Image
            key={imgManip ? imgManip.uri : imageSrc}
            source={{
              uri: imgManip ? imgManip.uri : imageSrc,
            }}
            style={{ width, aspectRatio }}
          />
        )}

        {!showResult && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <DashedBorder
              currentActive={pressed}
              activeWhen={[1, 2]}
              a={point0Offset}
              b={point1Offset}
            />

            <DashedBorder
              currentActive={pressed}
              activeWhen={[3, 4]}
              a={point2Offset}
              b={point3Offset}
              bottom
            />

            <DashedBorder
              currentActive={pressed}
              activeWhen={[1, 3]}
              a={point0Offset}
              b={point2Offset}
              vertical
            />
            <DashedBorder
              currentActive={pressed}
              activeWhen={[2, 4]}
              a={point1Offset}
              b={point3Offset}
              vertical
              right
            />

            <GestureDetector gesture={panGesture0}>
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  left: 0,
                  bottom: 0,
                }}
              >
                <Animated.View
                  key="point0"
                  style={[
                    {
                      position: 'absolute',
                      // backgroundColor: "white",
                      height: 20,
                      width: 20,
                      opacity: 0.6,
                      borderLeftWidth: 2,
                      borderTopWidth: 2,
                      borderColor: 'white',
                    },
                    point0Style,
                  ]}
                />

                <Animated.View
                  key="point1"
                  style={[
                    {
                      position: 'absolute',
                      height: 20,
                      width: 20,
                      opacity: 0.6,
                      borderRightWidth: 2,
                      borderTopWidth: 2,
                      borderColor: 'white',
                    },
                    point1Style,
                  ]}
                />

                <Animated.View
                  key="point2"
                  style={[
                    {
                      position: 'absolute',
                      height: 20,
                      width: 20,
                      opacity: 0.6,
                      borderLeftWidth: 2,
                      borderBottomWidth: 2,
                      borderColor: 'white',
                    },
                    point2Style,
                  ]}
                />

                <Animated.View
                  key="point3"
                  style={[
                    {
                      position: 'absolute',
                      height: 20,
                      width: 20,
                      opacity: 0.6,
                      borderRightWidth: 2,
                      borderBottomWidth: 2,
                      borderColor: 'white',
                    },
                    point3Style,
                  ]}
                />
              </View>
            </GestureDetector>
          </View>
        )}
      </View>

      <View
        style={{
          position: 'absolute',
          bottom: insets.bottom + 20,
          left: 0,
          right: 0,
          height: 100,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity style={{ padding: 16 }} onPress={onCancel}>
          <Text style={{ color: 'white', fontSize: 20 }}>
            {cancelBtnLabel ?? 'Cancel'}
          </Text>
        </TouchableOpacity>

        {cropBtn}
        {saveBtn}
      </View>
    </View>
  );
}
