import {
  LazyLoadImage,
  LazyLoadImageProps,
} from "react-lazy-load-image-component";

import 'react-lazy-load-image-component/src/effects/blur.css';


export const Image: React.FC<LazyLoadImageProps> = ({ ...props }) => {
  return <LazyLoadImage effect="black-and-white" wrapperProps={{
    // If you need to, you can tweak the effect transition using the wrapper style.
    style: {transitionDelay: "1s", pointerEvents: "none"},
}}   {...props} />;
};
