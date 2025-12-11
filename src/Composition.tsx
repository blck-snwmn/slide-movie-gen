import { AbsoluteFill, Html5Audio, Img, Series, staticFile, useVideoConfig } from 'remotion';
// @ts-ignore
import assets from '../public/assets.json';

type Asset = {
  slide: string;
  voice: string | null;
  duration: number;
  text: string | null;
};

export const MyComposition = () => {
  const { fps } = useVideoConfig();
  const data = assets as Asset[];

  return (
    <AbsoluteFill style={{ backgroundColor: 'white' }}>
      <Series>
        {data.map((asset, index) => {
          const durationInFrames = Math.ceil(asset.duration * fps);
          return (
            <Series.Sequence key={index} durationInFrames={durationInFrames}>
              <AbsoluteFill>
                <Img
                  src={staticFile(asset.slide)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
                {asset.voice && <Html5Audio src={staticFile(asset.voice)} />}
              </AbsoluteFill>
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};
