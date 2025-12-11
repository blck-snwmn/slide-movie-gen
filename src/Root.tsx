import { Composition } from 'remotion';
import { MyComposition } from './Composition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={150} // 5秒
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
