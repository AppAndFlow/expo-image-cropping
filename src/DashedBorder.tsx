import React from 'react';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import Dashed from './Dashed';
import type { Point } from './types';

export default function DashedBorder({
  bottom,
  right,
  vertical,
  a,
  b,
  currentActive,
  activeWhen = [],
}: {
  currentActive: SharedValue<number>;
  activeWhen: number[];
  a: SharedValue<Point>;
  b: SharedValue<Point>;
  bottom?: boolean;
  right?: boolean;
  vertical?: boolean;
}) {
  const style = useAnimatedStyle(() => {
    return {
      flexDirection: vertical ? 'column' : 'row',
      alignItems: 'flex-start',
      position: 'absolute',
      left: a.value.x + (vertical ? (right ? 18 : 0) : 20),
      width: b.value.x - a.value.x - 20,
      top: a.value.y + (bottom || vertical ? 18 : 0),
      height: vertical ? b.value.y - a.value.y - 20 : undefined,
      overflow: 'hidden',
      opacity: withSpring(activeWhen.includes(currentActive.value) ? 1 : 0.4),
    };
  });

  return (
    <Animated.View style={style}>
      {Array.from({ length: 100 }).map((_, i) => (
        <Dashed key={i} vertical={vertical} />
      ))}
    </Animated.View>
  );
}
