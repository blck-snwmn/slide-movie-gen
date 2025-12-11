import { AbsoluteFill, Html5Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

const SLIDE_COUNT = 3;
const SLIDE_DURATION_SEC = 3; // 1枚あたり3秒

export const MyComposition = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 現在のフレームがどのスライドに対応するか計算
  // 3秒(3 * fpsフレーム)ごとに切り替える
  const slideIndex = Math.floor(frame / (fps * SLIDE_DURATION_SEC));
  
  // スライド番号は 1 始まり (001, 002...)
  // 最後のスライドを超えたら最後のスライドを表示し続ける
  const currentSlideNumber = Math.min(slideIndex + 1, SLIDE_COUNT);
  
  // 3桁のゼロ埋め (001, 002...)
  const slideName = `slide.${String(currentSlideNumber).padStart(3, '0')}.png`;

  return (
    <AbsoluteFill style={{ backgroundColor: 'white' }}>
      <Html5Audio src={staticFile('voice.wav')} />
      <Img 
        src={staticFile(`slides/${slideName}`)} 
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </AbsoluteFill>
  );
};
