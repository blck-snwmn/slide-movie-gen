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
          // 音声の長さに余韻を追加（最後だけ長くする）
          const isLast = index === data.length - 1;
          const bufferFrames = isLast ? 90 : 15; // 3秒 or 0.5秒
          const durationInFrames = Math.ceil(asset.duration * fps) + bufferFrames;
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
