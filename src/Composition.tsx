import { AbsoluteFill, Html5Audio, staticFile } from 'remotion';

export const MyComposition = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 100,
        backgroundColor: 'white',
      }}
    >
      <Html5Audio src={staticFile('voice.wav')} />
      Hello, Zundamon!
    </AbsoluteFill>
  );
};
