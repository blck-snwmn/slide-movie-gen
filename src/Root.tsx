import { Composition } from 'remotion';
import { MyComposition } from './Composition';
// @ts-ignore
import assets from '../public/assets.json';

type Asset = {
  duration: number;
};

export const RemotionRoot: React.FC = () => {
  const fps = 30;
  const data = assets as Asset[];
  
  // 総フレーム数を計算
  const durationInFrames = Math.ceil(
    data.reduce((sum, asset) => sum + asset.duration, 0) * fps
  );

  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={Math.max(durationInFrames, 1)} // 少なくとも1フレーム
        fps={fps}
        width={1920}
        height={1080}
      />
    </>
  );
};
