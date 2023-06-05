import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  LogBox,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {
  ExpoCroppingImageModal,
  ExpoCroppingImageModalRef,
} from '@appandflow/expo-image-cropping';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

LogBox.ignoreLogs([
  'Key "cancelled" in the image picker result is deprecated and will be removed in SDK 48, use "canceled" instead',
]);

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  const modalRef = useRef<ExpoCroppingImageModalRef>(null);

  const onImageSelect = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    console.log(result);

    if (!result.canceled && result.assets[0]) {
      setOriginalImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        {originalImage && (
          <View style={{ marginBottom: 16 }}>
            <Text>Original Image</Text>

            <TouchableOpacity onPress={() => modalRef.current?.present()}>
              <Image
                source={{ uri: originalImage }}
                style={{ width: 200, height: 200 }}
              />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={{
            backgroundColor: '#06b6d4',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 8,
            borderRadius: 8,
          }}
          onPress={onImageSelect}
        >
          <Text style={{ color: 'white' }}>Select image</Text>
        </TouchableOpacity>
        <StatusBar style="auto" />

        {originalImage && (
          <ExpoCroppingImageModal
            modalRef={modalRef}
            imageSrc={originalImage}
            onImageSave={(img) => {
              console.log('the image save is: ', img);
            }}
          />
        )}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
