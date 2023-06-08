![github_readme_banner](https://github.com/AppAndFlow/expo-image-cropping/assets/7192823/ca80d920-927b-4240-989e-b77c256927fe)

App & Flow is a Montreal-based, close-knit team that specializes in React Native/Expo development. Need a hand? Let’s build together! team@appandflow.com

[![npm (scoped)](https://img.shields.io/npm/v/@appandflow/expo-image-cropping.svg)](https://www.npmjs.com/package/@appandflow/expo-image-cropping)

A package for cropping image with expo without any plugin. (Still WIP. Wait 1.0.0 for stable release)

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
