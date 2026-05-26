import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Dimensions } from 'react-native';
import Video from 'react-native-video';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onVideoEnd }) => {
  const hasFinished = useRef(false);
  const videoRef = useRef(null);
  const timeoutRef = useRef(null);

  // Function to handle navigation
  const handleNavigation = () => {
    if (!hasFinished.current) {
      hasFinished.current = true;

      // Clear timeout if it exists
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      onVideoEnd?.();
    }
  };

  // Set a timeout to redirect after 7 seconds
  useEffect(() => {
    // Redirect after 7 seconds regardless of video status
    timeoutRef.current = setTimeout(() => {
      if (!hasFinished.current) {
        console.log('7 seconds completed - forcing navigation');
        handleNavigation();
      }
    }, 7000); // 7 seconds timeout

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleEnd = () => {
    console.log('Video ended naturally');
    handleNavigation();
  };

  const handleError = error => {
    console.error('Video error:', error);
    // Navigate even if video fails to load/play
    handleNavigation();
  };

  const handleLoad = () => {
    console.log('Video loaded successfully');
  };

  const handleBuffer = bufferData => {
    console.log('Buffering:', bufferData);
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <Video
        ref={videoRef}
        source={require('../../assets/images/welcome_image.mp4')}
        style={styles.video}
        resizeMode="cover"
        onEnd={handleEnd}
        onError={handleError}
        onLoad={handleLoad}
        onBuffer={handleBuffer}
        muted={true}
        repeat={false}
        paused={false}
        rate={1.0}
        playInBackground={false}
        playWhenInactive={false}
        ignoreSilentSwitch="obey"
        bufferConfig={{
          minBufferMs: 15000,
          maxBufferMs: 50000,
          bufferForPlaybackMs: 2500,
          bufferForPlaybackAfterRebufferMs: 5000,
        }}
        progressUpdateInterval={250}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  video: {
    width: width,
    height: height,
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});

export default SplashScreen;
