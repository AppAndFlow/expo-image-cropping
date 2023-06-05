import React from 'react';
import { View } from 'react-native';

interface Props {
  vertical?: boolean;
}

export default function Dashed({ vertical }: Props) {
  return (
    <View
      style={{
        height: vertical ? 8 : 2,
        width: vertical ? 2 : 8,
        backgroundColor: 'white',
        borderRadius: 4,
        marginRight: vertical ? 0 : 2,
        marginBottom: vertical ? 2 : 0,
      }}
    />
  );
}
