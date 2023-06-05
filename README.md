# @appandflow/expo-image-cropping

A package for cropping image with expo without any plugin

## Installation

```sh
npm install @appandflow/expo-image-cropping
```

## Usage

```js
import {
  ExpoCroppingImageModal,
  ExpoCroppingImageModalRef,
} from '@appandflow/expo-image-cropping';

// ...

const modalRef = useRef<ExpoCroppingImageModalRef>(null);

// ...

<ExpoCroppingImageModal
  modalRef={modalRef}
  imageSrc={originalImage}
  onImageSave={(img) => {
    console.log('the image save is: ', img);
  }}
/>
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
